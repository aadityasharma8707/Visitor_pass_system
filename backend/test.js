require("dotenv").config();
const { spawn } = require("child_process");
const path = require("path");
const mongoose = require("mongoose");

const API_BASE = "http://localhost:5000/api";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cleanDatabase() {
  console.log("🧹 Cleaning test database...");
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vspm";
  await mongoose.connect(mongoUri);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  console.log("✨ Database cleaned successfully.");
}

async function runTests() {
  console.log("🚀 Starting E2E Integration Tests...");

  // Generate unique credentials for this test run
  const testId = Date.now().toString(36);
  const adminEmail = `admin_${testId}@test.com`;
  const hostEmail = `host_${testId}@test.com`;
  const securityEmail = `security_${testId}@test.com`;
  const password = "password123";

  let adminToken = "";
  let hostToken = "";
  let securityToken = "";
  let hostId = "";
  let requestId = "";
  let passCode = "";

  try {
    // 1. Bootstrapping Admin User (First user)
    console.log("\n1️⃣ Registering First Admin User...");
    const regAdminRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Admin Tester",
        email: adminEmail,
        password,
        role: "admin",
      }),
    });
    const regAdminData = await regAdminRes.json();
    if (!regAdminRes.ok) throw new Error(`Admin registration failed: ${JSON.stringify(regAdminData)}`);
    console.log("✅ Admin User created successfully.");

    // 2. Login Admin to obtain Token
    console.log("\n2️⃣ Logging in Admin...");
    const loginAdminRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    const loginAdminData = await loginAdminRes.json();
    if (!loginAdminRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(loginAdminData)}`);
    adminToken = loginAdminData.token;
    console.log("✅ Admin logged in. Token acquired.");

    // 3. Register a Host User
    console.log("\n3️⃣ Registering a Host User using Admin Authorization...");
    const regHostRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "Host Tester",
        email: hostEmail,
        password,
        role: "host",
      }),
    });
    const regHostData = await regHostRes.json();
    if (!regHostRes.ok) throw new Error(`Host registration failed: ${JSON.stringify(regHostData)}`);
    hostId = regHostData.user.id;
    console.log(`✅ Host User created (ID: ${hostId}).`);

    // 4. Register a Security User
    console.log("\n4️⃣ Registering a Security User using Admin Authorization...");
    const regSecRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "Security Tester",
        email: securityEmail,
        password,
        role: "security",
      }),
    });
    const regSecData = await regSecRes.json();
    if (!regSecRes.ok) throw new Error(`Security registration failed: ${JSON.stringify(regSecData)}`);
    console.log("✅ Security User created successfully.");

    // 5. Public Endpoint: Get active hosts
    console.log("\n5️⃣ Fetching Active Hosts list (Public Endpoint)...");
    const hostsRes = await fetch(`${API_BASE}/visitor/hosts`);
    const hostsPayload = await hostsRes.json();
    if (!hostsRes.ok) throw new Error(`Failed to load hosts: ${JSON.stringify(hostsPayload)}`);
    const hostsData = Array.isArray(hostsPayload) ? hostsPayload : hostsPayload.data;
    const containsHost = hostsData.some((h) => h._id === hostId);
    if (!containsHost) throw new Error("Newly created host is missing from hosts list!");
    console.log("✅ Active hosts list fetched successfully. Host ID verified in output.");

    // 6. Public Endpoint: Create a Visit Request
    console.log("\n6️⃣ Submitting a Visit Request...");
    const visitDate = new Date();
    visitDate.setHours(visitDate.getHours() + 2); // 2 hours from now
    const requestRes = await fetch(`${API_BASE}/visitor/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John Visitor",
        phone: "9876543210",
        idProof: "ID-12345",
        hostId,
        purpose: "Project Review Meeting",
        visitDate: visitDate.toISOString(),
      }),
    });
    const requestData = await requestRes.json();
    if (!requestRes.ok) throw new Error(`Failed to create visit request: ${JSON.stringify(requestData)}`);
    requestId = requestData.requestId;
    console.log(`✅ Visit Request created successfully (Request ID: ${requestId}).`);

    // 7. Host Log In
    console.log("\n7️⃣ Logging in Host User...");
    const loginHostRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: hostEmail, password }),
    });
    const loginHostData = await loginHostRes.json();
    if (!loginHostRes.ok) throw new Error(`Host login failed: ${JSON.stringify(loginHostData)}`);
    hostToken = loginHostData.token;
    console.log("✅ Host logged in.");

    // 8. Host view own requests
    console.log("\n8️⃣ Fetching Host's pending requests...");
    const myRequestsRes = await fetch(`${API_BASE}/visitor/host/my-requests`, {
      headers: { Authorization: `Bearer ${hostToken}` },
    });
    const myRequestsPayload = await myRequestsRes.json();
    if (!myRequestsRes.ok) throw new Error(`Failed to load host requests: ${JSON.stringify(myRequestsPayload)}`);
    const myRequestsData = Array.isArray(myRequestsPayload) ? myRequestsPayload : myRequestsPayload.data;
    const containsRequest = myRequestsData.some((r) => r._id === requestId);
    if (!containsRequest) throw new Error("Created request is missing from host requests list!");
    console.log("✅ Host verified request presence.");

    // 9. Host Approve Request
    console.log("\n9️⃣ Host Approving Visit Request...");
    const approveRes = await fetch(`${API_BASE}/visitor/approve/${requestId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${hostToken}` },
    });
    const approveData = await approveRes.json();
    if (!approveRes.ok) throw new Error(`Failed to approve request: ${JSON.stringify(approveData)}`);
    passCode = approveData.passCode;
    console.log(`✅ Request approved. Assigned Pass Code: ${passCode}`);

    // 10. Security Log In
    console.log("\n🔟 Logging in Security User...");
    const loginSecRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: securityEmail, password }),
    });
    const loginSecData = await loginSecRes.json();
    if (!loginSecRes.ok) throw new Error(`Security login failed: ${JSON.stringify(loginSecData)}`);
    securityToken = loginSecData.token;
    console.log("✅ Security logged in.");

    // 11. Security mark entry
    console.log("\n1️⃣1️⃣ Marking Visitor Entry...");
    const entryRes = await fetch(`${API_BASE}/visitor/entry/${requestId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${securityToken}` },
    });
    const entryData = await entryRes.json();
    if (!entryRes.ok) throw new Error(`Failed to mark entry: ${JSON.stringify(entryData)}`);
    console.log(`✅ Entry marked successfully. In Time: ${entryData.inTime}`);

    // 12. Security mark exit
    console.log("\n1️⃣2️⃣ Marking Visitor Exit...");
    const exitRes = await fetch(`${API_BASE}/visitor/exit/${requestId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${securityToken}` },
    });
    const exitData = await exitRes.json();
    if (!exitRes.ok) throw new Error(`Failed to mark exit: ${JSON.stringify(exitData)}`);
    console.log(`✅ Exit marked successfully. Out Time: ${exitData.outTime}`);

    // 13. Admin Audit Log check
    console.log("\n1️⃣3️⃣ Verification of Admin Audit Logs...");
    const auditRes = await fetch(`${API_BASE}/admin/audit`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const auditPayload = await auditRes.json();
    if (!auditRes.ok) throw new Error(`Failed to load audit logs: ${JSON.stringify(auditPayload)}`);
    const auditData = Array.isArray(auditPayload) ? auditPayload : auditPayload.data;
    console.log(`✅ Audit Logs verification complete. Records count: ${auditData.length}`);

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🌟");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exit(1);
  }
}

async function main() {
  await cleanDatabase();

  // Spin up server in background, wait for it to listen, run tests, and exit
  const server = spawn("node", ["index.js"], {
    cwd: __dirname,
    env: { ...process.env, PORT: "5000" },
    shell: true,
  });

  server.stdout.on("data", (data) => {
    const output = data.toString();
    if (output.includes("MongoDB connected")) {
      runTests();
    }
  });

  server.stderr.on("data", (data) => {
    console.error(`[Server Error]: ${data}`);
  });

  process.on("exit", () => {
    server.kill();
  });
}

main();

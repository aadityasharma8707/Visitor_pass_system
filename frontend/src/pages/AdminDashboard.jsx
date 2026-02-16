import { useEffect, useState } from "react";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function AdminDashboard() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("adminToken") || ""
  );

  const [activeTab, setActiveTab] = useState("overview");

  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  // ================= VALIDATE TOKEN ON LOAD =================
  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);

      if (!payload || payload.role !== "admin") {
        logout();
        return;
      }

      loadAllData();
    }
  }, [token]);

  function logout() {
    localStorage.removeItem("adminToken");
    setToken("");
    setRequests([]);
    setUsers([]);
    setAuditLogs([]);
  }

  // ================= LOGIN =================
  async function login(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Login failed");
        setLoading(false);
        return;
      }

      const payload = parseJwt(data.token);

      if (!payload || payload.role !== "admin") {
        setMsg("Access denied");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", data.token);
      setToken(data.token);
      setMsg("Login successful");

    } catch {
      setMsg("Server error");
    }

    setLoading(false);
  }

  async function loadAllData() {
    await Promise.all([
      loadRequests(),
      loadUsers(),
      loadAudit()
    ]);
  }

  async function loadRequests() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/requests", {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setMsg("Failed to load requests");
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setMsg("Failed to load users");
    }
  }

  async function loadAudit() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/audit", {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch {
      setMsg("Failed to load audit logs");
    }
  }

  // ================= ADMIN ACTIONS =================
  async function adminAction(url, id, reloadFn) {
    if (!window.confirm("Are you sure?")) return;

    setLoadingId(id);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: "Bearer " + token }
      });

      if (!res.ok) {
        setMsg("Action failed");
        return;
      }

      await reloadFn();
      await loadAudit();

    } catch {
      setMsg("Server error");
    }

    setLoadingId(null);
  }

  // ================= FILTERING =================
  const filteredRequests = requests
    .filter(r =>
      (r.visitor?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter(r =>
      filter === "all" ? true : r.status === filter
    )
    .sort((a, b) =>
      sort === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  // ================= STATS =================
  const total = requests.length;
  const pending = requests.filter(r => r.status === "pending").length;
  const approved = requests.filter(r => r.status === "approved").length;
  const rejected = requests.filter(r => r.status === "rejected").length;
  const suspended = users.filter(u => u.isSuspended).length;

  return (
    <div className="admin-layout">

      {!token && (
        <form onSubmit={login} className="loginBox">
          <h2>Admin Login</h2>
          <input placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)} />
          <button disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p>{msg}</p>
        </form>
      )}

      {token && (
        <>
          {/* SIDEBAR */}
          <div className="sidebar">
            <h3>Admin Panel</h3>

            {["overview","requests","users","audit"].map(tab => (
              <button
                key={tab}
                className={activeTab === tab ? "active-tab" : ""}
                onClick={()=>setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}

            <button onClick={logout}>Logout</button>
          </div>

          {/* CONTENT */}
          <div className="content">

            {activeTab === "overview" && (
              <div className="stats-grid">
                <div>Total Requests: {total}</div>
                <div>Pending: {pending}</div>
                <div>Approved: {approved}</div>
                <div>Rejected: {rejected}</div>
                <div>Suspended Users: {suspended}</div>
              </div>
            )}

            {activeTab === "requests" && (
              <>
                <div className="controls">
                  <input
                    placeholder="Search visitor..."
                    value={search}
                    onChange={e=>setSearch(e.target.value)}
                  />

                  <select value={filter}
                    onChange={e=>setFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <select value={sort}
                    onChange={e=>setSort(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>

                <div className="cards">
                  {filteredRequests.length === 0 && (
                    <div className="empty-state">
                      No matching requests
                    </div>
                  )}

                  {filteredRequests.map(r => (
                    <div key={r._id} className="card">
                      <p><b>Visitor:</b> {r.visitor?.name}</p>
                      <p><b>Host:</b> {r.host?.name}</p>
                      <p><b>Status:</b> {r.status}</p>

                      <button
                        disabled={loadingId === r._id}
                        onClick={() =>
                          adminAction(
                            `http://localhost:5000/api/admin/request/${r._id}/approve`,
                            r._id,
                            loadRequests
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        disabled={loadingId === r._id}
                        onClick={() =>
                          adminAction(
                            `http://localhost:5000/api/admin/request/${r._id}/reject`,
                            r._id,
                            loadRequests
                          )
                        }
                      >
                        Reject
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "users" && (
              <div className="cards">
                {users.length === 0 && (
                  <div className="empty-state">No users found</div>
                )}

                {users.map(u => (
                  <div key={u._id} className="card">
                    <p><b>{u.name}</b></p>
                    <p>{u.email}</p>
                    <p>{u.role}</p>
                    <p>Status: {u.isSuspended ? "Suspended" : "Active"}</p>

                    <button
                      disabled={loadingId === u._id}
                      onClick={() =>
                        adminAction(
                          `http://localhost:5000/api/admin/user/${u._id}/${u.isSuspended ? "activate" : "suspend"}`,
                          u._id,
                          loadUsers
                        )
                      }
                    >
                      {u.isSuspended ? "Activate" : "Suspend"}
                    </button>
                  </div>
                ))}
              </div>
            )}

           {/* ================= AUDIT ================= */}
           {activeTab === "audit" && (<>
    <div className="audit-controls">

      <input
        placeholder="Search action or admin..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <select
        value={filter}
        onChange={e => setFilter(e.target.value)}
      >
        <option value="all">All Actions</option>
        <option value="override-status">Status Override</option>
        <option value="force-entry">Force Entry</option>
        <option value="force-exit">Force Exit</option>
      </select>

    </div>

    <div className="cards">

      {auditLogs
        .filter(log => {
          const text =
            `${log.action} ${log.admin?.name || ""}`
              .toLowerCase();

          const matchSearch =
            text.includes(search.toLowerCase());

          const matchFilter =
            filter === "all" || log.action === filter;

          return matchSearch && matchFilter;
        })
        .map(log => (

          <div key={log._id} className="card audit-card">

            <div className="audit-header">
              <span className={`audit-badge ${log.action}`}>
                {log.action.replace("-", " ").toUpperCase()}
              </span>

              <span className="audit-time">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="audit-body">

              <p>
                <b>Admin:</b> {log.admin?.name} ({log.admin?.email})
              </p>

              {log.visitRequest && (
                <>
                  <p>
                    <b>Visitor:</b> {log.visitRequest?.visitor?.name || "N/A"}
                  </p>

                  <p>
                    <b>Request ID:</b> {log.visitRequest._id}
                  </p>
                </>
              )}

              {log.previousStatus && (
                <p className="status-diff">
                  <span className="old">
                    {log.previousStatus}
                  </span>
                  →
                  <span className="new">
                    {log.newStatus}
                  </span>
                </p>
              )}

            </div>

          </div>
        ))}

      {auditLogs.length === 0 && (
        <div className="empty-state">
          No audit activity recorded yet
        </div>
      )}

    </div>
  </>
)}

          </div>
        </>
      )}
    </div>
  );
}

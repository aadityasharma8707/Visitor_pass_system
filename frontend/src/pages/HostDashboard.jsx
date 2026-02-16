import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function HostDashboard() {

  const API_BASE = "http://localhost:5000/api";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState("");

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [loadingList, setLoadingList] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);

  const [tab, setTab] = useState("requests");

  /* ================= AUTO RESTORE LOGIN ================= */
  useEffect(() => {
    const saved = localStorage.getItem("hostToken");
    if (saved) {
      setToken(saved);
      loadRequests(saved);
    }
  }, []);

  /* ================= LOGIN ================= */
  async function login(e) {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Login failed");
        return;
      }

      setToken(data.token);
      localStorage.setItem("hostToken", data.token);

      setMsg("Login successful");
      loadRequests(data.token);

    } catch {
      setMsg("Server error");
    }
  }

  /* ================= LOGOUT ================= */
  function logout() {
    localStorage.removeItem("hostToken");
    setToken("");
    setRequests([]);
    setMsg("Logged out successfully");
  }

  /* ================= LOAD REQUESTS ================= */
  async function loadRequests(tk) {
    try {
      setLoadingList(true);

      const res = await fetch(
        `${API_BASE}/visitor/host/my-requests`,
        {
          headers: {
            Authorization: "Bearer " + tk
          }
        }
      );

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        setRequests([]);
        return;
      }

      setRequests(data);

    } catch {
      setRequests([]);
      setMsg("Could not load requests");
    } finally {
      setLoadingList(false);
    }
  }

  /* ================= APPROVE ================= */
  async function approve(id) {

    if (loadingId) return;

    try {
      setLoadingId(id);

      const res = await fetch(
        `${API_BASE}/visitor/approve/${id}`,
        {
          method: "PUT",
          headers: { Authorization: "Bearer " + token }
        }
      );

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Error");
        return;
      }

      showToast("Approved • " + data.passCode);
      await loadRequests(token);

    } catch {
      showToast("Server error");
    } finally {
      setLoadingId(null);
    }
  }

  /* ================= TOAST ================= */
  function showToast(text) {
    const id = Date.now();

    setToasts((t) => [...t, { id, text }]);

    setNotifications((n) => [
      { id, text, time: new Date() },
      ...n
    ]);

    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2500);
  }
  /* ================= FILTER + SEARCH + SORT ================= */
  const filteredRequests = requests
    .filter((r) => {

      const matchStatus =
        filter === "all" || r.status === filter;

      const text =
        `${r.visitor?.name || ""} ${r.purpose || ""}`.toLowerCase();

      const matchSearch =
        text.includes(search.toLowerCase());

      return matchStatus && matchSearch;
    })
    .sort((a, b) => {

      if (sortBy === "name") {
        return (a.visitor?.name || "")
          .localeCompare(b.visitor?.name || "");
      }

      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }

      if (sortBy === "visitDate") {
        return new Date(a.visitDate || 0) - new Date(b.visitDate || 0);
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  /* ================= HISTORY ================= */
  const historyRequests =
    requests.filter((r) => r.status === "approved");

  const total = requests.length;
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  /* ================= CHART ================= */
  const chartData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        label: "Requests",
        data: [pendingCount, approvedCount, rejectedCount],
        backgroundColor: ["#f59e0b", "#7c3aed", "#ef4444"]
      }
    ]
  };

  /* ================= EXPORT CSV ================= */
  function exportCSV() {

    if (filteredRequests.length === 0) return;

    const headers = [
      "Visitor",
      "Purpose",
      "Status",
      "VisitDate",
      "CreatedAt",
      "RequestId"
    ];

    const rows = filteredRequests.map((r) => [
      r.visitor?.name || "",
      r.purpose || "",
      r.status,
      r.visitDate || "",
      r.createdAt || "",
      r._id
    ]);

    const csv =
      [headers, ...rows]
        .map(row =>
          row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "host_requests.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  /* ================= UI ================= */
  return (
    <div className="page">

      <div style={{ display: "flex", alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>Host Dashboard</h4>
        {token && (
          <button
            onClick={logout}
            style={{ marginLeft: "auto" }}
          >
            Logout
          </button>
        )}
      </div>

      {!token && (
        <form onSubmit={login}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>
      )}

      <p>{msg}</p>

      {token && (
        <div>

          {/* -------- tabs + notifications -------- */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>

            <button
              className={tab === "requests" ? "filter-btn active" : "filter-btn"}
              onClick={() => setTab("requests")}
            >
              Requests
            </button>

            <button
              className={tab === "history" ? "filter-btn active" : "filter-btn"}
              onClick={() => setTab("history")}
            >
              History
            </button>

            <button
              style={{ marginLeft: "auto" }}
              onClick={() => setShowDrawer(true)}
            >
              🔔 Notifications
            </button>

          </div>

          {/* ================= REQUESTS TAB ================= */}
          {tab === "requests" && (
            <>
              <h4>My Visit Requests</h4>

              <input
                placeholder="Search by visitor or purpose..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: "10px", maxWidth: "320px" }}
              />

              <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="name">Visitor name</option>
                  <option value="status">Status</option>
                  <option value="visitDate">Visit date</option>
                </select>

                <button onClick={exportCSV}>Export CSV</button>
              </div>

              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-title">Total</div>
                  <div className="stat-value">{total}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Pending</div>
                  <div className="stat-value">{pendingCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Approved</div>
                  <div className="stat-value">{approvedCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Rejected</div>
                  <div className="stat-value">{rejectedCount}</div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: "24px" }}>
                <h4 style={{ marginBottom: "10px" }}>Requests overview</h4>
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>

              <div className="filter-bar">
                <button className={`filter-btn ${filter==="all"?"active":""}`} onClick={()=>setFilter("all")}>All</button>
                <button className={`filter-btn ${filter==="pending"?"active":""}`} onClick={()=>setFilter("pending")}>Pending</button>
                <button className={`filter-btn ${filter==="approved"?"active":""}`} onClick={()=>setFilter("approved")}>Approved</button>
                <button className={`filter-btn ${filter==="rejected"?"active":""}`} onClick={()=>setFilter("rejected")}>Rejected</button>
              </div>

              {loadingList && (
                <div className="cards">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="skeleton"></div>
                  ))}
                </div>
              )}

              {!loadingList && filteredRequests.length === 0 && (
                <div className="empty-state">📭 No visit requests found</div>
              )}

              {!loadingList && filteredRequests.length > 0 && (
                <div className="cards">
                  {filteredRequests.map((r) => (

                    <div
                      key={r._id}
                      className={`card ${expandedId === r._id ? "expanded" : ""}`}
                      onClick={() =>
                        setExpandedId(expandedId === r._id ? null : r._id)
                      }
                    >

                      <p><b>Visitor:</b> {r.visitor?.name}</p>
                      <p><b>Purpose:</b> {r.purpose}</p>

                      <p>
                        <b>Status:</b>{" "}
                        <span className={`badge ${r.status}`}>
                          {r.status.toUpperCase()}
                        </span>
                      </p>

                      {r.status === "pending" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            approve(r._id);
                          }}
                          className={loadingId === r._id ? "btn-loading" : ""}
                          disabled={loadingId === r._id}
                        >
                          {loadingId === r._id ? "Approving" : "Approve"}
                        </button>
                      )}

                      <div className="extra">
                        <p><b>Request ID:</b> {r._id}</p>
                        <p><b>Visit date:</b> {r.visitDate ? new Date(r.visitDate).toLocaleDateString() : "-"}</p>
                        <p><b>Created:</b> {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</p>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ================= HISTORY TAB ================= */}
          {tab === "history" && (

            <div className="cards">

              {historyRequests.length === 0 && (
                <div className="empty-state">
                  No approved visits yet
                </div>
              )}

              {historyRequests.map((r) => (
                <div key={r._id} className="card">

                  <p><b>Visitor:</b> {r.visitor?.name}</p>
                  <p><b>Purpose:</b> {r.purpose}</p>
                  <p><b>Pass:</b> {r.passCode}</p>
                  <p><b>Visit date:</b> {r.visitDate ? new Date(r.visitDate).toLocaleDateString() : "-"}</p>
                  <p><b>Approved on:</b> {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "-"}</p>

                </div>
              ))}

            </div>
          )}

        </div>
      )}

      {/* ================= NOTIFICATION DRAWER ================= */}
      {showDrawer && (
        <div className="notify-drawer">

          <div className="notify-header">
            <b>Notifications</b>
            <button onClick={() => setShowDrawer(false)}>✕</button>
          </div>

          <div className="notify-list">

            {notifications.length === 0 && (
              <div className="empty-state">No notifications</div>
            )}

            {notifications.map((n) => (
              <div key={n.id} className="notify-item">
                <div>{n.text}</div>
                <small>{n.time.toLocaleTimeString()}</small>
              </div>
            ))}

          </div>
        </div>
      )}

      {/* ================= TOASTS ================= */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.text}
          </div>
        ))}
      </div>

    </div>
  );
}

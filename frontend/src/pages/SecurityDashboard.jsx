import { useEffect, useState } from "react";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function SecurityDashboard() {

  const API_BASE = "http://localhost:5000/api";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  const [requests, setRequests] = useState([]);

  const [msg, setMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [scan, setScan] = useState("");

  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);

  const [tab, setTab] = useState("gate");
  const [flashId, setFlashId] = useState(null);

  /* ================= AUTO RESTORE ================= */
  useEffect(() => {
    const saved = localStorage.getItem("securityToken");
    if (saved) {
      const payload = parseJwt(saved);
      if (payload?.role !== "security") {
        localStorage.removeItem("securityToken");
        return;
      }
      setToken(saved);
      loadApproved(saved);
    }
  }, []);

  /* ================= LOGOUT ================= */
  function logout() {
    localStorage.removeItem("securityToken");
    setToken("");
    setRequests([]);
    setSearch("");
    setScan("");
    setFilter("all");
    setTab("gate");
    setNotifications([]);
    setToasts([]);
    setMsg("Logged out successfully");
  }

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

      const payload = parseJwt(data.token);
      if (payload?.role !== "security") {
        setMsg("Access denied");
        return;
      }

      setToken(data.token);
      localStorage.setItem("securityToken", data.token);
      loadApproved(data.token);

    } catch {
      setMsg("Server error");
    }
  }

  /* ================= LOAD DATA ================= */
  async function loadApproved(tk) {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/visitor/approved-with-logs`,
        { headers: { Authorization: "Bearer " + tk } }
      );

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);

    } catch {
      setMsg("Could not load data");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  /* ================= TOAST SYSTEM ================= */
  function pushToast(text, type = "success") {
    const id = Date.now();

    setToasts(t => [...t, { id, text, type }]);
    setNotifications(n => [{ id, text, type, time: new Date() }, ...n]);

    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 2500);
  }
  /* ================= ENTRY ================= */
  async function markEntry(id) {
    if (!window.confirm("Mark entry for this visitor?")) return;

    try {
      setLoadingId(id);

      const res = await fetch(
        `${API_BASE}/visitor/entry/${id}`,
        { method: "POST", headers: { Authorization: "Bearer " + token } }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: "Server error" };
      }

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        pushToast(data.message || "Error", "error");
        return;
      }

      pushToast("Entry marked", "success");
      setFlashId(id);
      setTimeout(() => setFlashId(null), 1500);

      loadApproved(token);

    } catch {
      pushToast("Server crashed", "error");
    } finally {
      setLoadingId(null);
    }
  }

  /* ================= EXIT ================= */
  async function markExit(id) {
    if (!window.confirm("Mark exit for this visitor?")) return;

    try {
      setLoadingId(id);

      const res = await fetch(
        `${API_BASE}/visitor/exit/${id}`,
        { method: "POST", headers: { Authorization: "Bearer " + token } }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: "Server error" };
      }

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        pushToast(data.message || "Error", "error");
        return;
      }

      pushToast("Exit marked", "warning");
      loadApproved(token);

    } catch {
      pushToast("Server crashed", "error");
    } finally {
      setLoadingId(null);
    }
  }

  /* ================= STATUS LOGIC ================= */
  function getStage(r) {
    if (!r.entryLog) return "queue";
    if (r.entryLog.inTime && !r.entryLog.outTime) return "inside";
    if (r.entryLog.outTime) return "exited";
    return "queue";
  }

  const filtered = requests.filter(r => {
    const text =
      `${r.visitor?.name || ""} ${r.passCode || ""} ${r.host?.name || ""}`
        .toLowerCase();

    const matchSearch = text.includes(search.toLowerCase());
    const stage = getStage(r);
    const matchFilter = filter === "all" || stage === filter;

    return matchSearch && matchFilter;
  });

  const queue = filtered.filter(r => getStage(r) === "queue");
  const inside = filtered.filter(r => getStage(r) === "inside");
  const exited = filtered.filter(r => getStage(r) === "exited");

  const scanMatch =
    scan.trim()
      ? requests.find(r => r.passCode === scan.trim())
      : null;

  /* ================= UI ================= */
  return (
    <div className="page">
      <h3>Security Dashboard</h3>

      {!token && (
        <form onSubmit={login}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button>Login</button>
        </form>
      )}

      <p>{msg}</p>

      {token && (
        <div>

          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <button className={tab==="gate"?"filter-btn active":"filter-btn"} onClick={()=>setTab("gate")}>Gate</button>
            <button className={tab==="log"?"filter-btn active":"filter-btn"} onClick={()=>setTab("log")}>Activity log</button>
            <button style={{marginLeft:"auto"}} onClick={()=>setShowDrawer(true)}>🔔</button>
            <button onClick={logout} style={{background:"#ef4444",color:"#fff"}}>
              Logout
            </button>
          </div>

          {tab==="gate" && (
            <>
              <input placeholder="Search name / pass / host..." value={search} onChange={e=>setSearch(e.target.value)} />
              <input placeholder="Scan pass code..." value={scan} onChange={e=>setScan(e.target.value)} />

              {scanMatch && (
                <div className="card flash">
                  <b>Scan result</b>
                  <p>{scanMatch.visitor?.name}</p>
                  <p>{scanMatch.passCode}</p>
                </div>
              )}

              <div className="filter-bar">
                <button onClick={()=>setFilter("all")}>All</button>
                <button onClick={()=>setFilter("queue")}>Queue</button>
                <button onClick={()=>setFilter("inside")}>Inside</button>
                <button onClick={()=>setFilter("exited")}>Exited</button>
              </div>

              {loading && <p>Loading...</p>}

              {filter === "all" && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div>
                    <h4>Waiting / Approved</h4>
                    {queue.map(r=>(
                      <div key={r._id} className={`card ${flashId===r._id?"flash":""}`}>
                        <p><b>{r.visitor?.name}</b></p>
                        <p>{r.passCode}</p>
                        <button disabled={loadingId===r._id} onClick={()=>markEntry(r._id)}>
                          {loadingId===r._id?"Processing...":"Mark entry"}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4>Inside building</h4>
                    {inside.map(r=>(
                      <div key={r._id} className="card">
                        <p><b>{r.visitor?.name}</b></p>
                        <p>{r.passCode}</p>
                        <button disabled={loadingId===r._id} onClick={()=>markExit(r._id)}>
                          {loadingId===r._id?"Processing...":"Mark exit"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filter === "queue" && queue.map(r=>(
                <div key={r._id} className="card">
                  <p><b>{r.visitor?.name}</b></p>
                  <button disabled={loadingId===r._id} onClick={()=>markEntry(r._id)}>
                    {loadingId===r._id?"Processing...":"Mark entry"}
                  </button>
                </div>
              ))}

              {filter === "inside" && inside.map(r=>(
                <div key={r._id} className="card">
                  <p><b>{r.visitor?.name}</b></p>
                  <button disabled={loadingId===r._id} onClick={()=>markExit(r._id)}>
                    {loadingId===r._id?"Processing...":"Mark exit"}
                  </button>
                </div>
              ))}

              {filter === "exited" && exited.map(r=>(
                <div key={r._id} className="card">
                  <p><b>{r.visitor?.name}</b></p>
                </div>
              ))}

            </>
          )}

          {tab==="log" && (
            <div className="cards">
              {exited.map(r=>(
                <div key={r._id} className="card">
                  <p><b>{r.visitor?.name}</b></p>
                  <p>In: {r.entryLog?.inTime ? new Date(r.entryLog.inTime).toLocaleString() : "-"}</p>
                  <p>Out: {r.entryLog?.outTime ? new Date(r.entryLog.outTime).toLocaleString() : "-"}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {showDrawer && (
        <div className="notify-drawer">
          <div className="notify-header">
            Notifications
            <button onClick={()=>setShowDrawer(false)}>✕</button>
          </div>
          {notifications.map(n=>(
            <div key={n.id} className={`notify-item ${n.type}`}>
              <div>{n.text}</div>
              <small>{n.time.toLocaleTimeString()}</small>
            </div>
          ))}
        </div>
      )}

      <div className="toast-container">
        {toasts.map(t=>(
          <div key={t.id} className={`toast ${t.type}`}>{t.text}</div>
        ))}
      </div>

    </div>
  );
}

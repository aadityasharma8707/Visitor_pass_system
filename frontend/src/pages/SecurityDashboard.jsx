import { useState, useCallback } from "react";
import api from "../services/api";
import useDashboardAuth from "../hooks/useDashboardAuth";
import useToast from "../hooks/useToast";
import useModal from "../hooks/useModal";
import Roles from "../constants/roles";
import { formatDateTime } from "../utils/dateUtils";

import LoginForm from "../components/ui/LoginForm";
import DashboardLayout from "../components/layout/DashboardLayout";
import FilterBar from "../components/ui/FilterBar";
import EmptyState from "../components/ui/EmptyState";
import ToastContainer from "../components/ui/ToastContainer";
import NotificationDrawer from "../components/ui/NotificationDrawer";

const TABS = [
  { value: "gate", label: "Gate"         },
  { value: "log",  label: "Activity log" },
];

const STAGE_FILTERS = [
  { value: "all",    label: "All"     },
  { value: "queue",  label: "Queue"   },
  { value: "inside", label: "Inside"  },
  { value: "exited", label: "Exited"  },
];

/** Compute which gate stage a request is in based on its entryLog. */
function getStage(r) {
  if (!r.entryLog)             return "queue";
  if (r.entryLog.inTime && !r.entryLog.outTime) return "inside";
  if (r.entryLog.outTime)      return "exited";
  return "queue";
}

export default function SecurityDashboard() {
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");
  const [scan,      setScan]      = useState("");
  const [tab,       setTab]       = useState("gate");
  const [flashId,   setFlashId]   = useState(null);

  const drawer = useModal();

  const {
    email, setEmail, password, setPassword,
    token, msg, setMsg, login, logout
  } = useDashboardAuth(Roles.SECURITY, "securityToken", (tk) => loadApproved(tk));

  const { toasts, notifications, pushToast } = useToast();

  /* ================= LOAD DATA ================= */
  const loadApproved = useCallback(async (tk) => {
    try {
      setLoading(true);
      const data = await api.get("/visitor/approved-with-logs", { Authorization: "Bearer " + tk });
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message.includes("Token") || err.message.includes("denied")) {
        logout(() => setRequests([]));
        return;
      }
      setMsg("Could not load data");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= ENTRY ================= */
  async function markEntry(id) {
    if (!window.confirm("Mark entry for this visitor?")) return;
    try {
      setLoadingId(id);
      await api.post(`/visitor/entry/${id}`);
      pushToast("Entry marked", "success");
      setFlashId(id);
      setTimeout(() => setFlashId(null), 1500);
      loadApproved(token);
    } catch (err) {
      if (err.message.includes("Token") || err.message.includes("denied")) {
        logout();
        return;
      }
      pushToast(err.message || "Server error", "error");
    } finally {
      setLoadingId(null);
    }
  }

  /* ================= EXIT ================= */
  async function markExit(id) {
    if (!window.confirm("Mark exit for this visitor?")) return;
    try {
      setLoadingId(id);
      await api.post(`/visitor/exit/${id}`);
      pushToast("Exit marked", "warning");
      loadApproved(token);
    } catch (err) {
      if (err.message.includes("Token") || err.message.includes("denied")) {
        logout();
        return;
      }
      pushToast(err.message || "Server error", "error");
    } finally {
      setLoadingId(null);
    }
  }

  /* ================= FILTERING ================= */
  const lowerSearch = search.toLowerCase();

  const filtered = requests.filter((r) => {
    const text = `${r.visitor?.name || ""} ${r.passCode || ""} ${r.host?.name || ""}`.toLowerCase();
    const matchSearch = !lowerSearch || text.includes(lowerSearch);
    const stage = getStage(r);
    const matchFilter = filter === "all" || stage === filter;
    return matchSearch && matchFilter;
  });

  const queue  = filtered.filter((r) => getStage(r) === "queue");
  const inside = filtered.filter((r) => getStage(r) === "inside");
  const exited = filtered.filter((r) => getStage(r) === "exited");

  const scanMatch = scan.trim()
    ? requests.find((r) => r.passCode === scan.trim())
    : null;

  /* ================= REUSABLE VISITOR CARD ================= */
  function GateCard({ r, action }) {
    return (
      <div
        className={`card${flashId === r._id ? " flash" : ""}`}
        aria-label={`Visitor: ${r.visitor?.name || "Unknown"}`}
      >
        <p><b>{r.visitor?.name || "—"}</b></p>
        <p style={{ fontSize: 13, opacity: 0.75 }}>{r.passCode}</p>
        {action && (
          <button
            disabled={loadingId === r._id}
            onClick={() => action(r._id)}
            aria-busy={loadingId === r._id}
            aria-label={`${action === markEntry ? "Mark entry" : "Mark exit"} for ${r.visitor?.name || "visitor"}`}
          >
            {loadingId === r._id ? "Processing…" : (action === markEntry ? "Mark entry" : "Mark exit")}
          </button>
        )}
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <>
      <DashboardLayout
        title="Security Dashboard"
        token={token}
        onLogout={logout}
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        onNotificationsClick={drawer.open}
      >
        {/* Login Gate */}
        {!token && (
          <LoginForm
            title="Security Login"
            formId="security-login"
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={login}
            msg={msg}
          />
        )}

        {token && msg && <p role="status" aria-live="polite">{msg}</p>}

        {/* ===== GATE TAB ===== */}
        {token && tab === "gate" && (
          <section aria-label="Gate control">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <div>
                <label htmlFor="sec-search" className="sr-only">Search visitors</label>
                <input
                  id="sec-search"
                  type="search"
                  placeholder="Search name / pass / host…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search visitors"
                />
              </div>

              <div>
                <label htmlFor="sec-scan" className="sr-only">Scan pass code</label>
                <input
                  id="sec-scan"
                  type="search"
                  placeholder="Scan pass code…"
                  value={scan}
                  onChange={(e) => setScan(e.target.value)}
                  aria-label="Scan visitor pass code"
                />
              </div>
            </div>

            {/* Scan result */}
            {scanMatch && (
              <div className="card flash" role="alert" aria-live="assertive">
                <b>Scan result</b>
                <p>{scanMatch.visitor?.name}</p>
                <p style={{ fontSize: 13, opacity: 0.7 }}>{scanMatch.passCode}</p>
              </div>
            )}

            <FilterBar
              options={STAGE_FILTERS}
              active={filter}
              onChange={setFilter}
              label="Filter visitors by gate stage"
            />

            {loading && <p aria-live="polite">Loading…</p>}

            {/* All-stage split view */}
            {!loading && filter === "all" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <section aria-label="Waiting / Approved">
                  <h4>Waiting / Approved</h4>
                  {queue.length === 0
                    ? <EmptyState icon="🕐" message="No visitors waiting" />
                    : queue.map((r) => <GateCard key={r._id} r={r} action={markEntry} />)
                  }
                </section>
                <section aria-label="Inside building">
                  <h4>Inside building</h4>
                  {inside.length === 0
                    ? <EmptyState icon="🏢" message="No visitors inside" />
                    : inside.map((r) => <GateCard key={r._id} r={r} action={markExit} />)
                  }
                </section>
              </div>
            )}

            {/* Filtered stage views */}
            {!loading && filter === "queue"  && (queue.length  === 0 ? <EmptyState message="No visitors in queue"  /> : queue.map( (r) => <GateCard key={r._id} r={r} action={markEntry} />))}
            {!loading && filter === "inside" && (inside.length === 0 ? <EmptyState message="No visitors inside"    /> : inside.map((r) => <GateCard key={r._id} r={r} action={markExit}  />))}
            {!loading && filter === "exited" && (exited.length === 0 ? <EmptyState message="No exited visitors"    /> : exited.map((r) => <GateCard key={r._id} r={r} />))}
          </section>
        )}

        {/* ===== ACTIVITY LOG TAB ===== */}
        {token && tab === "log" && (
          <section aria-label="Activity log">
            <h4>Activity Log</h4>
            {exited.length === 0 ? (
              <EmptyState message="No completed visits yet" />
            ) : (
              <div className="cards">
                {exited.map((r) => (
                  <div key={r._id} className="card">
                    <p><b>{r.visitor?.name}</b></p>
                    <p>In: {formatDateTime(r.entryLog?.inTime)}</p>
                    <p>Out: {formatDateTime(r.entryLog?.outTime)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </DashboardLayout>

      <NotificationDrawer
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        notifications={notifications}
      />

      <ToastContainer toasts={toasts} />
    </>
  );
}

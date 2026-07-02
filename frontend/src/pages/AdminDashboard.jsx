import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import useDashboardAuth from "../hooks/useDashboardAuth";
import useToast from "../hooks/useToast";
import useFilterSort from "../hooks/useFilterSort";
import Roles from "../constants/roles";
import Statuses from "../constants/statuses";
import { formatDateTime } from "../utils/dateUtils";

import LoginForm from "../components/ui/LoginForm";
import StatCard from "../components/ui/StatCard";
import EmptyState from "../components/ui/EmptyState";
import ToastContainer from "../components/ui/ToastContainer";

const SIDEBAR_TABS = ["overview", "requests", "users", "audit"];

// Separate filter definitions per tab to prevent shared-state cross-contamination
const REQUEST_STATUS_FILTERS = [
  { value: "all",               label: "All"      },
  { value: Statuses.PENDING,    label: "Pending"  },
  { value: Statuses.APPROVED,   label: "Approved" },
  { value: Statuses.REJECTED,   label: "Rejected" },
];

const AUDIT_ACTION_FILTERS = [
  { value: "all",             label: "All Actions"     },
  { value: "override_status", label: "Status Override" },
  { value: "force_entry",     label: "Force Entry"     },
  { value: "force_exit",      label: "Force Exit"      },
  { value: "approve_request", label: "Approve"         },
  { value: "reject_request",  label: "Reject"          },
  { value: "suspend_user",    label: "Suspend User"    },
  { value: "activate_user",   label: "Activate User"   },
];

export default function AdminDashboard() {
  const [activeTab,  setActiveTab]  = useState("overview");
  const [requests,   setRequests]   = useState([]);
  const [users,      setUsers]      = useState([]);
  const [auditLogs,  setAuditLogs]  = useState([]);
  const [loadingId,  setLoadingId]  = useState(null);

  // BUG FIX: Separate search+filter state per tab to prevent cross-contamination.
  // Previously a single `search` and `filter` state were shared between the
  // "requests" tab and "audit" tab — typing in one would persist to the other.
  const [reqSearch,   setReqSearch]   = useState("");
  const [reqFilter,   setReqFilter]   = useState("all");
  const [reqSort,     setReqSort]     = useState("newest");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("all");

  const {
    email, setEmail, password, setPassword,
    token, msg, setMsg, loading, login, logout
  } = useDashboardAuth(Roles.ADMIN, "adminToken");

  // BUG FIX: Add useToast so admin actions provide feedback (previously absent)
  const { toasts, pushToast } = useToast();

  /* ================= DATA LOADERS ================= */
  async function loadRequests() {
    try {
      const data = await api.get("/admin/requests");
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      pushToast(err.message || "Failed to load requests", "error");
    }
  }

  async function loadUsers() {
    try {
      const data = await api.get("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      pushToast(err.message || "Failed to load users", "error");
    }
  }

  async function loadAudit() {
    try {
      const data = await api.get("/admin/audit");
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      pushToast(err.message || "Failed to load audit logs", "error");
    }
  }

  useEffect(() => {
    if (token) {
      Promise.all([loadRequests(), loadUsers(), loadAudit()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ================= ADMIN ACTIONS ================= */
  async function adminAction(path, id, reloadFn) {
    if (!window.confirm("Are you sure?")) return;
    setLoadingId(id);
    try {
      await api.post(path);
      await reloadFn();
      await loadAudit();
      pushToast("Action completed successfully", "success");
    } catch (err) {
      pushToast(err.message || "Action failed", "error");
    }
    setLoadingId(null);
  }

  /* ================= FILTERED REQUESTS (memoized) ================= */
  const filteredRequests = useMemo(() => {
    const lowerSearch = reqSearch.toLowerCase();
    return [...requests]
      .filter((r) => {
        const matchStatus = reqFilter === "all" || r.status === reqFilter;
        const matchSearch = !lowerSearch ||
          (r.visitor?.name || "").toLowerCase().includes(lowerSearch);
        return matchStatus && matchSearch;
      })
      .sort((a, b) =>
        reqSort === "newest"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
  }, [requests, reqSearch, reqFilter, reqSort]);

  /* ================= FILTERED AUDIT LOGS (memoized) ================= */
  const filteredAudit = useMemo(() => {
    const lowerSearch = auditSearch.toLowerCase();
    return auditLogs.filter((log) => {
      const text = `${log.action || ""} ${log.admin?.name || ""}`.toLowerCase();
      const matchSearch = !lowerSearch || text.includes(lowerSearch);
      const matchFilter = auditFilter === "all" || log.action === auditFilter;
      return matchSearch && matchFilter;
    });
  }, [auditLogs, auditSearch, auditFilter]);

  /* ================= STATS ================= */
  const { total, pending, approved, rejected, suspended } = useMemo(() => ({
    total:     requests.length,
    pending:   requests.filter((r) => r.status === Statuses.PENDING).length,
    approved:  requests.filter((r) => r.status === Statuses.APPROVED).length,
    rejected:  requests.filter((r) => r.status === Statuses.REJECTED).length,
    suspended: users.filter((u) => u.isSuspended).length,
  }), [requests, users]);

  /* ================= UI ================= */
  return (
    <div className="admin-layout">

      {/* ---- Login Gate ---- */}
      {!token && (
        <LoginForm
          title="Admin Login"
          formId="admin-login"
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSubmit={login}
          loading={loading}
          msg={msg}
        />
      )}

      {token && (
        <>
          {/* SIDEBAR */}
          <nav
            className="sidebar"
            aria-label="Admin navigation"
          >
            <h3>Admin Panel</h3>

            {SIDEBAR_TABS.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active-tab" : ""}
                onClick={() => setActiveTab(tab)}
                aria-current={activeTab === tab ? "page" : undefined}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}

            <button
              onClick={() => logout(() => { setRequests([]); setUsers([]); setAuditLogs([]); })}
              aria-label="Logout from Admin Panel"
            >
              Logout
            </button>
          </nav>

          {/* CONTENT */}
          <main className="content" aria-label="Admin content">

            {/* ===== OVERVIEW ===== */}
            {activeTab === "overview" && (
              <section aria-label="Overview statistics">
                <h4>Overview</h4>
                <div className="stats-row">
                  <StatCard title="Total Requests" value={total}     />
                  <StatCard title="Pending"         value={pending}   />
                  <StatCard title="Approved"        value={approved}  />
                  <StatCard title="Rejected"        value={rejected}  />
                  <StatCard title="Suspended Users" value={suspended} />
                </div>
              </section>
            )}

            {/* ===== REQUESTS ===== */}
            {activeTab === "requests" && (
              <section aria-label="Manage requests">
                <h4>Visit Requests</h4>

                <div className="controls">
                  <div>
                    <label htmlFor="adm-req-search" className="sr-only">Search requests</label>
                    <input
                      id="adm-req-search"
                      type="search"
                      placeholder="Search visitor…"
                      value={reqSearch}
                      onChange={(e) => setReqSearch(e.target.value)}
                      aria-label="Search requests by visitor name"
                    />
                  </div>

                  <div>
                    <label htmlFor="adm-req-filter" className="sr-only">Filter by status</label>
                    <select
                      id="adm-req-filter"
                      value={reqFilter}
                      onChange={(e) => setReqFilter(e.target.value)}
                      aria-label="Filter requests by status"
                    >
                      {REQUEST_STATUS_FILTERS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="adm-req-sort" className="sr-only">Sort order</label>
                    <select
                      id="adm-req-sort"
                      value={reqSort}
                      onChange={(e) => setReqSort(e.target.value)}
                      aria-label="Sort requests"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </div>
                </div>

                <div className="cards">
                  {filteredRequests.length === 0 ? (
                    <EmptyState message="No matching requests" />
                  ) : (
                    filteredRequests.map((r) => (
                      <div key={r._id} className="card">
                        <p><b>Visitor:</b> {r.visitor?.name}</p>
                        <p><b>Host:</b>    {r.host?.name}</p>
                        <p><b>Status:</b>  {r.status}</p>

                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button
                            disabled={loadingId === r._id}
                            onClick={() => adminAction(`/admin/request/${r._id}/approve`, r._id, loadRequests)}
                            aria-label={`Approve request from ${r.visitor?.name || "visitor"}`}
                          >
                            Approve
                          </button>
                          <button
                            disabled={loadingId === r._id}
                            onClick={() => adminAction(`/admin/request/${r._id}/reject`, r._id, loadRequests)}
                            style={{ background: "rgba(239,68,68,.15)", color: "var(--danger)", boxShadow: "none" }}
                            aria-label={`Reject request from ${r.visitor?.name || "visitor"}`}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* ===== USERS ===== */}
            {activeTab === "users" && (
              <section aria-label="Manage users">
                <h4>Users</h4>
                <div className="cards">
                  {users.length === 0 ? (
                    <EmptyState message="No users found" />
                  ) : (
                    users.map((u) => (
                      <div key={u._id} className="card">
                        <p><b>{u.name}</b></p>
                        <p style={{ fontSize: 13, opacity: 0.75 }}>{u.email}</p>
                        <p style={{ fontSize: 13 }}>Role: {u.role}</p>
                        <p style={{ fontSize: 13 }}>
                          Status: <b>{u.isSuspended ? "Suspended" : "Active"}</b>
                        </p>
                        <button
                          disabled={loadingId === u._id}
                          onClick={() =>
                            adminAction(
                              `/admin/user/${u._id}/${u.isSuspended ? "activate" : "suspend"}`,
                              u._id,
                              loadUsers
                            )
                          }
                          style={u.isSuspended
                            ? {}
                            : { background: "rgba(239,68,68,.15)", color: "var(--danger)", boxShadow: "none" }
                          }
                          aria-label={`${u.isSuspended ? "Activate" : "Suspend"} user ${u.name}`}
                        >
                          {u.isSuspended ? "Activate" : "Suspend"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* ===== AUDIT ===== */}
            {activeTab === "audit" && (
              <section aria-label="Audit log">
                <h4>Audit Log</h4>

                <div className="audit-controls">
                  <div>
                    <label htmlFor="adm-audit-search" className="sr-only">Search audit log</label>
                    <input
                      id="adm-audit-search"
                      type="search"
                      placeholder="Search action or admin…"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      aria-label="Search audit log"
                    />
                  </div>

                  <div>
                    <label htmlFor="adm-audit-filter" className="sr-only">Filter by action</label>
                    <select
                      id="adm-audit-filter"
                      value={auditFilter}
                      onChange={(e) => setAuditFilter(e.target.value)}
                      aria-label="Filter audit log by action type"
                    >
                      {AUDIT_ACTION_FILTERS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="cards">
                  {filteredAudit.length === 0 ? (
                    <EmptyState message="No audit activity recorded yet" />
                  ) : (
                    filteredAudit.map((log) => (
                      <div key={log._id} className="card audit-card">
                        <div className="audit-header">
                          <span className="audit-badge">
                            {(log.action || "").replace(/_/g, " ").toUpperCase()}
                          </span>
                          <span className="audit-time">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>

                        <div className="audit-body">
                          <p><b>Admin:</b> {log.admin?.name} ({log.admin?.email})</p>

                          {/* BUG FIX: Use the newly added visitRequest field from the schema.
                              Previously this always rendered undefined because the AuditLog schema
                              did not have a visitRequest field — it only had targetId + metadata. */}
                          {log.visitRequest && (
                            <>
                              <p><b>Visitor:</b> {log.visitRequest?.visitor?.name || "N/A"}</p>
                              <p><b>Request ID:</b> {log.visitRequest._id || log.visitRequest}</p>
                            </>
                          )}

                          {/* Status transition display */}
                          {log.previousStatus && (
                            <p className="status-diff">
                              <span className="old">{log.previousStatus}</span>
                              {" → "}
                              <span className="new">{log.newStatus}</span>
                            </p>
                          )}

                          {/* Fallback: show targetId if no visitRequest */}
                          {!log.visitRequest && log.targetId && (
                            <p><b>Target ID:</b> {log.targetId}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

          </main>
        </>
      )}

      {/* Toast notifications for admin actions */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

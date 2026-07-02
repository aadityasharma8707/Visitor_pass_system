import { useState, useCallback, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import api from "../services/api";
import useDashboardAuth from "../hooks/useDashboardAuth";
import useToast from "../hooks/useToast";
import useModal from "../hooks/useModal";
import useFilterSort from "../hooks/useFilterSort";
import Roles from "../constants/roles";
import Statuses from "../constants/statuses";
import { formatDate, formatDateTime } from "../utils/dateUtils";
import { exportToCSV } from "../utils/csvUtils";

import LoginForm from "../components/ui/LoginForm";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import FilterBar from "../components/ui/FilterBar";
import EmptyState from "../components/ui/EmptyState";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import VisitRequestCard from "../components/ui/VisitRequestCard";
import ToastContainer from "../components/ui/ToastContainer";
import NotificationDrawer from "../components/ui/NotificationDrawer";

// Register Chart.js at module scope — not inside the component to avoid re-registration on re-render
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const STATUS_FILTERS = [
  { value: "all",      label: "All"      },
  { value: Statuses.PENDING,   label: "Pending"  },
  { value: Statuses.APPROVED,  label: "Approved" },
  { value: Statuses.REJECTED,  label: "Rejected" },
];

const SORT_OPTIONS = [
  { value: "newest",    label: "Newest first"  },
  { value: "name",      label: "Visitor name"  },
  { value: "status",    label: "Status"        },
  { value: "visitDate", label: "Visit date"    },
];

const TABS = [
  { value: "requests", label: "Requests" },
  { value: "history",  label: "History"  },
];

export default function HostDashboard() {
  const [requests,    setRequests]    = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingId,   setLoadingId]   = useState(null);
  const [expandedId,  setExpandedId]  = useState(null);
  const [tab,         setTab]         = useState("requests");

  const drawer = useModal();

  const {
    email, setEmail, password, setPassword,
    token, msg, setMsg, login, logout
  } = useDashboardAuth(Roles.HOST, "hostToken", (tk) => loadRequests(tk));

  const {
    toasts, notifications, pushToast: showToast
  } = useToast();

  /* ================= LOAD REQUESTS ================= */
  // useCallback: prevents this from being recreated on every render,
  // safe to pass as useDashboardAuth's onLoadData callback.
  const loadRequests = useCallback(async (tk) => {
    try {
      setLoadingList(true);
      // BUG FIX: Use /host/all-requests to get ALL statuses (not just pending)
      // so the History tab shows approved requests.
      const data = await api.get("/visitor/host/all-requests", { Authorization: "Bearer " + tk });
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message.includes("Token") || err.message.includes("denied")) {
        logout(() => setRequests([]));
        return;
      }
      setRequests([]);
      setMsg("Could not load requests");
    } finally {
      setLoadingList(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= FILTER + SORT + SEARCH ================= */
  const { filtered: filteredRequests, search, setSearch, filter, setFilter, sortBy, setSortBy } =
    useFilterSort(requests, {
      searchFields: ["visitor.name", "purpose"],
      statusField: "status",
      defaultSort: "newest",
    });

  /* ================= DERIVED DATA (memoized) ================= */
  const { total, pendingCount, approvedCount, rejectedCount, historyRequests, chartData } =
    useMemo(() => {
      const pending  = requests.filter((r) => r.status === Statuses.PENDING).length;
      const approved = requests.filter((r) => r.status === Statuses.APPROVED).length;
      const rejected = requests.filter((r) => r.status === Statuses.REJECTED).length;
      const history  = requests.filter((r) => r.status === Statuses.APPROVED);

      return {
        total: requests.length,
        pendingCount:  pending,
        approvedCount: approved,
        rejectedCount: rejected,
        historyRequests: history,
        chartData: {
          labels: ["Pending", "Approved", "Rejected"],
          datasets: [{
            label: "Requests",
            data: [pending, approved, rejected],
            backgroundColor: ["#f59e0b", "#7c3aed", "#ef4444"],
          }],
        },
      };
    }, [requests]);

  /* ================= APPROVE ================= */
  async function approve(id) {
    if (loadingId) return;
    try {
      setLoadingId(id);
      const data = await api.put(`/visitor/approve/${id}`);
      showToast("Approved • " + data.passCode);
      await loadRequests(token);
    } catch (err) {
      if (err.message.includes("Token") || err.message.includes("denied")) {
        logout(() => setRequests([]));
        return;
      }
      showToast(err.message || "Server error", "error");
    } finally {
      setLoadingId(null);
    }
  }

  /* ================= EXPORT CSV ================= */
  function handleExportCSV() {
    exportToCSV(
      ["Visitor", "Purpose", "Status", "VisitDate", "CreatedAt", "RequestId"],
      filteredRequests.map((r) => [
        r.visitor?.name || "",
        r.purpose || "",
        r.status,
        formatDate(r.visitDate),
        formatDateTime(r.createdAt),
        r._id,
      ]),
      "host_requests.csv"
    );
  }

  /* ================= UI ================= */
  return (
    <>
      <DashboardLayout
        title="Host Dashboard"
        token={token}
        onLogout={logout}
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        onNotificationsClick={drawer.open}
      >
        {/* ---- Login Gate ---- */}
        {!token && (
          <LoginForm
            title="Host Login"
            formId="host-login"
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={login}
            msg={msg}
          />
        )}

        {/* ---- Status message (after login) ---- */}
        {token && msg && (
          <p role="status" aria-live="polite">{msg}</p>
        )}

        {/* ================= REQUESTS TAB ================= */}
        {token && tab === "requests" && (
          <section aria-label="Visitor requests">
            <h4>My Visit Requests</h4>

            {/* Search + Sort + Export row */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div>
                <label htmlFor="host-search" className="sr-only">Search requests</label>
                <input
                  id="host-search"
                  type="search"
                  placeholder="Search by visitor or purpose…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ maxWidth: 320 }}
                  aria-label="Search requests by visitor name or purpose"
                />
              </div>

              <div>
                <label htmlFor="host-sort" className="sr-only">Sort requests</label>
                <select
                  id="host-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort requests"
                >
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <button onClick={handleExportCSV} aria-label="Export visible requests to CSV">
                Export CSV
              </button>
            </div>

            {/* Stats */}
            <div className="stats-row" role="region" aria-label="Request statistics">
              <StatCard title="Total"    value={total}         />
              <StatCard title="Pending"  value={pendingCount}  />
              <StatCard title="Approved" value={approvedCount} />
              <StatCard title="Rejected" value={rejectedCount} />
            </div>

            {/* Chart */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 10 }}>Requests overview</h4>
              <Bar
                data={chartData}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
                aria-label="Bar chart showing request counts by status"
              />
            </div>

            {/* Status filter bar */}
            <FilterBar
              options={STATUS_FILTERS}
              active={filter}
              onChange={setFilter}
              label="Filter requests by status"
            />

            {/* List */}
            {loadingList && <SkeletonLoader count={4} />}

            {!loadingList && filteredRequests.length === 0 && (
              <EmptyState message="No visit requests found" />
            )}

            {!loadingList && filteredRequests.length > 0 && (
              <div className="cards">
                {filteredRequests.map((r) => (
                  <VisitRequestCard
                    key={r._id}
                    request={r}
                    expandedId={expandedId}
                    onExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                    actions={
                      r.status === Statuses.PENDING ? (
                        <button
                          onClick={() => approve(r._id)}
                          className={loadingId === r._id ? "btn-loading" : ""}
                          disabled={!!loadingId}
                          aria-label={`Approve request from ${r.visitor?.name || "visitor"}`}
                          aria-busy={loadingId === r._id}
                        >
                          {loadingId === r._id ? "Approving…" : "Approve"}
                        </button>
                      ) : null
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= HISTORY TAB ================= */}
        {token && tab === "history" && (
          <section aria-label="Approved visit history">
            <h4>Approved Visit History</h4>
            {historyRequests.length === 0 ? (
              <EmptyState message="No approved visits yet" />
            ) : (
              <div className="cards">
                {historyRequests.map((r) => (
                  <div key={r._id} className="card">
                    <p><b>Visitor:</b> {r.visitor?.name}</p>
                    <p><b>Purpose:</b> {r.purpose}</p>
                    <p><b>Pass:</b> {r.passCode}</p>
                    <p><b>Visit date:</b> {formatDate(r.visitDate)}</p>
                    <p><b>Approved on:</b> {formatDateTime(r.updatedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </DashboardLayout>

      {/* Notification Drawer (outside layout so it overlays correctly) */}
      <NotificationDrawer
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        notifications={notifications}
      />

      {/* Toast Stack */}
      <ToastContainer toasts={toasts} />
    </>
  );
}

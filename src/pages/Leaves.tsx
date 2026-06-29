import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// ─── Types ────────────────────────────────────────────────────────────────────
type Leave = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  reason: string;
  status: string;
  date: string;
};

// ─── Toast Notification ───────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getLocalDateStr = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];

const todayStr = getLocalDateStr();

// Min date = today, max date = 1 year from now
const maxDateStr = getLocalDateStr(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

const statusColors: Record<string, string> = {
  Pending:  "bg-amber-50 text-amber-700 border border-amber-200",
  Accepted: "bg-green-50 text-green-700 border border-green-200",
  Rejected: "bg-red-50 text-red-700 border border-red-200",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Leaves() {
  const getSafeUser = () => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : {};
    } catch { return {}; }
  };

  const currentUser = getSafeUser();
  const isAdmin      = currentUser?.role === "Admin" || currentUser?.role === "MD/CEO";
  const isSuperAdmin = currentUser?.role === "MD/CEO" ||
    String(currentUser?.designation || "").toLowerCase().includes("ceo") ||
    String(currentUser?.designation || "").toLowerCase().includes("md");
  const token = localStorage.getItem("token") || "";

  // ── State ──────────────────────────────────────────────────────────────────
  const [leaves,      setLeaves]      = useState<Leave[]>([]);
  const [reason,      setReason]      = useState("");
  const [leaveDate,   setLeaveDate]   = useState(todayStr);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [toasts,      setToasts]      = useState<Toast[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Withdrawal confirmation modal
  const [withdrawalConfirm, setWithdrawalConfirm] = useState<{ id: string; reason: string; date: string } | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Month/Year filters for both tabs
  const [myLeavesMonth, setMyLeavesMonth] = useState<number>(new Date().getMonth());
  const [myLeavesYear, setMyLeavesYear] = useState<number>(new Date().getFullYear());
  
  const [manageLeavesMonth, setManageLeavesMonth] = useState<number>(new Date().getMonth());
  const [manageLeavesYear, setManageLeavesYear] = useState<number>(new Date().getFullYear());

  // Admin starts on "apply" (My Applications) tab per requirement
  const [activeTab, setActiveTab] = useState<"apply" | "manage">("apply");

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // ── Fetch all leaves from backend ──────────────────────────────────────────
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(Array.isArray(data) ? data : []);
      } else {
        addToast("Failed to load leave records.", "error");
      }
    } catch {
      addToast("Network error. Could not fetch leaves.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLeaves();

    // Real-time: refresh when another admin updates a leave
    socket.on("leaveUpdated", () => fetchLeaves());
    return () => { socket.off("leaveUpdated"); };
  }, [token]);

  // ── Apply for leave ────────────────────────────────────────────────────────
  const handleApplyLeave = async () => {
    if (!reason.trim()) { addToast("Please provide a reason for your leave.", "error"); return; }
    if (!leaveDate)      { addToast("Please select a leave date.", "error"); return; }

    const newLeave = {
      employeeId:   currentUser.id,
      employeeName: currentUser.name,
      department:   currentUser.department,
      reason:       reason.trim(),
      date:         leaveDate,
    };

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/leaves", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(newLeave),
      });
      if (res.ok) {
        const created = await res.json();
        setLeaves(prev => [created, ...prev]);
        setReason("");
        setLeaveDate(todayStr);
        addToast("Leave request submitted successfully.", "success");
        socket.emit("leaveApplied", created);
      } else {
        addToast("Failed to submit leave request.", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirm withdrawal ─────────────────────────────────────────────────────
  const handleWithdrawalClick = (id: string, reason: string, date: string) => {
    setWithdrawalConfirm({ id, reason, date });
  };

  // ── Execute withdrawal ─────────────────────────────────────────────────────
  const handleDeleteLeave = async () => {
    if (!withdrawalConfirm) return;
    
    const { id } = withdrawalConfirm;
    try {
      setIsWithdrawing(true);
      const res = await fetch(`http://localhost:5000/api/leaves/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLeaves(prev => prev.filter(l => l.id !== id));
        addToast("Leave request withdrawn successfully.", "info");
        socket.emit("leaveDeleted", { id });
        setWithdrawalConfirm(null);
      } else {
        addToast("Failed to withdraw leave request.", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // ── Admin: accept / reject ─────────────────────────────────────────────────
  const updateLeaveStatus = async (id: string, status: "Accepted" | "Rejected") => {
    try {
      const res = await fetch(`http://localhost:5000/api/leaves/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status }),
      });
      if (res.ok) {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
        addToast(`Leave ${status.toLowerCase()} successfully.`, "success");
        socket.emit("leaveUpdated", { id, status });
      } else {
        addToast("Failed to update leave status.", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const myLeaves = leaves.filter(l => String(l.employeeId) === String(currentUser?.id));

  // Filter my leaves by selected month/year
  const myLeavesFiltered = myLeaves.filter(l => {
    const leaveDate = new Date(l.date + "T00:00:00");
    return leaveDate.getMonth() === myLeavesMonth && leaveDate.getFullYear() === myLeavesYear;
  });

  // Stats for my leaves (based on selected month)
  const myFilteredStats = {
    total:    myLeavesFiltered.length,
    pending:  myLeavesFiltered.filter(l => l.status === "Pending").length,
    accepted: myLeavesFiltered.filter(l => l.status === "Accepted").length,
    rejected: myLeavesFiltered.filter(l => l.status === "Rejected").length,
  };

  // All-time stats for my leaves
  const myAllTimeStats = {
    total:    myLeaves.length,
    pending:  myLeaves.filter(l => l.status === "Pending").length,
    accepted: myLeaves.filter(l => l.status === "Accepted").length,
    rejected: myLeaves.filter(l => l.status === "Rejected").length,
  };

  const manageLeaves = leaves.filter(l => {
    if (String(l.employeeId) === String(currentUser?.id)) return false;
    if (isSuperAdmin) return true;
    return l.department === currentUser?.department;
  });

  // Filter manage leaves by selected month/year and status
  const manageLeavesFiltered = manageLeaves.filter(l => {
    const leaveDate = new Date(l.date + "T00:00:00");
    const monthYearMatch = leaveDate.getMonth() === manageLeavesMonth && leaveDate.getFullYear() === manageLeavesYear;
    const statusMatch = filterStatus === "All" ? true : l.status === filterStatus;
    return monthYearMatch && statusMatch;
  });

  const pendingCount  = manageLeaves.filter(l => l.status === "Pending").length;

  // Stats for manage (based on selected month)
  const manageFilteredStats = {
    total:    manageLeaves.filter(l => {
      const leaveDate = new Date(l.date + "T00:00:00");
      return leaveDate.getMonth() === manageLeavesMonth && leaveDate.getFullYear() === manageLeavesYear;
    }).length,
    pending:  manageLeaves.filter(l => {
      const leaveDate = new Date(l.date + "T00:00:00");
      return leaveDate.getMonth() === manageLeavesMonth && leaveDate.getFullYear() === manageLeavesYear && l.status === "Pending";
    }).length,
    accepted: manageLeaves.filter(l => {
      const leaveDate = new Date(l.date + "T00:00:00");
      return leaveDate.getMonth() === manageLeavesMonth && leaveDate.getFullYear() === manageLeavesYear && l.status === "Accepted";
    }).length,
    rejected: manageLeaves.filter(l => {
      const leaveDate = new Date(l.date + "T00:00:00");
      return leaveDate.getMonth() === manageLeavesMonth && leaveDate.getFullYear() === manageLeavesYear && l.status === "Rejected";
    }).length,
  };

  // All-time stats for manage
  const manageAllTimeStats = {
    total:    manageLeaves.length,
    pending:  manageLeaves.filter(l => l.status === "Pending").length,
    accepted: manageLeaves.filter(l => l.status === "Accepted").length,
    rejected: manageLeaves.filter(l => l.status === "Rejected").length,
  };

  // Month/Year helpers
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <MainLayout>

      {/* ── Withdrawal Confirmation Modal ───────────────────────────────────── */}
      {withdrawalConfirm && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform">
            <div className="flex justify-between items-center bg-amber-50 border-b border-amber-100 p-5">
              <h3 className="font-bold text-amber-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Confirm Withdrawal
              </h3>
              <button 
                onClick={() => setWithdrawalConfirm(null)} 
                className="text-amber-400 hover:text-amber-700 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-800 font-bold mb-4">Are you sure you want to withdraw this leave request?</p>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Date</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {new Date(withdrawalConfirm.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</p>
                  <p className="text-sm text-slate-700 mt-0.5 italic">"{withdrawalConfirm.reason}"</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                This action will <span className="font-bold">permanently remove</span> this leave request from your record. You can always submit a new leave request if needed.
              </p>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setWithdrawalConfirm(null)}
                  disabled={isWithdrawing}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  No, Cancel
                </button>
                <button 
                  onClick={handleDeleteLeave}
                  disabled={isWithdrawing}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isWithdrawing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Withdrawing…
                    </>
                  ) : "Yes, Withdraw"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ─────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold animate-fadeIn border ${
              toast.type === "success" ? "bg-green-600 text-white border-green-700" :
              toast.type === "error"   ? "bg-red-600 text-white border-red-700" :
                                         "bg-slate-700 text-white border-slate-800"
            }`}
          >
            <span>
              {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
            </span>
            {toast.message}
          </div>
        ))}
      </div>

      {/* ── Sticky Header — z-30 so mobile drawer (z-50) sits above it ───── */}
      <div className="sticky top-0 z-30 bg-slate-50 -mx-4 md:-mx-8 px-4 md:px-8 pt-6 pb-4 border-b border-slate-200 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Leaves &amp; Time Off</h1>
            <p className="text-slate-500 font-medium mt-1">
              {isAdmin
                ? "Manage team requests and track your own leave applications."
                : "Apply for leave and track your request history."}
            </p>
          </div>

          {/* Tab switcher — admin only */}
          {isAdmin && (
            <div className="flex bg-slate-200 p-1 rounded-xl gap-1 self-start sm:self-auto flex-shrink-0">
              {/* My Applications FIRST */}
              <button
                onClick={() => setActiveTab("apply")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
                  activeTab === "apply"
                    ? "bg-white text-blue-600 shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {/* person icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Applications
              </button>

              {/* Department Requests SECOND */}
              <button
                onClick={() => setActiveTab("manage")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition relative ${
                  activeTab === "manage"
                    ? "bg-white text-blue-600 shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {/* building icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Department Requests
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          MY APPLICATIONS TAB
      ================================================================ */}
      {activeTab === "apply" && (
        <div className="animate-fadeIn">

          {/* All-time stats row */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">All-Time Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total",    value: myAllTimeStats.total,    color: "text-slate-800",  bg: "bg-white" },
                { label: "Pending",  value: myAllTimeStats.pending,  color: "text-amber-600",  bg: "bg-amber-50" },
                { label: "Approved", value: myAllTimeStats.accepted, color: "text-green-600",  bg: "bg-green-50" },
                { label: "Rejected", value: myAllTimeStats.rejected, color: "text-red-600",    bg: "bg-red-50" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-slate-100 shadow-sm`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Application form */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-1">New Leave Request</h2>
            <p className="text-slate-500 text-sm mb-6">Select the date you need off and provide a reason. Your manager will be notified.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Date picker */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Leave Date
                  <span className="ml-2 text-xs font-normal text-slate-400">(today or any future date)</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={leaveDate}
                    min={todayStr}
                    max={maxDateStr}
                    onChange={e => setLeaveDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition"
                  />
                </div>
                {/* Visual day indicator */}
                {leaveDate && (
                  <p className="mt-2 text-xs text-slate-500 font-medium">
                    {new Date(leaveDate + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric"
                    })}
                    {(new Date(leaveDate + "T00:00:00").getDay() === 0 ||
                      new Date(leaveDate + "T00:00:00").getDay() === 6) && (
                      <span className="ml-2 text-amber-600 font-bold">⚠ Weekend</span>
                    )}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Leave</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Medical appointment, family event, personal matter..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleApplyLeave}
                disabled={submitting || !reason.trim() || !leaveDate}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Submitting…
                  </>
                ) : "Submit Request"}
              </button>
              {(!reason.trim() || !leaveDate) && (
                <p className="text-xs text-slate-400 font-medium">Fill in both fields to submit.</p>
              )}
            </div>
          </div>

          {/* Month/Year selector for filtering */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-white rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">Filter by Month:</span>
              <select
                value={myLeavesMonth}
                onChange={(e) => setMyLeavesMonth(parseInt(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={myLeavesYear}
                onChange={(e) => setMyLeavesYear(parseInt(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {(myLeavesMonth !== new Date().getMonth() || myLeavesYear !== new Date().getFullYear()) && (
              <button
                onClick={() => {
                  setMyLeavesMonth(new Date().getMonth());
                  setMyLeavesYear(new Date().getFullYear());
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Reset to current month
              </button>
            )}
          </div>

          {/* Filtered month stats */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {months[myLeavesMonth]} {myLeavesYear} Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total",    value: myFilteredStats.total,    color: "text-slate-800",  bg: "bg-white" },
                { label: "Pending",  value: myFilteredStats.pending,  color: "text-amber-600",  bg: "bg-amber-50" },
                { label: "Approved", value: myFilteredStats.accepted, color: "text-green-600",  bg: "bg-green-50" },
                { label: "Rejected", value: myFilteredStats.rejected, color: "text-red-600",    bg: "bg-red-50" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-slate-100 shadow-sm`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* My leave history */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              Leave History - {months[myLeavesMonth]} {myLeavesYear}
            </h3>
            <span className="text-sm text-slate-500 font-medium">{myLeavesFiltered.length} request{myLeavesFiltered.length !== 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="font-bold">Loading records…</p>
              </div>
            </div>
          ) : myLeavesFiltered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-700 text-lg">No leave requests for this period</h4>
              <p className="text-slate-400 font-medium mt-1">Your submitted requests will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[560px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeavesFiltered.map((l, i) => (
                      <tr key={l.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 text-sm">
                            {new Date(l.date + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(l.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm max-w-xs">
                          <p className="line-clamp-2">{l.reason}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${statusColors[l.status] || "bg-slate-100 text-slate-600"}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {l.status === "Pending" ? (
                            <button
                              onClick={() => handleWithdrawalClick(l.id, l.reason, l.date)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                              title="Withdraw this leave request"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Withdraw
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300 font-medium">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          DEPARTMENT REQUESTS TAB (Admin only)
      ================================================================ */}
      {activeTab === "manage" && isAdmin && (
        <div className="animate-fadeIn">

          {/* All-time stats row */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">All-Time Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total",    value: manageAllTimeStats.total,    color: "text-slate-800", bg: "bg-white" },
                { label: "Pending",  value: manageAllTimeStats.pending,  color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Approved", value: manageAllTimeStats.accepted, color: "text-green-600", bg: "bg-green-50" },
                { label: "Rejected", value: manageAllTimeStats.rejected, color: "text-red-600",   bg: "bg-red-50" },
              ].map(s => (
                <div 
                  key={s.label}
                  className={`${s.bg} rounded-2xl p-5 border border-slate-100 shadow-sm`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Month/Year selector and filter bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-white rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">Filter by Month:</span>
              <select
                value={manageLeavesMonth}
                onChange={(e) => setManageLeavesMonth(parseInt(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={manageLeavesYear}
                onChange={(e) => setManageLeavesYear(parseInt(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {(manageLeavesMonth !== new Date().getMonth() || manageLeavesYear !== new Date().getFullYear()) && (
              <button
                onClick={() => {
                  setManageLeavesMonth(new Date().getMonth());
                  setManageLeavesYear(new Date().getFullYear());
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Reset to current month
              </button>
            )}
          </div>

          {/* Filtered month stats */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {months[manageLeavesMonth]} {manageLeavesYear} Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total",    value: manageFilteredStats.total,    color: "text-slate-800", bg: "bg-white" },
                { label: "Pending",  value: manageFilteredStats.pending,  color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Approved", value: manageFilteredStats.accepted, color: "text-green-600", bg: "bg-green-50" },
                { label: "Rejected", value: manageFilteredStats.rejected, color: "text-red-600",   bg: "bg-red-50" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-slate-100 shadow-sm`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status filter bar */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              {filterStatus === "All" ? "All Requests" : `${filterStatus} Requests`}
              <span className="ml-2 text-sm font-normal text-slate-400">({manageLeavesFiltered.length})</span>
            </h3>
            {filterStatus !== "All" && (
              <button
                onClick={() => setFilterStatus("All")}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Status filter buttons */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {["All", "Pending", "Accepted", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  filterStatus === status
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="font-bold">Loading records…</p>
              </div>
            </div>
          ) : manageLeavesFiltered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-700 text-lg">All caught up!</h4>
              <p className="text-slate-400 font-medium mt-1">No {filterStatus !== "All" ? filterStatus.toLowerCase() : ""} requests for {months[manageLeavesMonth]} {manageLeavesYear}.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Requested For</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manageLeavesFiltered.map((leave, i) => (
                      <tr key={leave.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 text-sm">
                            {new Date(leave.date + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(leave.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{leave.employeeName}</p>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium mt-1 inline-block">
                            {leave.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm max-w-xs">
                          <p className="line-clamp-2 italic">"{leave.reason}"</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${statusColors[leave.status] || "bg-slate-100 text-slate-600"}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {leave.status === "Pending" ? (
                              <>
                                <button
                                  onClick={() => updateLeaveStatus(leave.id, "Accepted")}
                                  className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-500 hover:text-white border border-green-200 hover:border-green-500 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateLeaveStatus(leave.id, "Rejected")}
                                  className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-500 hover:text-white border border-red-200 hover:border-red-500 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-300 font-medium">Decision made</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </MainLayout>
  );
}
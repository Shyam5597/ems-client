import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import StatsCard from "../components/StatsCard";
import { FaUsers, FaUserCheck, FaUserTimes, FaFingerprint, FaClock, FaCheckCircle, FaExclamationCircle, FaUserClock, FaFileInvoice, FaChartLine, FaChartPie, FaCalendarDay, FaTimes, FaIdBadge, FaBuilding, FaMapMarkerAlt, FaHome, FaCheck, FaBan, FaCalendarAlt, FaUndo, FaExclamationTriangle } from "react-icons/fa";
import { MdEventAvailable } from "react-icons/md";

// TypeScript Interfaces
interface AttendanceRecord { date: string; checkIn: string; checkOut: string; status: string; }
interface Leave { id?: string; _id?: string; employeeId: string; employeeName: string; department: string; reason: string; status: string; date: string; }
interface User { id?: string; _id?: string; name: string; email: string; phone: string; role: string; department: string; designation: string; status: string; createdAt: string; attendance: AttendanceRecord[]; }

const getLocalDateStr = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

type DrillDownType = "myPresent" | "myAbsent" | "myPTO" | "myPending" | "myRejected" | "myTotalLeaves" | "myWeekend" | "teamTotal" | "teamPresent" | "teamAbsent" | "teamAction" | "teamAccepted" | "teamRejected";

export default function Dashboard() {
  const getSafeUser = (): User => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : {} as User;
    } catch { return {} as User; }
  };

  const [currentUser, setCurrentUser] = useState<User>(getSafeUser);
  const token = localStorage.getItem("token") || "";

  const isAdmin = currentUser?.role === "Admin" || currentUser?.role === "MD/CEO";
  const isSuperAdmin = currentUser?.role === "MD/CEO" || String(currentUser?.designation || "").toLowerCase().includes("ceo") || String(currentUser?.designation || "").toLowerCase().includes("md");

  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [dashboardView, setDashboardView] = useState<"personal" | "department">("personal");

  const [activeModal, setActiveModal] = useState<{ title: string; type: DrillDownType } | null>(null);
  const [modalSubFilter, setModalSubFilter] = useState<string>("All");

  // Work mode modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Undo punch modal
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [undoTarget, setUndoTarget] = useState<"in" | "out" | null>(null);
  const [undoLoading, setUndoLoading] = useState(false);

  const [adminFilterMode, setAdminFilterMode] = useState<"today" | "date" | "month">("today");
  const [adminFilterDate, setAdminFilterDate] = useState(getLocalDateStr());
  const [adminFilterMonth, setAdminFilterMonth] = useState(new Date().getMonth());
  const [adminFilterYear, setAdminFilterYear] = useState(new Date().getFullYear());
  const [selectedAdminDept, setSelectedAdminDept] = useState(isAdmin ? currentUser?.department : "All");

  const openModal = (title: string, type: DrillDownType) => {
    setModalSubFilter("All");
    setActiveModal({ title, type });
  };

  const todayDate = getLocalDateStr();
  const safeAttendance = Array.isArray(currentUser?.attendance) ? currentUser.attendance : [];
  const todayRecord = safeAttendance.find(a => a?.date === todayDate) || null;
  const hasPunchedIn = !!todayRecord;
  const hasPunchedOut = !!todayRecord?.checkOut;

  // How many minutes ago did the user punch in?
  const minutesSincePunchIn = (() => {
    if (!todayRecord?.checkIn) return Infinity;
    // Try to parse checkIn time like "09:30 AM"
    const now = new Date();
    const [timePart, ampm] = todayRecord.checkIn.split(" ");
    if (!timePart) return Infinity;
    const [hStr, mStr] = timePart.split(":");
    let hours = parseInt(hStr, 10);
    const mins = parseInt(mStr, 10);
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    const punchTime = new Date();
    punchTime.setHours(hours, mins, 0, 0);
    return (now.getTime() - punchTime.getTime()) / 60000;
  })();

  const minutesSincePunchOut = (() => {
    if (!todayRecord?.checkOut) return Infinity;
    const now = new Date();
    const [timePart, ampm] = todayRecord.checkOut.split(" ");
    if (!timePart) return Infinity;
    const [hStr, mStr] = timePart.split(":");
    let hours = parseInt(hStr, 10);
    const mins = parseInt(mStr, 10);
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    const punchTime = new Date();
    punchTime.setHours(hours, mins, 0, 0);
    return (now.getTime() - punchTime.getTime()) / 60000;
  })();

  // Allow undo only within 5 minutes
  const canUndoPunchIn = hasPunchedIn && !hasPunchedOut && minutesSincePunchIn <= 5;
  const canUndoPunchOut = hasPunchedOut && minutesSincePunchOut <= 5;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [usersRes, leavesRes] = await Promise.all([
          fetch("http://localhost:5000/api/users", { headers }),
          fetch("http://localhost:5000/api/leaves", { headers })
        ]);
        const uData = usersRes.ok ? await usersRes.json() : [];
        const lData = leavesRes.ok ? await leavesRes.json() : [];
        const fetchedUsers: User[] = Array.isArray(uData) ? uData : [];
        const fetchedLeaves: Leave[] = Array.isArray(lData) ? lData : [];
        const myId = currentUser?.id || currentUser?._id;
        const updatedMe = fetchedUsers.find(u => (u?.id || u?._id) === myId);
        if (updatedMe) setCurrentUser(updatedMe);
        if (isAdmin || isSuperAdmin) setTeamUsers(fetchedUsers);
        setAllLeaves(fetchedLeaves);
      } catch (error) { console.error("Error fetching data", error); }
    };
    if (token) fetchDashboardData();
  }, [token, todayDate, currentUser?.id, currentUser?._id, currentUser?.department, isAdmin, isSuperAdmin]);

  // ============================================================
  // PUNCH LOGIC
  // ============================================================
  const executePunch = async (punchType: "in" | "out", workModeStatus: string = "Present") => {
    const myId = currentUser?.id || currentUser?._id;
    if (!myId) return alert("User error. Please re-login.");
    const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    let newAttendance = Array.isArray(currentUser?.attendance) ? [...currentUser.attendance] : [];
    if (punchType === "in") {
      newAttendance.push({ date: todayDate, checkIn: timeNow, checkOut: "", status: workModeStatus });
    } else {
      const index = newAttendance.findIndex(a => a?.date === todayDate);
      if (index !== -1) newAttendance[index] = { ...newAttendance[index], checkOut: timeNow };
    }
    try {
      const res = await fetch(`http://localhost:5000/api/users/${myId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ attendance: newAttendance })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setShowLocationModal(false);
      }
    } catch (err) { console.error("Sync failed"); }
  };

  const handleLocationPunch = (mode: "Office" | "WFH") => {
    setLocationError("");
    if (mode === "WFH") {
      executePunch("in", "Present (WFH)");
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = calculateDistance(17.3850, 78.4867, position.coords.latitude, position.coords.longitude);
        if (distance <= 200) executePunch("in", "Present (Office)");
        else setLocationError(`You are ${Math.round(distance)}m from the office. Must be within 200m to punch in from Office.`);
      },
      () => setLocationError("Please allow location access to punch in from Office."),
      { enableHighAccuracy: true }
    );
  };

  // ============================================================
  // UNDO PUNCH LOGIC
  // ============================================================
  const handleUndoRequest = (type: "in" | "out") => {
    setUndoTarget(type);
    setShowUndoModal(true);
  };

  const confirmUndo = async () => {
    const myId = currentUser?.id || currentUser?._id;
    if (!myId || !undoTarget) return;
    setUndoLoading(true);
    let newAttendance = Array.isArray(currentUser?.attendance) ? [...currentUser.attendance] : [];
    const index = newAttendance.findIndex(a => a?.date === todayDate);
    if (undoTarget === "in") {
      // Remove today's entire record
      if (index !== -1) newAttendance.splice(index, 1);
    } else if (undoTarget === "out") {
      // Clear only the check-out time
      if (index !== -1) newAttendance[index] = { ...newAttendance[index], checkOut: "" };
    }
    try {
      const res = await fetch(`http://localhost:5000/api/users/${myId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ attendance: newAttendance })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }
    } catch (err) { console.error("Undo failed"); }
    setUndoLoading(false);
    setShowUndoModal(false);
    setUndoTarget(null);
  };

  // ============================================================
  // DATA COMPILATION
  // ============================================================
  const safeTeamUsers = Array.isArray(teamUsers) ? teamUsers : [];
  const safeAllLeaves = Array.isArray(allLeaves) ? allLeaves : [];
  const uniqueDepartments = Array.from(new Set(safeTeamUsers.map(u => u.department || ""))).filter(Boolean);

  const targetAdminDate = adminFilterMode === "today" ? todayDate : adminFilterDate;
  const targetAdminDateObj = new Date(targetAdminDate);
  targetAdminDateObj.setHours(0, 0, 0, 0);

  const displayedTeamUsers = safeTeamUsers.filter(u => selectedAdminDept === "All" || String(u.department) === selectedAdminDept);

  const teamUsersOnDate = displayedTeamUsers.filter(u => {
    const joinDate = new Date(u?.createdAt || Date.now());
    joinDate.setHours(0, 0, 0, 0);
    return joinDate <= targetAdminDateObj;
  });

  const presentUsersList = teamUsersOnDate.filter(u =>
    Array.isArray(u?.attendance) && u.attendance.find(a => a?.date === targetAdminDate && String(a?.status || "").includes("Present"))
  );

  const isTargetWeekend = targetAdminDateObj.getDay() === 0 || targetAdminDateObj.getDay() === 6;
  const absentUsersList = teamUsersOnDate.filter(u => {
    const hasPunched = Array.isArray(u?.attendance) && u.attendance.find(a => a?.date === targetAdminDate);
    return !isTargetWeekend && !hasPunched;
  });

  let adminScopedLeaves = safeAllLeaves.filter(l => selectedAdminDept === "All" || String(l?.department) === selectedAdminDept);
  if (adminFilterMode === "today" || adminFilterMode === "date") {
    adminScopedLeaves = adminScopedLeaves.filter(l => l.date === targetAdminDate);
  } else if (adminFilterMode === "month") {
    adminScopedLeaves = adminScopedLeaves.filter(l => {
      if (!l?.date) return false;
      const d = new Date(l.date);
      return !isNaN(d.getTime()) && d.getMonth() === adminFilterMonth && d.getFullYear() === adminFilterYear;
    });
  }

  const actionRequiredCount = adminScopedLeaves.filter(l => String(l?.status) === "Pending").length;
  const acceptedLeavesCount = adminScopedLeaves.filter(l => String(l?.status) === "Accepted").length;
  const rejectedLeavesCount = adminScopedLeaves.filter(l => String(l?.status) === "Rejected").length;

  let teamTotalScheduled = 0, teamTotalPresent = 0, teamTotalAbsent = 0;
  const currentYear = new Date().getFullYear();

  if (adminFilterMode === "month") {
    const todayObj = new Date(todayDate);
    todayObj.setHours(0, 0, 0, 0);
    const daysInMonthToCalculate = (adminFilterMonth === todayObj.getMonth() && adminFilterYear === todayObj.getFullYear())
      ? todayObj.getDate()
      : new Date(adminFilterYear, adminFilterMonth + 1, 0).getDate();

    displayedTeamUsers.forEach(u => {
      const uJoinDate = new Date(u.createdAt || Date.now());
      uJoinDate.setHours(0, 0, 0, 0);
      for (let day = 1; day <= daysInMonthToCalculate; day++) {
        const loopDate = new Date(adminFilterYear, adminFilterMonth, day);
        loopDate.setHours(0, 0, 0, 0);
        if (loopDate < uJoinDate || loopDate > todayObj) continue;
        const isWeekend = loopDate.getDay() === 0 || loopDate.getDay() === 6;
        const isoDate = getLocalDateStr(loopDate);
        const record = Array.isArray(u.attendance) ? u.attendance.find(a => a.date === isoDate) : null;
        if (isWeekend && !record) continue;
        teamTotalScheduled++;
        if (record?.status?.includes("Present")) teamTotalPresent++;
        else if (record?.status !== "On Leave") teamTotalAbsent++;
      }
    });
  }
  const teamPresentPct = teamTotalScheduled > 0 ? ((teamTotalPresent / teamTotalScheduled) * 100).toFixed(1) : "0.0";
  const teamAbsentPct = teamTotalScheduled > 0 ? ((teamTotalAbsent / teamTotalScheduled) * 100).toFixed(1) : "0.0";

  // Personal data
  const myLeaves = safeAllLeaves.filter(l => String(l?.employeeId) === String(currentUser?.id || currentUser?._id));
  const myPendingLeavesList = myLeaves.filter(l => String(l?.status) === "Pending");
  const myRejectedLeavesList = myLeaves.filter(l => String(l?.status) === "Rejected");

  let myActiveRecords: (AttendanceRecord & { day: string })[] = [];
  let myAbsentRecords: { date: string; day: string }[] = [];
  let myOnLeaveRecords: AttendanceRecord[] = [];
  let myWeekendRecords: (AttendanceRecord & { day: string })[] = [];

  const currentMonth = new Date().getMonth();
  const todayDateObj = new Date(todayDate);
  todayDateObj.setHours(0, 0, 0, 0);
  const parsedJoin = new Date(currentUser?.createdAt || Date.now());
  const joinDate = isNaN(parsedJoin.getTime()) ? new Date() : parsedJoin;
  joinDate.setHours(0, 0, 0, 0);
  const daysToCalculate = new Date().getDate();

  for (let day = 1; day <= daysToCalculate; day++) {
    const loopDate = new Date(currentYear, currentMonth, day);
    loopDate.setHours(0, 0, 0, 0);
    if (loopDate < joinDate || loopDate > todayDateObj) continue;
    const isWeekend = loopDate.getDay() === 0 || loopDate.getDay() === 6;
    const isoDate = getLocalDateStr(loopDate);
    const dayOfWeek = loopDate.toLocaleDateString('en-US', { weekday: 'long' });
    const record = safeAttendance.find(a => a?.date === isoDate);
    if (isWeekend && !record) continue;
    const safeStatusStr = String(record?.status || "");
    if (safeStatusStr.includes("Present")) {
      if (record) {
        myActiveRecords.push({ ...record, day: dayOfWeek });
        if (isWeekend) myWeekendRecords.push({ ...record, day: dayOfWeek });
      }
    } else if (safeStatusStr === "On Leave") {
      if (record) myOnLeaveRecords.push(record);
    } else {
      myAbsentRecords.push({ date: isoDate, day: dayOfWeek });
    }
  }

  // Modal sub-filter
  let displayMyActive = myActiveRecords;
  if (activeModal?.type === "myPresent") {
    if (modalSubFilter === "Office") displayMyActive = myActiveRecords.filter(r => String(r?.status) === "Present" || String(r?.status) === "Present (Office)");
    if (modalSubFilter === "WFH") displayMyActive = myActiveRecords.filter(r => String(r?.status) === "Present (WFH)");
    if (modalSubFilter === "Leave") displayMyActive = myActiveRecords.filter(r => String(r?.status) === "On Leave");
  }

  let displayModalTeamPresent = presentUsersList;
  if (activeModal?.type === "teamPresent") {
    if (modalSubFilter === "Office") displayModalTeamPresent = presentUsersList.filter(u => {
      const s = String(Array.isArray(u?.attendance) ? u.attendance.find(a => a?.date === targetAdminDate)?.status || "" : "");
      return s === "Present" || s === "Present (Office)";
    });
    if (modalSubFilter === "WFH") displayModalTeamPresent = presentUsersList.filter(u =>
      String(Array.isArray(u?.attendance) ? u.attendance.find(a => a?.date === targetAdminDate)?.status || "" : "") === "Present (WFH)"
    );
  }

  let displayAdminLeaves: Leave[] = [];
  if (activeModal?.type === "teamAccepted" || activeModal?.type === "teamRejected" || activeModal?.type === "teamAction") {
    const targetStatus = activeModal.type === "teamAccepted" ? "Accepted" : activeModal.type === "teamRejected" ? "Rejected" : "Pending";
    displayAdminLeaves = adminScopedLeaves.filter(l => String(l?.status) === targetStatus);
  }

  let activeModalCount = 0;
  if (activeModal?.type === "myPresent") activeModalCount = displayMyActive.length;
  if (activeModal?.type === "myAbsent") activeModalCount = myAbsentRecords.length;
  if (activeModal?.type === "myPTO") activeModalCount = myOnLeaveRecords.length;
  if (activeModal?.type === "myPending") activeModalCount = myPendingLeavesList.length;
  if (activeModal?.type === "myRejected") activeModalCount = myRejectedLeavesList.length;
  if (activeModal?.type === "myTotalLeaves") activeModalCount = myLeaves.length;
  if (activeModal?.type === "myWeekend") activeModalCount = myWeekendRecords.length;
  if (activeModal?.type === "teamTotal") activeModalCount = (adminFilterMode === "month" ? displayedTeamUsers : teamUsersOnDate).length;
  if (activeModal?.type === "teamPresent") activeModalCount = displayModalTeamPresent.length;
  if (activeModal?.type === "teamAbsent") activeModalCount = absentUsersList.length;
  if (activeModal?.type === "teamAction" || activeModal?.type === "teamAccepted" || activeModal?.type === "teamRejected") activeModalCount = displayAdminLeaves.length;

  const renderBasicFilterTabs = (options: string[]) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl w-fit">
        {options.map(opt => (
          <button key={opt} onClick={() => setModalSubFilter(opt)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${modalSubFilter === opt ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}>
            {opt}
          </button>
        ))}
      </div>
      <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold border border-blue-100">
        Showing {activeModalCount} Record{activeModalCount !== 1 ? 's' : ''}
      </div>
    </div>
  );

  const renderModalContent = () => {
    if (!activeModal) return <></>;

    if (activeModal.type === "myPresent" || activeModal.type === "myWeekend") {
      const dataToRender = activeModal.type === "myWeekend" ? myWeekendRecords : displayMyActive;
      return (
        <div>
          {activeModal.type === "myPresent" && renderBasicFilterTabs(["All", "Office", "WFH", "Leave"])}
          {dataToRender.length === 0 ? <p className="text-slate-500 p-8 text-center font-bold">No records found for this filter.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50"><tr><th className="p-4 text-slate-500">Date</th><th className="p-4 text-slate-500">Day</th><th className="p-4 text-slate-500">Status</th><th className="p-4 text-slate-500">Check In</th><th className="p-4 text-slate-500">Check Out</th></tr></thead>
                <tbody>{dataToRender.map((r, i) => (
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors" key={r?.date || i}>
                    <td className="p-4 font-bold text-slate-700">{String(r?.date || "")}</td>
                    <td className="p-4 text-slate-500 font-medium">{String(r?.day || "")}</td>
                    <td className="p-4">
                      {activeModal.type === "myWeekend"
                        ? <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Weekend OT</span>
                        : <span className={`px-3 py-1 rounded-full text-xs font-bold ${r?.status === 'On Leave' ? 'bg-purple-100 text-purple-700' : String(r?.status || "").includes('WFH') ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                          {r?.status === "Present" ? "Present (Office)" : String(r?.status || "Unknown")}
                        </span>}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{r?.status === 'On Leave' ? "N/A" : String(r?.checkIn || "")}</td>
                    <td className="p-4 text-slate-500 font-medium">{r?.status === 'On Leave' ? "N/A" : (r?.checkOut ? String(r.checkOut) : "--:--")}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (activeModal.type === "myAbsent") {
      return myAbsentRecords.length === 0
        ? <p className="text-slate-500 p-8 text-center font-bold">Perfect attendance! No absences.</p>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="p-4 text-slate-500">Date</th><th className="p-4 text-slate-500">Day</th><th className="p-4 text-slate-500">Status</th></tr></thead>
              <tbody>{myAbsentRecords.map((r, i) => (
                <tr className="border-b border-slate-50 hover:bg-slate-50" key={r?.date || i}>
                  <td className="p-4 font-bold text-slate-700">{String(r?.date || "")}</td>
                  <td className="p-4 text-slate-500 font-medium">{String(r?.day || "")}</td>
                  <td className="p-4"><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Absent</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        );
    }

    if (activeModal.type === "myPending" || activeModal.type === "myRejected" || activeModal.type === "myTotalLeaves" || activeModal.type === "myPTO") {
      let listToRender: any[] = [];
      if (activeModal.type === "myPending") listToRender = myPendingLeavesList;
      else if (activeModal.type === "myRejected") listToRender = myRejectedLeavesList;
      else if (activeModal.type === "myTotalLeaves") listToRender = myLeaves;
      else if (activeModal.type === "myPTO") listToRender = myOnLeaveRecords;
      return listToRender.length === 0
        ? <p className="text-slate-500 p-8 text-center font-bold">No requests found.</p>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50"><tr><th className="p-4 text-slate-500">Date</th><th className="p-4 text-slate-500">{activeModal.type === "myPTO" ? "Status" : "Reason"}</th>{activeModal.type !== "myPTO" && <th className="p-4 text-slate-500">Status</th>}</tr></thead>
              <tbody>{listToRender.map((r, i) => (
                <tr className="border-b border-slate-50 hover:bg-slate-50" key={r?.id || r?._id || r?.date || i}>
                  <td className="p-4 font-bold text-slate-700">{String(r?.date || "")}</td>
                  {activeModal.type === "myPTO"
                    ? <td className="p-4"><span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">Approved PTO</span></td>
                    : <>
                      <td className="p-4 text-slate-600">{String(r?.reason || "No reason provided")}</td>
                      <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${String(r?.status) === 'Accepted' ? 'bg-green-100 text-green-700' : String(r?.status) === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{String(r?.status || "Unknown")}</span></td>
                    </>}
                </tr>
              ))}</tbody>
            </table>
          </div>
        );
    }

    if (activeModal.type === "teamPresent") {
      return (
        <div>
          {renderBasicFilterTabs(["All", "Office", "WFH"])}
          {displayModalTeamPresent.length === 0
            ? <p className="text-slate-500 p-8 text-center font-bold">No employees found for this filter.</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50"><tr><th className="p-4 text-slate-500">ID</th><th className="p-4 text-slate-500">Name</th><th className="p-4 text-slate-500">Status</th><th className="p-4 text-slate-500">Check In</th><th className="p-4 text-slate-500">Check Out</th><th className="p-4 text-slate-500">Department</th></tr></thead>
                  <tbody>{displayModalTeamPresent.map((u, i) => {
                    const targetRec = Array.isArray(u?.attendance) ? u.attendance.find(a => a?.date === targetAdminDate) : null;
                    const s = String(targetRec?.status || "Present");
                    return (
                      <tr className="border-b border-slate-50 hover:bg-slate-50" key={u?.id || u?._id || i}>
                        <td className="p-4 font-medium text-slate-500">{String(u?.id || u?._id || "")}</td>
                        <td className="p-4 font-bold text-slate-800">{String(u?.name || "")}</td>
                        <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${s.includes('WFH') ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>{s === "Present" ? "Present (Office)" : s}</span></td>
                        <td className="p-4 text-slate-600 font-medium">{targetRec ? String(targetRec.checkIn || "") : "N/A"}</td>
                        <td className="p-4 text-slate-500 font-medium">{targetRec ? (targetRec.checkOut ? String(targetRec.checkOut) : "--:--") : "N/A"}</td>
                        <td className="p-4 text-sm font-medium text-slate-600">{String(u?.department || "")}</td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            )}
        </div>
      );
    }

    if (activeModal.type === "teamAccepted" || activeModal.type === "teamRejected" || activeModal.type === "teamAction") {
      const statusColor = activeModal.type === "teamAccepted" ? "bg-green-100 text-green-700" : activeModal.type === "teamRejected" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700";
      return (
        <div>
          {displayAdminLeaves.length === 0
            ? <p className="text-slate-500 p-8 text-center font-bold">No records found for this date range.</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50"><tr><th className="p-4 text-slate-500">Employee</th><th className="p-4 text-slate-500">Requested For</th><th className="p-4 text-slate-500">Reason</th><th className="p-4 text-slate-500">Status</th></tr></thead>
                  <tbody>{displayAdminLeaves.map((l, i) => (
                    <tr className="border-b border-slate-50 hover:bg-slate-50" key={l?.id || l?._id || i}>
                      <td className="p-4 font-bold text-slate-800">{String(l?.employeeName || "")} <span className="text-xs font-normal text-slate-500 ml-2">{String(l?.department || "")}</span></td>
                      <td className="p-4 text-slate-500 font-medium flex items-center gap-2 mt-2"><FaCalendarAlt className="text-slate-300" />{String(l?.date || "")}</td>
                      <td className="p-4 text-sm text-slate-600 italic">"{String(l?.reason || "No reason provided")}"</td>
                      <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>{String(l?.status || "Unknown")}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
        </div>
      );
    }

    if (activeModal.type === "teamTotal" || activeModal.type === "teamAbsent") {
      const data = activeModal.type === "teamTotal" ? (adminFilterMode === "month" ? displayedTeamUsers : teamUsersOnDate) : absentUsersList;
      return data.length === 0
        ? <p className="text-slate-500 p-8 text-center font-bold">No employees in this category.</p>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="p-4 text-slate-500">ID</th><th className="p-4 text-slate-500">Name</th><th className="p-4 text-slate-500">Contact</th><th className="p-4 text-slate-500">Department</th></tr></thead>
              <tbody>{data.map((u, i) => (
                <tr className="border-b border-slate-50 hover:bg-slate-50" key={u?.id || u?._id || i}>
                  <td className="p-4 font-medium text-slate-500">{String(u?.id || u?._id || "")}</td>
                  <td className="p-4 font-bold text-slate-800">{String(u?.name || "")}</td>
                  <td className="p-4 text-sm text-slate-500">{String(u?.email || "")}<br />{String(u?.phone || "")}</td>
                  <td className="p-4 text-sm font-medium">{String(u?.department || "")}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        );
    }

    return <></>;
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <MainLayout>

      {/* ── WORK MODE MODAL ── */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center text-white relative">
              <button onClick={() => { setShowLocationModal(false); setLocationError(""); }} className="absolute top-4 right-4 text-white/50 hover:text-white transition cursor-pointer">
                <FaTimes className="text-xl" />
              </button>
              <FaFingerprint className="text-5xl mx-auto mb-3 text-white/80" />
              <h2 className="text-2xl font-bold">Select Work Mode</h2>
              <p className="text-blue-100 text-sm mt-1">Please confirm your working location for today's shift.</p>
            </div>
            <div className="p-8 flex gap-4">
              <button onClick={() => handleLocationPunch("Office")} className="flex-1 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-500 p-6 rounded-2xl transition-all group cursor-pointer">
                <FaBuilding className="text-4xl text-slate-400 group-hover:text-blue-600 mb-3 transition-colors" />
                <span className="font-bold text-slate-700 group-hover:text-blue-700">Office</span>
              </button>
              <button onClick={() => handleLocationPunch("WFH")} className="flex-1 flex flex-col items-center justify-center bg-slate-50 hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-500 p-6 rounded-2xl transition-all group cursor-pointer">
                <FaHome className="text-4xl text-slate-400 group-hover:text-purple-600 mb-3 transition-colors" />
                <span className="font-bold text-slate-700 group-hover:text-purple-700">Work From Home</span>
              </button>
            </div>
            {locationError && (
              <div className="mx-8 mb-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-bold flex items-center gap-3">
                <FaMapMarkerAlt className="text-2xl flex-shrink-0" />
                <p>{locationError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── UNDO PUNCH CONFIRMATION MODAL ── */}
      {showUndoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-100 p-6 text-center">
              <FaExclamationTriangle className="text-4xl text-amber-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-slate-800">Undo {undoTarget === "in" ? "Punch In" : "Punch Out"}?</h2>
              <p className="text-slate-500 text-sm mt-2">
                {undoTarget === "in"
                  ? "This will remove your check-in record for today. You can punch in again."
                  : "This will clear your check-out time. You can punch out again."}
              </p>
            </div>
            <div className="p-6 flex gap-3">
              <button onClick={() => { setShowUndoModal(false); setUndoTarget(null); }}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmUndo} disabled={undoLoading}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition disabled:opacity-60 cursor-pointer">
                {undoLoading ? "Processing..." : "Yes, Undo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DRILL-DOWN MODAL ── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center bg-slate-800 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center gap-3"><FaIdBadge className="text-blue-400" />{activeModal.title}</h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white transition cursor-pointer"><FaTimes className="text-2xl" /></button>
            </div>
            <div className="overflow-y-auto p-6 min-h-[400px]">{renderModalContent()}</div>
            <div className="bg-slate-50 p-4 text-right border-t border-slate-200">
              <button onClick={() => setActiveModal(null)} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-100 transition shadow-sm cursor-pointer">Close Report</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-slate-50 -mx-4 md:-mx-8 px-4 md:px-8 pt-6 pb-4 border-b border-slate-200 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 leading-tight">
              Welcome back, {String(currentUser?.name || "User")}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Here is your {isAdmin ? (dashboardView === "personal" ? "personal" : "department") : "personal"} overview for today.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
              <span className="text-2xl font-black text-slate-800 leading-tight">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            {isAdmin && (
              <div className="flex bg-slate-200 p-1 rounded-xl gap-1">
                <button onClick={() => setDashboardView("personal")}
                  className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${dashboardView === "personal" ? 'bg-white shadow-md text-blue-600' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300'}`}>
                  My Personal Data
                </button>
                <button onClick={() => setDashboardView("department")}
                  className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${dashboardView === "department" ? 'bg-white shadow-md text-blue-600' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300'}`}>
                  Department
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PERSONAL VIEW ── */}
      {(!isAdmin || dashboardView === "personal") && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

            {/* PUNCH CLOCK */}
            <div className="lg:col-span-1">
              <div className={`${isAdmin ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'} p-8 rounded-3xl shadow-lg border flex flex-col items-center justify-center text-center ${isAdmin ? 'text-white' : 'text-slate-800'} h-full min-h-[320px] relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 ${isAdmin ? 'bg-white' : 'bg-blue-500'}`}></div>
                <FaFingerprint className={`text-6xl mb-6 z-10 ${isAdmin ? 'text-slate-500' : 'text-blue-300'}`} />
                <h2 className="text-2xl font-bold mb-6 z-10">Daily Time Clock</h2>

                <div className="w-full z-10 space-y-3">
                  {!hasPunchedIn ? (
                    <button onClick={() => setShowLocationModal(true)}
                      className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg shadow-green-500/30 hover:bg-green-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                      PUNCH IN
                    </button>
                  ) : !hasPunchedOut ? (
                    <div className="w-full animate-fadeIn space-y-3">
                      <p className={`font-bold px-4 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 ${isAdmin ? 'text-green-400 bg-green-900/40 border-green-800' : 'text-green-700 bg-green-100 border-green-300'}`}>
                        <span className="flex items-center gap-2"><FaCheckCircle /> In at {String(todayRecord?.checkIn || "")}</span>
                        <span className="text-xs font-normal opacity-80">{String(todayRecord?.status || "")}</span>
                      </p>
                      <button onClick={() => executePunch("out")}
                        className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg shadow-red-500/30 hover:bg-red-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                        PUNCH OUT
                      </button>
                      {canUndoPunchIn && (
                        <button onClick={() => handleUndoRequest("in")}
                          className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-2 rounded-xl border transition cursor-pointer ${isAdmin ? 'border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-amber-400' : 'border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300'}`}>
                          <FaUndo className="text-xs" /> Undo Punch In
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-full space-y-3 animate-fadeIn">
                      <div className={`py-5 rounded-2xl font-bold text-xl border ${isAdmin ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        Shift Completed
                        <p className={`text-sm font-normal mt-2 ${isAdmin ? 'text-slate-400' : 'text-slate-400'}`}>
                          {String(todayRecord?.checkIn || "")} – {String(todayRecord?.checkOut || "")}
                        </p>
                        <p className={`text-xs font-medium mt-1 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>{String(todayRecord?.status || "")}</p>
                      </div>
                      {canUndoPunchOut && (
                        <button onClick={() => handleUndoRequest("out")}
                          className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-2 rounded-xl border transition cursor-pointer ${isAdmin ? 'border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-amber-400' : 'border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300'}`}>
                          <FaUndo className="text-xs" /> Undo Punch Out
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-lg text-white flex flex-col h-full relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 opacity-10"><FaChartLine className="text-[200px]" /></div>
                <h2 className="text-2xl font-bold mb-2 z-10">Portal Quick Actions</h2>
                <p className="text-blue-100 font-medium mb-8 z-10">Navigate to your most frequently used tools.</p>
                <div className="space-y-4 flex-grow flex flex-col justify-center z-10">
                  <Link to="/attendance" className="bg-white/10 hover:bg-white/20 border border-white/20 p-5 rounded-2xl flex items-center justify-between transition group backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center"><FaChartPie className="text-xl" /></div>
                      <div><div className="font-bold text-lg">View Attendance History</div><div className="text-sm text-blue-200 opacity-90 mt-0.5">Check your detailed monthly reports</div></div>
                    </div>
                    <div className="text-2xl opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition transform">→</div>
                  </Link>
                  <Link to="/leaves" className="bg-white/10 hover:bg-white/20 border border-white/20 p-5 rounded-2xl flex items-center justify-between transition group backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center"><FaFileInvoice className="text-xl" /></div>
                      <div><div className="font-bold text-lg">Apply for Time Off</div><div className="text-sm text-blue-200 opacity-90 mt-0.5">Submit a new leave request</div></div>
                    </div>
                    <div className="text-2xl opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition transform">→</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* PERSONAL STATS */}
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><FaUserClock className="text-blue-500" /> My Personal Month</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
            {[
              { label: "Present", value: myActiveRecords.length, icon: <FaClock />, color: "green", type: "myPresent" as DrillDownType },
              { label: "Wknd OT", value: myWeekendRecords.length, icon: <MdEventAvailable />, color: "yellow", type: "myWeekend" as DrillDownType },
              { label: "Absent", value: myAbsentRecords.length, icon: <FaUserTimes />, color: "red", type: "myAbsent" as DrillDownType },
              { label: "Requests", value: myLeaves.length, icon: <FaFileInvoice />, color: "blue", type: "myTotalLeaves" as DrillDownType },
              { label: "PTO", value: myOnLeaveRecords.length, icon: <FaCheckCircle />, color: "purple", type: "myPTO" as DrillDownType },
              { label: "Pending", value: myPendingLeavesList.length, icon: <FaExclamationCircle />, color: "orange", type: "myPending" as DrillDownType },
            ].map(({ label, value, icon, color, type }) => (
              <div key={type} onClick={() => openModal(`My ${label}`, type)}
                className="cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center group">
                <div className={`w-12 h-12 rounded-xl bg-${color}-50 border border-${color}-100 flex items-center justify-center text-${color}-600 text-xl group-hover:bg-${color}-500 group-hover:text-white transition-colors mb-3`}>{icon}</div>
                <h3 className="text-2xl font-black text-slate-800">{value}</h3>
                <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DEPARTMENT VIEW ── */}
      {isAdmin && dashboardView === "department" && (
        <div className="animate-fadeIn">

          {/* PENDING LEAVES */}
          <div className="mb-10">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaExclamationCircle className="text-orange-500" /> Pending Leave Requests</h2>
                <Link to="/leaves" className="text-sm font-bold text-blue-600 hover:underline bg-blue-50 px-4 py-2 rounded-lg">Manage All Leaves</Link>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {safeAllLeaves.filter(l => String(l?.status) === "Pending" && (isSuperAdmin || String(l?.department) === String(currentUser?.department))).length > 0
                  ? safeAllLeaves.filter(l => String(l?.status) === "Pending" && (isSuperAdmin || String(l?.department) === String(currentUser?.department))).map((leave, idx) => (
                    <div key={leave?.id || leave?._id || idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                      <div>
                        <div className="font-bold text-slate-800">{String(leave?.employeeName || "")} <span className="text-xs font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 ml-2">{String(leave?.department || "")}</span></div>
                        <div className="text-sm text-slate-500 mt-1 flex items-center gap-2"><FaCalendarDay className="text-slate-300" /> {String(leave?.date || "")}</div>
                        <div className="text-sm text-slate-600 mt-1 italic">"{String(leave?.reason || "No reason provided")}"</div>
                      </div>
                      <Link to="/leaves" className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">Review</Link>
                    </div>
                  ))
                  : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4"><FaCheckCircle className="text-2xl text-green-500" /></div>
                      <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
                      <p className="text-slate-500 font-medium">No pending requests for your department.</p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* DEPARTMENT STATS */}
          <div className="mb-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto shrink-0 z-20 relative">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaBuilding className="text-slate-500" /> Department Overview</h2>
                <select value={selectedAdminDept} onChange={e => setSelectedAdminDept(e.target.value)}
                  className="bg-white border border-slate-200 p-2.5 rounded-xl font-bold text-sm text-blue-700 outline-none shadow-sm cursor-pointer w-full sm:w-auto min-w-[200px]">
                  <option value="All">All Departments</option>
                  {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row bg-white p-2 rounded-2xl shadow-sm border border-slate-100 items-start sm:items-center gap-3 w-full xl:w-auto justify-between z-10 relative">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit shrink-0">
                  {(["today", "date", "month"] as const).map(mode => (
                    <button key={mode} onClick={() => setAdminFilterMode(mode)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${adminFilterMode === mode ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                      {mode === "today" ? "Today" : mode === "date" ? "Select Date" : "Month"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-start sm:justify-end gap-2 px-2 w-full sm:w-[260px] h-[40px]">
                  {adminFilterMode === "today" && <span className="text-sm text-slate-400 font-medium italic pr-2">Live metrics</span>}
                  {adminFilterMode === "date" && <input type="date" value={adminFilterDate} onChange={e => setAdminFilterDate(e.target.value)} className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-sm text-slate-700 outline-none w-full shadow-inner" />}
                  {adminFilterMode === "month" && (
                    <>
                      <select value={adminFilterMonth} onChange={e => setAdminFilterMonth(Number(e.target.value))} className="w-1/2 bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-sm text-slate-700 outline-none shadow-inner">
                        {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{new Date(2000, i).toLocaleString('default', { month: 'short' })}</option>)}
                      </select>
                      <select value={adminFilterYear} onChange={e => setAdminFilterYear(Number(e.target.value))} className="w-1/2 bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-sm text-slate-700 outline-none shadow-inner">
                        {Array.from({ length: 10 }).map((_, i) => <option key={i} value={currentYear - i}>{currentYear - i}</option>)}
                      </select>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div onClick={() => openModal("Total Team Roster", "teamTotal")} className="cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <StatsCard title={isSuperAdmin ? "Total Employees" : "Team Size"} value={String((adminFilterMode === "month" ? displayedTeamUsers : teamUsersOnDate).length || "0")} icon={<FaUsers className="text-blue-500" />} />
              </div>
              {adminFilterMode !== "month" && (
                <>
                  <div onClick={() => openModal("Online", "teamPresent")} className="cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <StatsCard title={adminFilterMode === "today" ? "Online Today" : "Online on Date"} value={String(presentUsersList.length || "0")} icon={<FaUserCheck className="text-green-500" />} />
                  </div>
                  <div onClick={() => openModal("Offline / Absent", "teamAbsent")} className="cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <StatsCard title={adminFilterMode === "today" ? "Offline Today" : "Offline on Date"} value={String(absentUsersList.length || "0")} icon={<FaUserTimes className="text-red-500" />} />
                  </div>
                </>
              )}
              {adminFilterMode === "month" && (
                <>
                  <div className="cursor-default"><StatsCard title="Avg Present Rate" value={`${teamPresentPct}%`} icon={<FaChartPie className="text-green-500" />} /></div>
                  <div className="cursor-default"><StatsCard title="Avg Absent Rate" value={`${teamAbsentPct}%`} icon={<FaUserTimes className="text-red-500" />} /></div>
                </>
              )}
              <div onClick={() => openModal("Action Required (Leaves)", "teamAction")} className="cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <StatsCard title="Action Required" value={String(actionRequiredCount || "0")} icon={<FaExclamationCircle className="text-orange-500" />} />
              </div>
              <div onClick={() => openModal("Approved Leaves", "teamAccepted")} className="cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <StatsCard title={adminFilterMode === "month" ? "Approved Leaves (Month)" : "Approved Leaves (Date)"} value={String(acceptedLeavesCount || "0")} icon={<FaCheck className="text-green-500" />} />
              </div>
              <div onClick={() => openModal("Rejected Leaves", "teamRejected")} className="cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <StatsCard title={adminFilterMode === "month" ? "Rejected Leaves (Month)" : "Rejected Leaves (Date)"} value={String(rejectedLeavesCount || "0")} icon={<FaBan className="text-red-500" />} />
              </div>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
}
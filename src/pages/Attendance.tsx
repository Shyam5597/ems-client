import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";

// ============================================================================
// INTERFACES
// ============================================================================
interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  status: string;
  createdAt: string;
  attendance: AttendanceRecord[];
}

// ============================================================================
// ICONS
// ============================================================================
const IconSearch = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconBuilding = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconHome = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconOffice = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconFingerprint = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
);
const IconMarker = () => (
  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconClose = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconUndo = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);
const IconWarning = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// ============================================================================
// HELPERS
// ============================================================================
const getLocalDateStr = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getDateStatus = (dateStr: string, userCreatedAt: string, attendance: AttendanceRecord[]) => {
  const targetDate = new Date(dateStr);
  const today = new Date(getLocalDateStr());
  const joinDate = new Date(userCreatedAt || new Date());
  joinDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (targetDate > today) return "Future";
  if (targetDate < joinDate) return "Not Joined";
  const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
  const record = attendance?.find((a) => a.date === dateStr);
  if (record) {
    if (isWeekend && record.status.includes("Present")) return "Weekend OT";
    return record.status;
  }
  if (isWeekend) return "Weekend";
  return "Absent";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Attendance() {
  const getSafeUser = (): User => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : ({} as User);
    } catch {
      return {} as User;
    }
  };

  const [currentUser, setCurrentUser] = useState<User>(getSafeUser);
  const isAdmin = currentUser?.role === "Admin" || currentUser?.role === "MD/CEO";
  const isSuperAdmin =
    currentUser?.role === "MD/CEO" ||
    String(currentUser?.designation || "").toLowerCase().includes("ceo");
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState(
    isAdmin && !isSuperAdmin ? currentUser.department : "All"
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<"personal" | "company">("personal");
  const [adminDateFilter, setAdminDateFilter] = useState(getLocalDateStr());

  // Work mode modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Undo modal
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [undoTarget, setUndoTarget] = useState<"in" | "out" | null>(null);
  const [undoLoading, setUndoLoading] = useState(false);

  const todayDate = getLocalDateStr();
  const todayRecord = currentUser?.attendance?.find((a) => a.date === todayDate) || null;
  const hasPunchedIn = !!todayRecord;
  const hasPunchedOut = !!todayRecord?.checkOut;

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Within-5-minute undo window
  const parseMinutesAgo = (timeStr: string) => {
    if (!timeStr) return Infinity;
    const [timePart, ampm] = timeStr.split(" ");
    if (!timePart) return Infinity;
    const [hStr, mStr] = timePart.split(":");
    let hours = parseInt(hStr, 10);
    const mins = parseInt(mStr, 10);
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    const then = new Date();
    then.setHours(hours, mins, 0, 0);
    return (Date.now() - then.getTime()) / 60000;
  };

  const canUndoPunchIn = hasPunchedIn && !hasPunchedOut && parseMinutesAgo(todayRecord?.checkIn || "") <= 5;
  const canUndoPunchOut = hasPunchedOut && parseMinutesAgo(todayRecord?.checkOut || "") <= 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: User[] = await res.json();
          setUsers(Array.isArray(data) ? data : []);
          const updatedMe = data.find((u) => u.id === currentUser.id);
          if (updatedMe) setCurrentUser(updatedMe);
        }
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    if (token) fetchUsers();
  }, [token, currentUser.id]);

  // ============================================================================
  // STATS
  // ============================================================================
  const calculateStats = () => {
    let scheduledDays = 0, presentDays = 0, absentDays = 0, leaveDays = 0, weekendOT = 0;
    const todayObj = new Date(getLocalDateStr());
    todayObj.setHours(0, 0, 0, 0);
    const daysInMonthToCalculate =
      selectedMonth === todayObj.getMonth() && selectedYear === todayObj.getFullYear()
        ? todayObj.getDate()
        : new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const joinDate = new Date(currentUser?.createdAt || Date.now());
    joinDate.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonthToCalculate; day++) {
      const loopDate = new Date(selectedYear, selectedMonth, day);
      loopDate.setHours(0, 0, 0, 0);
      if (loopDate < joinDate || loopDate > todayObj) continue;
      const isWeekend = loopDate.getDay() === 0 || loopDate.getDay() === 6;
      const isoDate = getLocalDateStr(loopDate);
      const record = (currentUser?.attendance || []).find((a) => a.date === isoDate);
      const safeStatus = String(record?.status || "");
      if (isWeekend && !record) continue;
      scheduledDays++;
      if (safeStatus.includes("Present")) { presentDays++; if (isWeekend) weekendOT++; }
      else if (safeStatus === "On Leave") leaveDays++;
      else absentDays++;
    }

    return {
      scheduledDays, presentDays, absentDays, leaveDays, weekendOT,
      presentPercentage: scheduledDays > 0 ? ((presentDays / scheduledDays) * 100).toFixed(1) : "0.0",
      absentPercentage: scheduledDays > 0 ? ((absentDays / scheduledDays) * 100).toFixed(1) : "0.0",
    };
  };

  const stats = calculateStats();

  const monthlyHistory = (currentUser?.attendance || []).filter((a) => {
    const [year, month] = a.date.split("-");
    return Number(month) - 1 === selectedMonth && Number(year) === selectedYear;
  });

  // ============================================================================
  // PUNCH WITH WORK MODE MODAL
  // ============================================================================
  const executePunch = async (type: "in" | "out", workModeStatus: string = "Present") => {
    if (!currentUser?.id) return;
    const timeNow = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    let newAttendance = [...(currentUser?.attendance || [])];

    if (type === "in") {
      newAttendance.push({ date: todayDate, checkIn: timeNow, checkOut: "", status: workModeStatus });
    } else {
      const index = newAttendance.findIndex((a) => a.date === todayDate);
      if (index !== -1) newAttendance[index].checkOut = timeNow;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ attendance: newAttendance }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setShowLocationModal(false);
      }
    } catch (err) {
      alert("Failed to punch.");
    }
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

  // ============================================================================
  // UNDO PUNCH
  // ============================================================================
  const handleUndoRequest = (type: "in" | "out") => {
    setUndoTarget(type);
    setShowUndoModal(true);
  };

  const confirmUndo = async () => {
    if (!currentUser?.id || !undoTarget) return;
    setUndoLoading(true);
    let newAttendance = [...(currentUser?.attendance || [])];
    const index = newAttendance.findIndex((a) => a.date === todayDate);
    if (undoTarget === "in") {
      if (index !== -1) newAttendance.splice(index, 1);
    } else if (undoTarget === "out") {
      if (index !== -1) newAttendance[index] = { ...newAttendance[index], checkOut: "" };
    }
    try {
      const res = await fetch(`http://localhost:5000/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ attendance: newAttendance }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }
    } catch { alert("Undo failed."); }
    setUndoLoading(false);
    setShowUndoModal(false);
    setUndoTarget(null);
  };

  // ============================================================================
  // ADMIN OVERRIDE
  // ============================================================================
  const adminOverride = async (userId: string, newStatus: string) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return;
    let newAttendance = [...(userToUpdate.attendance || [])];
    const index = newAttendance.findIndex((a) => a.date === adminDateFilter);
    if (newStatus === "Present") {
      if (index === -1) {
        newAttendance.push({ date: adminDateFilter, checkIn: "09:00 AM (Override)", checkOut: "06:00 PM (Override)", status: "Present" });
      } else {
        newAttendance[index] = { ...newAttendance[index], status: "Present", checkIn: newAttendance[index].checkIn || "09:00 AM (Override)", checkOut: newAttendance[index].checkOut || "06:00 PM (Override)" };
      }
    } else if (newStatus === "Absent") {
      if (index !== -1) newAttendance.splice(index, 1);
    }
    try {
      await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ attendance: newAttendance }),
      });
      setUsers(users.map((u) => (u.id === userId ? { ...u, attendance: newAttendance } : u)));
    } catch { alert("Failed to override."); }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" ? true : user.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = Array.from(new Set(users.map((u) => u.department)));
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <MainLayout>

      {/* ── WORK MODE MODAL ── */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center text-white relative">
              <button
                onClick={() => { setShowLocationModal(false); setLocationError(""); }}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition cursor-pointer"
              >
                <IconClose />
              </button>
              <div className="flex justify-center mb-3 opacity-80"><IconFingerprint /></div>
              <h2 className="text-2xl font-bold">Select Work Mode</h2>
              <p className="text-blue-100 text-sm mt-1">Please confirm your working location for today's shift.</p>
            </div>
            <div className="p-8 flex gap-4">
              <button
                onClick={() => handleLocationPunch("Office")}
                className="flex-1 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-500 p-6 rounded-2xl transition-all group cursor-pointer"
              >
                <div className="text-slate-400 group-hover:text-blue-600 mb-3 transition-colors"><IconOffice /></div>
                <span className="font-bold text-slate-700 group-hover:text-blue-700">Office</span>
              </button>
              <button
                onClick={() => handleLocationPunch("WFH")}
                className="flex-1 flex flex-col items-center justify-center bg-slate-50 hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-500 p-6 rounded-2xl transition-all group cursor-pointer"
              >
                <div className="text-slate-400 group-hover:text-purple-600 mb-3 transition-colors"><IconHome /></div>
                <span className="font-bold text-slate-700 group-hover:text-purple-700">Work From Home</span>
              </button>
            </div>
            {locationError && (
              <div className="mx-8 mb-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-bold flex items-center gap-3">
                <IconMarker />
                <p>{locationError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── UNDO CONFIRMATION MODAL ── */}
      {showUndoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-100 p-6 text-center">
              <div className="flex justify-center text-amber-500 mb-3"><IconWarning /></div>
              <h2 className="text-xl font-bold text-slate-800">
                Undo {undoTarget === "in" ? "Check In" : "Check Out"}?
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                {undoTarget === "in"
                  ? "This will remove your check-in record for today. You can check in again."
                  : "This will clear your check-out time. You can check out again."}
              </p>
            </div>
            <div className="p-6 flex gap-3">
              <button
                onClick={() => { setShowUndoModal(false); setUndoTarget(null); }}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmUndo}
                disabled={undoLoading}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition disabled:opacity-60 cursor-pointer"
              >
                {undoLoading ? "Processing..." : "Yes, Undo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-40 bg-slate-50 -mx-4 md:-mx-8 px-4 md:px-8 pt-6 pb-4 border-b border-slate-200 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Attendance Portal</h1>
            <p className="text-slate-500 font-medium mt-1">
              Track daily attendance, review history, and manage records.
            </p>
          </div>
          {isAdmin && (
            <div className="flex bg-slate-200 p-1 rounded-xl gap-1 self-start sm:self-auto flex-shrink-0">
              <button
                onClick={() => setActiveTab("personal")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === "personal" ? "bg-white text-blue-600 shadow" : "text-slate-500 hover:text-slate-700"}`}
              >
                <IconUser /> My Attendance
              </button>
              <button
                onClick={() => setActiveTab("company")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === "company" ? "bg-white text-blue-600 shadow" : "text-slate-500 hover:text-slate-700"}`}
              >
                <IconBuilding /> Company Records
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          PERSONAL TAB
      ================================================================ */}
      {activeTab === "personal" && (
        <div className="space-y-6">

          {/* Today's Widget */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Today's Status</h2>
              <div className="flex flex-wrap gap-8 text-sm font-semibold text-slate-500">
                <div>Date:<br /><span className="text-slate-800 text-lg">{todayDate}</span></div>
                <div>Check In:<br /><span className="text-blue-600 text-lg">{todayRecord?.checkIn || "--:--"}</span></div>
                <div>Check Out:<br /><span className="text-blue-600 text-lg">{todayRecord?.checkOut || "--:--"}</span></div>
                <div>Status:<br />
                  <span className={`px-3 py-1 rounded-full text-white text-xs mt-1 inline-block ${!todayRecord ? "bg-slate-400" : todayRecord.status === "On Leave" ? "bg-purple-500" : todayRecord.status.includes("WFH") ? "bg-indigo-500" : "bg-green-500"}`}>
                    {!todayRecord ? "Not Marked" : todayRecord.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0 min-w-[160px]">
              {!hasPunchedIn ? (
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition cursor-pointer"
                >
                  Check In
                </button>
              ) : !hasPunchedOut && todayRecord?.status !== "On Leave" ? (
                <>
                  <button
                    onClick={() => executePunch("out")}
                    className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition cursor-pointer"
                  >
                    Check Out
                  </button>
                  {canUndoPunchIn && (
                    <button
                      onClick={() => handleUndoRequest("in")}
                      className="flex items-center justify-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition cursor-pointer"
                    >
                      <IconUndo /> Undo Check In
                    </button>
                  )}
                </>
              ) : hasPunchedOut ? (
                <>
                  <div className="bg-slate-100 text-slate-500 px-6 py-3 rounded-xl font-bold text-center text-sm">
                    Shift Complete
                  </div>
                  {canUndoPunchOut && (
                    <button
                      onClick={() => handleUndoRequest("out")}
                      className="flex items-center justify-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition cursor-pointer"
                    >
                      <IconUndo /> Undo Check Out
                    </button>
                  )}
                </>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">

              {/* Period Selector */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Select Period</h3>
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full bg-slate-100 border-0 rounded-lg p-3 font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i} value={i}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-1/3 bg-slate-100 border-0 rounded-lg p-3 font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Visual Calendar */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Attendance Calendar</h3>
                <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div key={d} className="text-slate-400 py-1">{d}</div>
                  ))}
                  {calendarDays.map((day) => {
                    const loopDate = new Date(selectedYear, selectedMonth, day);
                    const isoStr = getLocalDateStr(loopDate);
                    const status = getDateStatus(isoStr, currentUser?.createdAt, currentUser?.attendance || []);
                    let bg = "bg-slate-100 text-slate-400";
                    let text = `${day}`;
                    if (status.includes("Present")) { bg = "bg-green-100 text-green-700"; text = `${day} ✔`; }
                    else if (status === "Weekend OT") { bg = "bg-yellow-100 text-yellow-700"; text = `${day} OT`; }
                    else if (status === "On Leave") { bg = "bg-purple-100 text-purple-700"; text = `${day} L`; }
                    else if (status === "Absent") { bg = "bg-red-100 text-red-700"; text = `${day} A`; }
                    else if (status === "Weekend") { bg = "bg-slate-50 text-slate-400"; }
                    else if (status === "Future") { bg = "bg-blue-50 text-blue-300"; }
                    else if (status === "Not Joined") { bg = "bg-slate-50 text-slate-300"; text = `-`; }
                    return <div key={day} className={`py-2.5 rounded-lg ${bg}`} title={status}>{text}</div>;
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-500 justify-center">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 rounded-full"></div>Present</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 rounded-full"></div>Absent</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-100 rounded-full"></div>Leave</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-100 rounded-full"></div>Wknd OT</span>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="bg-slate-900 p-6 rounded-3xl shadow-sm text-white">
                <h3 className="font-bold mb-4 border-b border-slate-700 pb-2">Attendance Summary</h3>
                <div className="space-y-3 font-medium">
                  <div className="flex justify-between text-slate-500 text-sm border-b border-slate-800 pb-2">
                    Completed Scheduled Days <span className="text-white">{stats.scheduledDays}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">Present Days <span className="text-green-400">{stats.presentDays}</span></div>
                  {stats.weekendOT > 0 && (
                    <div className="flex justify-between text-slate-400">↳ Incl. Weekend OT <span className="text-yellow-400">{stats.weekendOT}</span></div>
                  )}
                  <div className="flex justify-between text-slate-400">Absent Days <span className="text-red-400">{stats.absentDays}</span></div>
                  <div className="flex justify-between text-slate-400">Leave Days <span className="text-purple-400">{stats.leaveDays}</span></div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
                    <span className="text-slate-300">Present Rate</span>
                    <span className="text-2xl font-bold text-green-400">{stats.presentPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly History Table */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-fit">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Check In</th>
                    <th className="p-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Check Out</th>
                    <th className="p-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyHistory.map((record, i) => {
                    const isWknd = new Date(record.date).getDay() === 0 || new Date(record.date).getDay() === 6;
                    return (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{record.date}</td>
                        <td className="p-4 text-slate-500">{record.checkIn}</td>
                        <td className="p-4 text-slate-500">{record.checkOut || "--:--"}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            record.status === "On Leave" ? "bg-purple-100 text-purple-700"
                              : isWknd ? "bg-yellow-100 text-yellow-700"
                              : record.status.includes("WFH") ? "bg-indigo-100 text-indigo-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {isWknd && record.status !== "On Leave" ? "Weekend OT" : record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {monthlyHistory.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">No records for this month.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          COMPANY RECORDS TAB (Admin only)
      ================================================================ */}
      {activeTab === "company" && isAdmin && (
        <>
          {/* Filter bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <input
              type="date"
              value={adminDateFilter}
              onChange={(e) => setAdminDateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconSearch /></div>
              <input
                type="text"
                placeholder="Search Employee ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 bg-white border border-slate-300 py-2 px-3 rounded-xl font-medium text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Departments</option>
              {uniqueDepartments.map((d) => <option key={d as string} value={d as string}>{d as string}</option>)}
            </select>
          </div>

          {/* Company Records Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-x-auto">
            <table className="w-full text-left min-w-[750px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">EMP ID</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Override</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const status = getDateStatus(adminDateFilter, user.createdAt, user.attendance);
                  const record = user.attendance?.find((a) => a.date === adminDateFilter);
                  const canEdit = isSuperAdmin || user.department === currentUser.department;
                  const selectedDateObj = new Date(adminDateFilter + "T00:00:00");
                  const isSelectedWeekend = selectedDateObj.getDay() === 0 || selectedDateObj.getDay() === 6;
                  const overrideAllowed = canEdit && (status === "Absent" || status.includes("Present") || status === "Weekend OT" || status === "Weekend");

                  return (
                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-5 font-bold text-slate-600 text-sm">
                        {adminDateFilter}
                        {isSelectedWeekend && <span className="ml-2 text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">Weekend</span>}
                      </td>
                      <td className="p-5 font-medium text-slate-500 text-sm">{user.id}</td>
                      <td className="p-5 font-bold text-slate-800">{user.name}</td>
                      <td className="p-5 text-slate-500 text-sm">{user.department}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap ${
                          status.includes("Present") ? "bg-green-100 text-green-700"
                            : status === "Weekend OT" ? "bg-yellow-100 text-yellow-700"
                            : status === "On Leave" ? "bg-purple-100 text-purple-700"
                            : status === "Weekend" ? "bg-amber-50 text-amber-600"
                            : status === "Future" || status === "Not Joined" ? "bg-slate-100 text-slate-400"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {status}
                        </span>
                        {record?.checkIn && (
                          <div className="text-xs text-slate-400 mt-1 font-medium">
                            {record.checkIn} — {record.checkOut || "--:--"}
                          </div>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-2">
                          {overrideAllowed ? (
                            <>
                              <button onClick={() => adminOverride(user.id, "Present")} className="text-xs bg-slate-100 hover:bg-green-500 hover:text-white text-slate-600 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap">✔ Mark Present</button>
                              <button onClick={() => adminOverride(user.id, "Absent")} className="text-xs bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap">✖ Mark Absent</button>
                            </>
                          ) : (
                            <span className="text-xs bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg font-bold">{!canEdit ? "Diff. Dept" : "N/A"}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-bold">No employees found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </MainLayout>
  );
}
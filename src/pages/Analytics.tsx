import api from "../api"; // Make sure the path points to your new api.js file
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import StatsCard from "../components/StatsCard";

// ============================================================================
// INLINE SVG ICONS: Zero dependencies. Zero crashes. 100% Professional UI.
// ============================================================================
const IconCalendar = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconChart = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const IconUser = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconBuilding = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const IconUsers = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconPie = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const IconShield = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const IconFile = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconBan = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const IconFingerprint = ({ className = "w-6 h-6" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>;
const IconHome = ({ className = "w-6 h-6" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const IconOffice = ({ className = "w-6 h-6" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const IconClose = ({ className = "w-6 h-6" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const IconMarker = ({ className = "w-6 h-6" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconClock = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconUndo = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>;
const IconWarning = ({ className = "w-8 h-8" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

// ============================================================================
// TypeScript Interfaces
// ============================================================================
interface AttendanceRecord { date: string; checkIn: string; checkOut: string; status: string; }
interface Leave { id?: string; _id?: string; employeeId: string; employeeName?: string; department: string; reason: string; status: string; date: string; }
interface User { id?: string; _id?: string; name: string; email?: string; phone?: string; department: string; role: string; designation: string; createdAt: string; attendance: AttendanceRecord[]; }

// ============================================================================
// HELPERS
// ============================================================================
const getLocalDateStr = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

type AnalyticsDrillDown =
  | "dailyHeadcount" | "dailyPresent" | "dailyAbsent" | "dailyLeave" | "dailyRejected"
  | "myPresent" | "myAbsent" | "myPTO" | "myPending" | "myWeekend"
  | "myLeavesMonthTotal" | "myLeavesMonthAccepted" | "myLeavesMonthRejected" | "myLeavesMonthPending"
  | "myLeavesAllTotal" | "myLeavesAllAccepted" | "myLeavesAllRejected" | "myLeavesAllPending"
  | "teamTotal" | "teamPresent" | "teamAbsent" | "teamAction" | "teamAccepted" | "teamRejected" | "teamWeekend";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Analytics() {
  const getSafeUser = (): User => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : {} as User;
    } catch { return {} as User; }
  };

  const [currentUser, setCurrentUser] = useState<User>(getSafeUser);
  const isAdmin = currentUser?.role === "Admin" || currentUser?.role === "MD/CEO";
  const token = localStorage.getItem("token") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);

  const [activeTab, setActiveTab] = useState<"personal" | "company">(isAdmin ? "personal" : "personal");
  const [selectedDept, setSelectedDept] = useState(isAdmin ? (currentUser?.department || "All") : "All");
  const [snapshotDate, setSnapshotDate] = useState(getLocalDateStr());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [activeModal, setActiveModal] = useState<{ title: string; type: AnalyticsDrillDown } | null>(null);
  const [modalSubFilter, setModalSubFilter] = useState<string>("All");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [undoTarget, setUndoTarget] = useState<"in" | "out" | null>(null);
  const [undoLoading, setUndoLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 11 }, (_, i) => currentYear + 5 - i);

  // ============================================================================
  // FETCH DATA
  // ============================================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [usersRes, leavesRes] = await Promise.all([
          fetch("http://localhost:5000/api/users", { headers }),
          fetch("http://localhost:5000/api/leaves", { headers })
        ]);

        const uData = usersRes.ok ? await usersRes.json() : [];
        const lData = leavesRes.ok ? await leavesRes.json() : [];

        const safeUsers: User[] = Array.isArray(uData) ? uData : [];
        const safeLeaves: Leave[] = Array.isArray(lData) ? lData : [];

        setUsers(safeUsers);
        setLeaves(safeLeaves);

        const myId = currentUser?.id || currentUser?._id;
        const updatedMe = safeUsers.find(u => (u.id || u._id) === myId);
        if (updatedMe) setCurrentUser(updatedMe);
      } catch (error) { console.error("Failed to fetch analytics data", error); }
    };
    if (token) fetchData();
  }, [token, currentUser?.id, currentUser?._id]);

  // ============================================================================
  // PUNCH OPERATIONS
  // ============================================================================
  const executePunch = async (punchType: "in" | "out", workModeStatus: string = "Present") => {
    const myId = currentUser?.id || currentUser?._id;
    if (!myId) return alert("User error. Please re-login.");

    const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    let newAttendance = Array.isArray(currentUser?.attendance) ? [...currentUser.attendance] : [];

    if (punchType === "in") {
      newAttendance.push({ date: getLocalDateStr(), checkIn: timeNow, checkOut: "", status: workModeStatus });
    } else {
      const index = newAttendance.findIndex(a => a?.date === getLocalDateStr());
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

  // ============================================================================
  // UNDO OPERATIONS
  // ============================================================================
  const todayRecord = (Array.isArray(currentUser?.attendance) ? currentUser.attendance : []).find(a => a?.date === getLocalDateStr()) || null;
  const hasPunchedIn = !!todayRecord;
  const hasPunchedOut = !!todayRecord?.checkOut;
  const canUndoPunchIn = hasPunchedIn && !hasPunchedOut && parseMinutesAgo(todayRecord?.checkIn || "") <= 5;
  const canUndoPunchOut = hasPunchedOut && parseMinutesAgo(todayRecord?.checkOut || "") <= 5;

  const handleUndoRequest = (type: "in" | "out") => {
    setUndoTarget(type);
    setShowUndoModal(true);
  };

  const confirmUndo = async () => {
    if (!(currentUser?.id || currentUser?._id) || !undoTarget) return;
    setUndoLoading(true);
    const myId = currentUser?.id || currentUser?._id;
    let newAttendance = Array.isArray(currentUser?.attendance) ? [...currentUser.attendance] : [];
    const index = newAttendance.findIndex(a => a?.date === getLocalDateStr());
    
    if (undoTarget === "in") {
      if (index !== -1) newAttendance.splice(index, 1);
    } else if (undoTarget === "out") {
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
    } catch { alert("Undo failed."); }
    
    setUndoLoading(false);
    setShowUndoModal(false);
    setUndoTarget(null);
  };

  // ============================================================================
  // CALCULATE STATS
  // ============================================================================
  const todayDateObj = new Date(getLocalDateStr());
  todayDateObj.setHours(0, 0, 0, 0);
  const snapshotDateObj = new Date(snapshotDate || getLocalDateStr());
  snapshotDateObj.setHours(0, 0, 0, 0);

  const isFutureSnapshot = snapshotDateObj > todayDateObj;

  const parsedJoin = new Date(currentUser?.createdAt || Date.now());
  const myJoinDateObj = isNaN(parsedJoin.getTime()) ? new Date() : parsedJoin;
  myJoinDateObj.setHours(0, 0, 0, 0);

  const isBeforeMyJoinDate = snapshotDateObj < myJoinDateObj;

  const filteredUsers = users.filter(user => {
    if (selectedDept !== "All" && String(user.department) !== String(selectedDept)) return false;
    return true;
  });

  const uniqueDepartments = Array.from(new Set(users.map(u => u.department || ""))).filter(Boolean);

  // ============================================================================
  // 1. PERSONAL DAILY STATS
  // ============================================================================
  const myTodayRecord = (Array.isArray(currentUser?.attendance) ? currentUser.attendance : []).find(a => a?.date === snapshotDate) || null;
  const myTodayStatus = String(myTodayRecord?.status || "");
  const isWeekend = snapshotDateObj.getDay() === 0 || snapshotDateObj.getDay() === 6;

  // ============================================================================
  // 2. ADMIN DAILY SNAPSHOT ARRAYS
  // ============================================================================
  let dailyHeadcountUsers: User[] = [];
  let dailyPresentUsers: User[] = [];
  let dailyAbsentUsers: User[] = [];
  let dailyLeaveUsers: User[] = [];

  filteredUsers.forEach(user => {
    const uJoinRaw = new Date(user.createdAt || Date.now());
    const uJoin = isNaN(uJoinRaw.getTime()) ? new Date() : uJoinRaw;
    uJoin.setHours(0, 0, 0, 0);

    if (snapshotDateObj >= uJoin && !isFutureSnapshot) {
      dailyHeadcountUsers.push(user);

      const safeAttendance = Array.isArray(user.attendance) ? user.attendance : [];
      const record = safeAttendance.find(a => a.date === snapshotDate);
      const safeStatus = String(record?.status || "");

      if (safeStatus.includes("Present")) dailyPresentUsers.push(user);
      else if (safeStatus === "On Leave") dailyLeaveUsers.push(user);
      else if (!isWeekend) dailyAbsentUsers.push(user);
    }
  });

  const leavesToday = leaves.filter(l => String(l.date) === snapshotDate && (selectedDept === "All" || String(l.department) === String(selectedDept)));
  const rejectedLeavesToday = leavesToday.filter(l => String(l.status) === "Rejected");
  const acceptedLeavesToday = leavesToday.filter(l => String(l.status) === "Accepted");

  // ============================================================================
  // 3. ADMIN MONTHLY STATS
  // ============================================================================
  let totalScheduledDays = 0, totalPresent = 0, totalAbsent = 0, totalLeave = 0, totalWeekendWorked = 0;
  let teamWeekendRecords: any[] = [];

  const daysInMonthToCalculate = (selectedMonth === todayDateObj.getMonth() && selectedYear === todayDateObj.getFullYear())
    ? todayDateObj.getDate()
    : new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const adminMonthLeaves = leaves.filter(l => {
    if (!l.date) return false;
    const d = new Date(l.date);
    return !isNaN(d.getTime()) && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear && (selectedDept === "All" || String(l.department) === String(selectedDept));
  });

  filteredUsers.forEach(user => {
    const uJoinRaw = new Date(user.createdAt || Date.now());
    const uJoin = isNaN(uJoinRaw.getTime()) ? new Date() : uJoinRaw;
    uJoin.setHours(0, 0, 0, 0);
    const safeAttendance = Array.isArray(user.attendance) ? user.attendance : [];

    for (let day = 1; day <= daysInMonthToCalculate; day++) {
      const loopDate = new Date(selectedYear, selectedMonth, day);
      loopDate.setHours(0, 0, 0, 0);
      const isLoopWeekend = loopDate.getDay() === 0 || loopDate.getDay() === 6;

      if (loopDate < uJoin || loopDate > todayDateObj) continue;

      const isoDate = getLocalDateStr(loopDate);
      const record = safeAttendance.find(a => a.date === isoDate);
      const safeStatus = String(record?.status || "");

      if (isLoopWeekend && !record) continue;

      totalScheduledDays++;
      if (safeStatus.includes("Present")) {
        totalPresent++;
        if (isLoopWeekend) {
          totalWeekendWorked++;
          teamWeekendRecords.push({ user, record, date: isoDate, day: loopDate.toLocaleDateString('en-US', { weekday: 'long' }) });
        }
      }
      else if (safeStatus === "On Leave") totalLeave++;
      else totalAbsent++;
    }
  });

  const presentPct = totalScheduledDays > 0 ? ((totalPresent / totalScheduledDays) * 100).toFixed(1) : "0.0";
  const absentPct = totalScheduledDays > 0 ? ((totalAbsent / totalScheduledDays) * 100).toFixed(1) : "0.0";
  const leavePct = totalScheduledDays > 0 ? ((totalLeave / totalScheduledDays) * 100).toFixed(1) : "0.0";

  // ============================================================================
  // 4. PERSONAL MONTHLY STATS
  // ============================================================================
  let myActiveRecords: (AttendanceRecord & { day: string })[] = [];
  let myAbsentRecords: { date: string, day: string }[] = [];
  let myOnLeaveRecords: AttendanceRecord[] = [];
  let myWeekendRecords: (AttendanceRecord & { day: string })[] = [];
  let pScheduled = 0;

  const safeMyAttendance = Array.isArray(currentUser?.attendance) ? currentUser.attendance : [];

  for (let day = 1; day <= daysInMonthToCalculate; day++) {
    const loopDate = new Date(selectedYear, selectedMonth, day);
    loopDate.setHours(0, 0, 0, 0);
    const isLoopWeekend = loopDate.getDay() === 0 || loopDate.getDay() === 6;

    if (loopDate < myJoinDateObj || loopDate > todayDateObj) continue;

    const isoDate = getLocalDateStr(loopDate);
    const dayOfWeek = loopDate.toLocaleDateString('en-US', { weekday: 'long' });
    const record = safeMyAttendance.find(a => a.date === isoDate);
    const safeStatus = String(record?.status || "");

    if (isLoopWeekend && !record) continue;

    pScheduled++;
    if (safeStatus.includes("Present")) {
      if (record) {
        myActiveRecords.push({ ...record, day: dayOfWeek });
        if (isLoopWeekend) myWeekendRecords.push({ ...record, day: dayOfWeek });
      }
    }
    else if (safeStatus === "On Leave") {
      if (record) myOnLeaveRecords.push(record);
    }
    else {
      myAbsentRecords.push({ date: isoDate, day: dayOfWeek });
    }
  }

  const pPresentPct = pScheduled > 0 ? ((myActiveRecords.length / pScheduled) * 100).toFixed(1) : "0.0";
  const pAbsentPct = pScheduled > 0 ? ((myAbsentRecords.length / pScheduled) * 100).toFixed(1) : "0.0";

  const myAllLeaves = leaves.filter(l => String(l.employeeId) === String(currentUser?.id || currentUser?._id));
  const myAllAccepted = myAllLeaves.filter(l => String(l.status) === "Accepted");
  const myAllRejected = myAllLeaves.filter(l => String(l.status) === "Rejected");
  const myAllPending = myAllLeaves.filter(l => String(l.status) === "Pending");

  const myMonthLeaves = myAllLeaves.filter(l => {
    if (!l.date) return false;
    const d = new Date(l.date);
    return !isNaN(d.getTime()) && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });
  const myMonthAccepted = myMonthLeaves.filter(l => String(l.status) === "Accepted");
  const myMonthRejected = myMonthLeaves.filter(l => String(l.status) === "Rejected");
  const myMonthPending = myMonthLeaves.filter(l => String(l.status) === "Pending");

  // ============================================================================
  // MODAL CONTENT RENDERER
  // ============================================================================
  const openModal = (title: string, type: AnalyticsDrillDown) => {
    setModalSubFilter("All");
    setActiveModal({ title, type });
  };

  const renderBasicFilterTabs = (options: string[], count: number) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl w-fit">
        {options.map(opt => (
          <button key={opt} onClick={() => setModalSubFilter(opt)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${modalSubFilter === opt ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}>
            {opt}
          </button>
        ))}
      </div>
      <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold border border-blue-100 shadow-sm">
        Showing {count} Record{count !== 1 ? 's' : ''}
      </div>
    </div>
  );

  const renderModalContent = () => {
    if (!activeModal) return null;

    let displayArray: any[] = [];
    let modalType = "users";

    switch (activeModal.type) {
      case "dailyHeadcount": displayArray = dailyHeadcountUsers; modalType = "users"; break;
      case "dailyPresent": displayArray = dailyPresentUsers; modalType = "users"; break;
      case "dailyAbsent": displayArray = dailyAbsentUsers; modalType = "users"; break;
      case "dailyLeave": displayArray = dailyLeaveUsers; modalType = "users"; break;
      case "dailyRejected": displayArray = rejectedLeavesToday; modalType = "leaves"; break;

      case "myPresent":
        displayArray = myActiveRecords;
        modalType = "attendance";
        if (modalSubFilter === "Office") displayArray = myActiveRecords.filter(r => String(r?.status) === "Present" || String(r?.status) === "Present (Office)");
        if (modalSubFilter === "WFH") displayArray = myActiveRecords.filter(r => String(r?.status) === "Present (WFH)");
        if (modalSubFilter === "Leave") displayArray = myActiveRecords.filter(r => String(r?.status) === "On Leave");
        break;
      case "myAbsent": displayArray = myAbsentRecords; modalType = "attendance"; break;
      case "myPTO": displayArray = myOnLeaveRecords; modalType = "attendance"; break;
      case "myWeekend": displayArray = myWeekendRecords; modalType = "attendance"; break;
      case "myPending": displayArray = myAllPending; modalType = "leaves"; break;

      case "myLeavesMonthTotal": displayArray = myMonthLeaves; modalType = "leaves"; break;
      case "myLeavesMonthAccepted": displayArray = myMonthAccepted; modalType = "leaves"; break;
      case "myLeavesMonthRejected": displayArray = myMonthRejected; modalType = "leaves"; break;
      case "myLeavesMonthPending": displayArray = myMonthPending; modalType = "leaves"; break;

      case "myLeavesAllTotal": displayArray = myAllLeaves; modalType = "leaves"; break;
      case "myLeavesAllAccepted": displayArray = myAllAccepted; modalType = "leaves"; break;
      case "myLeavesAllRejected": displayArray = myAllRejected; modalType = "leaves"; break;
      case "myLeavesAllPending": displayArray = myAllPending; modalType = "leaves"; break;

      case "teamTotal": displayArray = filteredUsers; modalType = "users"; break;
      case "teamPresent": displayArray = dailyPresentUsers; modalType = "users"; break;
      case "teamAbsent": displayArray = dailyAbsentUsers; modalType = "users"; break;
      case "teamWeekend": displayArray = teamWeekendRecords; modalType = "teamWeekend"; break;
      case "teamAction": displayArray = adminMonthLeaves.filter(l => String(l?.status) === "Pending"); modalType = "leaves"; break;
      case "teamAccepted": displayArray = adminMonthLeaves.filter(l => String(l?.status) === "Accepted"); modalType = "leaves"; break;
      case "teamRejected": displayArray = adminMonthLeaves.filter(l => String(l?.status) === "Rejected"); modalType = "leaves"; break;
    }

    if (activeModal.type === "myPresent") {
      if (displayArray.length === 0) {
        return <>{renderBasicFilterTabs(["All", "Office", "WFH", "Leave"], 0)}<p className="text-slate-500 p-8 text-center font-bold">No records found for this filter.</p></>;
      }
    }

    if (displayArray.length === 0) return <p className="text-slate-500 p-8 text-center font-bold">No records found for this category.</p>;

    return (
      <div className="overflow-x-auto">
        {(activeModal.type === "myPresent") ? renderBasicFilterTabs(["All", "Office", "WFH", "Leave"], displayArray.length) : (
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold border border-blue-100 w-fit mb-4 shadow-sm">
            Showing {displayArray.length} Record(s)
          </div>
        )}
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {modalType === "users" && <><th className="p-4 text-slate-500 text-xs font-bold">ID</th><th className="p-4 text-slate-500 text-xs font-bold">Name</th><th className="p-4 text-slate-500 text-xs font-bold">Department</th><th className="p-4 text-slate-500 text-xs font-bold">Punch Data</th></>}
              {modalType === "teamWeekend" && <><th className="p-4 text-slate-500 text-xs font-bold">Employee</th><th className="p-4 text-slate-500 text-xs font-bold">Department</th><th className="p-4 text-slate-500 text-xs font-bold">Date</th><th className="p-4 text-slate-500 text-xs font-bold">Day</th><th className="p-4 text-slate-500 text-xs font-bold">Times</th></>}
              {modalType === "attendance" && <><th className="p-4 text-slate-500 text-xs font-bold">Date</th><th className="p-4 text-slate-500 text-xs font-bold">Day</th><th className="p-4 text-slate-500 text-xs font-bold">Status</th><th className="p-4 text-slate-500 text-xs font-bold">In</th><th className="p-4 text-slate-500 text-xs font-bold">Out</th></>}
              {modalType === "leaves" && <><th className="p-4 text-slate-500 text-xs font-bold">Date</th><th className="p-4 text-slate-500 text-xs font-bold">{isAdmin && !activeModal.type.startsWith("my") ? "Employee" : "Reason"}</th><th className="p-4 text-slate-500 text-xs font-bold">Status</th></>}
            </tr>
          </thead>
          <tbody>{displayArray.map((item, i) => (
            <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors" key={item?.id || item?._id || item?.date || i}>
              {modalType === "users" && (
                <>
                  <td className="p-4 font-medium text-slate-600">{String(item?.id || item?._id || "")}</td>
                  <td className="p-4 font-bold text-slate-800">{String(item?.name || "")}</td>
                  <td className="p-4 text-sm font-medium">{String(item?.department || "")}</td>
                  <td className="p-4 text-slate-500 text-sm font-medium">
                    {(() => {
                      const rec = Array.isArray(item?.attendance) ? item.attendance.find((a: any) => String(a.date) === String(snapshotDate)) : null;
                      if (rec?.status === "On Leave") return <span className="text-purple-600 font-bold">Approved Leave</span>;
                      if (rec && String(rec.status).includes("Present")) {
                        const isRecWeekend = new Date(snapshotDate).getDay() === 0 || new Date(snapshotDate).getDay() === 6;
                        if (isRecWeekend) {
                          return (
                            <div className="flex flex-col">
                              <span className="text-yellow-600 font-bold text-[10px] uppercase tracking-wider">Weekend OT</span>
                              <span className="text-slate-700">{rec.checkIn || ""} - {rec.checkOut || "Active"}</span>
                            </div>
                          );
                        }
                        return <span className="text-slate-700">{rec.checkIn || ""} - {rec.checkOut || "Active"}</span>;
                      }
                      return <span className="text-slate-400">N/A</span>;
                    })()}
                  </td>
                </>
              )}

              {modalType === "teamWeekend" && (
                <>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{String(item.user?.name || "")}</div>
                    <div className="text-xs text-slate-500">{String(item.user?.id || item.user?._id || "")}</div>
                  </td>
                  <td className="p-4 text-sm font-medium">{String(item.user?.department || "")}</td>
                  <td className="p-4 font-bold text-slate-700">{String(item.date || "")}</td>
                  <td className="p-4 text-slate-500 font-medium">{String(item.day || "")}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-yellow-600 font-bold text-[10px] uppercase tracking-wider mb-0.5">Weekend OT</span>
                      <span className="text-slate-600 font-medium">{item.record?.checkIn || ""} - {item.record?.checkOut || "Active"}</span>
                    </div>
                  </td>
                </>
              )}

              {modalType === "attendance" && (
                <>
                  <td className="p-4 font-bold text-slate-700">{String(item?.date || "")}</td>
                  <td className="p-4 text-slate-500 font-medium">{String(item?.day || "")}</td>
                  <td className="p-4">
                    {(() => {
                      const isPersonalWkend = item?.day === "Sunday" || item?.day === "Saturday";
                      const isPersonalPresent = String(item?.status || "").includes("Present");
                      if (String(item?.status) === 'On Leave') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">On Leave</span>;
                      if (isPersonalWkend && isPersonalPresent) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Weekend OT</span>;
                      if (isPersonalPresent && String(item?.status || "").includes("WFH")) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">Present (WFH)</span>;
                      if (isPersonalPresent) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Present</span>;
                      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Absent</span>;
                    })()}
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{String(item?.status) === 'On Leave' || !item?.status ? "N/A" : String(item?.checkIn || "")}</td>
                  <td className="p-4 text-slate-500 font-medium">{String(item?.status) === 'On Leave' || !item?.status ? "N/A" : (item?.checkOut ? String(item.checkOut) : "--:--")}</td>
                </>
              )}

              {modalType === "leaves" && (
                <>
                  <td className="p-4 font-bold text-slate-700 flex items-center gap-2"><IconCalendar /> {String(item?.date || "")}</td>
                  <td className="p-4 text-sm text-slate-600">
                    {isAdmin && !activeModal.type.startsWith("my") ? (
                      <div className="font-bold text-slate-800">{String(item?.employeeName || "")} <span className="text-xs font-normal text-slate-500 ml-2">{String(item?.department || "")}</span></div>
                    ) : (
                      <span className="italic">"{String(item?.reason || "No reason")}"</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${String(item?.status) === 'Accepted' ? 'bg-green-100 text-green-700' : String(item?.status) === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {String(item?.status || "Unknown")}
                    </span>
                  </td>
                </>
              )}
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  };

  // ============================================================================
  // RENDER: PERSONAL MONTHLY VIEW
  // ============================================================================
  const renderPersonalMonthlyView = () => {
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });
    const isBeforeJoinMonth = (selectedYear < myJoinDateObj.getFullYear()) || (selectedYear === myJoinDateObj.getFullYear() && selectedMonth < myJoinDateObj.getMonth());
    const isFutureMonth = (selectedYear > todayDateObj.getFullYear()) || (selectedYear === todayDateObj.getFullYear() && selectedMonth > todayDateObj.getMonth());

    if (isBeforeJoinMonth) {
      return <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center text-slate-500 font-bold text-lg animate-fadeIn w-full col-span-full">You were not employed at the company during {monthName} {selectedYear}.</div>;
    }
    if (isFutureMonth) {
      return <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 text-center text-blue-700 font-bold text-lg animate-fadeIn flex items-center justify-center gap-2 w-full col-span-full"><IconClock /> {monthName} {selectedYear} is in the future. Data pending.</div>;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn w-full">
        <div className="bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-700 text-white h-full flex flex-col">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">My Personal Attendance</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-600">
              <span className="font-bold text-slate-300">Present Percentage</span>
              <span className="text-2xl font-black text-green-400">{pPresentPct}%</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-600">
              <span className="font-bold text-slate-300">Absent Percentage</span>
              <span className="text-2xl font-black text-red-400">{pAbsentPct}%</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 flex-grow content-end">
            <div onClick={() => openModal("My Present Days", "myPresent")} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl text-center cursor-pointer transition border border-slate-600 hover:border-blue-400 group">
              <div className="text-2xl font-black text-blue-400 group-hover:scale-110 transition-transform">{myActiveRecords.length}</div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Present</div>
            </div>
            <div onClick={() => openModal("Weekend Extra Days", "myWeekend")} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl text-center cursor-pointer transition border border-slate-600 hover:border-yellow-400 group">
              <div className="text-2xl font-black text-yellow-400 group-hover:scale-110 transition-transform">{myWeekendRecords.length}</div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Wkend OT</div>
            </div>
            <div onClick={() => openModal("My Absent Days", "myAbsent")} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl text-center cursor-pointer transition border border-slate-600 hover:border-red-400 group">
              <div className="text-2xl font-black text-red-400 group-hover:scale-110 transition-transform">{myAbsentRecords.length}</div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Absent</div>
            </div>
            <div onClick={() => openModal("My PTO Days", "myPTO")} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl text-center cursor-pointer transition border border-slate-600 hover:border-purple-400 group">
              <div className="text-2xl font-black text-purple-400 group-hover:scale-110 transition-transform">{myOnLeaveRecords.length}</div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Leaves</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-6 text-center leading-relaxed">Future unpunched shifts do not trigger absence penalties.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">My Leave Statistics</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-grow">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">{monthName} Overview</h3>
              <div className="space-y-3">
                <div onClick={() => openModal(`Submitted in ${monthName}`, "myLeavesMonthTotal")} className="flex justify-between items-center p-2 hover:bg-white rounded-lg cursor-pointer transition group">
                  <span className="font-bold text-slate-600 group-hover:text-blue-600">Submitted</span><span className="text-lg font-black text-slate-800 group-hover:text-blue-600">{myMonthLeaves.length}</span>
                </div>
                <div onClick={() => openModal(`Accepted in ${monthName}`, "myLeavesMonthAccepted")} className="flex justify-between items-center p-2 hover:bg-green-50 rounded-lg cursor-pointer transition group">
                  <span className="font-bold text-green-700">Accepted</span><span className="text-lg font-black text-green-600">{myMonthAccepted.length}</span>
                </div>
                <div onClick={() => openModal(`Rejected in ${monthName}`, "myLeavesMonthRejected")} className="flex justify-between items-center p-2 hover:bg-red-50 rounded-lg cursor-pointer transition group">
                  <span className="font-bold text-red-700">Rejected</span><span className="text-lg font-black text-red-600">{myMonthRejected.length}</span>
                </div>
                <div onClick={() => openModal(`Pending in ${monthName}`, "myLeavesMonthPending")} className="flex justify-between items-center p-2 hover:bg-orange-50 rounded-lg cursor-pointer transition group">
                  <span className="font-bold text-orange-700">Pending</span><span className="text-lg font-black text-orange-500">{myMonthPending.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">All-Time History</h3>
              <div className="space-y-3">
                <div onClick={() => openModal("All-Time Submitted", "myLeavesAllTotal")} className="flex justify-between items-center p-2 hover:bg-white rounded-lg cursor-pointer transition group">
                  <span className="font-bold text-slate-600 group-hover:text-blue-600">Submitted</span><span className="text-lg font-black text-slate-800 group-hover:text-blue-600">{myAllLeaves.length}</span>
                </div>
                <div onClick={() => openModal("All-Time Accepted", "myLeavesAllAccepted")} className="flex justify-between items-center p-2 hover:bg-green-50 rounded-lg cursor-pointer transition group">
                  <span className="font-bold text-green-700">Accepted</span><span className="text-lg font-black text-green-600">{myAllAccepted.length}</span>
                </div>
                <div onClick={() => openModal("All-Time Rejected", "myLeavesAllRejected")} className="flex justify-between items-center p-2 hover:bg-red-50 rounded-lg cursor-pointer transition group">
                  <span className="font-bold text-red-700">Rejected</span><span className="text-lg font-black text-red-600">{myAllRejected.length}</span>
                </div>
                <div onClick={() => openModal("All-Time Pending", "myLeavesAllPending")} className="flex justify-between items-center p-2 hover:bg-orange-50 rounded-lg cursor-pointer transition group">
                  <span className="font-bold text-orange-700">Pending</span><span className="text-lg font-black text-orange-500">{myAllPending.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link to="/leaves" className="block text-center w-full bg-blue-50 text-blue-700 border border-blue-100 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition shadow-sm">Apply / Manage Leaves →</Link>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: ADMIN COMPANY MONTHLY VIEW
  // ============================================================================
  const renderCompanyMonthlyView = () => {
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">Team Attendance Health</h2>
          <div className="space-y-4">
            <div onClick={() => openModal("Team Weekend Overtime", "teamWeekend")} className="flex justify-between items-center bg-yellow-50 hover:bg-yellow-100 p-4 rounded-xl border border-yellow-200 cursor-pointer transition">
              <span className="font-bold text-yellow-800">Total Weekend Overtime Days</span>
              <span className="text-2xl font-black text-yellow-600">{totalWeekendWorked}</span>
            </div>
            <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
              <span className="font-bold text-green-800">Present Percentage</span>
              <span className="text-2xl font-black text-green-600">{presentPct}%</span>
            </div>
            <div className="flex justify-between items-center bg-red-50 p-4 rounded-xl border border-red-100">
              <span className="font-bold text-red-800">Absent Percentage</span>
              <span className="text-2xl font-black text-red-600">{absentPct}%</span>
            </div>
            <div className="flex justify-between items-center bg-purple-50 p-4 rounded-xl border border-purple-100">
              <span className="font-bold text-purple-800">On Leave Percentage</span>
              <span className="text-2xl font-black text-purple-600">{leavePct}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">Calculated against completed scheduled days. Future shifts and un-punched weekends do not trigger absence penalties.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">Leave Approvals ({selectedDept})</h2>
          <div className="flex justify-between items-center mb-6"><span className="text-slate-600 font-bold text-lg">Total Processed</span><span className="text-blue-600 text-3xl font-black">{adminMonthLeaves.length}</span></div>
          <div className="space-y-3 font-bold">
            <div onClick={() => openModal("Approved Leaves", "teamAccepted")} className="flex justify-between text-sm bg-green-50 hover:bg-green-100 p-3 rounded-lg cursor-pointer transition"><span className="text-green-700">Approved</span><span className="text-green-600">{adminMonthLeaves.filter(l => String(l.status) === "Accepted").length}</span></div>
            <div onClick={() => openModal("Rejected Leaves", "teamRejected")} className="flex justify-between text-sm bg-red-50 hover:bg-red-100 p-3 rounded-lg cursor-pointer transition"><span className="text-red-700">Rejected</span><span className="text-red-600">{adminMonthLeaves.filter(l => String(l.status) === "Rejected").length}</span></div>
            <div onClick={() => openModal("Pending Leaves", "teamAction")} className="flex justify-between text-sm bg-orange-50 hover:bg-orange-100 p-3 rounded-lg cursor-pointer transition"><span className="text-orange-700">Pending</span><span className="text-orange-500">{adminMonthLeaves.filter(l => String(l.status) === "Pending").length}</span></div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <MainLayout>
      {/* LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden transform transition-all scale-100">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center text-white relative">
              <button type="button" onClick={() => { setShowLocationModal(false); setLocationError(""); }} className="absolute top-4 right-4 text-white/50 hover:text-white transition z-10 cursor-pointer p-2"><IconClose /></button>
              <div className="flex justify-center mb-3 opacity-80"><IconFingerprint /></div>
              <h2 className="text-2xl font-bold">Select Work Mode</h2>
              <p className="text-blue-100 text-sm mt-1">Please confirm your working location for today's shift.</p>
            </div>

            <div className="p-8 flex gap-4">
              <button type="button" onClick={() => handleLocationPunch("Office")} className="flex-1 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-500 p-6 rounded-2xl transition-all group cursor-pointer">
                <IconOffice className="text-slate-400 group-hover:text-blue-600 mb-3 transition-colors" />
                <span className="font-bold text-slate-700 group-hover:text-blue-700">Office</span>
              </button>

              <button type="button" onClick={() => handleLocationPunch("WFH")} className="flex-1 flex flex-col items-center justify-center bg-slate-50 hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-500 p-6 rounded-2xl transition-all group cursor-pointer">
                <IconHome className="text-slate-400 group-hover:text-purple-600 mb-3 transition-colors" />
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

      {/* UNDO MODAL */}
      {showUndoModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
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

      {/* DRILL DOWN MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all scale-100">
            <div className="flex justify-between items-center bg-slate-800 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <IconShield className="w-6 h-6 text-blue-400" />
                {activeModal.title}
              </h2>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white transition cursor-pointer p-2"><IconClose /></button>
            </div>
            <div className="overflow-y-auto p-6 min-h-[400px]">
              {renderModalContent()}
            </div>
            <div className="bg-slate-50 p-4 text-right border-t border-slate-200">
              <button type="button" onClick={() => setActiveModal(null)} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-100 hover:text-slate-900 transition shadow-sm cursor-pointer">Close Report</button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-white -mx-4 md:-mx-8 px-4 md:px-8 pt-6 pb-4 border-b border-slate-200 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
            <p className="text-slate-500 font-medium mt-1">Deep insights and historical tracking.</p>
          </div>

          {isAdmin && (
            <div className="flex bg-slate-200 p-1 rounded-xl gap-1 self-start sm:self-auto flex-shrink-0">
              <button
                onClick={() => setActiveTab("personal")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition whitespace-nowrap ${activeTab === "personal" ? "bg-white text-blue-600 shadow" : "text-slate-500 hover:text-slate-700"}`}
              >
                <IconUser /> My Analytics
              </button>
              <button
                onClick={() => setActiveTab("company")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition whitespace-nowrap ${activeTab === "company" ? "bg-white text-blue-600 shadow" : "text-slate-500 hover:text-slate-700"}`}
              >
                <IconBuilding /> Company Analytics
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          PERSONAL TAB
      ================================================================ */}
      {(activeTab === "personal" || !isAdmin) && (
        <div className="space-y-6 animate-fadeIn">
          {/* Today's Punch Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Today's Status</h2>
              <div className="flex flex-wrap gap-8 text-sm font-semibold text-slate-500">
                <div>Date:<br /><span className="text-slate-800 text-lg">{getLocalDateStr()}</span></div>
                <div>Check In:<br /><span className="text-blue-600 text-lg">{todayRecord?.checkIn || "--:--"}</span></div>
                <div>Check Out:<br /><span className="text-blue-600 text-lg">{todayRecord?.checkOut || "--:--"}</span></div>
                <div>Status:<br />
                  <span className={`px-3 py-1 rounded-full text-white text-xs mt-1 inline-block ${!todayRecord ? "bg-slate-400" : todayRecord.status === "On Leave" ? "bg-purple-500" : todayRecord.status.includes("WFH") ? "bg-indigo-500" : "bg-green-500"}`}>
                    {!todayRecord ? "Not Marked" : todayRecord.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Punch Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0 min-w-[160px]">
              {!hasPunchedIn ? (
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <IconFingerprint className="w-5 h-5" /> Check In
                </button>
              ) : !hasPunchedOut && todayRecord?.status !== "On Leave" ? (
                <>
                  <button
                    onClick={() => executePunch("out")}
                    className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <IconFingerprint className="w-5 h-5" /> Check Out
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

          

          {/* Monthly View */}
          <div className="space-y-6">
            <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-fit">
              <span className="font-bold text-slate-600 mt-2">Select Month:</span>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-slate-100 border-0 p-2 rounded-lg font-bold text-slate-800 outline-none cursor-pointer">
                {Array.from({ length: 12 }).map((_, i) => (<option key={i} value={i}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>))}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-slate-100 border-0 p-2 rounded-lg font-bold text-slate-800 outline-none cursor-pointer">
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {renderPersonalMonthlyView()}
          </div>
        </div>
      )}

      {/* ================================================================
          COMPANY TAB (Admin only)
      ================================================================ */}
      {activeTab === "company" && isAdmin && (
        <div className="space-y-6 animate-fadeIn">
          {/* Department Selector */}
          <div className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-fit">
            <span className="font-bold text-slate-600 flex items-center gap-2">Department:</span>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-slate-100 border-0 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 w-full md:w-auto outline-none cursor-pointer shadow-sm">
              <option value="All">All Departments</option>
              {uniqueDepartments.map(d => <option key={String(d)} value={String(d)}>{String(d)}</option>)}
            </select>
          </div>

          {/* Daily Snapshot */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-fit">
              <span className="font-bold text-slate-600">Select Date:</span>
              <input type="date" value={snapshotDate} onChange={(e) => setSnapshotDate(e.target.value)} className="bg-slate-100 border-0 p-2 rounded-lg font-bold text-slate-800 outline-none cursor-pointer" />
            </div>

            {isFutureSnapshot && <div className="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-200 font-bold text-center flex items-center justify-center gap-2 shadow-sm"><IconClock /> Selected date is in the future. Data is pending.</div>}

            {!isFutureSnapshot && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div onClick={() => openModal(`Headcount (${snapshotDate})`, "dailyHeadcount")} className="cursor-pointer hover:-translate-y-1 transition hover:shadow-lg">
                  <StatsCard title="Headcount" value={String(dailyHeadcountUsers.length)} icon={<IconUsers className="text-blue-500 w-6 h-6" />} />
                </div>
                <div onClick={() => openModal(`Present Employees (${snapshotDate})`, "dailyPresent")} className="cursor-pointer hover:-translate-y-1 transition hover:shadow-lg">
                  <StatsCard title="Present" value={String(dailyPresentUsers.length)} icon={<IconPie className="text-green-500 w-6 h-6" />} />
                </div>
                <div onClick={() => openModal(`Approved Leaves (${snapshotDate})`, "dailyLeave")} className="cursor-pointer hover:-translate-y-1 transition hover:shadow-lg">
                  <StatsCard title="On Leave" value={String(dailyLeaveUsers.length)} icon={<IconCalendar className="text-purple-500 w-6 h-6" />} />
                </div>
                <div onClick={() => openModal(`Absent Employees (${snapshotDate})`, "dailyAbsent")} className="cursor-pointer hover:-translate-y-1 transition hover:shadow-lg">
                  <StatsCard title="Absent" value={String(dailyAbsentUsers.length)} icon={<IconFile className="text-red-500 w-6 h-6" />} />
                </div>
                <div onClick={() => openModal(`Rejected Leaves (${snapshotDate})`, "dailyRejected")} className="cursor-pointer hover:-translate-y-1 transition hover:shadow-lg">
                  <StatsCard title="Rejected Leaves" value={String(rejectedLeavesToday.length)} icon={<IconBan className="text-orange-500 w-6 h-6" />} />
                </div>
              </div>
            )}
          </div>

          {/* Monthly View */}
          <div className="space-y-6">
            <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-fit">
              <span className="font-bold text-slate-600 mt-2">Select Month:</span>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-slate-100 border-0 p-2 rounded-lg font-bold text-slate-800 outline-none cursor-pointer">
                {Array.from({ length: 12 }).map((_, i) => (<option key={i} value={i}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>))}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-slate-100 border-0 p-2 rounded-lg font-bold text-slate-800 outline-none cursor-pointer">
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {renderCompanyMonthlyView()}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import AddEmployeeModal from "../components/AddEmployeeModal";

// ============================================================================
// SVG ICONS (Professional UI)
// ============================================================================
const IconSearch = () => <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconDownload = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const IconEdit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const IconTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconClose = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const IconWarning = () => <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const IconSort = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>;
const IconCalendar = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

// ============================================================================
// TYPES & CORPORATE CONSTANTS
// ============================================================================
interface AttendanceRecord { date: string; checkIn: string; checkOut: string; status: string; }
interface User { id: string; name: string; email: string; phone: string; role: string; department: string; designation: string; status: string; createdAt: string; attendance: AttendanceRecord[]; }

type SortOption = "name_asc" | "name_desc" | "id_asc" | "id_desc" | "newest" | "oldest";

const CORPORATE_STRUCTURE: Record<string, string[]> = {
  "IT": ["Java Developer", "React Developer", "Full Stack Developer", "Python Developer", "Software Engineer", "QA Engineer"],
  "HR": ["HR Executive", "Recruiter", "HR Associate", "Payroll Specialist"],
  "Finance": ["Accountant", "Financial Analyst", "Accounts Executive"],
  "Sales": ["Sales Executive", "Sales Associate", "Business Development Executive"],
  "Operations": ["Operations Executive", "Operations Coordinator", "Logistics Manager"],
  "Marketing": ["Marketing Executive", "SEO Specialist", "Content Writer", "Social Media Manager"],
};

const getLocalDateStr = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];

const getDateStatus = (dateStr: string, userCreatedAt: string, attendance: AttendanceRecord[]) => {
  const targetDate = new Date(dateStr);
  const today = new Date(getLocalDateStr());
  const joinDate = new Date(userCreatedAt || new Date());
  joinDate.setHours(0, 0, 0, 0); targetDate.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0);

  if (targetDate > today) return "Future";
  if (targetDate < joinDate) return "Not Joined";

  const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
  const record = attendance?.find(a => a.date === dateStr);

  if (record) {
    if (isWeekend && record.status.includes("Present")) return "Weekend OT";
    return record.status;
  }
  if (isWeekend) return "Weekend";
  return "Absent";
};

// ============================================================================
// PAYROLL DATE RANGE PICKER MODAL
// ============================================================================
const PayrollDateRangeModal = ({ employee, onClose, onExport, token }: { employee: User, onClose: () => void, onExport: (startDate: string, endDate: string) => void, token: string }) => {
  const today = getLocalDateStr();
  const oneYearAgo = getLocalDateStr(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
  
  const [startDate, setStartDate] = useState(oneYearAgo);
  const [endDate, setEndDate] = useState(today);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    if (start > end) {
      alert("Start date must be before end date.");
      return;
    }

    setIsExporting(true);
    try {
      onExport(startDate, endDate);
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="flex justify-between items-center bg-slate-50 border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <IconCalendar />
            Export Payroll Report
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition"><IconClose /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Employee</p>
            <p className="font-bold text-slate-800">{employee.name}</p>
            <p className="text-xs text-slate-500 mt-1">{employee.id} • {employee.department}</p>
          </div>

          {/* Date range selector */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={getLocalDateStr()}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-1">
                {new Date(startDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={getLocalDateStr()}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-1">
                {new Date(endDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Duration info */}
          {startDate && endDate && new Date(startDate) <= new Date(endDate) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700">
                📊 Report duration: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleExport}
              disabled={isExporting || !startDate || !endDate}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Exporting…
                </>
              ) : (
                <>
                  <IconDownload />
                  Export Payroll
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// INLINED DYNAMIC EDIT MODAL
// ============================================================================
const DynamicEditModal = ({ employee, onClose, onUpdate, token, canEdit }: { employee: User, onClose: () => void, onUpdate: (u: User) => void, token: string, canEdit: boolean }) => {
  const [department, setDepartment] = useState(employee.department);
  const [designation, setDesignation] = useState(employee.designation);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const validDesignations = CORPORATE_STRUCTURE[department] || [];
    const isAdminRole = employee.role === "Admin" || employee.role === "MD/CEO";
    const availableDesignations = isAdminRole
      ? [`Head of ${department}`, `${department} Manager`, ...validDesignations]
      : validDesignations;
    if (!availableDesignations.includes(designation) && availableDesignations.length > 0) {
      setDesignation(availableDesignations[0]);
    }
  }, [department, employee.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: employee.role, department, designation })
      });
      if (res.ok) {
        onUpdate({ ...employee, department, designation });
        onClose();
      }
    } catch (err) {
      alert("Failed to update employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDesignations = (employee.role === "Admin" || employee.role === "MD/CEO")
    ? [`Head of ${department}`, `${department} Manager`, ...(CORPORATE_STRUCTURE[department] || [])]
    : (CORPORATE_STRUCTURE[department] || []);

  if (!canEdit) {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
          <div className="flex justify-between items-center bg-red-50 border-b border-red-100 p-6">
            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
              <IconWarning />
              Access Denied
            </h2>
            <button onClick={onClose} className="text-red-400 hover:text-red-700"><IconClose /></button>
          </div>
          <div className="p-6">
            <p className="text-slate-800 font-bold mb-2">You don't have permission to edit this employee.</p>
            <p className="text-sm text-slate-600 mb-6">Only administrators of the <span className="font-bold">{employee.department}</span> department can edit employees in their department.</p>
            <div className="flex justify-end">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="flex justify-between items-center bg-slate-50 border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800">Update Assignment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition"><IconClose /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* LOCKED IDENTITY FIELDS */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Locked Identity Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                <input type="text" value={employee.name} readOnly className="w-full bg-slate-200 border border-slate-300 text-slate-500 p-2.5 rounded-lg cursor-not-allowed text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Employee ID</label>
                <input type="text" value={employee.id} readOnly className="w-full bg-slate-200 border border-slate-300 text-slate-500 p-2.5 rounded-lg cursor-not-allowed text-sm font-medium" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                <input type="text" value={employee.email} readOnly className="w-full bg-slate-200 border border-slate-300 text-slate-500 p-2.5 rounded-lg cursor-not-allowed text-sm font-medium" />
              </div>
            </div>
          </div>

          {/* UNLOCKED CORPORATE FIELDS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Corporate Structure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full bg-white border border-slate-300 p-3 rounded-lg font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-sm cursor-pointer">
                  {Object.keys(CORPORATE_STRUCTURE).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Designation</label>
                <select value={designation} onChange={e => setDesignation(e.target.value)} className="w-full bg-white border border-slate-300 p-3 rounded-lg font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-sm cursor-pointer">
                  {currentDesignations.map(des => <option key={des} value={des}>{des}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN DIRECTORY COMPONENT
// ============================================================================
export default function Employees() {
  const [users, setUsers] = useState<User[]>([]);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const isAdmin = currentUser.role === "Admin" || currentUser.role === "MD/CEO";
  const isSuperAdmin = currentUser.role === "MD/CEO" || String(currentUser.designation).toLowerCase().includes("ceo") || String(currentUser.designation).toLowerCase().includes("md");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<User | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);
  const [payrollExportEmployee, setPayrollExportEmployee] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Controls
  const [selectedDept, setSelectedDept] = useState(isAdmin ? currentUser.department : "All");
  const [snapshotDate, setSnapshotDate] = useState(getLocalDateStr());

  // Sort option
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const token = localStorage.getItem("token") || "";

  // Derive month/year purely from the snapshot date for legacy single-month export
  const snapshotDateObj = new Date(snapshotDate + "T00:00:00");
  const exportMonth = snapshotDateObj.getMonth();
  const exportYear = snapshotDateObj.getFullYear();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setUsers(await res.json());
      } catch (error) { console.error("Failed to fetch users", error); }
    };
    if (token) fetchUsers();
  }, [token]);

  const maskPhone = (phone: string) => {
    if (!phone) return "N/A";
    if (phone.length < 4) return phone;
    return `${"x".repeat(phone.length - 3)}${phone.slice(-3)}`;
  };

  const executeDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
        setEmployeeToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete employee", error);
    }
  };

  // ============================================================================
  // PAYROLL EXPORT — DATE RANGE BASED
  // ============================================================================
  const exportPayrollCSV = (emp: User, startDateStr: string, endDateStr: string) => {
    const startDate = new Date(startDateStr + "T00:00:00");
    const endDate = new Date(endDateStr + "T00:00:00");
    const joinDate = new Date(emp.createdAt || Date.now());
    joinDate.setHours(0, 0, 0, 0);

    // Check if employee had not joined by the end date
    if (joinDate > endDate) {
      const joinDateFormatted = joinDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
      const content = [
        `"PAYROLL REPORT — ${startDateStr} to ${endDateStr}"`,
        ``,
        `"NOTICE: Record Not Available"`,
        ``,
        `"Employee ID:",${emp.id}`,
        `"Employee Name:",${emp.name}`,
        `"Department:",${emp.department}`,
        `"Designation:",${emp.designation}`,
        ``,
        `"============================================================"`,
        `"This report could not be generated for the period:"`,
        `"${startDateStr} to ${endDateStr}"`,
        ``,
        `"REASON: ${emp.name} had not yet joined the organisation`,
        `during this time period."`,
        ``,
        `"Date of Joining:",${joinDateFormatted}`,
        ``,
        `"Please select a payroll period on or after the employee's`,
        `date of joining to generate a valid payroll report."`,
        `"============================================================"`,
      ].join("\n");

      const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `Payroll_${emp.id}_${startDateStr}_to_${endDateStr}_NOT_AVAILABLE.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    let presentDates: string[] = [];
    let absentDates: string[] = [];
    let leaveDates: string[] = [];
    let otDates: string[] = [];
    let futureDates: string[] = [];

    const dailyRows: string[] = [];
    dailyRows.push(`"DATE","DAY","STATUS","CHECK IN","CHECK OUT"`);

    // Iterate through each day in the date range
    for (let loopDate = new Date(startDate); loopDate <= endDate; loopDate.setDate(loopDate.getDate() + 1)) {
      const isoDate = getLocalDateStr(loopDate);
      const dayName = loopDate.toLocaleDateString('en-US', { weekday: 'long' });
      const dayNumber = loopDate.getDate().toString();

      // Skip days before employee joined
      if (loopDate < joinDate) continue;

      const isWeekend = loopDate.getDay() === 0 || loopDate.getDay() === 6;
      const record = (emp.attendance || []).find(a => a.date === isoDate);
      const safeStatus = String(record?.status || "");
      const today = new Date(getLocalDateStr());

      let finalStatus = "Absent";
      let checkIn = "--:--";
      let checkOut = "--:--";

      if (record) {
        if (safeStatus.includes("Present")) {
          if (isWeekend) { finalStatus = "Weekend OT"; otDates.push(dayNumber); }
          else { finalStatus = "Present"; presentDates.push(dayNumber); }
          checkIn = record.checkIn;
          checkOut = record.checkOut || "Active";
        } else if (safeStatus === "On Leave") {
          finalStatus = "Approved Leave";
          leaveDates.push(dayNumber);
        }
      } else {
        if (loopDate > today) { finalStatus = "Future"; futureDates.push(dayNumber); }
        else if (isWeekend) { finalStatus = "Weekend (No Punch)"; }
        else { finalStatus = "Absent"; absentDates.push(dayNumber); }
      }

      dailyRows.push(`"${isoDate}","${dayName}","${finalStatus}","${checkIn}","${checkOut}"`);
    }

    const totalPayableDays = presentDates.length + leaveDates.length + otDates.length;

    const csvContent = [
      `"PAYROLL REPORT FOR ${startDateStr} TO ${endDateStr}"`,
      `"EMPLOYEE ID:",${emp.id}`,
      `"EMPLOYEE NAME:",${emp.name}`,
      `"DEPARTMENT:",${emp.department}`,
      `"DESIGNATION:",${emp.designation}`,
      `""`,
      `"REPORT PERIOD:",From ${startDateStr} to ${endDateStr}`,
      ``,
      `"============== MONTHLY SUMMARY =============="`,
      `"Total Standard Days Present:",${presentDates.length}`,
      `"Total Days Absent:",${absentDates.length}`,
      `"Total Approved Leaves:",${leaveDates.length}`,
      `"Total Weekend OT Days:",${otDates.length}`,
      `"Total Future Days:",${futureDates.length}`,
      `"TOTAL PAYABLE DAYS (Present + Leave + OT):",${totalPayableDays}`,
      ``,
      `"============== SPECIFIC DATES LOG =============="`,
      `"Standard Present Dates:",${presentDates.join(", ") || "None"}`,
      `"Absent Dates:",${absentDates.join(", ") || "None"}`,
      `"Approved Leave Dates:",${leaveDates.join(", ") || "None"}`,
      `"Weekend OT Dates:",${otDates.join(", ") || "None"}`,
      `"Future Dates (No Data):",${futureDates.join(", ") || "None"}`,
      ``,
      `"============== DAILY PUNCH RECORD =============="`,
      ...dailyRows
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Payroll_${emp.id}_${startDateStr}_to_${endDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============================================================================
  // CHECK EDIT/DELETE PERMISSIONS — DEPARTMENT LEVEL
  // ============================================================================
  const canEditEmployee = (emp: User): boolean => {
    // Super admin (MD/CEO) can edit anyone
    if (isSuperAdmin) return true;
    
    // Regular admin can only edit employees in their own department
    if (isAdmin) return emp.department === currentUser.department;
    
    // Non-admin cannot edit
    return false;
  };

  const canDeleteEmployee = (emp: User): boolean => {
    // Super admin (MD/CEO) can delete anyone
    if (isSuperAdmin) return true;
    
    // Regular admin can only delete employees in their own department
    if (isAdmin) return emp.department === currentUser.department;
    
    // Non-admin cannot delete
    return false;
  };

  // ============================================================================
  // FILTERING + SORTING LOGIC
  // ============================================================================
  const filteredUsers = users
    .filter((user) => {
      if (!isAdmin && user.id !== currentUser.id) return false;

      const matchesSearch =
        user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === "All" ? true : user.department === selectedDept;

      // Show only employees who joined by the end of the snapshot date's month
      const joinDate = new Date(user.createdAt || Date.now());
      const endOfSnapshotMonth = new Date(exportYear, exportMonth + 1, 0);
      const isJoinedByMonth = joinDate <= endOfSnapshotMonth;

      return matchesSearch && matchesDept && isJoinedByMonth;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "id_asc":
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        case "id_desc":
          return b.id.localeCompare(a.id, undefined, { numeric: true });
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

  // Snapshot date display helpers
  const snapshotDayName = snapshotDateObj.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <MainLayout>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform">
            <div className="flex justify-between items-center bg-red-50 border-b border-red-100 p-5">
              <h3 className="font-bold text-red-700 flex items-center gap-2"><IconWarning /> Confirm Deletion</h3>
              <button onClick={() => setEmployeeToDelete(null)} className="text-red-400 hover:text-red-700 transition cursor-pointer"><IconClose /></button>
            </div>
            <div className="p-6">
              <p className="text-slate-800 font-bold mb-2">Are you sure you want to delete this employee?</p>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">This action is permanent. All historical attendance, payroll data, and leave records for <span className="font-bold text-slate-800">{employeeToDelete.name}</span> will be instantly erased from the database.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setEmployeeToDelete(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm cursor-pointer">No, Cancel</button>
                <button onClick={() => executeDelete(employeeToDelete.id)} className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm cursor-pointer">Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYROLL DATE RANGE MODAL */}
      {payrollExportEmployee && (
        <PayrollDateRangeModal
          employee={payrollExportEmployee}
          onClose={() => setPayrollExportEmployee(null)}
          onExport={(startDate, endDate) => exportPayrollCSV(payrollExportEmployee, startDate, endDate)}
          token={token}
        />
      )}

      {/* STICKY HEADER & TOP CONTROL BAR */}
      <div className="sticky top-0 z-40 bg-slate-50 -mx-4 md:-mx-8 px-4 md:px-8 pt-6 pb-4 border-b border-slate-200 mb-8 shadow-sm">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-slate-800">Employee Directory</h1>
          <p className="text-slate-500 font-medium mt-1">Manage personnel, review daily statuses, and export payroll records.</p>
        </div>

        {/* COMPACT SINGLE-ROW CONTROL BAR */}
        <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">

          {/* 1. Department Selector (Admin Only) */}
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Dept</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-xl font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-inner cursor-pointer"
              >
                <option value="All">All Depts</option>
                {Object.keys(CORPORATE_STRUCTURE).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {/* 2. Daily Snapshot Calendar */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Snapshot</span>
            <input
              type="date"
              value={snapshotDate}
              onChange={(e) => setSnapshotDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-xl font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-inner cursor-pointer"
            />
          </div>

          {/* 3. Sort Option (replaces month/year selector) */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <IconSort />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Sort</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-xl font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-inner cursor-pointer"
              >
                <option value="newest">Newly Added</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name A → Z</option>
                <option value="name_desc">Name Z → A</option>
                <option value="id_asc">ID Low → High</option>
                <option value="id_desc">ID High → Low</option>
              </select>
            </div>
          )}

          {/* 4. Search Bar */}
          <div className="flex-grow flex items-center gap-2 border-l border-slate-200 pl-3 min-w-[160px]">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconSearch /></div>
              <input
                type="text"
                placeholder="Search ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 bg-white border border-slate-300 py-2 px-3 rounded-xl font-medium text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* 5. Add Employee Button (Admin) */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-md whitespace-nowrap cursor-pointer ml-auto"
            >
              + New Employee
            </button>
          )}
        </div>
      </div>

      {/* DATA TABLE — no horizontal scroll, compact columns */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden w-full mb-12">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {/* Date + Day stacked */}
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[120px]">Date & Day</th>
              {/* Name + EMP ID stacked in one column */}
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[180px]">Contact</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[160px]">Role & Dept</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[110px]">Status</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-[200px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((emp) => {
              const status = getDateStatus(snapshotDate, emp.createdAt, emp.attendance || []);
              const canEdit = canEditEmployee(emp);
              const canDelete = canDeleteEmployee(emp);

              return (
                <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">

                  {/* DATE + DAY NAME */}
                  <td className="p-4 w-[120px]">
                    <span className="block font-bold text-slate-700 text-sm">{snapshotDate}</span>
                    <span className="block text-xs font-semibold text-blue-500 mt-0.5">{snapshotDayName}</span>
                  </td>

                  {/* NAME + EMP ID stacked */}
                  <td className="p-4">
                    <span className="block font-bold text-slate-800 text-sm leading-tight">{emp.name}</span>
                    <span className="block text-xs font-semibold text-slate-400 mt-0.5">{emp.id}</span>
                  </td>

                  {/* CONTACT */}
                  <td className="p-4 w-[180px]">
                    <span className="block text-xs text-slate-500 leading-tight break-all">{emp.email}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{isAdmin ? emp.phone : maskPhone(emp.phone)}</span>
                  </td>

                  {/* ROLE & DEPT */}
                  <td className="p-4 w-[160px]">
                    <span className="block font-bold text-slate-700 text-xs leading-tight">{emp.designation}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{emp.department}</span>
                  </td>

                  {/* DAILY STATUS BADGE */}
                  <td className="p-4 w-[110px]">
                    {(() => {
                      if (status.includes("Present")) return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">Present</span>;
                      if (status === "Weekend OT") return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">Wknd OT</span>;
                      if (status === "On Leave") return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">On Leave</span>;
                      if (status === "Absent") return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">Absent</span>;
                      return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">{status}</span>;
                    })()}
                  </td>

                  {/* ACTIONS — all buttons in a tidy row */}
                  <td className="p-4 w-[200px]">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">

                      {/* PAYROLL EXPORT */}
                      {(canEdit || emp.id === currentUser.id) && (
                        <button
                          onClick={() => setPayrollExportEmployee(emp)}
                          title="Export Payroll (Date Range)"
                          className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white hover:border-green-600 transition shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          <IconDownload /> Payroll
                        </button>
                      )}

                      {/* EDIT BUTTON */}
                      {canEdit && (
                        <button
                          onClick={() => setEditEmployee(emp)}
                          className="flex items-center gap-1 bg-white border border-slate-300 text-slate-600 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition shadow-sm cursor-pointer"
                        >
                          <IconEdit /> Edit
                        </button>
                      )}

                      {/* EDIT BUTTON (DISABLED if no permission) */}
                      {isAdmin && !canEdit && (
                        <button
                          onClick={() => setEditEmployee(emp)}
                          className="flex items-center gap-1 bg-slate-100 border border-slate-300 text-slate-400 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-not-allowed"
                          title="Only admins from this department can edit this employee"
                        >
                          <IconEdit /> Edit
                        </button>
                      )}

                      {/* DELETE BUTTON */}
                      {canDelete && (
                        <button
                          onClick={() => setEmployeeToDelete(emp)}
                          className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition shadow-sm cursor-pointer"
                          title="Delete Employee"
                        >
                          <IconTrash />
                        </button>
                      )}

                      {/* DELETE BUTTON (DISABLED if no permission) */}
                      {isAdmin && !canDelete && (
                        <button
                          className="flex items-center gap-1 bg-slate-100 border border-slate-300 text-slate-400 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-not-allowed"
                          title="Only admins from this department can delete this employee"
                        >
                          <IconTrash />
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <IconSearch />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">No records found</h3>
                  <p className="text-slate-500 font-medium mt-1">Adjust your search or date filters. Employees who have not joined yet are hidden.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} onAddEmployee={(e: any) => setUsers([...users, e])} />}

      {editEmployee && (
        <DynamicEditModal
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onUpdate={(updated: User) => setUsers(users.map(u => u.id === updated.id ? updated : u))}
          token={token}
          canEdit={canEditEmployee(editEmployee)}
        />
      )}

    </MainLayout>
  );
}
import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import AddEmployeeModal from "../components/AddEmployeeModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
const IconFilePdf = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V4a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V20a2 2 0 01-2 2z" /></svg>;

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

const StatusBadge = ({ status }: { status: string }) => {
  if (status.includes("Present")) return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">Present</span>;
  if (status === "Weekend OT") return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">Wknd OT</span>;
  if (status === "On Leave") return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">On Leave</span>;
  if (status === "Absent") return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">Absent</span>;
  return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">{status}</span>;
};

// ============================================================================
// PAYROLL DATE RANGE PICKER MODAL (now drives PDF export)
// ============================================================================
const PayrollDateRangeModal = ({ employee, onClose, onExport }: { employee: User, onClose: () => void, onExport: (startDate: string, endDate: string) => void }) => {
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center bg-slate-50 border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <IconCalendar />
            Generate Payroll PDF
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

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
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
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <IconFilePdf />
                  Download PDF
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${employee.id}`, {
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center bg-slate-50 border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800">Update Assignment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition"><IconClose /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* LOCKED IDENTITY FIELDS */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Locked Identity Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                <input type="text" value={employee.name} readOnly className="w-full bg-slate-200 border border-slate-300 text-slate-500 p-2.5 rounded-lg cursor-not-allowed text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Employee ID</label>
                <input type="text" value={employee.id} readOnly className="w-full bg-slate-200 border border-slate-300 text-slate-500 p-2.5 rounded-lg cursor-not-allowed text-sm font-medium" />
              </div>
              <div className="col-span-1 sm:col-span-2">
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

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
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

  // Derive month/year purely from the snapshot date for legacy single-month filtering
  const snapshotDateObj = new Date(snapshotDate + "T00:00:00");
  const exportMonth = snapshotDateObj.getMonth();
  const exportYear = snapshotDateObj.getFullYear();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
        setEmployeeToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete employee", error);
    }
  };

  // ============================================================================
  // PAYROLL EXPORT — PROFESSIONAL PDF (date-range based)
  // ============================================================================
  const exportPayrollPDF = (emp: User, startDateStr: string, endDateStr: string) => {
    const startDate = new Date(startDateStr + "T00:00:00");
    const endDate = new Date(endDateStr + "T00:00:00");
    const joinDate = new Date(emp.createdAt || Date.now());
    joinDate.setHours(0, 0, 0, 0);

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // ── Header ──────────────────────────────────────────────
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, pageWidth, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("EmpManage", margin, 32);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Official Payroll & Attendance Report", margin, 48);

    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`, pageWidth - margin, 32, { align: "right" });
    doc.text(`Period: ${startDateStr} to ${endDateStr}`, pageWidth - margin, 48, { align: "right" });

    let y = 95;

    // ── Case: employee had not joined yet during this period ──
    if (joinDate > endDate) {
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Report Unavailable", margin, y);
      y += 22;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Employee: ${emp.name}  (${emp.id})`, margin, y); y += 16;
      doc.text(`Department: ${emp.department}  •  Designation: ${emp.designation}`, margin, y); y += 16;
      doc.text(`Date of Joining: ${joinDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`, margin, y); y += 24;

      doc.setTextColor(150, 30, 30);
      const msg = doc.splitTextToSize(
        `${emp.name} had not yet joined the organisation during the selected period (${startDateStr} to ${endDateStr}). Please select a period on or after the date of joining to generate a valid report.`,
        pageWidth - margin * 2
      );
      doc.text(msg, margin, y);

      doc.save(`Payroll_${emp.id}_${startDateStr}_to_${endDateStr}_NOT_AVAILABLE.pdf`);
      return;
    }

    // ── Employee identity block ──────────────────────────────
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Employee Details", margin, y);
    y += 8;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const col2X = pageWidth / 2;
    doc.text(`Name: ${emp.name}`, margin, y);
    doc.text(`Employee ID: ${emp.id}`, col2X, y);
    y += 16;
    doc.text(`Department: ${emp.department}`, margin, y);
    doc.text(`Designation: ${emp.designation}`, col2X, y);
    y += 16;
    doc.text(`Email: ${emp.email}`, margin, y);
    doc.text(`Phone: ${emp.phone || "N/A"}`, col2X, y);
    y += 28;

    // ── Build daily records + tallies ────────────────────────
    let presentCount = 0, absentCount = 0, leaveCount = 0, otCount = 0;
    const dailyRows: (string | number)[][] = [];
    const today = new Date(getLocalDateStr());

    for (let loopDate = new Date(startDate); loopDate <= endDate; loopDate.setDate(loopDate.getDate() + 1)) {
      const isoDate = getLocalDateStr(loopDate);
      const dayName = loopDate.toLocaleDateString("en-US", { weekday: "long" });
      if (loopDate < joinDate) continue;

      const isWeekend = loopDate.getDay() === 0 || loopDate.getDay() === 6;
      const record = (emp.attendance || []).find(a => a.date === isoDate);
      const safeStatus = String(record?.status || "");

      let finalStatus = "Absent";
      let checkIn = "--:--";
      let checkOut = "--:--";

      if (record) {
        if (safeStatus.includes("Present")) {
          if (isWeekend) { finalStatus = "Weekend OT"; otCount++; }
          else { finalStatus = "Present"; presentCount++; }
          checkIn = record.checkIn || "--:--";
          checkOut = record.checkOut || "Active";
        } else if (safeStatus === "On Leave") {
          finalStatus = "Approved Leave";
          leaveCount++;
        }
      } else if (loopDate > today) {
        continue; // future dates are not part of an official record
      } else if (isWeekend) {
        finalStatus = "Weekend";
      } else {
        finalStatus = "Absent";
        absentCount++;
      }

      dailyRows.push([isoDate, dayName, finalStatus, checkIn, checkOut]);
    }

    const totalPayableDays = presentCount + leaveCount + otCount;

    // ── Summary box ───────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Attendance Summary", margin, y);
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;

    const summaryStats = [
      ["Present", String(presentCount)],
      ["Absent", String(absentCount)],
      ["Approved Leave", String(leaveCount)],
      ["Weekend OT", String(otCount)],
      ["Total Payable Days", String(totalPayableDays)],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      body: [summaryStats.map(s => s[0]), summaryStats.map(s => s[1])],
      theme: "grid",
      styles: { fontSize: 9, halign: "center", cellPadding: 6 },
      bodyStyles: { textColor: [30, 41, 59] },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [241, 245, 249];
        }
        if (data.row.index === 1 && data.column.index === 4) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = [22, 101, 52];
        }
      },
    });

    // @ts-ignore — autoTable attaches this to the doc instance
    y = doc.lastAutoTable.finalY + 28;

    // ── Daily attendance table ───────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Daily Attendance Record", margin, y);
    y += 8;

    autoTable(doc, {
      startY: y + 6,
      margin: { left: margin, right: margin },
      head: [["Date", "Day", "Status", "Check In", "Check Out"]],
      body: dailyRows,
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const val = String(data.cell.raw);
          if (val === "Present") data.cell.styles.textColor = [21, 128, 61];
          else if (val === "Absent") data.cell.styles.textColor = [185, 28, 28];
          else if (val === "Weekend OT") data.cell.styles.textColor = [161, 98, 7];
          else if (val === "Approved Leave") data.cell.styles.textColor = [109, 40, 217];
        }
      },
      didDrawPage: (data) => {
        // Footer on every page
        const pageCount = doc.getNumberOfPages();
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `EmpManage Payroll Report  •  ${emp.name} (${emp.id})  •  Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          pageH - 20,
          { align: "center" }
        );
      },
    });

    doc.save(`Payroll_${emp.id}_${startDateStr}_to_${endDateStr}.pdf`);
  };

  // ============================================================================
  // CHECK EDIT/DELETE PERMISSIONS — DEPARTMENT LEVEL
  // ============================================================================
  const canEditEmployee = (emp: User): boolean => {
    if (isSuperAdmin) return true;
    if (isAdmin) return emp.department === currentUser.department;
    return false;
  };

  const canDeleteEmployee = (emp: User): boolean => {
    if (isSuperAdmin) return true;
    if (isAdmin) return emp.department === currentUser.department;
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
              <div className="flex flex-col sm:flex-row justify-end gap-3">
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
          onExport={(startDate, endDate) => exportPayrollPDF(payrollExportEmployee, startDate, endDate)}
        />
      )}

      {/* STICKY HEADER & TOP CONTROL BAR */}
      <div className="sticky top-0 z-40 bg-slate-50 -mx-4 md:-mx-8 px-4 md:px-8 pt-6 pb-4 border-b border-slate-200 mb-8 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Employee Directory</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Manage personnel, review daily statuses, and download payroll reports.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">

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

          <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-200 sm:pl-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Snapshot</span>
            <input
              type="date"
              value={snapshotDate}
              onChange={(e) => setSnapshotDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-xl font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-inner cursor-pointer"
            />
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-200 sm:pl-3">
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

          <div className="flex-grow flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-3 min-w-[160px] basis-full sm:basis-auto">
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

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-md whitespace-nowrap cursor-pointer w-full sm:w-auto sm:ml-auto"
            >
              + New Employee
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
          DESKTOP TABLE — hidden on small screens, visible md and up
      ============================================================ */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden w-full mb-12">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[120px]">Date & Day</th>
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

                  <td className="p-4 w-[120px]">
                    <span className="block font-bold text-slate-700 text-sm">{snapshotDate}</span>
                    <span className="block text-xs font-semibold text-blue-500 mt-0.5">{snapshotDayName}</span>
                  </td>

                  <td className="p-4">
                    <span className="block font-bold text-slate-800 text-sm leading-tight">{emp.name}</span>
                    <span className="block text-xs font-semibold text-slate-400 mt-0.5">{emp.id}</span>
                  </td>

                  <td className="p-4 w-[180px]">
                    <span className="block text-xs text-slate-500 leading-tight break-all">{emp.email}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{isAdmin ? emp.phone : maskPhone(emp.phone)}</span>
                  </td>

                  <td className="p-4 w-[160px]">
                    <span className="block font-bold text-slate-700 text-xs leading-tight">{emp.designation}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{emp.department}</span>
                  </td>

                  <td className="p-4 w-[110px]">
                    <StatusBadge status={status} />
                  </td>

                  <td className="p-4 w-[200px]">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">

                      {(canEdit || emp.id === currentUser.id) && (
                        <button
                          onClick={() => setPayrollExportEmployee(emp)}
                          title="Download Payroll PDF (Date Range)"
                          className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          <IconDownload /> Payroll PDF
                        </button>
                      )}

                      {canEdit && (
                        <button
                          onClick={() => setEditEmployee(emp)}
                          className="flex items-center gap-1 bg-white border border-slate-300 text-slate-600 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition shadow-sm cursor-pointer"
                        >
                          <IconEdit /> Edit
                        </button>
                      )}

                      {isAdmin && !canEdit && (
                        <button
                          onClick={() => setEditEmployee(emp)}
                          className="flex items-center gap-1 bg-slate-100 border border-slate-300 text-slate-400 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-not-allowed"
                          title="Only admins from this department can edit this employee"
                        >
                          <IconEdit /> Edit
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => setEmployeeToDelete(emp)}
                          className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition shadow-sm cursor-pointer"
                          title="Delete Employee"
                        >
                          <IconTrash />
                        </button>
                      )}

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

      {/* ============================================================
          MOBILE CARD LIST — visible only below md breakpoint
      ============================================================ */}
      <div className="md:hidden space-y-4 mb-12">
        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-4">
              <IconSearch />
            </div>
            <h3 className="text-base font-bold text-slate-700">No records found</h3>
            <p className="text-slate-500 font-medium text-sm mt-1">Adjust your search or date filters.</p>
          </div>
        )}

        {filteredUsers.map((emp) => {
          const status = getDateStatus(snapshotDate, emp.createdAt, emp.attendance || []);
          const canEdit = canEditEmployee(emp);
          const canDelete = canDeleteEmployee(emp);

          return (
            <div key={emp.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

              <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                <div>
                  <span className="block text-xs font-bold text-slate-600">{snapshotDate}</span>
                  <span className="block text-[11px] font-semibold text-blue-500">{snapshotDayName}</span>
                </div>
                <StatusBadge status={status} />
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="font-bold text-slate-800 text-base leading-tight">{emp.name}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{emp.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Email</p>
                    <p className="text-slate-600 text-xs break-all">{emp.email}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Phone</p>
                    <p className="text-slate-600 text-xs">{isAdmin ? emp.phone : maskPhone(emp.phone)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Designation</p>
                    <p className="text-slate-700 text-xs font-semibold">{emp.designation}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Department</p>
                    <p className="text-slate-700 text-xs font-semibold">{emp.department}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  {(canEdit || emp.id === currentUser.id) && (
                    <button
                      onClick={() => setPayrollExportEmployee(emp)}
                      className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg text-xs font-bold active:bg-red-600 active:text-white transition"
                    >
                      <IconDownload /> Payroll PDF
                    </button>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => setEditEmployee(emp)}
                      className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 bg-white border border-slate-300 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold active:bg-slate-100 transition"
                    >
                      <IconEdit /> Edit
                    </button>
                  )}

                  {isAdmin && !canEdit && (
                    <button
                      onClick={() => setEditEmployee(emp)}
                      className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-300 text-slate-400 px-3 py-2 rounded-lg text-xs font-bold"
                    >
                      <IconEdit /> Edit
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => setEmployeeToDelete(emp)}
                      className="flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg text-xs font-bold active:bg-red-600 active:text-white transition"
                      title="Delete Employee"
                    >
                      <IconTrash />
                    </button>
                  )}

                  {isAdmin && !canDelete && (
                    <button
                      className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-300 text-slate-400 px-3 py-2 rounded-lg text-xs font-bold"
                      title="Only admins from this department can delete this employee"
                    >
                      <IconTrash />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
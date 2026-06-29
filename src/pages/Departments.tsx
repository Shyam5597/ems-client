import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";

// ============================================================================
// SVG ICONS
// ============================================================================
const IconBuilding = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const IconX = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconWarning = () => (
  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Department accent colors — cycles through for visual variety
const DEPT_ACCENTS = [
  { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  { bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-500", text: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
  { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
  { bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500", text: "text-rose-700", badge: "bg-rose-100 text-rose-700" },
  { bg: "bg-cyan-50", border: "border-cyan-200", dot: "bg-cyan-500", text: "text-cyan-700", badge: "bg-cyan-100 text-cyan-700" },
];

// ============================================================================
// DELETE CONFIRM MODAL
// ============================================================================
const DeleteConfirmModal = ({
  deptName,
  onConfirm,
  onCancel,
}: {
  deptName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <div className="flex items-center gap-3 bg-red-50 border-b border-red-100 p-5">
        <IconWarning />
        <h3 className="font-bold text-red-700 text-lg">Delete Department</h3>
      </div>
      <div className="p-6">
        <p className="text-slate-700 font-semibold mb-1">
          Are you sure you want to delete{" "}
          <span className="text-red-600 font-bold">"{deptName}"</span>?
        </p>
        <p className="text-sm text-slate-500 leading-relaxed mt-2 mb-8">
          This action is permanent and cannot be undone. Employees currently
          assigned to this department will lose their department association.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm cursor-pointer"
          >
            <IconX /> Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm cursor-pointer"
          >
            <IconTrash /> Yes, Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN DEPARTMENTS COMPONENT
// ============================================================================
export default function Departments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const token = localStorage.getItem("token");

  const isAdmin = currentUser.role === "Admin" || currentUser.role === "MD/CEO";

  const [newDept, setNewDept] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deptToDelete, setDeptToDelete] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [deptsRes, usersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/departments`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/users`, { headers }),
        ]);
        if (deptsRes.ok) setDepartments(await deptsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, [token]);

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleAdd = async () => {
    const trimmed = newDept.trim();
    if (!trimmed) { setAddError("Department name cannot be empty."); return; }
    const exists = departments.some((d: any) => d.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) { setAddError("A department with this name already exists."); return; }

    setIsAdding(true);
    setAddError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const addedDept = await res.json();
        setDepartments([...departments, addedDept]);
        setNewDept("");
        showToast(`"${trimmed}" department created successfully.`, "success");
      } else {
        showToast("Failed to add department. Please try again.", "error");
      }
    } catch (error) {
      console.error("Failed to add department", error);
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deptToDelete) return;
    const { id, name } = deptToDelete;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDepartments(departments.filter((d: any) => d.id !== id));
        showToast(`"${name}" department deleted.`, "success");
      } else {
        showToast("Failed to delete department.", "error");
      }
    } catch (error) {
      console.error("Failed to delete department", error);
      showToast("Network error. Please try again.", "error");
    } finally {
      setDeptToDelete(null);
    }
  };

  const getDeptStats = (deptName: string) => {
    const deptUsers = users.filter((u: any) => u.department === deptName);
    const present = deptUsers.filter((u: any) => u.status === "Present").length;
    return { total: deptUsers.length, present, absent: deptUsers.length - present };
  };

  // Filtered departments for search
  const filteredDepts = departments.filter((d: any) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Summary stats
  const totalEmployees = users.length;
  const totalPresent = users.filter((u: any) => u.status === "Present").length;
  const totalAbsent = totalEmployees - totalPresent;

  return (
    <MainLayout>

      {/* DELETE CONFIRM MODAL */}
      {deptToDelete && (
        <DeleteConfirmModal
          deptName={deptToDelete.name}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeptToDelete(null)}
        />
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl font-semibold text-sm transition-all animate-fadeIn
          ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <IconCheck /> : <IconX />}
          {toast.message}
        </div>
      )}

      {/* ================================================================
          STICKY HEADER — Page title + stats summary + Add Dept form
      ================================================================ */}
      <div className="sticky top-0 z-40 bg-slate-50 -mx-4 md:-mx-8 px-4 md:px-8 pt-6 pb-4 border-b border-slate-200 mb-8 shadow-sm">

        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 leading-tight">Company Departments</h1>
            <p className="text-slate-500 font-medium mt-1">
              {departments.length} department{departments.length !== 1 ? "s" : ""} · {totalEmployees} total employees
            </p>
          </div>

          {/* Quick summary pills */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              {totalPresent} Active
            </span>
            <span className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
              {totalAbsent} Absent
            </span>
          </div>
        </div>

        {/* Control bar: Add Dept (admin) + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">

          {/* Add department (admin only) */}
          {isAdmin && (
            <div className="flex gap-2 flex-grow">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconPlus />
                </div>
                <input
                  value={newDept}
                  onChange={(e) => { setNewDept(e.target.value); setAddError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="New department name..."
                  className={`w-full pl-9 bg-slate-50 border py-2 px-3 rounded-xl font-medium text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition
                    ${addError ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-slate-200"}`}
                />
                {addError && (
                  <p className="absolute -bottom-5 left-0 text-xs text-red-500 font-semibold">{addError}</p>
                )}
              </div>
              <button
                onClick={handleAdd}
                disabled={isAdding}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-md whitespace-nowrap disabled:opacity-50 cursor-pointer"
              >
                <IconPlus />
                {isAdding ? "Adding..." : "Add Department"}
              </button>
            </div>
          )}

          {/* Search */}
          <div className={`relative ${isAdmin ? "sm:w-56" : "flex-grow"}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconSearch /></div>
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 bg-white border border-slate-300 py-2 px-3 rounded-xl font-medium text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

        </div>
      </div>

      {/* ================================================================
          DEPARTMENT CARDS GRID
      ================================================================ */}
      {filteredDepts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <IconBuilding />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No departments found</h3>
          <p className="text-slate-500 text-sm mt-1">
            {searchQuery ? `No results for "${searchQuery}". Try a different search.` : "Add your first department above to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filteredDepts.map((dept: any, idx: number) => {
            const stats = getDeptStats(dept.name);
            const accent = DEPT_ACCENTS[idx % DEPT_ACCENTS.length];
            const attendancePct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

            return (
              <div
                key={dept.id}
                className={`bg-white rounded-3xl border ${accent.border} shadow-sm hover:shadow-md transition-all group flex flex-col overflow-hidden`}
              >
                {/* Card top accent strip */}
                <div className={`h-1.5 w-full ${accent.dot}`} />

                <div className="p-6 flex flex-col flex-grow">
                  {/* Dept name + icon */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${accent.bg} ${accent.border} border flex items-center justify-center`}>
                        <span className={`w-3 h-3 rounded-full ${accent.dot}`} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight">{dept.name}</h2>
                        <span className={`text-xs font-bold ${accent.text}`}>Department</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${accent.badge}`}>
                      {stats.total} {stats.total === 1 ? "emp" : "emps"}
                    </span>
                  </div>

                  {/* Stats rows */}
                  <div className="space-y-3 flex-grow">
                    <div className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                        <IconUsers />
                        Total Employees
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{stats.total}</span>
                    </div>

                    <div className="flex justify-between items-center bg-emerald-50 rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                        <IconCheck />
                        Active Today
                      </div>
                      <span className="font-bold text-emerald-700 text-sm">{stats.present}</span>
                    </div>

                    <div className="flex justify-between items-center bg-red-50 rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
                        <IconX />
                        Absent Today
                      </div>
                      <span className="font-bold text-red-600 text-sm">{stats.absent}</span>
                    </div>
                  </div>

                  {/* Attendance progress bar */}
                  {stats.total > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                        <span>Attendance Rate</span>
                        <span className={attendancePct >= 75 ? "text-emerald-600" : attendancePct >= 50 ? "text-amber-600" : "text-red-500"}>
                          {attendancePct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            attendancePct >= 75 ? "bg-emerald-500" : attendancePct >= 50 ? "bg-amber-400" : "bg-red-400"
                          }`}
                          style={{ width: `${attendancePct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Delete button */}
                  {isAdmin && (
                    <button
                      onClick={() => setDeptToDelete({ id: dept.id, name: dept.name })}
                      className="mt-5 w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
                    >
                      <IconTrash />
                      Delete Department
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </MainLayout>
  );
}
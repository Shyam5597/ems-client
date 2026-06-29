import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const isAdmin = currentUser.role === "Admin" || currentUser.role === "MD/CEO";
  const location = useLocation();

  const getLinkClass = (path: string) => {
    return `p-3 rounded transition font-medium ${
      location.pathname === path ? "bg-blue-600 text-white" : "hover:bg-slate-800"
    }`;
  };

  const NavLinks = () => (
    <div className="flex flex-col gap-2 flex-grow">
      <Link to="/" className={getLinkClass("/")} onClick={onClose}>Dashboard</Link>
      <Link to="/attendance" className={getLinkClass("/attendance")} onClick={onClose}>Attendance Tracker</Link>
      <Link to="/employees" className={getLinkClass("/employees")} onClick={onClose}>Employees</Link>
      <Link to="/departments" className={getLinkClass("/departments")} onClick={onClose}>Departments</Link>
      <Link to="/leaves" className={getLinkClass("/leaves")} onClick={onClose}>
        {isAdmin ? "Leaves & Time Off" : "Apply Leave"}
      </Link>
      <Link to="/analytics" className={getLinkClass("/analytics")} onClick={onClose}>Reports & Analytics</Link>
      <Link to="/profile" className={getLinkClass("/profile")} onClick={onClose}>Profile</Link>
    </div>
  );

  return (
    <>
      {/* ============================================================
          DESKTOP SIDEBAR — always visible on md and above
      ============================================================ */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 min-h-screen p-5">
        <h1 className="text-2xl font-bold mb-8 tracking-widest text-center border-b border-slate-700 pb-4 text-white">
          EMS PORTAL
        </h1>
        <NavLinks />
      </div>

      {/* ============================================================
          MOBILE DRAWER — slides in from the left when isOpen is true
      ============================================================ */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 text-slate-300
          flex flex-col p-5
          transform transition-transform duration-300 ease-in-out
          md:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Drawer header with close button */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-white">EMS PORTAL</h1>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
          >
            {/* X icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <NavLinks />

        {/* User info at the bottom of the drawer */}
        <div className="mt-auto pt-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser?.name || "Employee"}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.designation || currentUser?.role || "Staff"}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getSafeUser = () => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : {};
    } catch { return {}; }
  };

  const currentUser = getSafeUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">

      {/* SIDEBAR — receives open state */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MOBILE BACKDROP — tapping outside closes the drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP NAVBAR */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-20 shadow-sm relative">

          <div className="flex items-center gap-3">
            {/* HAMBURGER — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-slate-100 transition gap-1.5"
              aria-label="Open navigation menu"
            >
              <span className="w-5 h-0.5 bg-slate-600 rounded-full"></span>
              <span className="w-5 h-0.5 bg-slate-600 rounded-full"></span>
              <span className="w-5 h-0.5 bg-slate-600 rounded-full"></span>
            </button>

            <span className="font-extrabold text-slate-400 tracking-wider text-sm hidden md:inline-block uppercase">
              {currentUser?.department ? `${currentUser.department} WORKSPACE` : "ENTERPRISE WORKSPACE"}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-slate-800 text-sm leading-tight">{currentUser?.name || "Employee"}</p>
              <p className="text-xs text-slate-500 font-medium">{currentUser?.designation || currentUser?.role || "Staff"}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <button
              onClick={handleLogout}
              className="bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            >
              Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 animate-fadeIn">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
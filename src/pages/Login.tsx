import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineShieldCheck } from "react-icons/hi";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // IMPORTANT: every time the Login page mounts (including right after logout),
  // wipe any leftover auth data and reset the form fields. This prevents the
  // "dummy data" / stale form values from ever surviving a logout.
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    setEmail("");
    setPassword("");
    setFieldErrors({});
  }, []);

  const clearError = (field: keyof FieldErrors) =>
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));

  const validateEmail = (val: string): string | undefined => {
    if (!val) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email address.";
    return undefined;
  };

  const handleEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const err = validateEmail(email);
      if (err) setFieldErrors(prev => ({ ...prev, email: err }));
      else { clearError("email"); passwordRef.current?.focus(); }
    }
  };

  const handlePasswordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!password) setFieldErrors(prev => ({ ...prev, password: "Password is required." }));
      else handleLogin();
    }
  };

  const handleLogin = async () => {
    const errors: FieldErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    if (!password) errors.password = "Password is required.";
    if (Object.keys(errors).length) return setFieldErrors(errors);

    setIsLoading(true);
    setFieldErrors({});

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        navigate("/", { replace: true });
      } else {
        const msg: string = data.message || "Invalid credentials.";
        if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("account") || msg.toLowerCase().includes("user")) {
          setFieldErrors({ email: "No account found with this email." });
        } else if (msg.toLowerCase().includes("password")) {
          setFieldErrors({ password: "Incorrect password. Please try again." });
        } else {
          setFieldErrors({ password: msg });
        }
      }
    } catch {
      setFieldErrors({ password: "Cannot connect to server. Is your backend running?" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <span className="text-white font-extrabold text-sm tracking-tight">EM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Sign in to EmpManage</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your work credentials to continue.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Email</label>
            <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all ${
              fieldErrors.email
                ? "border-red-400 bg-red-50"
                : "border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
            }`}>
              <HiOutlineMail className={`text-lg flex-shrink-0 ${fieldErrors.email ? "text-red-400" : "text-slate-400"}`} />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                onKeyDown={handleEmailKeyDown}
                className="flex-1 outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
                autoComplete="off"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">!</span>
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <button type="button" className="text-xs text-blue-600 hover:underline font-medium">Forgot password?</button>
            </div>
            <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all ${
              fieldErrors.password
                ? "border-red-400 bg-red-50"
                : "border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
            }`}>
              <HiOutlineLockClosed className={`text-lg flex-shrink-0 ${fieldErrors.password ? "text-red-400" : "text-slate-400"}`} />
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                onKeyDown={handlePasswordKeyDown}
                className="flex-1 outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
                autoComplete="off"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0">
                {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">!</span>
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 mt-1"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <HiOutlineShieldCheck className="text-base" />
                Log In
              </>
            )}
          </button>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          New employee?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
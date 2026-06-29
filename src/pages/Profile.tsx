import { useState, useEffect, useRef } from "react";
import MainLayout from "../layouts/MainLayout";

// ============================================================================
// INLINE SVG ICONS — consistent with the rest of the app
// ============================================================================
const IconEye = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const IconEyeOff = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;
const IconClose = ({ className = "w-6 h-6" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const IconEdit = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const IconCheck = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const IconShield = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const IconMail = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconPhone = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IconLock = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const IconUser = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconBuilding = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const IconBadge = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>;
const IconCalendar = ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconStar = ({ className = "w-5 h-5" }) => <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;

// ============================================================================
// INTERFACES
// ============================================================================
interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  status: string;
  createdAt: string;
  attendance: any[];
}

// ============================================================================
// TOAST NOTIFICATION
// ============================================================================
interface Toast { message: string; type: "success" | "error" | "info"; }

// ============================================================================
// OTP MODAL PROPS
// ============================================================================
type OtpFlowType = "email" | "phone" | "password";

interface OtpModalState {
  open: boolean;
  flow: OtpFlowType | null;
  step: "input" | "otp" | "verified";
  newValue: string;         // new email / phone / (unused for password)
  newPassword: string;      // used only for password flow
  confirmPassword: string;
  otp: string;
  generatedOtp: string;
  loading: boolean;
  error: string;
  countdown: number;
}

// ============================================================================
// PASSWORD STRENGTH
// ============================================================================
const getPasswordStrength = (pwd: string): { label: string; color: string; width: string; score: number } => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;
  if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/5", score };
  if (score === 2) return { label: "Fair", color: "bg-orange-400", width: "w-2/5", score };
  if (score === 3) return { label: "Good", color: "bg-yellow-400", width: "w-3/5", score };
  if (score === 4) return { label: "Strong", color: "bg-blue-500", width: "w-4/5", score };
  return { label: "Very Strong", color: "bg-green-500", width: "w-full", score };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Profile() {
  const token = localStorage.getItem("token") || "";

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved && saved !== "undefined" ? JSON.parse(saved) : {} as User;
    } catch { return {} as User; }
  });

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // OTP Modal State — single unified state machine
  const [modal, setModal] = useState<OtpModalState>({
    open: false,
    flow: null,
    step: "input",
    newValue: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
    generatedOtp: "",
    loading: false,
    error: "",
    countdown: 0,
  });

  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // ============================================================================
  // FETCH FRESH USER FROM BACKEND ON MOUNT
  // ============================================================================
  useEffect(() => {
    const fetchUser = async () => {
      const myId = currentUser?.id || currentUser?._id;
      if (!myId || !token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${myId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const user = data.user || data;
          setCurrentUser(user);
          localStorage.setItem("currentUser", JSON.stringify(user));
        }
      } catch { /* silent */ }
    };
    fetchUser();
  }, [token]);

  // ============================================================================
  // TOAST HELPER
  // ============================================================================
  const showToast = (message: string, type: Toast["type"] = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // ============================================================================
  // OPEN MODAL FOR A FLOW
  // ============================================================================
  const openModal = (flow: OtpFlowType) => {
    setShowNewPwd(false);
    setShowConfirmPwd(false);
    setModal({
      open: true,
      flow,
      step: "input",
      newValue: "",
      newPassword: "",
      confirmPassword: "",
      otp: "",
      generatedOtp: "",
      loading: false,
      error: "",
      countdown: 0,
    });
  };

  const closeModal = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setModal(prev => ({ ...prev, open: false, loading: false, error: "" }));
  };

  // ============================================================================
  // COUNTDOWN TIMER
  // ============================================================================
  const startCountdown = (seconds = 60) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setModal(prev => ({ ...prev, countdown: seconds }));
    countdownRef.current = setInterval(() => {
      setModal(prev => {
        if (prev.countdown <= 1) {
          clearInterval(countdownRef.current!);
          return { ...prev, countdown: 0 };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  };

  // ============================================================================
  // GENERATE & "SEND" OTP  (in production: call backend /api/send-otp)
  // Here we simulate OTP generation and log it to console for development.
  // Replace the fetch call below with your real backend OTP endpoint.
  // ============================================================================
  const sendOtp = async () => {
    setModal(prev => ({ ...prev, loading: true, error: "" }));

    // Validate input first
    if (modal.flow === "email") {
      if (!modal.newValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modal.newValue)) {
        setModal(prev => ({ ...prev, loading: false, error: "Please enter a valid email address." }));
        return;
      }
    }
    if (modal.flow === "phone") {
      if (!modal.newValue || !/^\d{10}$/.test(modal.newValue.replace(/\s/g, ""))) {
        setModal(prev => ({ ...prev, loading: false, error: "Please enter a valid 10-digit mobile number." }));
        return;
      }
    }
    if (modal.flow === "password") {
      const alphaCount = (modal.newPassword.match(/[a-zA-Z]/g) || []).length;
      const hasNum = /\d/.test(modal.newPassword);
      const hasSpec = /[^a-zA-Z0-9\s]/.test(modal.newPassword);
      if (alphaCount < 4 || !hasNum || !hasSpec) {
        setModal(prev => ({ ...prev, loading: false, error: "Password must have ≥4 letters, 1 number, and 1 special character." }));
        return;
      }
      if (modal.newPassword !== modal.confirmPassword) {
        setModal(prev => ({ ...prev, loading: false, error: "Passwords do not match." }));
        return;
      }
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // --------------------------------------------------------------------------
    // PRODUCTION: Replace the block below with a real backend call:
    //
    // const target = modal.flow === "email" ? modal.newValue
    //              : modal.flow === "phone" ? modal.newValue
    //              : currentUser.email;  // send password-change OTP to current email
    //
    // await fetch("http://localhost:5000/api/send-otp", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    //   body: JSON.stringify({ target, otp, type: modal.flow })
    // });
    // --------------------------------------------------------------------------

    // DEV: Simulate network delay and log OTP to console
    await new Promise(r => setTimeout(r, 800));
    console.log(`[DEV] OTP for ${modal.flow}: ${otp}`);

    setModal(prev => ({ ...prev, loading: false, step: "otp", generatedOtp: otp, otp: "" }));
    startCountdown(60);

    const destination = modal.flow === "password"
      ? `your registered email (${currentUser.email})`
      : modal.flow === "email" ? modal.newValue : modal.newValue;
    showToast(`OTP sent to ${destination}. (Check console in dev mode.)`, "info");
  };

  // ============================================================================
  // VERIFY OTP
  // ============================================================================
  const verifyOtp = async () => {
    if (modal.otp.length !== 6) {
      setModal(prev => ({ ...prev, error: "Please enter the complete 6-digit OTP." }));
      return;
    }
    if (modal.otp !== modal.generatedOtp) {
      setModal(prev => ({ ...prev, error: "Incorrect OTP. Please try again." }));
      return;
    }

    // OTP correct — apply the change
    setModal(prev => ({ ...prev, loading: true, error: "" }));
    const myId = currentUser?.id || currentUser?._id;

    let updatePayload: Record<string, string> = {};
    if (modal.flow === "email") updatePayload = { email: modal.newValue };
    if (modal.flow === "phone") updatePayload = { phone: modal.newValue };
    if (modal.flow === "password") updatePayload = { password: modal.newPassword };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${myId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = data.user || data;
        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setModal(prev => ({ ...prev, loading: false, step: "verified" }));
        if (countdownRef.current) clearInterval(countdownRef.current);

        const successMsg = modal.flow === "email" ? "Email updated successfully!"
          : modal.flow === "phone" ? "Mobile number updated successfully!"
          : "Password changed successfully!";
        showToast(successMsg, "success");
      } else {
        setModal(prev => ({ ...prev, loading: false, error: "Failed to save. Please try again." }));
      }
    } catch {
      setModal(prev => ({ ...prev, loading: false, error: "Server error. Please try again." }));
    }
  };

  // ============================================================================
  // OTP INPUT — 6 individual boxes
  // ============================================================================
  const handleOtpDigit = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const digits = modal.otp.split("").concat(Array(6).fill("")).slice(0, 6);
    digits[index] = value.slice(-1);
    const newOtp = digits.join("");
    setModal(prev => ({ ...prev, otp: newOtp, error: "" }));
    if (value && index < 5) otpInputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !modal.otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // ============================================================================
  // DERIVED DATA
  // ============================================================================
  const initials = currentUser.name
    ? currentUser.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const joinDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const attendanceCount = Array.isArray(currentUser.attendance) ? currentUser.attendance.length : 0;

  const pwdStrength = getPasswordStrength(modal.newPassword);

  // ============================================================================
  // MODAL FLOW LABELS
  // ============================================================================
  const flowMeta = {
    email: {
      title: "Change Email Address",
      icon: <IconMail className="w-8 h-8" />,
      inputLabel: "New Email Address",
      inputType: "email",
      inputPlaceholder: "Enter new email address",
      otpSentTo: modal.newValue,
      gradient: "from-blue-600 to-indigo-600",
    },
    phone: {
      title: "Change Mobile Number",
      icon: <IconPhone className="w-8 h-8" />,
      inputLabel: "New Mobile Number",
      inputType: "tel",
      inputPlaceholder: "Enter 10-digit mobile number",
      otpSentTo: modal.newValue,
      gradient: "from-violet-600 to-purple-600",
    },
    password: {
      title: "Change Password",
      icon: <IconLock className="w-8 h-8" />,
      inputLabel: "New Password",
      inputType: "password",
      inputPlaceholder: "Enter new password",
      otpSentTo: currentUser.email,
      gradient: "from-slate-700 to-slate-900",
    },
  };

  // ============================================================================
  // RENDER MODAL INNER CONTENT
  // ============================================================================
  const renderModalBody = () => {
    if (!modal.flow) return null;
    const meta = flowMeta[modal.flow];

    // ── STEP 1: INPUT ──
    if (modal.step === "input") {
      return (
        <div className="space-y-5">
          {modal.flow === "password" ? (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    value={modal.newPassword}
                    onChange={e => setModal(prev => ({ ...prev, newPassword: e.target.value, error: "" }))}
                    placeholder="Enter new password"
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 pr-12 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
                  />
                  <button onClick={() => setShowNewPwd(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition">
                    {showNewPwd ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {modal.newPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pwdStrength.score >= 1 ? pwdStrength.color : "bg-slate-200"}`}></div>
                      <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pwdStrength.score >= 2 ? pwdStrength.color : "bg-slate-200"}`}></div>
                      <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pwdStrength.score >= 3 ? pwdStrength.color : "bg-slate-200"}`}></div>
                      <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pwdStrength.score >= 4 ? pwdStrength.color : "bg-slate-200"}`}></div>
                      <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pwdStrength.score >= 5 ? pwdStrength.color : "bg-slate-200"}`}></div>
                    </div>
                    <p className={`text-xs font-bold ${pwdStrength.score <= 1 ? "text-red-500" : pwdStrength.score <= 2 ? "text-orange-500" : pwdStrength.score <= 3 ? "text-yellow-600" : "text-green-600"}`}>
                      {pwdStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    value={modal.confirmPassword}
                    onChange={e => setModal(prev => ({ ...prev, confirmPassword: e.target.value, error: "" }))}
                    placeholder="Re-enter new password"
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 pr-12 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
                  />
                  <button onClick={() => setShowConfirmPwd(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition">
                    {showConfirmPwd ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {modal.confirmPassword.length > 0 && modal.newPassword !== modal.confirmPassword && (
                  <p className="text-xs text-red-500 font-bold mt-1">Passwords do not match.</p>
                )}
                {modal.confirmPassword.length > 0 && modal.newPassword === modal.confirmPassword && (
                  <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1"><IconCheck className="w-3 h-3" /> Passwords match</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-500 font-medium space-y-1">
                <p className="font-bold text-slate-600 mb-1">Password requirements:</p>
                <p className={/[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*[a-zA-Z]/.test(modal.newPassword) ? "text-green-600" : ""}>• At least 4 alphabets</p>
                <p className={/\d/.test(modal.newPassword) ? "text-green-600" : ""}>• At least 1 number</p>
                <p className={/[^a-zA-Z0-9\s]/.test(modal.newPassword) ? "text-green-600" : ""}>• At least 1 special character</p>
              </div>

              <p className="text-xs text-slate-400 font-medium">An OTP will be sent to <span className="font-bold text-slate-600">{currentUser.email}</span> to confirm this change.</p>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">{meta.inputLabel}</label>
                <input
                  type={meta.inputType}
                  value={modal.newValue}
                  onChange={e => setModal(prev => ({ ...prev, newValue: e.target.value, error: "" }))}
                  placeholder={meta.inputPlaceholder}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium">
                A 6-digit OTP will be sent to <span className="font-bold text-slate-600">{modal.newValue || "the address above"}</span> to verify ownership.
              </p>
            </>
          )}

          {modal.error && <p className="text-sm text-red-600 font-bold bg-red-50 border border-red-100 p-3 rounded-xl">{modal.error}</p>}

          <button
            onClick={sendOtp}
            disabled={modal.loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-2"
          >
            {modal.loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span> Sending OTP…</>
            ) : "Send OTP"}
          </button>
        </div>
      );
    }

    // ── STEP 2: OTP ──
    if (modal.step === "otp") {
      const digits = modal.otp.split("").concat(Array(6).fill("")).slice(0, 6);
      return (
        <div className="space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 mb-3">
              <IconShield className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-slate-500 font-medium">
              We sent a 6-digit code to <br />
              <span className="font-bold text-slate-800">{meta.otpSentTo || currentUser.email}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">(Check your browser console in dev mode)</p>
          </div>

          {/* 6-box OTP input */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={el => { otpInputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digits[i] || ""}
                onChange={e => handleOtpDigit(e.target.value, i)}
                onKeyDown={e => handleOtpKeyDown(e, i)}
                className="w-11 h-12 text-center text-xl font-black border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
              />
            ))}
          </div>

          {modal.error && <p className="text-sm text-red-600 font-bold bg-red-50 border border-red-100 p-3 rounded-xl text-center">{modal.error}</p>}

          <button
            onClick={verifyOtp}
            disabled={modal.loading || modal.otp.length < 6}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-2"
          >
            {modal.loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span> Verifying…</>
            ) : <><IconCheck /> Verify & Save</>}
          </button>

          <div className="text-center">
            {modal.countdown > 0 ? (
              <p className="text-xs text-slate-400 font-medium">Resend OTP in <span className="font-bold text-blue-600">{modal.countdown}s</span></p>
            ) : (
              <button onClick={sendOtp} className="text-sm font-bold text-blue-600 hover:underline cursor-pointer transition">Resend OTP</button>
            )}
          </div>
        </div>
      );
    }

    // ── STEP 3: VERIFIED ──
    if (modal.step === "verified") {
      const successMsg = modal.flow === "email" ? "Email address updated!"
        : modal.flow === "phone" ? "Mobile number updated!"
        : "Password changed!";
      const subMsg = modal.flow === "email" ? `Your new email is ${modal.newValue}`
        : modal.flow === "phone" ? `Your new number is ${modal.newValue}`
        : "Use your new password on next login.";

      return (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center animate-fadeIn">
            <IconCheck className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">{successMsg}</h3>
          <p className="text-slate-500 font-medium">{subMsg}</p>
          <button
            onClick={closeModal}
            className="mt-4 bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      );
    }

    return null;
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <MainLayout>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] max-w-sm px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold flex items-center gap-3 animate-fadeIn transition-all ${
          toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"
        }`}>
          {toast.type === "success" && <IconCheck className="w-5 h-5 flex-shrink-0" />}
          {toast.type === "error" && <span className="flex-shrink-0 text-lg">✕</span>}
          {toast.type === "info" && <IconShield className="w-5 h-5 flex-shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white cursor-pointer"><IconClose className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── MODAL ── */}
      {modal.open && modal.flow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className={`bg-gradient-to-br ${flowMeta[modal.flow].gradient} p-6 text-white relative`}>
              <button onClick={closeModal} className="absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer transition">
                <IconClose />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  {flowMeta[modal.flow].icon}
                </div>
                <div>
                  <h2 className="text-xl font-black">{flowMeta[modal.flow].title}</h2>
                  <p className="text-white/70 text-sm mt-0.5">
                    {modal.step === "input" ? "Enter your new details below"
                      : modal.step === "otp" ? "Enter the verification code"
                      : "Change complete"}
                  </p>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex gap-2 mt-4">
                {["input", "otp", "verified"].map((s, i) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    modal.step === "input" && i === 0 ? "bg-white" :
                    modal.step === "otp" && i <= 1 ? "bg-white" :
                    modal.step === "verified" ? "bg-white" : "bg-white/30"
                  }`} />
                ))}
              </div>
            </div>

            {/* Modal body */}
            <div className="p-6">
              {renderModalBody()}
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-slate-50 -mx-4 md:-mx-8 px-4 md:px-8 pt-6 pb-4 border-b border-slate-200 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your personal information and account security.</p>
          </div>
          <div className="flex-shrink-0">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${currentUser.status === "Active" || !currentUser.status ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
              ● {currentUser.status || "Active"}
            </span>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-500/10 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500/10 translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-900/40 select-none">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-slate-900 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-grow">
            <h2 className="text-3xl font-black text-white leading-tight">{currentUser.name || "—"}</h2>
            <p className="text-indigo-200 font-semibold mt-1">{currentUser.designation || "—"} · {currentUser.department || "—"}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                <IconBadge className="w-3.5 h-3.5 text-indigo-300" />
                {currentUser.role || "Employee"}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                <IconCalendar className="w-3.5 h-3.5 text-indigo-300" />
                Joined {joinDate}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                <IconStar className="w-3.5 h-3.5 text-yellow-300" />
                {attendanceCount} Punches Logged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: PERSONAL INFO ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Information Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <IconUser className="text-blue-500" /> Personal Information
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Name */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-slate-800 font-bold text-base">{currentUser.name || "—"}</p>
                </div>

                {/* Role */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                  <p className="text-slate-800 font-bold text-base">{currentUser.role || "—"}</p>
                </div>

                {/* Designation */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Designation</p>
                  <p className="text-slate-800 font-bold text-base">{currentUser.designation || "—"}</p>
                </div>

                {/* Department */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><IconBuilding className="w-3 h-3" /> Department</p>
                  <p className="text-slate-800 font-bold text-base">{currentUser.department || "—"}</p>
                </div>

                {/* Employee ID */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Employee ID</p>
                  <p className="text-slate-600 font-bold text-base font-mono">{currentUser.id || currentUser._id || "—"}</p>
                </div>

                {/* Joined */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date Joined</p>
                  <p className="text-slate-800 font-bold text-base">{joinDate}</p>
                </div>

              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <IconMail className="text-blue-500" /> Contact Details
              </h2>
            </div>
            <div className="p-8 space-y-4">

              {/* Email row */}
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <IconMail className="text-blue-600 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-slate-800 font-bold">{currentUser.email || "—"}</p>
                  </div>
                </div>
                <button
                  onClick={() => openModal("email")}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap"
                >
                  <IconEdit /> Change
                </button>
              </div>

              {/* Phone row */}
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <IconPhone className="text-violet-600 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</p>
                    <p className="text-slate-800 font-bold">{currentUser.phone || "Not set"}</p>
                  </div>
                </div>
                <button
                  onClick={() => openModal("phone")}
                  className="flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap"
                >
                  <IconEdit /> {currentUser.phone ? "Change" : "Add"}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ── RIGHT: SECURITY ── */}
        <div className="space-y-6">

          {/* Account Security Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <IconShield className="text-slate-600" /> Account Security
              </h2>
            </div>
            <div className="p-6 space-y-4">

              {/* Password row */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <IconLock className="text-slate-600 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</p>
                    <p className="text-slate-600 font-bold tracking-widest text-sm">••••••••••</p>
                  </div>
                </div>
                <button
                  onClick={() => openModal("password")}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-800 hover:text-white border border-slate-200 py-2.5 rounded-xl transition cursor-pointer"
                >
                  <IconLock className="w-4 h-4" /> Change Password
                </button>
              </div>

              {/* Security tips */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <p className="text-xs font-black text-blue-700 uppercase tracking-wider mb-2">Security Tips</p>
                <ul className="text-xs text-blue-600 font-medium space-y-1.5">
                  <li className="flex items-start gap-1.5"><IconCheck className="w-3 h-3 mt-0.5 flex-shrink-0" /> Use a unique password for this account</li>
                  <li className="flex items-start gap-1.5"><IconCheck className="w-3 h-3 mt-0.5 flex-shrink-0" /> Include numbers and special characters</li>
                  <li className="flex items-start gap-1.5"><IconCheck className="w-3 h-3 mt-0.5 flex-shrink-0" /> Change your password every 90 days</li>
                  <li className="flex items-start gap-1.5"><IconCheck className="w-3 h-3 mt-0.5 flex-shrink-0" /> Never share your password with anyone</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Activity Summary Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800">Activity Summary</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-500">Total Punches</span>
                <span className="font-black text-slate-800">{attendanceCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-500">This Month</span>
                <span className="font-black text-slate-800">
                  {Array.isArray(currentUser.attendance)
                    ? currentUser.attendance.filter(a => {
                        if (!a?.date) return false;
                        const d = new Date(a.date);
                        const now = new Date();
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                      }).length
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-slate-500">Account Status</span>
                <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  {currentUser.status || "Active"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
    
  );
}
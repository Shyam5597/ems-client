import { useState, useRef, KeyboardEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  HiOutlineUser, HiOutlineMail, HiOutlinePhone,
  HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineBriefcase,
  HiOutlineOfficeBuilding, HiOutlineCheckCircle, HiArrowRight
} from "react-icons/hi";

const roleData: Record<string, Record<string, string[]>> = {
  Admin: {
    "IT": ["IT Administrator", "IT Manager", "System Administrator", "Technical Lead"],
    "HR": ["HR Administrator", "HR Manager", "Talent Acquisition Manager"],
    "Finance": ["Finance Administrator", "Finance Manager", "Accounts Manager"],
    "Sales": ["Sales Administrator", "Sales Manager", "Regional Sales Manager"],
    "Operations": ["Operations Administrator", "Operations Manager", "Operations Head"],
    "Marketing": ["Marketing Administrator", "Marketing Manager", "Digital Marketing Manager"],
    "Customer Support": ["Support Administrator", "Support Manager", "Customer Success Manager"],
    "Production": ["Production Administrator", "Production Manager"],
    "Logistics": ["Logistics Administrator", "Logistics Manager"],
    "Security": ["Security Administrator", "Security Manager"]
  },
  Employee: {
    "IT": ["Java Developer", "React Developer", "Full Stack Developer", "Python Developer", "Software Engineer", "QA Engineer"],
    "HR": ["HR Executive", "Recruiter", "HR Associate"],
    "Finance": ["Accountant", "Financial Analyst", "Accounts Executive"],
    "Sales": ["Sales Executive", "Sales Associate", "Business Development Executive"],
    "Operations": ["Operations Executive", "Operations Coordinator"]
  }
};

type FieldErrors = Partial<Record<string, string>>;

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 3 = success
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
    role: "", department: "", designation: "", secretCode: ""
  });

  // Refs for Enter-key navigation
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const secretCodeRef = useRef<HTMLInputElement>(null);

  const setError = (field: string, msg: string) =>
    setFieldErrors(prev => ({ ...prev, [field]: msg }));
  const clearError = (field: string) =>
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    clearError(name);
    if (name === "role") {
      setFormData(prev => ({ ...prev, role: value, department: "", designation: "" }));
    } else if (name === "department") {
      setFormData(prev => ({ ...prev, department: value, designation: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Field-level validators
  const validators: Record<string, (val: string) => string | undefined> = {
    name: (v) => !v.trim() ? "Full name is required." : v.trim().length < 2 ? "Name is too short." : undefined,
    email: (v) => !v ? "Email is required." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address." : undefined,
    phone: (v) => !v ? "Phone number is required." : !/^\d{10}$/.test(v) ? "Phone must be exactly 10 digits." : undefined,
    password: (v) => {
      if (!v) return "Password is required.";
      const letters = (v.match(/[a-zA-Z]/g) || []).length;
      const hasNum = /\d/.test(v);
      const hasSpec = /[^a-zA-Z0-9\s]/.test(v);
      if (letters < 4 || !hasNum || !hasSpec) return "Need 4+ letters, 1 number, and 1 special character.";
      return undefined;
    },
    confirmPassword: (v) => !v ? "Please confirm your password." : v !== formData.password ? "Passwords do not match." : undefined,
  };

  const validateField = (name: string, value: string): boolean => {
    const err = validators[name]?.(value);
    if (err) { setError(name, err); return false; }
    clearError(name);
    return true;
  };

  // Enter key handlers per field
  const handleNameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") validateField("name", formData.name) && emailRef.current?.focus();
  };
  const handleEmailKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") validateField("email", formData.email) && phoneRef.current?.focus();
  };
  const handlePhoneKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") validateField("phone", formData.phone);
  };
  const handlePasswordKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") validateField("password", formData.password) && confirmPasswordRef.current?.focus();
  };
  const handleConfirmPasswordKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") validateField("confirmPassword", formData.confirmPassword) && handleNextStep();
  };
  const handleSecretCodeKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleRegister();
  };

  const handleNextStep = () => {
    const errors: FieldErrors = {};
    (["name", "email", "phone", "password", "confirmPassword"] as const).forEach(f => {
      const err = validators[f]?.(formData[f]);
      if (err) errors[f] = err;
    });
    if (!formData.role) errors.role = "Please select your role.";
    if (formData.role && formData.role !== "MD/CEO") {
      if (!formData.department) errors.department = "Please select a department.";
      if (formData.department && !formData.designation) errors.designation = "Please select a designation.";
    }
    if (Object.keys(errors).length) return setFieldErrors(errors);
    setStep(2);
  };

  const handleRegister = async () => {
    if (!formData.secretCode.trim()) return setError("secretCode", "Access code is required.");
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setStep(3);
      } else {
        setError("secretCode", data.message || "Registration failed. Check your access code.");
      }
    } catch {
      setError("secretCode", "Cannot connect to server. Is backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const availableDepartments = formData.role && formData.role !== "MD/CEO" ? Object.keys(roleData[formData.role] || {}) : [];
  const availableDesignations = formData.department && formData.role !== "MD/CEO" ? (roleData[formData.role]?.[formData.department] || []) : [];

  const InputWrapper = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <div>
      {children}
      {fieldErrors[field] && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          <span className="w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">!</span>
          {fieldErrors[field]}
        </p>
      )}
    </div>
  );

  const inputCls = (field: string) =>
    `flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all ${
      fieldErrors[field]
        ? "border-red-400 bg-red-50"
        : "border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
    }`;

  const iconCls = (field: string) => `text-lg flex-shrink-0 ${fieldErrors[field] ? "text-red-400" : "text-slate-400"}`;

  // ── Success Screen ────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <HiOutlineCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Account Created!</h2>
          <p className="text-slate-500 text-sm mb-2">
            Welcome to EmpManage, <span className="font-semibold text-slate-700">{formData.name}</span>.
          </p>
          <p className="text-slate-400 text-xs mb-8">
            Your account has been submitted for approval. You can sign in once it's activated.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20 transition-all"
          >
            Go to Sign In <HiArrowRight />
          </Link>
          <p className="text-slate-400 text-xs mt-6">Registered as <span className="font-medium text-slate-600">{formData.role}</span> · {formData.department || "N/A"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute bottom-10 -right-16 w-96 h-96 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-blue-700 font-extrabold text-sm">EM</span>
            </div>
            <span className="text-white font-semibold text-lg">EmpManage</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Join your<br />organization.
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
            Set up your employee account and get access to everything your team uses — tasks, leave, payroll, and more.
          </p>
        </div>

        {/* Step indicator */}
        <div className="relative z-10 space-y-3">
          {[
            { n: 1, label: "Personal & Role Info" },
            { n: 2, label: "Security Verification" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step >= n ? "bg-white text-blue-700 border-white" : "bg-transparent text-white/50 border-white/30"
              }`}>{n}</div>
              <span className={`text-sm font-medium transition-all ${step >= n ? "text-white" : "text-white/40"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 overflow-y-auto bg-slate-50 flex items-start justify-center py-10 px-6">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-extrabold text-xs">EM</span>
            </div>
            <span className="text-slate-700 font-semibold text-lg">EmpManage</span>
          </div>

          {/* Mobile step dots */}
          <div className="flex lg:hidden gap-2 justify-center mb-6">
            {[1, 2].map(n => (
              <div key={n} className={`h-1.5 rounded-full transition-all ${step === n ? "w-8 bg-blue-600" : "w-4 bg-slate-300"}`} />
            ))}
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-800">
              {step === 1 ? "Create your account" : "Verify your identity"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1 ? "Fill in your details to get started." : "Enter the secret access code provided by your organization."}
            </p>
          </div>

          {/* ── Step 1 ─────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Name */}
              <InputWrapper field="name">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className={inputCls("name")}>
                  <HiOutlineUser className={iconCls("name")} />
                  <input
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    onKeyDown={handleNameKey}
                    className="flex-1 outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
                  />
                </div>
              </InputWrapper>

              {/* Email */}
              <InputWrapper field="email">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Email</label>
                <div className={inputCls("email")}>
                  <HiOutlineMail className={iconCls("email")} />
                  <input
                    ref={emailRef}
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyDown={handleEmailKey}
                    className="flex-1 outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
                  />
                </div>
              </InputWrapper>

              {/* Phone */}
              <InputWrapper field="phone">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                <div className={inputCls("phone")}>
                  <HiOutlinePhone className={iconCls("phone")} />
                  <input
                    ref={phoneRef}
                    name="phone"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    onKeyDown={handlePhoneKey}
                    className="flex-1 outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
                  />
                </div>
              </InputWrapper>

              {/* Role */}
              <InputWrapper field="role">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <div className={inputCls("role")}>
                  <HiOutlineBriefcase className={iconCls("role")} />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="flex-1 outline-none bg-transparent text-slate-800 text-sm"
                  >
                    <option value="">Select your role</option>
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee</option>
                    <option value="MD/CEO">MD / CEO</option>
                  </select>
                </div>
              </InputWrapper>

              {/* Department */}
              {formData.role && formData.role !== "MD/CEO" && (
                <InputWrapper field="department">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                  <div className={inputCls("department")}>
                    <HiOutlineOfficeBuilding className={iconCls("department")} />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="flex-1 outline-none bg-transparent text-slate-800 text-sm"
                    >
                      <option value="">Select department</option>
                      {availableDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </InputWrapper>
              )}

              {/* Designation */}
              {formData.department && formData.role !== "MD/CEO" && (
                <InputWrapper field="designation">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Designation</label>
                  <div className={inputCls("designation")}>
                    <HiOutlineBriefcase className={iconCls("designation")} />
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="flex-1 outline-none bg-transparent text-slate-800 text-sm"
                    >
                      <option value="">Select designation</option>
                      {availableDesignations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </InputWrapper>
              )}

              {/* Password */}
              <InputWrapper field="password">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className={inputCls("password")}>
                  <HiOutlineLockClosed className={iconCls("password")} />
                  <input
                    ref={passwordRef}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 4 letters, 1 number, 1 symbol"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={handlePasswordKey}
                    className="flex-1 outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0">
                    {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </InputWrapper>

              {/* Confirm Password */}
              <InputWrapper field="confirmPassword">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className={inputCls("confirmPassword")}>
                  <HiOutlineLockClosed className={iconCls("confirmPassword")} />
                  <input
                    ref={confirmPasswordRef}
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onKeyDown={handleConfirmPasswordKey}
                    className="flex-1 outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0">
                    {showConfirmPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </InputWrapper>

              <button
                onClick={handleNextStep}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 transition-all mt-2 flex items-center justify-center gap-2"
              >
                Continue <HiArrowRight />
              </button>

              <p className="text-center text-slate-500 text-sm pt-1">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── Step 2 ─────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <HiOutlineShieldCheck className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-800 text-sm font-semibold">Organization Access Required</p>
                    <p className="text-blue-600 text-xs mt-0.5">
                      You're registering as <span className="font-bold">{formData.role}</span>
                      {formData.department ? ` · ${formData.department}` : ""}
                      {formData.designation ? ` · ${formData.designation}` : ""}
                      . Enter the secret code issued by your HR or IT team.
                    </p>
                  </div>
                </div>
              </div>

              <InputWrapper field="secretCode">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Secret Access Code</label>
                <div className={inputCls("secretCode")}>
                  <HiOutlineShieldCheck className={iconCls("secretCode")} />
                  <input
                    ref={secretCodeRef}
                    name="secretCode"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter your access code"
                    value={formData.secretCode}
                    onChange={(e) => { setFormData(prev => ({ ...prev, secretCode: e.target.value })); clearError("secretCode"); }}
                    onKeyDown={handleSecretCodeKey}
                    className="flex-1 outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm tracking-widest"
                  />
                </div>
              </InputWrapper>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-3.5 rounded-xl font-semibold text-sm transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-2/3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-green-600/20 hover:shadow-green-600/40 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <HiOutlineShieldCheck />
                      Verify & Register
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
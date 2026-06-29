
import { useState } from "react";

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

type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: string;
  status: string;
  password?: string;
  secretCode?: string; // To pass backend validation
};

type Props = {
  onClose: () => void;
  onAddEmployee: (employee: Employee) => void;
};

export default function AddEmployeeModal({ onClose, onAddEmployee }: Props) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Employee");
  const [designation, setDesignation] = useState("");

  const defaultPassword = "Welcome@123";
  
  // Get available designations based on selected role and the Admin's locked department
  const availableDesignations = roleData[role]?.[currentUser.department] || [];

  const handleSave = () => {
    if (!name || !email || !phone || !designation) {
      alert("Please fill all required fields");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("Invalid Phone Number: Must be exactly 10 digits with no alphabets.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Invalid Email: Must contain a valid format with one '@' and a dot.");
      return;
    }

    // Determine correct secret code to pass backend security check
    const code = role === "Admin" ? "EDVAC-MASTER-ADMIN" : "EDVAC-EMP-2026";

    onAddEmployee({
      id: `EMP${Date.now()}`,
      name,
      email,
      phone,
      department: currentUser.department,
      designation,
      role,
      status: "Absent",
      password: defaultPassword,
      secretCode: code 
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-[500px] my-8 border border-white/50">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Add New Team Member</h2>

        <div className="space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full border-0 bg-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
          <input value={email} type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full border-0 bg-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
          <input value={phone} maxLength={10} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number (10 digits)" className="w-full border-0 bg-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
          
          <select value={role} onChange={(e) => { setRole(e.target.value); setDesignation(""); }} className="w-full border-0 bg-slate-100 p-3 rounded-xl font-bold text-blue-700 focus:ring-2 focus:ring-blue-500">
            <option value="Employee">Account Category: Employee</option>
            <option value="Admin">Account Category: Admin</option>
          </select>

          <div className="text-sm font-semibold text-slate-500 ml-1">Department (Locked)</div>
          <input value={currentUser.department} disabled className="w-full border-0 p-3 rounded-xl bg-slate-200 text-slate-500 font-bold" />

          <select value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full border-0 bg-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500">
            <option value="">-- Select Designation --</option>
            {availableDesignations.map((desig, i) => (
              <option key={i} value={desig}>{desig}</option>
            ))}
          </select>

          <div className="text-sm font-semibold text-slate-500 ml-1 mt-4">Temporary Password (Auto-Generated)</div>
          <input value={defaultPassword} disabled className="w-full border-0 p-3 rounded-xl bg-slate-200 text-slate-500 tracking-widest font-bold" />

          <div className="flex gap-3 pt-6">
            <button onClick={onClose} className="w-1/3 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all">Cancel</button>
            <button onClick={handleSave} className="w-2/3 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all">Add Employee</button>
          </div>
        </div>
      </div>
    </div>
  );
}
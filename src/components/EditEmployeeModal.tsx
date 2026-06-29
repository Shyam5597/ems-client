import { useState } from "react";

type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: string;
  status: string;
};

type Props = {
  employee: Employee;
  onClose: () => void;
  onUpdateEmployee: (employee: Employee) => void;
};

export default function EditEmployeeModal({ employee, onClose, onUpdateEmployee }: Props) {
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [phone, setPhone] = useState(employee.phone || "");

  const handleUpdate = () => {
    if (!name || !email || !phone) {
      alert("Please fill all fields");
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

    onUpdateEmployee({
      ...employee,
      name,
      email,
      phone,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-xl w-[500px]">
        <h2 className="text-2xl font-bold mb-4">Edit Employee Details</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 font-semibold mb-1 block">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-3 rounded" />
          </div>
          
          <div>
            <label className="text-sm text-gray-600 font-semibold mb-1 block">Email Address</label>
            <input value={email} type="email" onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded" />
          </div>

          <div>
            <label className="text-sm text-gray-600 font-semibold mb-1 block">Phone Number</label>
            <input value={phone} maxLength={10} onChange={(e) => setPhone(e.target.value)} className="w-full border p-3 rounded" />
          </div>

          <div>
             <label className="text-sm text-gray-600 font-semibold mb-1 block">Department & Designation (Locked)</label>
             <input value={`${employee.designation} - ${employee.department}`} disabled className="w-full border p-3 rounded bg-gray-100 text-gray-500" />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleUpdate} className="w-full bg-green-600 text-white px-4 py-3 rounded font-semibold hover:bg-green-700">Update</button>
            <button onClick={onClose} className="w-full bg-gray-300 text-gray-800 px-4 py-3 rounded font-semibold hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
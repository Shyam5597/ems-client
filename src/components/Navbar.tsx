
import { useNavigate } from "react-router-dom";


export default function Navbar() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "currentUser"
    );

    navigate("/login");
  };

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">

      <div>

        <h2 className="font-bold text-lg">
          Employee Management System
        </h2>

        <p className="text-sm text-gray-500">
          Welcome Back
        </p>

      </div>

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">

            {currentUser.name
              ?.charAt(0)
              ?.toUpperCase()}

          </div>

          <div>

            <p className="font-semibold">
              {currentUser.name}
            </p>

            <p className="text-sm text-gray-500">
              {currentUser.role}
            </p>

          </div>

        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>

    </div>
  );
}
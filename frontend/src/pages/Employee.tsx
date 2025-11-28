import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

// Helper function to get initials from name
const getInitials = (name: string | null | undefined): string => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Helper function to get a color based on name (for consistent avatar colors)
const getAvatarColor = (name: string | null | undefined): string => {
  if (!name) return "bg-gray-500";
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function Employee() {
  const { user, logout } = useAuth() as any;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    document.title = "Academic ERP - Dashboard";
  }, []);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.picture]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">

      {/* ================= TOP NAVBAR ================= */}
      <div className="w-full h-16 bg-white flex items-center justify-between px-6 border-b shadow-sm">

        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <img
            src="https://www.iiitb.ac.in/includefiles/userfiles/images/iiitb_logo.png"
            className="h-9"
            alt="IIITB Logo"
          />
          <span className="text-lg font-semibold text-gray-800">
            Academic ERP – Employee Portal
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600">
              {user?.name || "User"}
            </span>
            {user?.picture && !imageError ? (
              <img
                src={user.picture}
                className="h-9 w-9 rounded-full border-2 border-gray-200 object-cover"
                alt="User Avatar"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className={`h-9 w-9 rounded-full ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-200`}
              >
                {getInitials(user?.name)}
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* =============== MAIN LAYOUT =============== */}
      <div className="flex flex-row flex-1">

        {/* ============= CONTENT AREA ============= */}
        <div className="flex-1 p-10 overflow-y-auto">

          {/* TOP HEADER BAR */}
          <div className="w-full h-14 bg-white border shadow-sm rounded-lg flex items-center px-6 text-lg font-semibold text-gray-800 mb-6">
            Dashboard
          </div>

          {/* TWO MAIN BOXES */}
          <div className="grid grid-cols-2 gap-10 mb-8">

            {/* ============ LEFT CARD – BILLS ============ */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-5 text-gray-800">Bills</h2>

              <div className="space-y-3">

                <Link
                  to="bills/add"
                  className="block text-center bg-gray-700 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition"
                >
                  Add Bill
                </Link>

                <Link
                  to="bills/all"
                  className="block text-center bg-gray-700 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition"
                >
                  View All Bills
                </Link>

                <Link
                  to="bills/update"
                  className="block text-center bg-gray-700 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition"
                >
                  Update Bill
                </Link>

                <Link
                  to="bills/delete"
                  className="block text-center bg-gray-700 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition"
                >
                  Delete Bill
                </Link>

              </div>
            </div>

            {/* ============ RIGHT CARD – ASSIGN BILLS ============ */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-5 text-gray-800">Student Bills</h2>

              <div className="space-y-3">

                <Link
                  to="student-bills/assign-roll"
                  className="block text-center bg-gray-700 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition"
                >
                  Assign to Student
                </Link>

                <Link
                  to="student-bills/assign-domain"
                  className="block text-center bg-gray-700 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition"
                >
                  Assign to Domain
                </Link>

                <Link
                  to="student-bills/view"
                  className="block text-center bg-gray-700 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition"
                >
                  View Student Bills
                </Link>

                <Link
                  to="student-bills/delete-student"
                  className="block text-center bg-gray-700 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition"
                >
                  Delete All Bills
                </Link>

                <Link
                  to="student-bills/delete-specific"
                  className="block text-center bg-gray-700 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition"
                >
                  Delete Specific Bill
                </Link>

              </div>
            </div>

          </div>

          {/* OUTLET FOR NESTED ROUTES */}
          <Outlet />

        </div>
      </div>
    </div>
  );
}

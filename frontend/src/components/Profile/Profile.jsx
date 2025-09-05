import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Mail, User, Shield, Edit3 } from "lucide-react";
import UpdateProfileForm from "../Profile/UpdateProfileForm";
import AdminDashboard from "../Profile/AdminDashboard";

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-full bg-gradient-to-r from-blue-950 via-purple-950 to-pink-950">
      {/* Hero Banner */}
      <div className="relative h-52 bg-gradient-to-r from-blue-950 via-purple-950 to-pink-950">
        <button
          onClick={logout}
          className="absolute top-5 right-6 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="max-w-5xl mx-auto -mt-28 relative ">
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Left Section */}
            <div className="flex flex-col items-center p-8 bg-white/30 backdrop-blur">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                  {user?.full_name?.charAt(0) || "A"}
                </div>
                <span className="absolute bottom-2 right-2 block w-4 h-4 bg-green-500 rounded-full ring-2 ring-white"></span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold">{user?.full_name || "Admin"}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <span className="mt-3 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-600 font-medium">
                {user?.role || "User"}
              </span>

              <button
                className="mt-6 px-5 py-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow hover:scale-105 transition cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>

            {/* Right Section */}
            <div className="col-span-2 p-8">
              <h3 className="text-lg font-semibold mb-6 text-gray-700 flex items-center gap-2">
                <Edit3 size={18} className="text-purple-500" /> Profile Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 bg-white shadow-md rounded-2xl hover:shadow-lg transition">
                  <User className="text-blue-500 mb-2" size={20} />
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="font-medium">{user?.id}</p>
                </div>

                <div className="p-5 bg-white shadow-md rounded-2xl hover:shadow-lg transition">
                  <Shield className="text-purple-500 mb-2" size={20} />
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="font-medium">{user?.role || "User"}</p>
                </div>

                <div className="p-5 bg-white shadow-md rounded-2xl hover:shadow-lg transition col-span-2">
                  <Mail className="text-green-500 mb-2" size={20} />
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <UpdateProfileForm
          onClose={() => setIsEditing(false)}
        />
      )}

      {user?.role === "Admin" && (
        <AdminDashboard />
      )}
    </div>
  );
}
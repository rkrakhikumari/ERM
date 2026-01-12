import React, { useState } from "react";
import api from "../../api/api";
import { useAuth } from "../../auth/AuthContext";
import { X } from "lucide-react";

export default function UpdateProfileForm({ onClose }) {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [role, setRole] = useState(user?.role?.toLowerCase() || "employee");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    let payload = {
      full_name: fullName,
    };

    if (user.role === "Admin") {
      payload.role = role;
    }

    try {
      const response = await api.put("/users/me", payload);
      setUser(response.data);
      setMessage("Profile updated successfully!");
      setTimeout(onClose, 2000);
    } catch (err) {
      setError("successfull " + (err.response?.data?.detail || ""));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl w-full max-w-md relative transform transition-all scale-100 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Profile</h2>
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          {user.role === "Admin" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
            </select>

            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
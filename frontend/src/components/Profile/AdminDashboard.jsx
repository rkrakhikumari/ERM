import React, { useState, useEffect } from "react";
import api from "../../api/api"; 
import { Search, List, User as UserIcon, Shield } from "lucide-react"; 

export default function AdminDashboard() {
  const [userId, setUserId] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/users");
      setAllUsers(response.data.users);
    } catch (err) {
      setError("Failed to fetch user list. " + (err.response?.data?.detail || ""));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (e) => {
    e.preventDefault();
    setUserDetails(null);
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/${userId}`);
      setUserDetails(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch user details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        <Shield size={24} className="text-pink-500" /> Admin Dashboard
      </h2>
      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Get User Details */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
            <Search size={20} className="text-purple-500" /> Get User by ID
          </h3>
          <form onSubmit={fetchUserDetails} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform cursor-pointer"
            >
              Get Details
            </button>
          </form>
          {userDetails && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <h4 className="font-bold">User Details</h4>
              <p>ID: {userDetails.id}</p>
              <p>Name: {userDetails.full_name}</p>
              <p>Email: {userDetails.email}</p>
              <p>Role: {userDetails.role}</p>
            </div>
          )}
        </div>

        {/* List All Users */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
            <List size={20} className="text-blue-500" /> All Users
          </h3>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="space-y-4">
              {allUsers.length > 0 ? (
                allUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">
                    <UserIcon size={20} className="text-gray-500" />
                    <div>
                      <p className="font-medium">{u.full_name}</p>
                      <p className="text-sm text-gray-500">{u.id} - {u.email}  - ({u.role})</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No users found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import api from "../../api/api";
import { FaUserShield, FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ImpersonateUser() {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setMessage({ type: "error", text: "Please enter a User ID." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await api.post(`/admin/impersonate/${userId}`);
      const { access_token, message: successMessage } = response.data;
      
      // Store the new token in local storage, replacing the admin token
      localStorage.setItem("token", access_token);
      
      setMessage({ type: "success", text: successMessage });

      // Redirect the admin to the main dashboard as the impersonated user
      setTimeout(() => {
        navigate("/dashboard"); 
        // Force a page reload to ensure the new token is picked up by all components
        window.location.reload(); 
      }, 1000);

    } catch (err) {
      console.error("Impersonation failed:", err);
      const errorMessage = err.response?.data?.detail || "Impersonation failed. Please check the User ID.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-[#0D1117] min-h-screen text-white">
      <div className="flex items-center gap-4 mb-8">
        <FaUserShield className="text-4xl text-[#3B82F6]" />
        <h1 className="text-4xl font-bold text-[#3B82F6]">Impersonate User</h1>
      </div>

      <div className="bg-[#161B22] p-8 rounded-lg shadow-lg border border-white/20 max-w-lg mx-auto">
        <p className="text-gray-400 mb-6 text-center">
          Temporarily log in as a regular user to debug or assist. A new token will be generated.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="userId" className="block text-gray-400 text-sm font-bold mb-2">
              User ID
            </label>
            <input
              id="userId"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-[#3B82F6] rounded-md transition-colors duration-300 hover:bg-[#2563EB] disabled:bg-gray-500 cursor-pointer mt-4"
          >
            {isSubmitting ? <FaSync className="animate-spin" /> : <FaUserShield />}
            {isSubmitting ? "Impersonating..." : "Impersonate User"}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center font-semibold ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
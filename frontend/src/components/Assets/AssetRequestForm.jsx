import { useState } from "react";
import api from "../../api/api";
import { GoCheckCircleFill } from "react-icons/go";
import { MdOutlineComputer } from "react-icons/md";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext"; 
export default function AssetRequestForm() {
  const { user, loading } = useAuth(); 
  const [formData, setFormData] = useState({
    asset_type: "",
    reason: "",
  });
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  console.log("Logged-in user:", user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      setStatus("error");
      setErrorMessage("User ID is not available. Please log in again.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const dataToSubmit = { ...formData, employee_id: user.id };
      console.log("Submitting form with data:", dataToSubmit);

      const response = await api.post("/assets/requests", dataToSubmit);
      console.log("API response:", response.data);

      setStatus("success");
      setFormData({ asset_type: "", reason: "" });
    } catch (err) {
      console.error("Error submitting request:", err);
      setStatus("error");
      setErrorMessage(
        err.response?.data?.detail || "Failed to submit request. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
        <div className="bg-[#161B22] border border-white/20 rounded-2xl p-8 text-center">
          <p className="text-gray-400">Loading user authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      <div className="bg-[#161B22] border border-white/20 rounded-2xl p-8 shadow-lg">
        {/* Header with button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-200">
            Asset Request Form
          </h2>
          <Link
            to={`/assets/${user?.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold 
                       bg-[#10B981] text-white hover:bg-[#059669] 
                       transition-all shadow-md cursor-pointer"
          >
            <MdOutlineComputer className="text-lg" /> My Assets
          </Link>
        </div>

        {user ? (
          <p className="text-gray-400 mb-6 text-sm">
            Fill out the form below to submit a request for a new piece of equipment or software.
          </p>
        ) : (
          <p className="text-red-400 mb-6 text-sm">
            You must be logged in to submit an asset request.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Asset Type */}
          <div className="mb-4">
            <label
              htmlFor="asset_type"
              className="block text-gray-300 text-sm font-medium mb-2"
            >
              Asset Type
            </label>
            <input
              type="text"
              id="asset_type"
              name="asset_type"
              value={formData.asset_type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0D1117] border border-gray-700 rounded-lg 
                         text-white placeholder-gray-500 
                         focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              placeholder="e.g., Laptop, Monitor, Software License"
              required
              disabled={!user || status === "loading"}
            />
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label
              htmlFor="reason"
              className="block text-gray-300 text-sm font-medium mb-2"
            >
              Reason for Request (Optional)
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 bg-[#0D1117] border border-gray-700 rounded-lg 
                         text-white placeholder-gray-500 
                         focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              placeholder="Please explain why you need this asset..."
              disabled={!user || status === "loading"}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold cursor-pointer
                       bg-[#3B82F6] text-white rounded-xl transition-all duration-300 
                       hover:bg-[#2563EB] disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={status === "loading" || !user}
          >
            {status === "loading" ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        {/* Success Message */}
        {status === "success" && (
          <div className="mt-6 flex items-center justify-center gap-2 text-green-500 font-semibold">
            <GoCheckCircleFill size={20} />
            Request submitted successfully!
          </div>
        )}

        {/* Error Message */}
        {status === "error" && (
          <div className="mt-6 text-center text-red-500 font-semibold">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

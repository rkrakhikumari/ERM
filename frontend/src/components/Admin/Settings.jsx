import { useEffect, useState } from "react";
import api from "../../api/api";
import { FaSave, FaSync } from "react-icons/fa";

export default function Settings() {
  const [settings, setSettings] = useState({
    working_hours: "",
    leave_policy: "",
    access_control_policy: "",
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/settings");
      setSettings({
        working_hours: response.data.working_hours || "",
        leave_policy: response.data.leave_policy || "",
        access_control_policy: response.data.access_control_policy || "",
      });
      setMessage(null);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setMessage({ type: "error", text: "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put("/admin/settings", settings);
      setMessage({ type: "success", text: "Settings updated successfully!" });
    } catch (err) {
      console.error("Failed to update settings:", err);
      setMessage({ type: "error", text: "Failed to update settings." });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="text-white text-center">Loading settings...</div>;

  return (
    <div className="p-8 bg-[#0D1117] min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-[#3B82F6]">Global Settings</h1>
      <form onSubmit={handleSubmit} className="bg-[#161B22] p-8 rounded-lg shadow-lg border border-white/20">
        <div className="mb-6">
          <label htmlFor="working_hours" className="block text-gray-400 text-sm font-bold mb-2">
            Working Hours
          </label>
          <input
            id="working_hours"
            name="working_hours"
            type="text"
            value={settings.working_hours}
            onChange={handleChange}
            placeholder="e.g., 9:00 AM - 5:00 PM"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="leave_policy" className="block text-gray-400 text-sm font-bold mb-2">
            Leave Policy
          </label>
          <textarea
            id="leave_policy"
            name="leave_policy"
            value={settings.leave_policy}
            onChange={handleChange}
            rows="5"
            placeholder="Enter leave policy details..."
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          ></textarea>
        </div>
        <div className="mb-6">
          <label htmlFor="access_control_policy" className="block text-gray-400 text-sm font-bold mb-2">
            Access Control Policy
          </label>
          <textarea
            id="access_control_policy"
            name="access_control_policy"
            value={settings.access_control_policy}
            onChange={handleChange}
            rows="5"
            placeholder="Enter access control policy details..."
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isUpdating}
          className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#3B82F6] rounded-md transition-colors duration-300 hover:bg-[#2563EB] disabled:bg-gray-500"
        >
          {isUpdating ? <FaSync className="animate-spin" /> : <FaSave />}
          {isUpdating ? "Saving..." : "Save Settings"}
        </button>
        {message && (
          <p className={`mt-4 text-sm font-semibold ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
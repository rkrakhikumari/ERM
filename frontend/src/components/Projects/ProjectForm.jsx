import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import {MdOutlineAssignment,MdOutlineDescription,MdOutlineCalendarToday,MdSave,MdCancel,} from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

export default function ProjectForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError(null);
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Project name is required");
      return false;
    }
    if (!form.start_date) {
      setError("Start date is required");
      return false;
    }
    if (!form.end_date) {
      setError("End date is required");
      return false;
    }
    if (new Date(form.start_date) >= new Date(form.end_date)) {
      setError("End date must be after start date");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      start_date: form.start_date,
      end_date: form.end_date,
    };

    try {
      await api.post("/projects", payload);
      setSuccess(true);
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (err) {
      console.error("Backend error:", err?.response?.data);
      setError(
        err.response?.data?.detail ||
          "Failed to create project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700 max-w-md mx-auto mt-8 text-center animate-fade-in-up">
        <FaCheckCircle className="text-green-400 mx-auto mb-4 w-12 h-12" />
        <h2 className="text-xl font-bold text-black-400 mb-2">
          Project Created Successfully!
        </h2>
        <p className="text-gray-400 text-sm">Redirecting to projects list...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1117] text-white min-h-screen p-24 font-sans">
      <div className="max-w-3xl mx-auto bg-[#161B22] backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-[#3B82F6] rounded-full flex items-center justify-center text-3xl shadow-lg">
            <MdOutlineAssignment className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Project</h1>
          </div>
        </div>

        <hr className="border-gray-700 mb-6" />

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl p-4 mb-6 transition-opacity duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-6">
            {/* Project Name */}
            <div>
              <label
                htmlFor="name"
                className="text-gray-400 font-medium mb-1 flex items-center gap-2"
              >
                <MdOutlineAssignment className="w-5 h-5" /> Project Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="text-gray-400 font-medium mb-1 flex items-center gap-2"
              >
                <MdOutlineDescription className="w-5 h-5" /> Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors resize-y"
              />
            </div>

            {/* Dates */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label
                  htmlFor="start_date"
                  className="text-gray-400 font-medium mb-1 flex items-center gap-2"
                >
                  <MdOutlineCalendarToday className="w-5 h-5" /> Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                />
              </div>

              <div className="flex-1">
                <label
                  htmlFor="end_date"
                  className="text-gray-400 font-medium mb-1 flex items-center gap-2"
                >
                  <MdOutlineCalendarToday className="w-5 h-5" /> End Date
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                onClick={() => navigate("/projects")}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 font-semibold text-gray-300 rounded-xl border border-gray-700 transition-colors duration-300 hover:border-red-400 hover:text-red-400 cursor-pointer"
              >
                <MdCancel className="w-5 h-5" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform cursor-pointer
                  ${loading
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-[#3B82F6] text-white hover:-translate-y-1 hover:shadow-md hover:shadow-[#3B82F6]/20"
                  }`}
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

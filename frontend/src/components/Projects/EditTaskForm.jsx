import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from '../../api/api'

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "blocked", label: "Blocked" },
];

export default function EditTaskForm() {
  const { task_id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchTask();
  }, [task_id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/tasks/${task_id}`);
      setTask(response.data);
      setStatus(response.data.status);
    } catch (err) {
      console.error("Error fetching task:", err);
      setError("Failed to load task. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put(`/projects/tasks/${task_id}`, { status });
      navigate(`/projects/${task?.project_id}`);
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-[1450px] mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      {/* Header */}
      <div className="relative mb-12 text-center">
        <h1
          className="text-3xl font-extrabold mt-10 bg-clip-text text-transparent drop-shadow-lg inline-block bg-[#3B82F6]"

        >
          Edit Task: {task.title}
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Update the status of your task
        </p>
      </div>

      {/* Back Button */}
      <div className="text-center mb-8">
        <button
          className="absolute top-8 right-8 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-[#3B82F6]"
          onClick={() => navigate(`/projects/${task?.project_id}`)}
        >
          <ArrowLeft className="inline-block w-5 h-5 mr-2" />
          Back to Project
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-[#161B22] backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl mx-auto max-w-xl">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title - Disabled */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Task Title</label>
            <input
              type="text"
              value={task.title}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            />
          </div>

          {/* Description - Disabled */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <textarea
              value={task.description}
              rows={4}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            />
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
              >
                {statusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-gray-800 text-white p-2 hover:bg-white/10"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              {/* Custom arrow for select */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/projects/${task?.project_id}`)}
              className="flex-1 px-6 py-4 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-[#3B82F6]"
              disabled={isUpdating}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-6 py-4 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed bg-[#3B82F6]"
            >
              {isUpdating ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Update Task
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
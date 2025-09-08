import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

function AddTaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/projects/${id}/tasks`, { title, description });
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error("Error adding task", err);
      setError("Failed to add task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1450px] mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      {/* Header */}
      <div className="relative mb-12 text-center">
        <h1
          className="text-3xl font-extrabold mt-10 bg-clip-text text-transparent drop-shadow-lg inline-block bg-[#3B82F6]"
          
        >
          Add New Task
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Create a new task to track your project progress
        </p>
      </div>

      {/* Back Button */}
      <div className="text-center mb-8">
        <button
          className="absolute top-8 right-8 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 bg-[#3B82F6] cursor-pointer"
          onClick={() => navigate(`/projects/${id}`)}
        >
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
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-300"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-300 resize-none"
              placeholder="Describe the task"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/projects/${id}`)}
              className="flex-1 px-6 py-4 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-[#3B82F6]"
            
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-6 py-4 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed bg-[#3B82F6] cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center justify-center cursor-pointer">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Task
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskForm;

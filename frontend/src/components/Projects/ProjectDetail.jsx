import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BiDetail } from "react-icons/bi";
import { TbBrandTeams } from "react-icons/tb";
import { RiTimeLine } from "react-icons/ri";
import { GrTask } from "react-icons/gr";
import { BiTask } from "react-icons/bi";
import { MdOutlineModeEdit } from "react-icons/md";
import api from "../../api/api"; 

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchProjectTasks();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
      setError(null);
    } catch (error) {
      console.error("Error loading project:", error);
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await api.get(`/projects/${id}/tasks`);
      setTasks(response.data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-[#10B981]/20 text-[#10B981] border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'blocked':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-[1435px] mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-[#3B82F6] text-lg">Loading project details...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-[1435px] mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white text-center">
        <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl p-4 mb-6">
          {error || "Project not found"}
        </div>
        <button
          className="flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-white/5 text-gray-300 rounded-xl border border-white/20 transition-all duration-300 hover:border-[#3B82F6] hover:text-[#3B82F6] cursor-pointer" 
          onClick={() => navigate("/projects")}
        >
          <span className="text-xl"></span>
          Back 
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#3B82F6] rounded-xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
             <BiTask/>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg">
              {project.name}
            </h1>
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border border-white/20 text-gray-400 mt-1">
              Project ID: {project.id}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          
          <button
            className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1.5 bg-[#3B82F6] cursor-pointer"
            onClick={() => navigate("/projects")}
          >
            <span className="text-base"></span>
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Details Section */}
        <div className="md:col-span-2 flex flex-col gap-8">
          {/* Project Details */}
          <div className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-[#3B82F6]/50 hover:shadow-xl hover:shadow-[#3B82F6]/20 ">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl text-[#3B82F6]">< BiDetail className=""/></span>
              <h2 className="text-xl font-bold">Project Details</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {project.description || "No description provided"}
            </p>
          </div>

          {/* Team Members */}
          <div className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl text-[#3B82F6]"><TbBrandTeams /></span>
                <h2 className="text-xl font-bold">
                  Team Members ({project.team_members?.length || 0})
                </h2>
              </div>
              <button
                className="px-4 py-2 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 bg-[#3B82F6] cursor-pointer"
                onClick={() => navigate(`/projects/${id}/assign`)}
              >
                Manage Team
              </button>
            </div>
            {project.team_members && project.team_members.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.team_members.map((memberId, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border border-gray-500/30 text-gray-400 bg-gray-500/10"
                  >
                    Employee {memberId}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No team members assigned</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-8">
          {/* Timeline */}
          <div className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl text-[#3B82F6]"><RiTimeLine/></span>
              <h2 className="text-xl font-bold">Timeline</h2>
            </div>
            <div className="space-y-4 text-gray-400">
              <div>
                <p className="text-sm uppercase tracking-wide font-semibold text-gray-500">Start Date</p>
                <p className="text-lg">{formatDate(project.start_date)}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide font-semibold text-gray-500">End Date</p>
                <p className="text-lg">{formatDate(project.end_date)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section (Full Width) */}
      <div className="mt-8 bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-[#3B82F6]"><GrTask /></span>
            <h2 className="text-xl font-bold">Tasks ({tasks.length})</h2>
          </div>
          <button
            className="px-4 py-2 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-[#3B82F6]"
            onClick={() => navigate(`/projects/${id}/tasks/new`)}
          >
            Add Task
          </button>
        </div>
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">{task.title}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border ${getStatusColor(task.status)}`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    <button
                      className=" text-[#3B82F6] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tasks/${task.id}/edit`);
                      }}
                    >
                <MdOutlineModeEdit className="w-6 h-6"/>
                    </button>
                  </div>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-400">
                    {task.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <span className="text-5xl opacity-50 mb-4 block">📝</span>
            <p className="text-lg text-gray-500">No tasks yet</p>
            <p className="text-sm text-gray-600">Add tasks to track progress</p>
          </div>
        )}
      </div>
    </div>
  );
}
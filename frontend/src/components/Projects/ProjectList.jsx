import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoProjectSymlink } from "react-icons/go";
import { FaRegCalendarCheck } from "react-icons/fa";
import { TbBrandTeams } from "react-icons/tb";
import api from "../../api/api";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/projects");
      console.log("Projects fetched:", response.data);
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProjectStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { status: 'Not Started', color: 'bg-[#3B82F6]/20 text-[#3B82F6]-500 border-[#3B82F6]-500/30' };
    if (now > end) return { status: 'Overdue', color: 'bg-[#EF4444]/20 text-[#EF4444] border-red-500/30' };
    return { status: 'In Progress', color: 'bg-[#10B981]/20 text-[#10B981] border-green-500/30' };
  };

  const calculateProgress = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  return (
    <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-center flex-wrap gap-6">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg animate-fade-slide">
            Projects
          </h1>

            <p className="text-lg text-gray-400">
              Manage and track your project portfolio{" "}
              <span className="text-[#3B82F6] font-semibold">({projects.length} total)</span>
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold bg-[#3B82F6] text-white rounded-xl border border-[#3B82F6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer"
            onClick={() => navigate("new")}
          >
            <span className="text-xl"></span>
            Create Project
          </button>
        </div>
      </div>

        <>
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {projects.map((project) => {
              const projectStatus = getProjectStatus(project.start_date, project.end_date);
              const progress = calculateProgress(project.start_date, project.end_date);
              
              return (
                <div
                  key={project.id}
                  className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-[#3B82F6] hover:shadow-xl hover:shadow-[#3B82F6]/20 flex flex-col h-full"
                  onClick={() => navigate(`${project.id}`)}
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                      <GoProjectSymlink/>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-white truncate pb-3">{project.name}</h3>
                      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-full border ${projectStatus.color}`}>
                        {projectStatus.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                    {project.description || "No description provided"}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Progress</span>
                      <span className="text-sm font-bold text-[#3B82F6]">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Meta */}
                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2">
                    <div className="text-[#3B82F6] ">
                      <FaRegCalendarCheck />
                    </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(project.start_date)} - {formatDate(project.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm opacity-70 "><TbBrandTeams className="w-4 h-4 text-[#3B82F6]"/></span>
                      <span className="text-xs text-gray-400">
                        {project.team_members?.length || 0} team members
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex gap-3 mt-auto pt-4 border-t border-white/10">
                    <button
                      className="px-3 py-2 text-xs text-gray-400 bg-transparent rounded-lg transition-all duration-300 hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 hover:border-[#3B82F6] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`${project.id}`);
                      }}
                    >
                      View Details
                    </button>
          
                  </div>
                </div>
              );
            })}
          </div>          
        </>
    </div>
  );
}
import { useEffect, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import { MdGroups } from "react-icons/md";

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get("/teams");
      setTeams(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams");
    }
  };

  return (
    <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-center flex-wrap gap-6">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg animate-fade-slide">
              Teams
            </h1>
            <p className="text-lg text-gray-400">
              Manage and track your team members{" "}
              <span className="text-[#3B82F6] font-semibold">({teams.length} total)</span>
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold bg-[#3B82F6] text-white rounded-xl border border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer"
            onClick={() => navigate("new")}
          >
            Create Team
          </button>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => navigate(`${team.id}`)}
              className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-[#3B82F6]/50 hover:shadow-xl hover:shadow-[#3B82F6]/20 flex flex-col h-full"
            >
              {/* Card Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0 text-white">
                  <MdGroups />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-white truncate pb-3">{team.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full text-blue-800 bg-blue-100">
                    Manager: {team.manager_id}
                  </span>
                </div>
              </div>
              
              {/* Team ID */}
              <p className="text-sm text-gray-400 mb-6 flex-grow">
                Team ID: {team.id} • Click to view details
              </p>
            </div>
          ))}
        </div>
      {/* )} */}
    </div>
  );
}

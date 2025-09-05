import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {ArrowLeft,UserCheck,Users,Briefcase,Mail,Home,User,} from "lucide-react";
import api from "../../api/api";

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [manager, setManager] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchTeamDetails();
    }
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      setError(null);

      const teamResponse = await api.get(`/teams/${id}`);
      const teamData = teamResponse.data;
      setTeam(teamData);

      if (teamData.manager_id) {
        try {
          const managerResponse = await api.get(`/employees/${teamData.manager_id}`);
          setManager(managerResponse.data);
        } catch (err) {
          console.error("Error fetching manager:", err);
        }
      }

      try {
        const membersResponse = await api.get(`/teams/${id}/members`);
        setMembers(membersResponse.data || []);
      } catch (err) {
        console.error("Error fetching team members:", err);
      }
    } catch (err) {
      console.error("Error fetching team details:", err);
      setError("Failed to load team details. Please check the backend connection.");
    }
  };

  if (!team) {
    return (

        <button
          className="cursor-pointer"
          onClick={() => navigate("/teams")}
        >
          Back to Teams
        </button>
    );
  }

  const PersonAvatar = ({ isManager }) => (
    <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-white ${isManager ? "bg-green-500" : "bg-blue-500"}`}>
      <User size={24} />
    </div>
  );

  return (
    <div className="bg-[#0D1117] min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-[#3B82F6] text-white">
                <Briefcase size={40} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-3xl font-extrabold text-white leading-tight">
                  {team.name}
                </h1>
                <span className="inline-block mt-1.5 px-2.5 py-1 text-sm font-medium text-gray-600 bg-gray-200 rounded-full">
                  Team ID: {team.id}
                </span>
              </div>
            </div>
            <button
              className="px-6 py-3 font-semibold bg-[#3B82F6] text-white rounded-xl border border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer"
              onClick={() => navigate("/teams")}
            >
              <ArrowLeft className="inline-block w-5 h-5 mr-2" />
              Back to Teams
            </button>
          </div>

          <div className="my-6 border-t border-white/20"></div>

          {/* Manager Section */}
          <div className="bg-[#161B22] backdrop:blur-lg rounded-xl border border-white/20 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4 text-blue-500">
              <UserCheck size={24} className="text-[#3B82F6]" />
              <h2 className="text-xl font-semibold text-gray-400">Team Manager</h2>
            </div>
            {manager ? (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-green-600 text-white shadow-md">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-400">
                    {manager.first_name} {manager.last_name}
                  </h3>
                  <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                    <span className="flex items-center">
                      <Mail size={16} className="text-gray-400 mr-1" />
                      {manager.email || "No email provided"}
                    </span>
                    <span className="text-gray-400">&bull;</span>
                    <span className="flex items-center">
                      <Home size={16} className="text-gray-400 mr-1" />
                      {manager.department || "No department"}
                    </span>
                  </p>
                  <span className="text-xs text-gray-400 mt-1 block">
                    Employee ID: {manager.id}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-gray-300 text-white">
                  <User size={28} className="text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    Manager details not available
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Manager ID: {team.manager_id}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Team Members Section */}
          <div className="bg-[#161B22] backdrop:blur-lg rounded-xl border border-white/20 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <Users size={24} className="text-[#3B82F6]" />
              <h2 className="text-xl font-semibold text-gray-400">
                Team Members ({members.length})
              </h2>
            </div>

            {members.length > 0 ? (
              <ul className="divide-y divide-white/20">
                {members.map((member) => (
                  <li key={member.id} className="py-4 flex items-center gap-4">
                    <PersonAvatar isManager={member.id === team.manager_id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-800">
                          {member.first_name} {member.last_name}
                        </h3>
                        {member.id === team.manager_id && (
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-200 rounded-full">
                            Manager
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        ID: {member.id} • {member.email || "No email"} •{" "}
                        {member.department || "No department"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <Users size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-lg text-gray-400 font-medium">
                  No team members available
                </p>
              
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;

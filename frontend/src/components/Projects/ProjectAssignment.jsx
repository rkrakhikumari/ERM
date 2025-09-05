import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { MdOutlineAssignmentInd } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi";
import { IoMdAdd } from "react-icons/io";
import { IoMdRemove } from "react-icons/io";
import { MdOutlineSaveAlt } from "react-icons/md";
import api from "../../api/api";

const customStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

const GradientButton = ({ children, onClick, disabled = false }) => {
    const buttonStyle = {
    backgroundColor: '#3B82F6',
  };

  const disabledStyle = {
    backgroundImage: 'none',
    backgroundColor: '#374151',
    color: '#9ca3af',
    cursor: 'not-allowed',
    transform: 'none',
  };

  return (
    <button
      className="px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 disabled:hover:translate-y-0 cursor-pointer"
      style={disabled ? disabledStyle : buttonStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default function ProjectAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projectMembers, setProjectMembers] = useState(null);
  
  const [selectedTab, setSelectedTab] = useState("direct");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, employeesRes, teamsRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get("/employees"),
        api.get("/teams"),
        api.get(`/projects/${id}/team-members`)
      ]);

      setProject(projectRes.data);
      setEmployees(employeesRes.data);
      setTeams(teamsRes.data);
      setProjectMembers(membersRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (event) => {
    const value = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedEmployees(value);
  };

  const handleTeamChange = (event) => {
    const value = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedTeams(value);
  };

  const handleAssignMixed = async () => {
    if (selectedEmployees.length === 0 && selectedTeams.length === 0) {
      setError("Please select at least one employee or team to assign");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(`/projects/${id}/assign-mixed`, {
        employee_ids: selectedEmployees.map(id => parseInt(id)),
        team_ids: selectedTeams.map(id => parseInt(id))
      });

      setSuccess(true);
      setSelectedEmployees([]);
      setSelectedTeams([]);
      
      const membersRes = await api.get(`/projects/${id}/team-members`);
      setProjectMembers(membersRes.data);

      setTimeout(() => setSuccess(false), 3000); 
    } catch (err) {
      console.error("Assignment error:", err);
      setError(err.response?.data?.detail || "Failed to assign members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (employeeIds = [], teamIds = []) => {
    setLoading(true);
    try {
      await api.delete(`/projects/${id}/remove-assignment`, {
        data: {
          employee_ids: employeeIds,
          team_ids: teamIds
        }
      });
      const membersRes = await api.get(`/projects/${id}/team-members`);
      setProjectMembers(membersRes.data);
    } catch (err) {
      console.error("Remove error:", err);
      setError("Failed to remove assignment");
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === parseInt(employeeId));
    return employee ? `${employee.first_name} ${employee.last_name}` : `Employee ${employeeId}`;
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === parseInt(teamId));
    return team ? team.name : `Team ${teamId}`;
  };

  if (loading && !project) {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-8 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-8 flex flex-col items-center justify-center space-y-4">
        <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl p-4 w-full max-w-lg text-center">
          {error}
        </div>
        <button
          className="px-6 py-3 font-semibold text-gray-300 rounded-xl border border-gray-700 transition-colors hover:border-[#3B82F6] hover:text-[#3B82F6] cursor-pointer"
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="bg-[#0D1117] text-white min-h-screen p-8 font-sans">
        <div className="max-w-7xl mx-auto rounded-2xl p-6 ">
          
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#3B82F6] rounded-full flex items-center justify-center text-3xl shadow-lg">
                <MdOutlineAssignmentInd className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{project?.name}</h1>
                <p className="text-gray-400 text-sm">Manage Team Assignments</p>
              </div>
            </div>
            <button
            className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer bg-[#3B82F6]"
            onClick={() => navigate(`/projects/${id}`)}
          >
            <span className="text-xl text-[#3B82F6]">
            </span>
            Back
          </button>


          </div>

          <hr className="border-gray-700 mb-6" />

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl p-4 mb-6 transition-opacity duration-300">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl p-4 mb-6 transition-opacity duration-300">
              Assignment updated successfully!
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Assignment Form Card */}
            <div className="bg-[#161B22] rounded-2xl p-6 shadow-md border border-gray-600">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#3B82F6]">
                <IoMdAdd className="w-6 h-6" /> Assign Members
              </h2>

              <div className="flex flex-col space-y-6">
                {/* Employee Selection */}
                <div className="relative">
                  <label className="block text-gray-400 font-medium mb-1" htmlFor="employee-select">
                    Select Employees
                  </label>
                  <select
                    multiple
                    id="employee-select"
                    value={selectedEmployees}
                    onChange={handleEmployeeChange}
                    className="w-full bg-[#161B22] text-white rounded-lg p-2 border border-gray-600 focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] min-h-[4rem] no-scrollbar"
                  >
                    {employees
                      .filter(emp => !projectMembers?.all_members?.some(member => member.id === emp.id))
                      .map((employee) => (
                        <option key={employee.id} value={employee.id} className="p-2 my-1 hover:bg-gray-700">
                          {employee.first_name} {employee.last_name} - {employee.department || 'No Dept'}
                        </option>
                      ))}
                  </select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEmployees.map(id => (
                      <span key={id} className="bg-[#3B82F6]/20 text-[#3B82F6] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <IoPerson className="w-4 h-4" /> {getEmployeeName(id)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team Selection */}
                <div className="relative">
                  <label className="block text-gray-400 font-medium mb-1" htmlFor="team-select">
                    Select Teams
                  </label>
                  <select
                    multiple
                    id="team-select"
                    value={selectedTeams}
                    onChange={handleTeamChange}
                    className="w-full bg-[#161B22] text-white rounded-lg p-2 border border-gray-600 focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] min-h-[4rem] no-scrollbar"
                  >
                    {teams
                      .filter(team => !projectMembers?.team_info?.some(t => t.id === team.id))
                      .map((team) => (
                        <option key={team.id} value={team.id} className="p-2 my-1 hover:bg-gray-700">
                          {team.name} (Manager: {team.manager_id})
                        </option>
                      ))}
                  </select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTeams.map(id => (
                      <span key={id} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <HiOutlineUserGroup className="w-4 h-4" /> {getTeamName(id)}
                      </span>
                    ))}
                  </div>
                </div>

                <GradientButton
                  onClick={handleAssignMixed}
                  disabled={loading || (selectedEmployees.length === 0 && selectedTeams.length === 0)}
                >
                  <span className="flex items-center gap-2">
                    <MdOutlineSaveAlt className="w-4 h-4" />
                    {loading ? "Assigning..." : "Assign Selected"}
                  </span>
                </GradientButton>
              </div>
            </div>

            {/* Current Assignments Card */}
            <div className="bg-[#161B22] rounded-2xl p-6 shadow-md border border-gray-600">
              <h2 className="text-xl font-bold mb-4 text-white">
                Current Assignments ({projectMembers?.all_members?.length || 0} total)
              </h2>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-600 mb-4">
                <button
                  className={`px-4 py-2 transition-colors cursor-pointer ${selectedTab === "direct" ? 'text-#3B82F6 border-b-2 border-#3B82F6' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setSelectedTab("direct")}
                >
                  Direct Members
                </button>
                <button
                  className={`px-4 py-2 transition-colors cursor-pointer ${selectedTab === "teams" ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setSelectedTab("teams")}
                >
                  Assigned Teams
                </button>
                <button
                  className={`px-4 py-2 transition-colors cursor-pointer ${selectedTab === "all" ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setSelectedTab("all")}
                >
                  All Members
                </button>
              </div>

              <div className="space-y-4">
                {selectedTab === "direct" && (
                  <ul className="list-none space-y-2">
                    {projectMembers?.direct_members?.length > 0 ? (
                      projectMembers.direct_members.map((member) => (
                        <li key={member.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                          <div>
                            <p className="font-semibold text-white">{member.first_name} {member.last_name}</p>
                            <p className="text-gray-400 text-sm">{member.department || 'No Dept'} </p>
                          </div>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                            onClick={() => handleRemoveAssignment([member.id], [])}
                          >
                            <IoMdRemove className="w-4 h-4" />
                          </button>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No directly assigned employees</p>
                    )}
                  </ul>
                )}

                {/* Assigned Teams Tab Content */}
                {selectedTab === "teams" && (
                  <ul className="list-none space-y-2">
                    {projectMembers?.team_info?.length > 0 ? (
                      projectMembers.team_info.map((team) => (
                        <li key={team.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                          <div>
                            <p className="font-semibold text-white">{team.name}</p>
                            <p className="text-gray-400 text-sm">{team.member_count} members • Manager: {team.manager_id}</p>
                          </div>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                            onClick={() => handleRemoveAssignment([], [team.id])}
                          >
                            <IoMdRemove className="w-4 h-4" />
                          </button>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No teams assigned</p>
                    )}
                  </ul>
                )}

                {/* All Members Tab Content */}
                {selectedTab === "all" && (
                  <ul className="list-none space-y-2">
                    {projectMembers?.all_members?.length > 0 ? (
                      projectMembers.all_members.map((member) => (
                        <li key={`${member.id}-${member.assignment_type}`} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                          <div>
                            <p className="font-semibold text-white">{member.first_name} {member.last_name}</p>
                            <p className="text-gray-400 text-sm">
                              {member.department || 'No Dept'} 
                            </p>
                            <div className="mt-1">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${member.assignment_type === 'direct' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-[#3B82F6]/20 text-[#3B82F6]'}`}>
                                {member.assignment_type === 'direct' ? 'Direct' : `Team: ${member.team_name}`}
                              </span>
                            </div>
                          </div>
                          {member.assignment_type === 'direct' && (
                            <button
                              className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                              onClick={() => handleRemoveAssignment([member.id], [])}
                            >
                              <IoMdRemove className="w-4 h-4" />
                            </button>
                          )}
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No members assigned</p>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
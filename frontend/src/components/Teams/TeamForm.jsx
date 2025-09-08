import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";


const API_BASE_URL = "http://localhost:8000";

export default function TeamForm() {
  const [form, setForm] = useState({
    name: "",
    manager_id: "",
    member_ids: []
  });
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to load employees from the server.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError(null);
  };

  const handleMemberChange = (e) => {
    const { options } = e.target;
    const value = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setForm({ ...form, member_ids: value });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Team name is required");
      return false;
    }
    if (!form.manager_id) {
      setError("Manager is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setError(null);

    const payload = {
      name: form.name.trim(),
      manager_id: parseInt(form.manager_id),
      member_ids: form.member_ids.map(id => parseInt(id))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Team created successfully:", result);

      setSuccess(true);
      setTimeout(() => {
        navigate("/teams");
      }, 1500);
    } catch (err) {
      console.error("Error creating team:", err);
      setError(`Failed to create team: ${err.message}. Please try again.`);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === parseInt(employeeId));
    return employee ? employee.name : `Employee ${employeeId}`;
  };

  if (success) {
    return (
      <div className="bg-[#161B22] backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 max-w-md mx-auto mt-8 text-center animate-fade-in-up">
              <FaCheckCircle className="text-[#3B82F6] mx-auto mb-4 w-12 h-12" />
              <h2 className="text-xl font-bold text-white mb-2">
                Team Created Successfully!
              </h2>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1117] min-h-screen flex items-center justify-center font-sans text-white px-4">
      <div className="w-full max-w-2xl p-8 bg-[#161B22] border border-gray-700/50 rounded-2xl shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-[#3B82F6] rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
            <MdGroups className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-neon">
              New Team
            </h1>
            <p className="text-gray-400 mt-1">Initiate a new team</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 p-4 rounded-lg mb-6 shadow-md animate-shake">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Team Name */}
            <div className="relative">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Team Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors duration-300"
                  placeholder="Design Squad, Data Analysts, etc."
                  required
                />
              </div>
            </div>

            {/* Manager */}
            <div className="relative">
              <label htmlFor="manager_id" className="block text-sm font-medium text-gray-300 mb-2">
                Team Manager
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  id="manager_id"
                  name="manager_id"
                  value={form.manager_id}
                  onChange={handleChange}
                  className="w-full pl-12 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors duration-300 appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-gray-800 text-gray-400">Select an administrator</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id} className="bg-gray-800 text-white">
                      {employee.name} (ID: {employee.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Members */}
            <div>
              <label htmlFor="member_ids" className="block text-sm font-medium text-gray-300 mb-2">
                Team Members (Optional)
              </label>
              <select
                id="member_ids"
                name="member_ids"
                multiple
                value={form.member_ids}
                onChange={handleMemberChange}
                className="w-full pl-4 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors duration-300 cursor-pointer h-40 overflow-y-auto"
              >
                {employees
                  .filter(employee => employee.id !== parseInt(form.manager_id))
                  .map((employee) => (
                    <option key={employee.id} value={employee.id} className="bg-gray-800 text-white">
                      {employee.name} (ID: {employee.id})
                    </option>
                  ))}
              </select>

              <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-400">
                {form.member_ids.map((id) => (
                  <span key={id} className="bg-blue-600/30 text-blue-300 px-4 py-1.5 rounded-full border border-blue-500/50 shadow-md">
                    {getEmployeeName(id)}
                  </span>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700/50">
              <button
                type="button"
                onClick={() => navigate("/teams")}
                className="px-6 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer hover:translate-y-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 font-semibold bg-[#3B82F6] text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[#3B82F6]/30 hover:translate-y-1 cursor-pointer"
              >
                Create Team
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdPerson, MdPersonAdd } from "react-icons/md";
import { getEmployees } from "../../api/employeeApi";

const GradientButton = ({ children, onClick, disabled = false, type = "button" }) => {
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
      type={type}
      className="px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1.5  disabled:hover:translate-y-0 cursor-pointer"
      style={disabled ? disabledStyle : buttonStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default function EmployeesList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getEmployees()
      .then(res => {
        setEmployees(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch employees:", err);
        setError("Failed to load employees list.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-8 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading employees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-8 flex flex-col items-center justify-center space-y-4">
        <p className="text-red-500 text-center text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1117] text-white h-screen p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-[#0D1117] backdrop-blur-lg rounded-2xl p-6 shadow-xl ">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#3B82F6] rounded-full flex items-center justify-center text-3xl shadow-lg">
              <MdPerson className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Employees</h1>
              <p className="text-gray-400 text-sm">View and manage all employees</p>
            </div>
          </div>
          <GradientButton onClick={() => navigate("/employees/new")}>
            <span className="flex items-center gap-2 cursor-pointer">
              <MdPersonAdd />
              Add Employee
            </span>
          </GradientButton>
        </div>

        <hr className="border-gray-700 mb-6" />
        
        {employees.length === 0 ? (
          <p className="text-gray-500 text-center">No employees found. Click "Add Employee" to get started.</p>
        ) : (
          <ul className="space-y-4">
            {employees.map(emp => (
              <li
                key={emp.id}
                className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-[#3B82F6]/50 hover:shadow-xl hover:shadow-[#3B82F6]/20 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-semibold text-white">{emp.name}</p>
                  <p className="text-sm text-gray-400">
                    <span className="font-bold text-gray-300">ID:</span> {emp.id} | {emp.department} - {emp.designation}
                  </p>
                </div>

                <Link
                  to={`/employees/${emp.id}`}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-[#3B82F6] border border-[#3B82F6] transition-all duration-300 hover:bg-[#3B82F6] hover:text-white whitespace-nowrap"
                >
                  View Details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MdPerson, MdEmail, MdPhone, MdApartment, MdWork, MdAssignmentInd, MdDateRange, MdEdit, MdDelete, MdChevronRight, MdHistory, MdArrowBack } from "react-icons/md";
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";
import {getEmployee,deleteEmployee,getEmployeeHistory} from "../../api/employeeApi";

const Message = ({ message, type }) => {
  if (!message) return null;

  const typeStyles = {
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    error: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  const icon = type === 'success' ? <FaCheckCircle className="w-5 h-5" /> : <FaTimesCircle className="w-5 h-5" />;

  return (
    <div className={`p-4 rounded-xl mb-6 transition-opacity duration-300 ${typeStyles[type]}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span>{message}</span>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onCancel, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm ">
      <div className="bg-[#0D1117] rounded-xl p-8 max-w-sm w-full border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-center mb-4">
          <FaExclamationTriangle className="w-10 h-10 text-yellow-400" />
        </div>
        <p className="text-white text-center text-lg mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([getEmployee(id), getEmployeeHistory(id)])
      .then(([empRes, histRes]) => {
        setEmployee(empRes.data);
        setHistory(histRes.data);
      })
      .catch((err) => {
        console.error("Failed to load employee or history:", err);
        setError("Failed to load employee details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    try {
      await deleteEmployee(id);
      showMessage("Employee deleted successfully", "success");
      setTimeout(() => navigate("/employees"), 1500);
    } catch (error) {
      console.error("Delete failed:", error?.response || error);
      showMessage("Failed to delete employee. Check console for details.", "error");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 text-white h-full p-8 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white min-h-full p-8 flex items-center justify-center">
        <div className="text-red-500 font-semibold">{error}</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-gray-900 text-white h-full p-8 flex items-center justify-center">
        <div className="text-gray-400">No employee found.</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1117] text-white h-full p-20 font-sans">
      <Message message={message} type={messageType} />
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this employee?"
      />
      
      <div className="max-w-4xl mx-auto bg-[#161B22] backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700">
        
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#3B82F6] rounded-full flex items-center justify-center text-3xl shadow-lg">
              <MdPerson className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{employee.name}</h1>
              <p className="text-gray-400 text-sm">{employee.designation} - {employee.department}</p>
            </div>
          </div>
          <Link
            to="/employees"
            className="flex items-center gap-2 text-gray-400 hover:text-[#3B82F6] transition-colors"
          >
            <MdArrowBack /> Back to Employees
          </Link>
        </div>
        <hr className="border-gray-700 mb-6" />

        {/* Employee Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-gray-300 mb-8">
          <div className="flex items-center gap-3">
            <MdEmail className="w-6 h-6 text-[#3B82F6]" />
            <span><span className="font-semibold text-white">Email:</span> {employee.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <MdPhone className="w-6 h-6 text-[#3B82F6]" />
            <span><span className="font-semibold text-white">Phone:</span> {employee.phone || "N/A"}</span>
          </div>
          <div className="flex items-center gap-3">
            <MdAssignmentInd className="w-6 h-6 text-[#3B82F6]" />
            <span><span className="font-semibold text-white">Manager ID:</span> {employee.manager_id || "None"}</span>
          </div>
          <div className="flex items-center gap-3">
            <MdDateRange className="w-6 h-6 text-[#3B82F6]" />
            <span><span className="font-semibold text-white">Date Joined:</span> {employee.date_joined ? new Date(employee.date_joined).toLocaleDateString() : "N/A"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${employee.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span><span className="font-semibold text-white">Status:</span> {employee.status}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Link
            to={`/employees/edit/${employee.id}`}
            className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-yellow-300 border border-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors"
          >
            <MdEdit />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-red-400 border border-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
          >
            <MdDelete />
            Delete
          </button>
        </div>

        {/* Change History Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <MdHistory className="w-6 h-6 text-gray-400" />
            Change History
          </h2>
          {history.length === 0 ? (
            <p className="text-gray-500 italic">No history available.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((item, index) => (
                <li key={item.id} className="relative pl-6">
                  <div className="absolute left-0 top-0 mt-1.5 h-3 w-3 bg-[#3B82F6] rounded-full"></div>
                  {index < history.length - 1 && (
                    <div className="absolute left-1.5 top-5 bottom-0 w-0.5 bg-gray-700"></div>
                  )}
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-white">{new Date(item.date).toLocaleDateString()}</span>:{" "}
                    <span className="text-gray-300">{item.action}</span> from{" "}
                    <b className="text-white">{item.from_value}</b> to{" "}
                    <b className="text-white">{item.to_value}</b>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
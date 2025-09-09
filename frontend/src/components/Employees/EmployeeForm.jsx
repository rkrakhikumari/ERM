import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {MdPerson,MdEmail,MdPhone,MdApartment,MdWork,MdAssignmentInd,MdDateRange,MdCancel,} from "react-icons/md";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {createEmployee,getEmployee,updateEmployee,} from "../../api/employeeApi";
const Message = ({ message, type }) => {
  if (!message) return null;

  const typeStyles = {
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    error: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  const icon =
    type === "success" ? (
      <FaCheckCircle className="w-5 h-5" />
    ) : (
      <FaTimesCircle className="w-5 h-5" />
    );

  return (
    <div
      className={`p-4 rounded-xl mb-6 transition-opacity duration-300 ${typeStyles[type]}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{message}</span>
      </div>
    </div>
  );
};
export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    manager_id: "",
    status: "active",
    date_joined: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  useEffect(() => {
    if (isEdit) {
      setLoadingInitial(true);
      setError(null);

      getEmployee(id)
        .then((res) => {
          const data = res.data;
          setFormData({
            ...data,
            manager_id: data.manager_id || "",
            date_joined: data.date_joined?.slice(0, 10) || "",
          });
        })
        .catch((err) => {
          console.error("Failed to fetch employee:", err);
          setError("Failed to load employee data.");
        })
        .finally(() => setLoadingInitial(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      manager_id:
        formData.manager_id === "" ? null : parseInt(formData.manager_id),
    };

    try {
      if (isEdit) {
        await updateEmployee(id, payload);
        showMessage("Employee updated successfully", "success");
      } else {
        await createEmployee(payload);
        showMessage("Employee created successfully", "success");
      }
      setTimeout(() => navigate("/employees/"), 1500);
    } catch (error) {
      console.error("Form submission failed:", error?.response?.data || error);
      setError("Failed to submit form. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-8 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading employee data...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1117] text-white min-h-screen p-24 font-sans">
      <Message message={message} type={messageType} />
      <div className="max-w-4xl mx-auto bg-[#161B22] backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-[#3B82F6] rounded-full flex items-center justify-center text-3xl shadow-lg">
            <MdPerson className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isEdit ? "Edit Employee" : "Add Employee"}
            </h1>
            <p className="text-gray-400 text-sm">
              Fields with <span className="text-red-500">*</span> are mandatory.
            </p>
          </div>
        </div>
        <hr className="border-gray-700 mb-6" />

        <form onSubmit={handleSubmit}>
          {error && <Message message={error} type="error" />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-6">
              {/* Full name */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                  <MdPerson className="w-5 h-5" /> Full Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 "
                  placeholder="Enter full name"
                />
              </div>
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                  <MdEmail className="w-5 h-5" /> Email{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  disabled={isEdit}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-gray-700 text-white rounded-lg p-3  ${
                    isEdit
                      ? "bg-gray-700/50 border-gray-600 cursor-not-allowed"
                      : "border-gray-600"
                  }`}
                  placeholder="Enter email"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                  <MdPhone className="w-5 h-5" /> Phone
                </label>
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 "
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* Department */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                  <MdApartment className="w-5 h-5" /> Department
                </label>
                <input
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 "
                  placeholder="Enter department"
                />
              </div>
              {/* Designation */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                  <MdWork className="w-5 h-5" /> Designation
                </label>
                <input
                  name="designation"
                  type="text"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 "
                  placeholder="Enter designation"
                />
              </div>
              {/* Manager ID */}
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                  <MdAssignmentInd className="w-5 h-5" /> Manager ID
                </label>
                <input
                  name="manager_id"
                  type="text"
                  value={formData.manager_id}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded-lg p-3  "
                  placeholder="Enter manager ID"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Date Joined */}
            <div>
              <label className=" text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <MdDateRange className="w-5 h-5" /> Date Joined
              </label>
              <input
                name="date_joined"
                type="date"
                value={formData.date_joined}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-3"
              />
            </div>
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="appearance-none w-full bg-gray-700 text-white rounded-lg p-3 pr-10 "
                >
                  <option value="active">Active</option>
                  <option value="terminated">Terminated</option>
                  <option value="resigned">Resigned</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 font-semibold text-gray-300 rounded-xl border border-gray-700 transition-colors duration-300 hover:border-red-400 hover:text-red-400 cursor-pointer"
            >
              <MdCancel className="w-5 h-5" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 cursor-pointer
                ${loading
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-[#3B82F6] text-white hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/30"
                }`}
            >
              {loading ? "Submitting..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
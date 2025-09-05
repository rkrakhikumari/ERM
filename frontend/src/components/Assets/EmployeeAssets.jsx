import { useEffect, useState } from "react";
import api from "../../api/api";
import { MdOutlineComputer } from "react-icons/md";
import { FaRegCalendarCheck } from "react-icons/fa";
import { useParams } from "react-router-dom";

export default function EmployeeAssets() {
  const { employeeId } = useParams();
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employeeId) {
      fetchAssignedAssets(employeeId);
    } else {
      setLoading(false);
    }
  }, [employeeId]);

  const fetchAssignedAssets = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/assets/employee/${id}`);
      setAssignedAssets(response.data);
    } catch (err) {
      console.error("Error fetching assigned assets:", err);
      setError("Failed to load your assets");
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

  if (!employeeId) {
    return (
      <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
        <div className="text-center text-gray-400">Please provide an employee ID.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
        <div className="text-center text-gray-400">Loading your assets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg">
            My Assets
          </h1>
          <p className="text-lg text-gray-400">
            Assets currently assigned to you <span className="text-[#3B82F6] font-semibold">({assignedAssets.length} total)</span>
          </p>
        </div>
      </div>

      {assignedAssets.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <div className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <MdOutlineComputer className="mx-auto text-6xl text-gray-600 mb-4" />
            <p className="text-xl">You have no assets assigned at this time.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assignedAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:border-[#3B82F6] hover:shadow-xl hover:shadow-[#3B82F6]/20 flex flex-col h-full"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                  <MdOutlineComputer />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-white truncate">{asset.name}</h3>
                  <p className="text-sm text-gray-400">{asset.type} - S/N: {asset.serial_number}</p>
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase rounded-full mt-2 bg-green-500/20 text-green-500 border-green-500/30">
                    Assigned
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="text-lg text-[#3B82F6]"><FaRegCalendarCheck /></span>
                  Assigned On: {formatDate(asset.assigned_on)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
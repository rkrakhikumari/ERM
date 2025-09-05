import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api"; 
import { useAuth } from "../../auth/AuthContext";
import { MdOutlineComputer, MdAssignmentTurnedIn, MdOutlineCancel, MdOutlineKeyboardReturn } from "react-icons/md";

export default function AssetRequestsList() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); 
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      fetchRequests();
    }
  }, [isAuthenticated, user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/assets/requests"); 
      setRequests(response.data);
      console.log("Fetched asset requests:", response.data);
    } catch (err) {
      console.error("Error fetching asset requests:", err);
      setError("Failed to load asset requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setActionLoading(true);
    try {
      await api.post(`/assets/requests/approve/${requestId}`); 
      fetchRequests();
      setError(null);
    } catch (err) {
      console.error("Error approving request:", err);
      setError(err.response?.data?.detail || "Failed to approve request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async (requestId) => {
    setActionLoading(true);
    try {
      await api.post(`/assets/requests/deny/${requestId}`); 
      fetchRequests();
      setError(null);
    } catch (err) {
      console.error("Error denying request:", err);
      setError(err.response?.data?.detail || "Failed to deny request.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D1117]">
        <div className="text-center text-gray-400">Loading requests...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "Admin") {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
        <div className="text-center">
          <div className="bg-[#161B22] border border-red-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
            <p className="text-gray-400 mb-6">Only administrators can view this page.</p>
            <button
              onClick={() => navigate("/assets")}
              className="px-6 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all cursor-pointer"
            >
              Back to Assets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg">
            Asset Requests
          </h1>
          <p className="text-lg text-gray-400">
            Pending requests for new assets: <span className="font-bold text-[#3B82F6]">{requests.length}</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/assets")}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-all hover:-translate-y-1 shadow-md cursor-pointer"
        >
          <MdOutlineKeyboardReturn className="text-lg" /> Back to Assets
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {requests.length === 0 ? (
          <div className="text-center text-gray-500 p-8 bg-[#161B22] border border-white/20 rounded-2xl">
            <MdOutlineComputer className="mx-auto text-6xl text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
            <p>All asset requests have been processed.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div 
              key={request.id} 
              className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:border-[#3B82F6] hover:shadow-xl hover:shadow-[#3B82F6]/20 flex items-start gap-6"
            >
              <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                <MdOutlineComputer />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">
                    {request.asset_type}
                  </h3>
                  <span className="px-3 py-1 text-xs font-semibold uppercase rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                    {request.status || 'Pending'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-400">
                    Requested by Employee ID: <span className="font-semibold text-gray-200">{request.employee_id}</span>
                  </p>
                  {request.created_at && (
                    <p className="text-sm text-gray-400">
                      Requested on: <span className="font-semibold text-gray-200">{formatDate(request.created_at)}</span>
                    </p>
                  )}
                </div>
                
                {request.reason && (
                  <div className="mb-4 p-3 bg-[#0D1117] rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Reason:</p>
                    <p className="text-gray-300 italic">{request.reason}</p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#10B981] bg-transparent rounded-lg border border-[#10B981]/30 transition-all duration-300 hover:text-white hover:bg-[#10B981] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    disabled={actionLoading}
                  >
                    <MdAssignmentTurnedIn className="inline-block" /> 
                    {actionLoading ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleDeny(request.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 bg-transparent rounded-lg border border-red-400/30 transition-all duration-300 hover:text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    disabled={actionLoading}
                  >
                    <MdOutlineCancel className="inline-block" /> 
                    {actionLoading ? "Processing..." : "Deny"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

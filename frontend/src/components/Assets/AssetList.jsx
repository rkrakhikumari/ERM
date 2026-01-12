import { useEffect, useState } from "react";
import api from "../../api/api"; 
import { MdOutlineComputer, MdAssignmentReturn, MdAssignmentTurnedIn } from "react-icons/md";
import { FaUserPlus, FaListUl } from "react-icons/fa";
import { Link } from "react-router-dom"; 
import { GoPlusCircle } from "react-icons/go"; 
import { useAuth } from "../../auth/AuthContext";

export default function AssetList() {
  const { user, loading: authLoading } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [employeeId, setEmployeeId] = useState("");

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/assets/");
      setAssets(response.data);
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/assets/allocate", {
        asset_id: selectedAsset.id,
        employee_id: parseInt(employeeId),
      });
      setShowAllocateModal(false);
      setEmployeeId("");
      fetchAssets(); 
    } catch (err) {
      console.error("Error allocating asset:", err);
      setError("Failed to allocate asset");
    }
  };

  const handleReturn = async () => {
    try {
      await api.put(`/assets/return/${selectedAsset.id}`, { user_id: 1 });
      setShowReturnModal(false);
      fetchAssets(); 
    } catch (err) {
      console.error("Error returning asset:", err);
      setError("Failed to return asset");
    }
  };

  const openAllocateModal = (asset) => {
    setSelectedAsset(asset);
    setShowAllocateModal(true);
  };

  const openReturnModal = (asset) => {
    setSelectedAsset(asset);
    setShowReturnModal(true);
  };

  if (loading || authLoading) return <div className="text-center text-gray-400">Loading assets...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg">
            Asset Inventory
          </h1>
          <p className="text-lg text-gray-400">
            View and manage all company assets <span className="text-[#3B82F6] font-semibold">({assets.length} total)</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === "Admin" && (
            <Link
              to="/assets/requests"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-all hover:-translate-y-1 shadow-md cursor-pointer"
            >
              <FaListUl className="text-lg" /> View Requests
            </Link>
          )}
          

          {/* create a new asset */}
           <Link
          to="/assets/new"
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-all hover:-translate-y-1 shadow-md cursor-pointer">
          <GoPlusCircle className="text-lg" /> Create New Asset
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assets.map((asset) => (
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
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase rounded-full mt-2
                  ${asset.assigned_to ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'}`}>
                  {asset.assigned_to ? `Assigned to ID: ${asset.assigned_to}` : 'Available'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-auto pt-4 border-t border-white/10">
              {asset.assigned_to ? (
                <button
                  className="flex-1 px-4 py-2 text-sm font-semibold text-red-400 bg-transparent rounded-lg border border-red-400/30 transition-all duration-300 hover:text-white hover:bg-red-500 cursor-pointer"
                  onClick={() => openReturnModal(asset)}
                >
                  <MdAssignmentReturn className="inline-block mr-1" /> Return
                </button>
              ) : (
                <button
                  className="flex-1 px-4 py-2 text-sm font-semibold text-[#3B82F6] bg-transparent rounded-lg border border-[#3B82F6]/30 transition-all duration-300 hover:text-white hover:bg-[#3B82F6] cursor-pointer"
                  onClick={() => openAllocateModal(asset)}
                >
                  <FaUserPlus className="inline-block mr-1" /> Allocate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Allocate Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161B22] border border-white/20 rounded-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Allocate Asset</h2>
            <form onSubmit={handleAllocate}>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Employee ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D1117] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-400 rounded-md transition-all hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-[#3B82F6] text-white rounded-md transition-all hover:bg-[#2563EB] cursor-pointer"
                >
                  Allocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161B22] border border-white/20 rounded-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Return Asset</h2>
            <p className="text-gray-400 mb-6">Are you sure you want to mark this asset as returned?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-400 rounded-md transition-all hover:bg-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturn}
                className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-md transition-all hover:bg-red-600 cursor-pointer"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

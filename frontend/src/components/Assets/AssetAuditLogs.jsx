import { useEffect, useState } from "react";
import api from "../../api/api";
import { FaUser } from "react-icons/fa";
import { MdOutlineComputer } from "react-icons/md";

export default function AssetAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
    fetchAssets();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/assets/audit-logs");
      setLogs(response.data || []);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await api.get("/assets/");
      const assetMap = {};
      res.data.forEach((a) => {
        assetMap[a.id] = a.name;
      });
      setAssets(assetMap);
    } catch (err) {
      console.error("Error fetching assets:", err);
    }
  };

  if (loading) return <div className="text-center text-gray-400">Loading audit logs...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg">
            Asset Audit Logs
          </h1>
          <p className="text-lg text-gray-400">
            Track all actions taken on assets <span className="text-[#3B82F6] font-semibold">({logs.length} total)</span>
          </p>
        </div>
      </div>

      <div className="bg-[#161B22] rounded-xl border border-white/10 overflow-hidden shadow-lg">
        <table className="w-full table-fixed border-collapse text-left text-gray-300">
  <colgroup>
    <col className="w-[10%]" />   
    <col className="w-[25%]" />  
    <col className="w-[25%]" />  
    <col className="w-[25%]" /> 
    <col className="w-[25%]" />  
  </colgroup>

  <thead className="bg-[#0D1117] text-gray-400 uppercase text-sm">
    <tr>
      <th className="px-4 py-3 text-center">#</th>
      <th className="px-4 py-3">Asset</th>
      <th className="px-4 py-3">User</th>
      <th className="px-4 py-3">Action</th>
      <th className="px-4 py-3">Timestamp</th>
    </tr>
  </thead>

  <tbody>
    {logs.map((log, idx) => (
      <tr key={log.id} className="border-t border-white/10">
        {/* index */}
        <td className="px-4 py-3 text-center">{idx + 1}</td>

        {/* asset */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <MdOutlineComputer className="text-[#3B82F6]" />
            <div>
              <div className="font-medium">{assets[log.asset_id] || "Unknown asset"}</div>
              <div className="text-xs text-gray-500">ID: {log.asset_id ?? "—"}</div>
            </div>
          </div>
        </td>

        {/* user */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <FaUser className="text-gray-400" />
            <div>
              <div className="font-medium">User {log.user_id}</div>
              <div className="text-xs text-gray-500">ID: {log.user_id}</div>
            </div>
          </div>
        </td>

        {/* action */}
        <td className="px-4 py-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
              ${
                log.action?.toLowerCase().includes("created")
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : log.action?.toLowerCase().includes("allocated")
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : log.action?.toLowerCase().includes("returned")
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : log.action?.toLowerCase().includes("denied")
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}
          >
            {String(log.action).toUpperCase()}
          </span>
        </td>

        {/* timestamp */}
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
          {new Date(log.timestamp).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </td>
      </tr>
    ))}
  </tbody>
</table>

      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../../api/api";
import { FaHistory } from "react-icons/fa";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/logs");
      setLogs(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setError("Failed to load audit logs. Please check the server status.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white text-center">Loading audit logs...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-8 bg-[#0D1117] min-h-screen text-white">
      <div className="flex items-center gap-4 mb-8">
        <FaHistory className="text-4xl text-[#3B82F6]" />
        <h1 className="text-4xl font-bold text-[#3B82F6]">Audit Logs</h1>
      </div>

      <div className="bg-[#161B22] p-6 rounded-lg shadow-lg border border-white/20 overflow-x-auto">
        {logs.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No audit logs found.</p>
        ) : (
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-[#24292E] border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">User ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Action</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-700 hover:bg-[#24292E] transition-colors duration-200">
                  <td className="px-4 py-3 font-mono text-gray-400">{log.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{log.user_id}</td>
                  <td className="px-4 py-3 text-gray-300">{log.action}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
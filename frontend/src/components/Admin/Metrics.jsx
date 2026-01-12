import { useEffect, useState } from "react";
import api from "../../api/api";
import { FaServer, FaDatabase, FaClock, FaMicrochip , FaMemory } from "react-icons/fa";

export default function Metrics() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); 
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get("/admin/metrics");
      setMetrics(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
      setError("Failed to load metrics. The server might be unreachable.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "ok":
      case "reachable":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "error":
      case "unreachable":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) return <div className="text-white text-center">Loading metrics...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-8 bg-[#0D1117] min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-[#3B82F6]">Health Metrics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Application Status */}
        <div className="bg-[#161B22] p-6 rounded-lg shadow-lg border border-white/20">
          <div className="flex items-center gap-4 mb-4">
            <FaServer className="text-3xl text-gray-400" />
            <h3 className="text-xl font-bold">Application Status</h3>
          </div>
          <p className={`text-3xl font-bold ${getStatusColor(metrics.status)}`}>
            {metrics.status?.toUpperCase() || "UNKNOWN"}
          </p>
        </div>

        {/* Database Status */}
        <div className="bg-[#161B22] p-6 rounded-lg shadow-lg border border-white/20">
          <div className="flex items-center gap-4 mb-4">
            <FaDatabase className="text-3xl text-gray-400" />
            <h3 className="text-xl font-bold">Database</h3>
          </div>
          <p className={`text-3xl font-bold ${getStatusColor(metrics.database)}`}>
            {metrics.database?.toUpperCase() || "UNKNOWN"}
          </p>
        </div>

        {/* System Uptime */}
        <div className="bg-[#161B22] p-6 rounded-lg shadow-lg border border-white/20">
          <div className="flex items-center gap-4 mb-4">
            <FaClock className="text-3xl text-gray-400" />
            <h3 className="text-xl font-bold">System Uptime</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatUptime(metrics.uptime_seconds)}
          </p>
        </div>

        {/* CPU Usage */}
        <div className="bg-[#161B22] p-6 rounded-lg shadow-lg border border-white/20">
          <div className="flex items-center gap-4 mb-4">
            <FaMicrochip className="text-3xl text-gray-400" />
            <h3 className="text-xl font-bold">CPU Usage</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {metrics.cpu_percent !== null && metrics.cpu_percent !== undefined 
              ? `${metrics.cpu_percent}%` 
              : "N/A"}
          </p>
          {metrics.cpu_percent !== null && (
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(metrics.cpu_percent, 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Memory Usage */}
        <div className="bg-[#161B22] p-6 rounded-lg shadow-lg border border-white/20">
          <div className="flex items-center gap-4 mb-4">
            <FaMemory className="text-3xl text-gray-400" />
            <h3 className="text-xl font-bold">Memory Usage</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {metrics.memory !== null && metrics.memory !== undefined 
              ? `${metrics.memory}%` 
              : "N/A"}
          </p>
          {metrics.memory !== null && (
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(metrics.memory, 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="bg-[#161B22] p-6 rounded-lg shadow-lg border border-white/20">
          <div className="flex items-center gap-4 mb-4">
            <FaClock className="text-3xl text-gray-400" />
            <h3 className="text-xl font-bold">Last Updated</h3>
          </div>
          <p className="text-lg text-white">
            {new Date().toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Auto-refreshes every 5 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
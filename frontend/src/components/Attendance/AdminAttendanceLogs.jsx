import React, { useState, useEffect } from 'react';
import api from "../../api/api";
import {MdHistory,MdPerson, MdDateRange, MdAccessTime, MdCheckCircle, MdPending, MdCancel, } from 'react-icons/md';
const AdminAttendanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/attendance/logs');
                setLogs(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching admin logs:', err);
                setError("Failed to fetch attendance logs. Access denied or server error.");
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [api]);
    if (loading) {
        return (
            <div className="bg-[#0D1117] text-white min-h-screen p-8 flex items-center justify-center">
                <div className="animate-pulse text-xl">Loading...</div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="bg-[#0D1117] text-white min-h-screen p-8 flex items-center justify-center">
                <div className="text-red-500 font-semibold text-center">{error}</div>
            </div>
        );
    }
    return (
        <div className="bg-[#0D1117] text-gray-200 h-full p-8 font-sans">
            <div className="max-w-7xl mx-auto bg-[#161B22] rounded-2xl p-8 shadow-xl border border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                    <MdHistory className="w-10 h-10 text-[#3B82F6]" />
                    <h1 className="text-3xl font-bold text-white">All Attendance Logs</h1>
                </div>
                <hr className="border-gray-700 mb-8" />
                
                {logs.length === 0 ? (
                    <div className="text-center p-6 text-gray-500 italic">No attendance records found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-[#1f2937]">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2"><MdPerson  /> Employee ID</div>
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2"><MdDateRange /> Date</div>
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2"><MdAccessTime /> Clock In</div>
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2"><MdAccessTime /> Clock Out</div>
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Manual Entry</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#1f2937] transition-colors">
                                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">{log.employee_id}</td>
                                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-400">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-400">{log.clock_in ? new Date(log.clock_in).toLocaleTimeString() : 'N/A'}</td>
                                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-400">{log.clock_out ? new Date(log.clock_out).toLocaleTimeString() : 'N/A'}</td>
                                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-400">
                                        {log.is_manual ? <MdCheckCircle className="text-green-500 inline-block" /> : <MdCancel className="text-red-500 inline-block" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAttendanceLogs;
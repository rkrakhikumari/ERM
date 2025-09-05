import React, { useState, useEffect } from 'react';
import api from "../../api/api";
import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom'; 
import ManualEntryForm from './ManualEntryForm';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { MdAccessTime, MdEventNote, MdHistory, MdAdd, MdTimerOff, MdTimer } from 'react-icons/md';

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
const MyAttendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showManualEntryForm, setShowManualEntryForm] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [isClockedIn, setIsClockedIn] = useState(false);

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get('/attendance/me');
            const sortedAttendance = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAttendance(sortedAttendance);
            
            const today = new Date().toISOString().slice(0, 10);
            const todayRecord = sortedAttendance.find(log => log.date.slice(0, 10) === today);
            setIsClockedIn(!!todayRecord && !todayRecord.clock_out);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            showMessage('Failed to fetch attendance records.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleClockIn = async () => {
        try {
            await api.post('/attendance/clock-in', { timestamp: new Date().toISOString() });
            showMessage('Clocked in successfully!', 'success');
            fetchAttendance();
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to clock in.';
            showMessage(errorMessage, 'error');
        }
    };

    const handleClockOut = async () => {
        try {
            await api.post('/attendance/clock-out', { timestamp: new Date().toISOString() });
            showMessage('Clocked out successfully!', 'success');
            fetchAttendance();
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to clock out.';
            showMessage(errorMessage, 'error');
        }
    };

    const handleManualEntrySubmit = async (data) => {
        try {
            await api.post('/attendance/manual-entry', data);
            showMessage('Manual entry request submitted!', 'success');
            setShowManualEntryForm(false);
            fetchAttendance();
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to submit manual entry.';
            showMessage(errorMessage, 'error');
        }
    };

    return (
        <div className="bg-[#0D1117] text-gray-200 h-full p-8 font-sans">
            <Message message={message} type={messageType} />
            <div className="max-w-7xl mx-auto bg-[#161B22] rounded-2xl p-8 shadow-xl border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <MdEventNote className="w-10 h-10 text-[#3B82F6]" />
                        <h1 className="text-3xl font-bold text-white">My Attendance</h1>
                    </div>

                    {/*  Show only for Admin, HR, Manager */}
                    {["admin", "hr", "manager"].includes(user?.role?.toLowerCase()) && (
                        <Link
                            to="/admin/attendance-logs"
                            className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600  shadow-lg transition-all hover:translate-y-1"
                        >
                            View Logs
                        </Link>
                    )}
                </div>
                <hr className="border-gray-700 mb-8" />
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <button
                        onClick={handleClockIn}
                        disabled={isClockedIn}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md cursor-pointer transition-all hover:translate-y-1 ${isClockedIn ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                        <MdTimer />
                        Clock In
                    </button>
                    <button
                        onClick={handleClockOut}
                        disabled={!isClockedIn}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:translate-y-1 shadow-md ${!isClockedIn ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'} ` }
                    >
                        <MdTimerOff />
                        Clock Out
                    </button>
                    <button
                        onClick={() => setShowManualEntryForm(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-yellow-500 text-white hover:bg-yellow-600 transition-all hover:translate-y-1 shadow-md cursor-pointer"
                    >
                        <MdAdd />
                        Request Manual Entry
                    </button>
                </div>
                {showManualEntryForm && (
                    <ManualEntryForm onSubmit={handleManualEntrySubmit} onClose={() => setShowManualEntryForm(false)} />
                )}

                <div className="bg-[#1f2937] rounded-xl shadow-inner p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><MdHistory /> Attendance Records</h3>
                    {loading ? (
                        <div className="text-center text-gray-500">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-[#161B22]">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Clock In</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Clock Out</th>
                                        {/* <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {attendance.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-4 px-4 text-center text-gray-500 italic">No attendance records found.</td>
                                        </tr>
                                    ) : (
                                        attendance.map((log) => (
                                            <tr key={log.id} className="hover:bg-[#252a33] transition-colors">
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">{new Date(log.date).toLocaleDateString()}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-400">{log.clock_in ? new Date(log.clock_in).toLocaleTimeString() : "N/A"}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-400">{log.clock_out ? new Date(log.clock_out).toLocaleTimeString() : "N/A"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyAttendance;
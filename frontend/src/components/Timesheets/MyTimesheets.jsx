import React, { useState, useEffect } from 'react';
import api from "../../api/api";
import TimesheetForm from './TimesheetForm';
import { MdHistory, MdEventNote, MdAddTask, MdWork } from 'react-icons/md';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; 
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

const MyTimesheets = () => {
    const [timesheets, setTimesheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTimesheetForm, setShowTimesheetForm] = useState(false);
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
        fetchTimesheets();
    }, []);

    const fetchTimesheets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/timesheets/me');
            const sortedTimesheets = response.data.sort((a, b) => new Date(b.submitted_on) - new Date(a.submitted_on));
            setTimesheets(sortedTimesheets);
        } catch (error) {
            console.error('Error fetching timesheets:', error);
            showMessage('Failed to fetch timesheet history.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTimesheetSubmit = async (formData) => {
        try {
            await api.post('/timesheets/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            showMessage('Timesheet submitted successfully!', 'success');
            setShowTimesheetForm(false);
            fetchTimesheets();
        } catch (error) {
            console.error('Submission failed:', error.response?.data?.detail || error);
            const errorMessage = error.response?.data?.detail || 'Failed to submit timesheet.';
            showMessage(errorMessage, 'error');
        }
    };

    return (
        <div className="bg-[#0D1117] text-gray-200 h-full p-8 font-sans">
            <Message message={message} type={messageType} />
            <div className="max-w-7xl mx-auto bg-[#161B22] rounded-2xl p-8 shadow-xl border border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                    <MdWork className="w-10 h-10 text-[#3B82F6]" />
                    <h1 className="text-3xl font-bold text-white">My Timesheets</h1>
                </div>
                <hr className="border-gray-700 mb-8" />
                
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <button
                        onClick={() => setShowTimesheetForm(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-all hover:translate-y-1 shadow-md cursor-pointer"
                    >
                        <MdAddTask />
                        Submit New Timesheet
                    </button>
                </div>
                
                {showTimesheetForm && (
                    <TimesheetForm onSubmit={handleTimesheetSubmit} onClose={() => setShowTimesheetForm(false)} />
                )}
                
                <div className="bg-[#1f2937] rounded-xl shadow-inner p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><MdHistory /> Timesheet History</h3>
                    {loading ? (
                        <div className="text-center text-gray-500">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-[#161B22]">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Week</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Summary</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted On</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Attachment</th>

                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {timesheets.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="py-4 px-4 text-center text-gray-500 italic">No timesheet records found.</td>
                                        </tr>
                                    ) : (
                                        timesheets.map((ts) => (
                                            <tr key={ts.id} className="hover:bg-[#252a33] transition-colors">
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">
                                                    {new Date(ts.week_start).toLocaleDateString()} - {new Date(ts.week_end).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-400 max-w-lg overflow-hidden text-ellipsis">{ts.task_summary}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-400">{new Date(ts.submitted_on).toLocaleDateString()}</td>
                                                <td>
                                            {ts.screenshot_path ? (
                                                <a
                                                href={`http://localhost:8000/${ts.screenshot_path.replace(/\\/g, "/")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                >
                                                <img
                                                    src={`http://localhost:8000/${ts.screenshot_path.replace(/\\/g, "/")}`}
                                                    alt="screenshot"
                                                    style={{
                                                    width: "60px",
                                                    height: "40px",
                                                    objectFit: "cover",
                                                    borderRadius: "6px",
                                                    cursor: "pointer"
                                                    }}
                                                />
                                                </a>
                                            ) : (
                                                "No file"
                                            )}
                                            </td>
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

export default MyTimesheets;
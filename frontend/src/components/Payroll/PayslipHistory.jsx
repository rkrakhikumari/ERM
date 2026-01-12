import React, { useState } from 'react';
import api from '../../api/api';
import { FaHistory } from 'react-icons/fa';

const PayslipHistory = () => {
    const [historyId, setHistoryId] = useState('');
    const [salaryHistory, setSalaryHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const clearMessages = () => {
        setMessage('');
        setError('');
    };

    const showMessage = (msg, isError = false) => {
        clearMessages();
        if (isError) {
            setError(msg);
        } else {
            setMessage(msg);
        }
    };
    
    const handleGetHistory = async (e) => {
        e.preventDefault();
        clearMessages();
        setSalaryHistory([]);
        try {
            const response = await api.get(`/payroll/history/${historyId}`);
            setSalaryHistory(response.data);
            if (response.data.length === 0) {
                showMessage('No salary history found for this employee.');
            }
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to fetch history.';
            showMessage(msg, true);
        }
    };

    return (
        <div className="bg-[#161B22] border border-white/20 rounded-2xl p-8 shadow-xl h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FaHistory className="text-yellow-400" /> View Salary History
            </h2>
            {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
            
            <form onSubmit={handleGetHistory} className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Employee ID</label>
                    <input 
                        type="text" 
                        value={historyId} 
                        onChange={(e) => setHistoryId(e.target.value)} 
                        className="mt-1 block w-full bg-gray-800 text-white border-gray-700 rounded-md shadow-sm p-2 transition-colors duration-300 focus:border-yellow-400 focus:ring focus:ring-yellow-400/50" 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-yellow-600 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 hover:bg-yellow-700 hover:shadow-lg hover:shadow-yellow-600/30 cursor-pointer"
                >
                    View History
                </button>
            </form>

            {salaryHistory.length > 0 && (
                <div className="mt-6 overflow-x-auto flex-grow">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Net Pay</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-900 divide-y divide-gray-700">
                            {salaryHistory.map((record) => (
                                <tr key={record.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.month} {record.year}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">₹{record.net_pay.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PayslipHistory;
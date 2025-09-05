import React, { useState } from 'react';
import api from '../../api/api';
import { FaDownload, FaRocket } from 'react-icons/fa';

const PayrollControls = () => {
    const [downloadSlip, setDownloadSlip] = useState({ employee_id: '', month: '' });
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

    const handleGeneratePayroll = async () => {
        clearMessages();
        try {
            const response = await api.post(`/payroll/generate`);
            showMessage(response.data.msg);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to generate payroll.';
            showMessage(msg, true);
        }
    };

    const handleDownloadPayslip = async (e) => {
        e.preventDefault();
        clearMessages();
        try {
            const response = await api.get(`/payroll/slips/${downloadSlip.employee_id}/${downloadSlip.month}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payslip_${downloadSlip.employee_id}_${downloadSlip.month}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showMessage('Payslip download started.');
        } catch (err) {
            const msg = err.response?.data?.detail || 'Payslip not found.';
            showMessage(msg, true);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#161B22] border border-white/20 rounded-2xl p-8 shadow-xl text-center flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-10 flex items-center justify-center ">
                    <FaRocket className="text-purple-400 " /> Generate Monthly Payroll
                </h2>
                <p className="text-gray-400 mb-24">
                    Process salary for all employees based on their defined structures.
                </p>
                <button 
                    onClick={handleGeneratePayroll} 
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-600/30 cursor-pointer"
                >
                    Generate Payroll
                </button>
            </div>

            <div className="bg-[#161B22] border border-white/20 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FaDownload className="text-cyan-400" /> Download Payslip
                </h2>
                <form onSubmit={handleDownloadPayslip} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Employee ID</label>
                        <input 
                            type="text" // Changed from "number" to "text"
                            value={downloadSlip.employee_id} 
                            onChange={(e) => setDownloadSlip({ ...downloadSlip, employee_id: e.target.value })} 
                            className="mt-1 block w-full bg-gray-800 text-white border-gray-700 rounded-md shadow-sm p-2 transition-colors duration-300 focus:border-cyan-400 focus:ring focus:ring-cyan-400/50" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Month (e.g., October)</label>
                        <input 
                            type="text" 
                            value={downloadSlip.month} 
                            onChange={(e) => setDownloadSlip({ ...downloadSlip, month: e.target.value })} 
                            className="mt-1 block w-full bg-gray-800 text-white border-gray-700 rounded-md shadow-sm p-2 transition-colors duration-300 focus:border-cyan-400 focus:ring focus:ring-cyan-400/50" 
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-cyan-600 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-600/30 cursor-pointer"
                    >
                        Download
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PayrollControls;
import React, { useState } from 'react';
import api from '../../api/api';
import { FaUserPlus, FaSearch } from 'react-icons/fa';

const SalaryStructureForm = () => {
    const [salaryStructure, setSalaryStructure] = useState({ employee_id: '', basic: '', hra: '', bonus: 0, deduction: 0 });
    const [getStructureId, setGetStructureId] = useState('');
    const [fetchedStructure, setFetchedStructure] = useState(null);
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

    const handleDefineStructure = async (e) => {
        e.preventDefault();
        clearMessages();
        try {
            await api.post(`/payroll/salary-structure`, salaryStructure);
            showMessage('Salary structure defined successfully!');
            setSalaryStructure({ employee_id: '', basic: '', hra: '', bonus: 0, deduction: 0 });
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to define salary structure.';
            showMessage(msg, true);
        }
    };

    const handleGetStructure = async (e) => {
        e.preventDefault();
        clearMessages();
        setFetchedStructure(null);
        try {
            const response = await api.get(`/payroll/salary-structure/${getStructureId}`);
            setFetchedStructure(response.data);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Salary structure not found.';
            showMessage(msg, true);
        }
    };

    return (
        <div className="bg-[#161B22] border border-white/20 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FaUserPlus className="text-[#3B82F6]" /> Define Salary Structure
            </h2>
            {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleDefineStructure} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Employee ID</label>
                        <input type="text" value={salaryStructure.employee_id} onChange={(e) => setSalaryStructure({ ...salaryStructure, employee_id: e.target.value })} className="mt-1 block w-full bg-gray-800 text-white border-gray-700 rounded-md shadow-sm p-2 transition-colors duration-300 focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6]/50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Basic Salary</label>
                        <input type="text" value={salaryStructure.basic} onChange={(e) => setSalaryStructure({ ...salaryStructure, basic: e.target.value })} className="mt-1 block w-full bg-gray-800 text-white border-gray-700 rounded-md shadow-sm p-2 transition-colors duration-300 focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6]/50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">HRA</label>
                        <input type="text" value={salaryStructure.hra} onChange={(e) => setSalaryStructure({ ...salaryStructure, hra: e.target.value })} className="mt-1 block w-full bg-gray-800 text-white border-gray-700 rounded-md shadow-sm p-2 transition-colors duration-300 focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6]/50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Bonus</label>
                        <input type="text" value={salaryStructure.bonus} onChange={(e) => setSalaryStructure({ ...salaryStructure, bonus: e.target.value })} className="mt-1 block w-full bg-gray-800 text-white border-gray-700 rounded-md shadow-sm p-2 transition-colors duration-300 focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6]/50" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400">Deduction</label>
                        <input type="text" value={salaryStructure.deduction} onChange={(e) => setSalaryStructure({ ...salaryStructure, deduction: e.target.value })} className="mt-1 block w-full bg-gray-800 text-white border-gray-700 rounded-md shadow-sm p-2 transition-colors duration-300 focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6]/50" />
                    </div>
                </div>
                <button type="submit" className="w-full bg-[#3B82F6] text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer">
                    Define Structure
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FaSearch className="text-[#3B82F6]" /> Get Salary Structure
                </h3>
                <form onSubmit={handleGetStructure} className="flex gap-4 items-end">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-400">Employee ID</label>
                        <input type="text" value={getStructureId} onChange={(e) => setGetStructureId(e.target.value)} className="mt-1 block w-full bg-gray-800 text-white border-gray-700 rounded-md shadow-sm p-2 transition-colors duration-300 focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6]/50" required />
                    </div>
                    <button type="submit" className="flex-shrink-0 bg-[#3B82F6] text-white py-2 px-6 rounded-xl font-semibold transition-all duration-300 hover:bg-[#2563EB] cursor-pointer">
                        Get
                    </button>
                </form>
                {fetchedStructure && (
                    <div className="mt-6 p-6 border border-gray-700 rounded-lg bg-gray-800">
                        <h4 className="font-medium text-lg mb-2">Details for Employee ID: {fetchedStructure.employee_id}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                            <p><strong>Basic:</strong> ₹{fetchedStructure.basic.toFixed(2)}</p>
                            <p><strong>HRA:</strong> ₹{fetchedStructure.hra.toFixed(2)}</p>
                            <p><strong>Bonus:</strong> ₹{fetchedStructure.bonus.toFixed(2)}</p>
                            <p><strong>Deduction:</strong> ₹{fetchedStructure.deduction.toFixed(2)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalaryStructureForm;
import React, { useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../auth/AuthContext';

const DefineGoals = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        employee_id: '', cycle_id: '', title: '', description: '', weight: ''
    });
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        setMessage('');
        setLoading(true);
        try {
            const payload = {
                ...formData,
                employee_id: parseInt(formData.employee_id),
                cycle_id: parseInt(formData.cycle_id),
                weight: parseFloat(formData.weight),
            };
            await api.post('/reviews/goals', payload);
            setStatus('success');
            setMessage(`Goal for Employee ID ${formData.employee_id} set successfully!`);
            setFormData({ employee_id: '', cycle_id: '', title: '', description: '', weight: '' });
        } catch (error) {
            console.error('Error setting goal:', error);
            setStatus('error');
            setMessage(error.response?.data?.detail || 'Error setting goal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl p-8 font-sans">
            <h2 className="text-2xl font-bold text-white mb-6">Define Employee Goals</h2>
            <style>
                {`
                /* Hide the number input arrows for Chrome, Safari, Edge, Opera */
                input[type="number"]::-webkit-outer-spin-button,
                input[type="number"]::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
      
                /* Hide the number input arrows for Firefox */
                input[type="number"] {
                  -moz-appearance: textfield;
                }
              `}
            </style>
            <form onSubmit={handleSubmit} className="bg-[#161B22] border border-white/20 rounded-2xl p-8 space-y-6">
                <div>
                    <label htmlFor="employee_id" className="block text-sm font-medium text-gray-300 mb-2">Employee ID</label>
                    <input type="number" id="employee_id" name="employee_id" value={formData.employee_id} onChange={handleChange}
                        className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200" required />
                </div>

                <div>
                    <label htmlFor="cycle_id" className="block text-sm font-medium text-gray-300 mb-2">Cycle ID</label>
                    <input type="number" id="cycle_id" name="cycle_id" value={formData.cycle_id} onChange={handleChange}
                        className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200" required />
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Goal Title</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
                        className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200" required />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4"
                        className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200" required></textarea>
                </div>

                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-2">Weight (%)</label>
                    <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleChange} step="0.1"
                        className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200" required />
                </div>

                <button type="submit" disabled={loading}
                    className="w-full flex justify-center items-center gap-2 px-6 py-3 text-base font-semibold bg-[#3B82F6] text-white rounded-xl border border-[#3B82F6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer disabled:opacity-50 disabled:pointer-events-none">
                    {loading ? 'Setting Goal...' : 'Set Goal'}
                </button>
            </form>
            {message && (
                <div className={`mt-6 p-4 rounded-xl text-sm border ${status === 'success' ? 'bg-green-900/30 text-green-300 border-green-600/50' : 'bg-red-900/30 text-red-300 border-red-600/50'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};
export default DefineGoals;

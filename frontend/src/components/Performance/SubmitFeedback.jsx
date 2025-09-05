import React, { useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
const SubmitFeedback = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        employee_id: '',
        cycle_id: '',
        role: '',
        comments: '',
        rating: '',
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
                reviewer_id: user.id,
                employee_id: parseInt(formData.employee_id),
                cycle_id: parseInt(formData.cycle_id),
                rating: parseFloat(formData.rating),
            };
            await api.post('/reviews/submit', payload);
            setStatus('success');
            setMessage('Feedback submitted successfully!');
            setFormData({
                employee_id: '',
                cycle_id: '',
                role: '',
                comments: '',
                rating: '',
            });
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setStatus('error');
            setMessage(error.response?.data?.detail || 'Error submitting feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl p-8 font-sans">
            <h2 className="text-2xl font-bold text-white mb-6">Submit 360 Feedback</h2>
            <form onSubmit={handleSubmit} className="bg-[#161B22] border border-white/20 rounded-2xl p-8 space-y-6">
                {/* Employee ID Field */}
                <div>
                    <label htmlFor="employee_id" className="block text-sm font-medium text-gray-300 mb-2">Employee ID for Feedback</label>
                    <input
                        type="text" 
                        id="employee_id"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200"
                        required
                    />
                </div>

                {/* Cycle ID Field */}
                <div>
                    <label htmlFor="cycle_id" className="block text-sm font-medium text-gray-300 mb-2">Cycle ID</label>
                    <input
                        type="text" 
                        id="cycle_id"
                        name="cycle_id"
                        value={formData.cycle_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200"
                        required
                    />
                </div>

                {/* Role Field */}
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">Your Role</label>
                    <input
                        type="text"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Manager, Peer, Self"
                        required
                    />
                </div>

                {/* Comments Field */}
                <div>
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-300 mb-2">Comments</label>
                    <textarea
                        id="comments"
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200"
                        required
                    ></textarea>
                </div>

                {/* Rating Field */}
                <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-2">Rating (1-5)</label>
                    <input
                        type="text" 
                        id="rating"
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 px-6 py-3 text-base font-semibold bg-[#3B82F6] text-white rounded-xl border border-[#3B82F6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                    {loading ? 'Submitting Feedback...' : 'Submit Feedback'}
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
export default SubmitFeedback;
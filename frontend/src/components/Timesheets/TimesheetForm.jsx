import React, { useState } from 'react';
import { FaTimes, FaUpload, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const TimesheetForm = ({ onSubmit, onClose }) => {
    const [weekStart, setWeekStart] = useState('');
    const [weekEnd, setWeekEnd] = useState('');
    const [taskSummary, setTaskSummary] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("File size should not exceed 5MB.");
            setScreenshot(null);
            return;
        }
        setScreenshot(file);
        setError('');
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    if (new Date(weekStart) >= new Date(weekEnd)) {
        setError("Week End date must be after Week Start date.");
        setIsSubmitting(false);
        return;
    }

    if (!screenshot) {
        setError("Please upload a screenshot of your timer.");
        setIsSubmitting(false);
        return;
    }

    try {
        // STEP 1: Submit JSON timesheet data
        const timesheetResponse = await fetch("http://localhost:8000/timesheets/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify({
                week_start: new Date(weekStart).toISOString(),
                week_end: new Date(weekEnd).toISOString(),
                task_summary: taskSummary,
            }),
        });

        if (!timesheetResponse.ok) {
            const errorData = await timesheetResponse.json();
            throw new Error(errorData.detail || "Failed to submit timesheet.");
        }

        const { timesheet_id } = await timesheetResponse.json();

        // STEP 2: Upload screenshot separately
        const formData = new FormData();
        formData.append("file", screenshot);

        const uploadResponse = await fetch(
            `http://localhost:8000/timesheets/${timesheet_id}/upload-screenshot`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: formData,
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.detail || "Failed to upload screenshot.");
        }

        setSuccessMessage("Timesheet submitted successfully!");

        setTimeout(() => {
            onClose();
        }, 2000);

    } catch (err) {
        console.error("Submission failed:", err);
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
};


    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-[#161B22] text-gray-200 p-8 rounded-2xl shadow-2xl w-full max-w-xl border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Submit New Timesheet</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-all hover:translate-y-1 cursor-pointer">
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Error Message Display */}
                {error && (
                    <div className="p-4 rounded-xl mb-4 bg-red-500/20 text-red-400 border border-red-500/30">
                        <div className="flex items-center gap-2">
                            <FaExclamationTriangle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}
                
                {/* Success Message Display */}
                {successMessage && (
                    <div className="p-4 rounded-xl mb-4 bg-green-500/20 text-green-400 border border-green-500/30">
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="w-5 h-5" />
                            <span>{successMessage}</span>
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Week Start</label>
                            <input
                                type="date"
                                value={weekStart}
                                onChange={(e) => setWeekStart(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white shadow-sm focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-colors p-3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Week End</label>
                            <input
                                type="date"
                                value={weekEnd}
                                onChange={(e) => setWeekEnd(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white shadow-sm focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-colors p-3"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Task Summary</label>
                        <textarea
                            value={taskSummary}
                            onChange={(e) => setTaskSummary(e.target.value)}
                            rows="5"
                            required
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white shadow-sm focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-colors p-3"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Screenshot of Timer</label>
                        <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-[#3B82F6] transition-colors">
                            <label htmlFor="screenshot-upload" className="flex flex-col items-center text-center">
                                <FaUpload className="w-10 h-10 text-gray-400" />
                                <span className="mt-2 text-sm text-gray-400">
                                    <span className="font-medium text-[#3B82F6]">Upload a file</span> or drag and drop
                                </span>
                                <span className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                            </label>
                            <input
                                id="screenshot-upload"
                                name="screenshot"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                                className="sr-only"
                            />
                        </div>
                        {screenshot && (
                            <p className="mt-2 text-sm text-gray-400">Selected file: <span className="font-semibold text-white">{screenshot.name}</span></p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-all cursor-pointer hover:translate-y-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-lg bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition-all hover:translate-y-1 cursor-pointer"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Timesheet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimesheetForm;
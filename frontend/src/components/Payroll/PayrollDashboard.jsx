import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCashStack } from 'react-icons/bs';
import SalaryStructureForm from './SalaryStructureForm';
import PayrollControls from './PayrollControls';
import PayslipHistory from './PayslipHistory';

const PayrollDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
            {/* Header */}
            <div className="mb-12">
                <div className="flex justify-between items-center flex-wrap gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold mb-2 bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg animate-fade-slide">
                            Payroll Management
                        </h1>
                        <p className="text-lg text-gray-400">
                            Effortlessly manage employee salaries, payslips, and history.
                        </p>
                    </div>
                    <button
                        className="flex items-center gap-2 px-6 py-3 text-base font-semibold bg-[#3B82F6] text-white rounded-xl border border-[#3B82F6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer"
                        onClick={() => navigate('/employees')} 
                    >
                        <BsCashStack className="text-xl" />
                        Manage Employees
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 space-y-8">
                    <SalaryStructureForm />
                    <PayrollControls />
                </div>
                <div className="lg:col-span-1">
                    <PayslipHistory />
                </div>
            </div>
        </div>
    );
};

export default PayrollDashboard;
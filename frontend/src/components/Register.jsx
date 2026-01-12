import React, { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Illustration from '../assets/register.svg'; 
const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    repeatPassword: '',
    full_name: '',
    role: 'Employee',
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password !== formData.repeatPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
      });

      setMessage({ type: 'success', text: 'Registered successfully!' });
      setFormData({
        email: '',
        password: '',
        repeatPassword: '',
        full_name: '',
        role: 'Employee',
      });
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Registration failed';
      setMessage({ type: 'error', text: detail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-6">
      <div className="flex flex-col md:flex-row bg-white shadow-lg overflow-hidden max-w-6xl w-full rounded-lg">
        {/* Illustration */}
        <div className="md:w-1/2 bg-[#EEF6FC] flex items-center justify-center p-10">
          <img src={Illustration} alt="Signup" className="w-full h-auto" />
        </div>

        {/* Form */}
        <div className="md:w-1/2 p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-[#1A202C] mb-4 text-center">Welcome to Family</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Repeat Password */}
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="repeatPassword"
                  value={formData.repeatPassword}
                  onChange={handleChange}
                  placeholder="Repeat Password"
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role Selection */}
              <div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                  <option value="Hr">Hr</option>
                  <option value="Manager">Manager</option>



                </select>
              </div>

              {/* Error/Success Message */}
              {message.text && (
                <div
                  className={`text-sm px-4 py-2 rounded ${
                    message.type === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full cursor-pointer"
              >
                {loading ? 'Registering...' : 'Sign Up Now'}
              </button>

              {/* Already have an account? */}
              <p className="text-center text-sm text-gray-500 mt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
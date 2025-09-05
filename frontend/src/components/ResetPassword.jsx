import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ResetPasswordImg from '../assets/reset-password.svg';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/auth/reset-password', {
        token,
        new_password: newPassword,
      });
      setMessage({ type: 'success', text: 'Password reset successfully!' });

      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Reset failed';
      setMessage({ type: 'error', text: detail });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'Invalid or missing token' });
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="max-w-4xl w-full bg-white p-8 shadow rounded flex items-center space-x-6">
        <div className="hidden md:block w-1/2">
          <img src={ResetPasswordImg} alt="Reset Password" className="w-full h-auto" />
        </div>

        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

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

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 cursor-pointer"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

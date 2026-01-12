import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordImg from '../assets/reset-req.svg'; 

const ResetRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await axios.post('http://localhost:8000/auth/request-password-reset', { email });
      setMessage({
        type: 'success',
        text: 'Reset token printed in backend terminal. Use it in URL.',
      });
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Request failed';
      setMessage({ type: 'error', text: detail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl w-full">
        {/* Illustration panel */}
        <div className="md:w-1/2 bg-blue-50 flex items-center justify-center p-8">
          <img
            src={ForgotPasswordImg}
            alt="Forgot Password"
            className="w-full max-w-xs"
          />
        </div>

        {/* Form panel */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-left text-gray-700">
            Forgot <br /> Your Password?
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition cursor-pointer"
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-sm text-gray-500 hover:underline mt-2 cursor-pointer"
            >
              Back to login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetRequest;

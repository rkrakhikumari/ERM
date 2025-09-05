import React, { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Illustration from "../assets/login.svg";
import { useAuth } from "../auth/AuthContext"; 

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); 

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      await login(formData); 
      setMessage({ type: "success", text: "Login successful!" });
    navigate("/profile");  

    } catch (err) {
      const detail = err.response?.data?.detail || "Login failed";
    setMessage({ type: "error", text: detail });
    } finally {
      setLoading(false);
}
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-6">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden max-w-6xl w-full">
        {/* Illustration */}
        <div className="md:w-1/2 bg-[#EEF6FC] flex items-center justify-center p-10">
          <img src={Illustration} alt="Login" className="w-full h-auto" />
        </div>

{/* Form */}  
      <div className="md:w-1/2 p-10 flex items-center justify-center">
      <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">
        Login to Your Account
    </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Email */}
     <div className="relative">
     <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
      type="email"
      name="email"
      placeholder="Email Address"
      value={formData.email}
      onChange={handleChange}
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
     placeholder="Password"
      value={formData.password}
     onChange={handleChange}
     required
      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
</div>


                {message.text && (
                <div
                className={`text-sm px-4 py-2 rounded ${
                message.type === "error"
                 ? "bg-red-100 text-red-600"
                 : "bg-green-100 text-green-600"
               }`}
                 >
             {message.text}
 </div>
 )}

        {/* Submit */}
        <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer"
        >
        {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
        Forgot your password?{" "}
        <Link
        to="/reset-request"
        className="text-blue-600 hover:underline font-semibold" >
        Reset it here
        </Link>
        </p>

        <p className="text-center text-sm text-gray-500 mt-2">
        Don’t have an account?{" "}
        <Link
        to="/register"
        className="text-blue-600 hover:underline font-semibold"
        >
        Sign Up
        </Link>
        </p>
        </form>
        </div>
        </div>
        </div>
        </div>
 );
};

export default Login;
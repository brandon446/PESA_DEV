import React, { useState } from "react";
import { API_URL } from "../config/api"; // ADD THIS

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // CHANGED: Use API_URL instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      onLogin({
        ...data.user,
        token: data.access_token
      });

    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Pesapal Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="mt-6 text-sm text-gray-600">
          <p className="font-semibold mb-2">Demo Accounts:</p>
          <div className="bg-gray-50 p-3 rounded text-xs">
            <p><strong>Admin:</strong> admin@example.com / adminpass</p>
            <p><strong>Finance:</strong> finance@example.com / financepass</p>
            <p><strong>Support:</strong> support@example.com / supportpass</p>
          </div>
        </div>

        {/* Show current API URL for debugging */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          API: {API_URL}
        </div>
      </div>
    </div>
  );
};

export default Login;
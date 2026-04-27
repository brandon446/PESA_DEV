import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SubmitPayment from "./components/SubmitPayment";
import PaymentStatus from "./components/PaymentStatus";
import Analytics from "./components/Analytics";
import ActivityLogs from "./components/ActivityLogs";
import Settings from "./components/Settings";
import Clients from "./components/Clients";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({ ...userData, token });
      } catch (err) {
        console.error("Error parsing user data:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} 
        />
        <Route path="/clients" element={<Clients user={user} onLogout={handleLogout} />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/submit-payment" 
          element={
            <ProtectedRoute>
              <SubmitPayment user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Analytics user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/activity-logs" 
          element={
            <ProtectedRoute>
              <ActivityLogs user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/payment-status" 
          element={
            <ProtectedRoute>
              <PaymentStatus user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
        path="/settings" 
        element=
        {<Settings user={user} onLogout={handleLogout} />} />

        {/* Root Redirect */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />

        {/* 404 Page */}
        <Route
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                
                 <a  href="/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const PaymentStatus = ({ user, onLogout }) => {
  const [status, setStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    // Extract query parameters from URL
    const params = new URLSearchParams(window.location.search);
    setStatus(params.get("status"));
    setOrderId(params.get("orderId"));

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [navigate]);

  // While waiting for status, show loading
  if (!status) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading payment status...</p>
        </div>
      </Layout>
    );
  }

  const success = status === "success";

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-200">
          {/* Icon */}
          <div className="mb-6">
            {success ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className={`text-3xl font-bold mb-4 ${success ? "text-green-600" : "text-red-600"}`}>
            {success ? "Payment Successful!" : "Payment Failed"}
          </h2>

          {/* Order ID */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="text-lg font-semibold text-gray-900">{orderId}</p>
            </div>
          )}

          {/* Message */}
          <p className="text-gray-700 mb-6">
            {success
              ? "Your payment has been processed successfully. Thank you!"
              : "There was an issue processing your payment. Please try again."}
          </p>

          {/* Countdown */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Redirecting to dashboard in <span className="font-bold text-xl">{countdown}</span>{" "}
              second{countdown !== 1 ? "s" : ""}...
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentStatus;
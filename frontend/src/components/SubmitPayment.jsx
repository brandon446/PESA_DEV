import React, { useState } from "react";
import { API_URL } from "../config/api";
import Layout from "./Layout";
import { 
  CreditCard, 
  User, 
  DollarSign, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader
} from "lucide-react";

const SubmitPayment = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    amount: "",
    currency: "KES",
    paymentMethod: "mobile_money",
    description: ""
  });
  
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [iframeUrl, setIframeUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("Processing payment...");
    setMessageType("");

    // Create payment data with timestamp
    const paymentData = {
      id: Date.now(),
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      billing_address: {
        email_address: formData.customerEmail,
        phone_number: formData.customerPhone,
        country_code: "KE",
        first_name: formData.customerName.split(' ')[0] || formData.customerName,
        last_name: formData.customerName.split(' ')[1] || "",
        line_1: "",
        line_2: "",
        city: "",
        state: "",
        postal_code: "",
        zip_code: ""
      },
      payment_method: formData.paymentMethod,
      description: formData.description || `Payment from ${formData.customerName}`,
      callback_url: `${window.location.origin}/payment-status`,
      notification_id: `notif_${Date.now()}`,
      branch: "Main Branch"
    };

    try {
      const token = localStorage.getItem("token");
      
      console.log("🔍 Submitting payment data:", paymentData); // DEBUG LOG
      
      const response = await fetch(`${API_URL}/api/v1/payments/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(paymentData),
      });

      console.log("📥 Response status:", response.status); // DEBUG LOG

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error response:", errorData); // DEBUG LOG
        throw new Error(errorData.detail || "Payment submission failed");
      }

      const data = await response.json();
      console.log("✅ Response data:", data); // DEBUG LOG
      
      const url = data.redirect_url;

      if (!url) {
        console.error("❌ No redirect_url in response. Full response:", data); // DEBUG LOG
        setStatusMessage("Failed to get payment redirect URL");
        setMessageType("error");
        setLoading(false);
        return;
      }

      console.log("🎉 Redirect URL received:", url); // DEBUG LOG

      // Detect mobile devices
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        window.open(url, "_blank");
        setStatusMessage("✓ Payment initiated! Redirected to payment page in new tab.");
        setMessageType("success");
        setIframeUrl(null);
      } else {
        setIframeUrl(url);
        setStatusMessage("✓ Payment page loaded below. Complete your payment.");
        setMessageType("success");
      }

      // Reset form after successful submission
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        amount: "",
        currency: "KES",
        paymentMethod: "mobile_money",
        description: ""
      });

    } catch (err) {
      console.error("❌ Payment error:", err); // DEBUG LOG
      setStatusMessage(`✗ Payment failed: ${err.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit Payment</h1>
        <p className="text-gray-600 mt-2">Create a new payment transaction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Customer Name *
                </div>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Enter customer full name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                placeholder="customer@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="+254712345678"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +254 for Kenya)</p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="mobile_money">Mobile Money (M-Pesa, Airtel, etc.)</option>
                <option value="card">Credit/Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Amount *
                  </div>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add payment notes or description..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Timestamp Display */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">Timestamp:</span>
                <span className="ml-2">{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Submit Payment
                </>
              )}
            </button>
          </form>
        </div>

        {/* Status and Info Panel */}
        <div className="space-y-6">
          {/* Status Message */}
          {statusMessage && (
            <div className={`rounded-xl p-4 border ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-200' 
                : messageType === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start">
                {messageType === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                ) : messageType === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                ) : (
                  <Loader className="w-5 h-5 text-blue-600 mr-3 mt-0.5 animate-spin" />
                )}
                <p className={`text-sm font-medium ${
                  messageType === 'success' 
                    ? 'text-green-800' 
                    : messageType === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }`}>
                  {statusMessage}
                </p>
              </div>
            </div>
          )}

          {/* Payment Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Instructions</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <p>Fill in all required customer details and payment information</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <p>Select the preferred payment method (Mobile Money, Card, or Bank)</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <p>Click "Submit Payment" to generate the payment link</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">4</span>
                </div>
                <p>Complete payment on the Pesapal secure payment page</p>
              </div>
            </div>
          </div>

          {/* Supported Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Supported Payment Methods</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-gray-700">M-Pesa</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-gray-700">Airtel Money</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-gray-700">Visa/Mastercard</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-gray-700">Bank Transfer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop iframe */}
      {iframeUrl && (
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Complete Your Payment</h3>
            <iframe
              src={iframeUrl}
              title="Pesapal Payment"
              className="w-full h-[600px] border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SubmitPayment;
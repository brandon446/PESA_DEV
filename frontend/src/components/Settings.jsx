import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { API_URL } from "../config/api";
import {
  Settings as SettingsIcon,
  Key,
  Bell,
  Shield,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const Settings = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [settings, setSettings] = useState({
    pesapal_api_base: "",
    consumer_key: "",
    consumer_secret: "",
    ipn_id: "",
    callback_url: "",
    email_notifications: true,
    sms_notifications: false,
    webhook_url: "",
    max_payment_amount: 1000000,
    min_payment_amount: 1,
    default_currency: "KES",
    session_timeout: 30,
    enable_2fa: false,
    password_expiry_days: 90,
    max_login_attempts: 5
  });

  useEffect(() => {
    if (!["admin", "super_admin"].includes(user?.role)) {
      window.location.href = "/dashboard";
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/settings`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/settings`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.detail || "Failed to save settings" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error saving settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  if (loading && !settings.pesapal_api_base) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-blue-600" />
            System Configuration
          </h1>
          <p className="text-gray-600 mt-2">Manage system settings and configurations</p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === "success" 
            ? "bg-green-50 border border-green-200 text-green-800" 
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Key className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Pesapal API Configuration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
              <input type="text" name="pesapal_api_base" value={settings.pesapal_api_base} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://cybqa.pesapal.com/pesapalv3/api" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consumer Key</label>
              <input type="text" name="consumer_key" value={settings.consumer_key} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter consumer key" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consumer Secret</label>
              <input type="password" name="consumer_secret" value={settings.consumer_secret} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter consumer secret" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IPN ID</label>
              <input type="text" name="ipn_id" value={settings.ipn_id} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter IPN ID (GUID)" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Callback URL</label>
              <input type="url" name="callback_url" value={settings.callback_url} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://yourdomain.com/api/v1/payments/callback" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Bell className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email alerts for payment events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="email_notifications" checked={settings.email_notifications} onChange={handleInputChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive SMS alerts for critical events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="sms_notifications" checked={settings.sms_notifications} onChange={handleInputChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL (Optional)</label>
              <input type="url" name="webhook_url" value={settings.webhook_url} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://yourdomain.com/webhooks/payments" />
              <p className="text-xs text-gray-500 mt-1">Receive payment notifications at this URL</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Globe className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Payment Amount (KES)</label>
              <input type="number" name="max_payment_amount" value={settings.max_payment_amount} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payment Amount (KES)</label>
              <input type="number" name="min_payment_amount" value={settings.min_payment_amount} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
              <select name="default_currency" value={settings.default_currency} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input type="number" name="session_timeout" value={settings.session_timeout} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Enable Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Require 2FA for all admin users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="enable_2fa" checked={settings.enable_2fa} onChange={handleInputChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                <input type="number" name="password_expiry_days" value={settings.password_expiry_days} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <p className="text-xs text-gray-500 mt-1">Users must change password after this period</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <input type="number" name="max_login_attempts" value={settings.max_login_attempts} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <p className="text-xs text-gray-500 mt-1">Lock account after this many failed attempts</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={saveSettings} disabled={loading} className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-lg">
            <Save className="w-5 h-5 mr-2" />
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

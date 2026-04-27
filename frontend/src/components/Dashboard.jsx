import React, { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import Layout from "./Layout";
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  RefreshCw,
  Eye,
  Edit
} from "lucide-react";

const Dashboard = ({ user, onLogout }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission);
  };

  // Helper function to safely format dates in EAT timezone
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    // Handle both ISO format and SQLite datetime format
    const date = new Date(dateString.replace(' ', 'T') + 'Z'); // Treat as UTC
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Convert to EAT (Africa/Nairobi = UTC+3)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi'
    });
  } catch (e) {
    console.error("Date parsing error:", e);
    return "Invalid Date";
  }
};
  // Helper function to safely get values with fallback
  const safeValue = (value, fallback = "N/A") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }
    return value;
  };

  const fetchPayments = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/payments`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied - insufficient permissions");
        }
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      console.log("📊 Payments data received:", data); // Debug log
      setPayments(data.payments || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!hasPermission("view_analytics")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/payments/analytics`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const updatePaymentStatus = async () => {
    if (!selectedPayment || !newStatus) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/payments/${selectedPayment.id}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchPayments();
        fetchAnalytics(); // Refresh analytics too
        setStatusUpdateModal(false);
        setSelectedPayment(null);
        setNewStatus("");
      } else {
        const errorData = await response.json();
        alert(`Failed to update status: ${errorData.detail}`);
      }
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const exportPayments = async (format = "csv") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/payments/export?format=${format}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (format === "csv") {
          const blob = new Blob([data.data], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
        }
      }
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchPayments();
      fetchAnalytics();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case "COMPLETED": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "PENDING": return <Clock className="w-5 h-5 text-yellow-500" />;
      case "FAILED": return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      FAILED: "bg-red-100 text-red-800 border-red-200",
      CANCELLED: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your payment transactions</p>
      </div>

      {/* Analytics Cards */}
      {analytics && hasPermission("view_analytics") && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.total_payments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">All time transactions</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.total_amount?.toLocaleString()} 
                </p>
                <p className="text-xs text-gray-500">KES</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Total amount processed</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {analytics.status_breakdown?.COMPLETED || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Successful transactions</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {analytics.status_breakdown?.PENDING || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Awaiting confirmation</p>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        <div className="flex gap-3">
          <button
            onClick={() => fetchPayments(true)}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {hasPermission("export_payments") && (
            <button
              onClick={() => exportPayments("csv")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reference
                  </th>
                  {user?.role !== "viewer" && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                  )}
                  {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th> */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{payment.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {safeValue(payment.customer_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 capitalize">
                        {payment.payment_method ? 
                          payment.payment_method.replace(/_/g, " ") : 
                          "N/A"
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {safeValue(payment.merchant_reference)}
                      </span>
                    </td>
                    {user?.role !== "viewer" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {payment.amount ? payment.amount.toLocaleString() : "0"} {payment.currency || "KES"}
                        </span>
                      </td>
                    )}
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-2">{safeValue(payment.status, "PENDING")}</span>
                      </span>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        {hasPermission("update_payment_status") && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setStatusUpdateModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 font-medium flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Update
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-2">Start by creating a new payment</p>
          </div>
        )}
      </div>

      {/* View Payment Modal */}
      {viewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Payment Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                  <p className="text-lg font-semibold text-gray-900">#{selectedPayment.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Reference</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {safeValue(selectedPayment.merchant_reference)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer Name</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {safeValue(selectedPayment.customer_name)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer Email</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {safeValue(selectedPayment.customer_email)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer Phone</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {safeValue(selectedPayment.customer_phone)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {selectedPayment.payment_method ? 
                      selectedPayment.payment_method.replace(/_/g, " ") : 
                      "N/A"
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPayment.amount ? selectedPayment.amount.toLocaleString() : "0"} {selectedPayment.currency || "KES"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedPayment.status)}`}>
                    {getStatusIcon(selectedPayment.status)}
                    <span className="ml-2">{safeValue(selectedPayment.status, "PENDING")}</span>
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedPayment.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Order Tracking ID</label>
                  <p className="text-sm text-gray-900 break-all">
                    {safeValue(selectedPayment.order_tracking_id)}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-sm text-gray-900">
                    {safeValue(selectedPayment.description)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setViewModal(false);
                  setSelectedPayment(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusUpdateModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Update Payment Status</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Payment ID: <span className="font-semibold">#{selectedPayment.id}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose status...</option>
                {user?.role === "admin" || user?.role === "super_admin" ? (
                  <>
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="FAILED">FAILED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </>
                ) : (
                  <>
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="FAILED">FAILED</option>
                  </>
                )}
              </select>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={updatePaymentStatus}
                disabled={!newStatus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Update Status
              </button>
              <button
                onClick={() => {
                  setStatusUpdateModal(false);
                  setSelectedPayment(null);
                  setNewStatus("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
import React, { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import Layout from "./Layout";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Filter
} from "lucide-react";

const Analytics = ({ user, onLogout }) => {
  const [analytics, setAnalytics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission);
  };

  const fetchAnalytics = async () => {
  if (!hasPermission("view_analytics")) {
    setError("You don't have permission to view analytics");
    setLoading(false);
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    setError("Authentication token missing. Please log in again.");
    setLoading(false);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/payments/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Remove Content-Type for GET
      },
    });

    if (!response.ok) {
      // Handle non-JSON or error responses
      const text = await response.text();
      console.error("Server response:", text);

      if (response.status === 422) {
        throw new Error("Invalid request. Please check your permissions or data.");
      } else if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized. Please log in again.");
      } else {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
    }

    const data = await response.json();
    setAnalytics(data);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    setError(err.message || "An unexpected error occurred.");
  } finally {
    setLoading(false);
  }
};


  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchAnalytics(), fetchPayments()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnalytics();
    fetchPayments();
  }, []);

  // Prepare chart data
  const statusData = analytics?.status_breakdown
    ? Object.entries(analytics.status_breakdown).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const COLORS = {
    COMPLETED: "#10b981",
    PENDING: "#f59e0b",
    FAILED: "#ef4444",
    CANCELLED: "#6b7280",
  };

  // Prepare daily transaction data (last 7 days)
  const getDailyTransactions = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayPayments = payments.filter(p => 
        p.created_at && p.created_at.split('T')[0] === dateStr
      );
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        transactions: dayPayments.length,
        amount: dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      });
    }
    
    return last7Days;
  };

  const dailyData = getDailyTransactions();

  // Export analytics report
  const exportReport = (format = "csv") => {
    if (!hasPermission("export_payments")) return;

    const reportData = {
      summary: analytics,
      payments: payments,
      generatedAt: new Date().toISOString(),
      generatedBy: user?.email
    };

    if (format === "json") {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
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
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive payment insights and trends</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {hasPermission("export_payments") && (
            <button
              onClick={() => exportReport("json")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">
            {analytics?.total_amount?.toLocaleString() || 0}
          </p>
          <p className="text-sm opacity-75">KES</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Total Transactions</h3>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">
            {analytics?.total_payments || 0}
          </p>
          <p className="text-sm opacity-75">All time</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Success Rate</h3>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">
            {analytics?.total_payments > 0
              ? Math.round(
                  ((analytics?.status_breakdown?.COMPLETED || 0) /
                    analytics?.total_payments) *
                    100
                )
              : 0}
            %
          </p>
          <p className="text-sm opacity-75">Completion rate</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Avg Transaction</h3>
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">
            {analytics?.total_payments > 0
              ? Math.round(analytics?.total_amount / analytics?.total_payments).toLocaleString()
              : 0}
          </p>
          <p className="text-sm opacity-75">KES per transaction</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Transaction Status Distribution - Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Daily Transactions - Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Transactions (Last 7 Days)</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Day - Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue by Day (Last 7 Days)</h3>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => `${value.toLocaleString()} KES`}
              />
              <Legend />
              <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-gray-400">
            No data available
          </div>
        )}
      </div>

      {/* Status Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Detailed Status Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Count</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statusData.map((item) => (
                <tr key={item.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${COLORS[item.name]}20`,
                        color: COLORS[item.name],
                      }}
                    >
                      {item.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.value}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {((item.value / analytics?.total_payments) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
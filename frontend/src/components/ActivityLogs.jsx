import React, { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import Layout from "./Layout";
import {
  History,
  Download,
  RefreshCw,
  Filter,
  User,
  Calendar,
  Activity,
  TrendingUp
} from "lucide-react";

const ActivityLogs = ({ user, onLogout }) => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    action: "",
    user_email: "",
    start_date: "",
    end_date: ""
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 50,
    total: 0
  });

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission);
  };

  const fetchLogs = async () => {
    if (!hasPermission("view_logs")) {
      setError("You don't have permission to view activity logs");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        skip: pagination.skip.toString(),
        limit: pagination.limit.toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.user_email && { user_email: filters.user_email }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      });

      const response = await fetch(`${API_URL}/api/v1/activity/logs?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setPagination(prev => ({ ...prev, total: data.total || 0 }));
      } else {
        throw new Error("Failed to fetch activity logs");
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/activity/logs/summary?days=7`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const exportLogs = async (format = "csv") => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        format,
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      });

      const response = await fetch(`${API_URL}/api/v1/activity/logs/export?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (format === "csv") {
          const blob = new Blob([data.data], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
        }
      }
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchLogs(), fetchSummary()]);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, skip: 0 }));
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({
      action: "",
      user_email: "",
      start_date: "",
      end_date: ""
    });
    setPagination(prev => ({ ...prev, skip: 0 }));
  };

  useEffect(() => {
    fetchLogs();
    fetchSummary();
  }, [pagination.skip]);

  const getActionColor = (action) => {
    const colors = {
      LOGIN: "bg-blue-100 text-blue-800 border-blue-200",
      LOGOUT: "bg-gray-100 text-gray-800 border-gray-200",
      CREATE_PAYMENT: "bg-green-100 text-green-800 border-green-200",
      UPDATE_PAYMENT_STATUS: "bg-yellow-100 text-yellow-800 border-yellow-200",
      VIEW_PAYMENTS: "bg-purple-100 text-purple-800 border-purple-200",
      VIEW_ANALYTICS: "bg-indigo-100 text-indigo-800 border-indigo-200",
      EXPORT_PAYMENTS: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colors[action] || "bg-gray-100 text-gray-800 border-gray-200";
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
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-2">Track and audit user actions across the system</p>
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
          <button
            onClick={() => exportLogs("csv")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total_activities}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Last 7 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.top_users?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Unique users active</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Common Action</p>
                <p className="text-xl font-bold text-gray-900 mt-2">
                  {Object.keys(summary.activities_by_action || {}).length > 0
                    ? Object.entries(summary.activities_by_action).sort((a, b) => b[1] - a[1])[0][0]
                    : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Most frequent activity</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE_PAYMENT">Create Payment</option>
              <option value="UPDATE_PAYMENT_STATUS">Update Status</option>
              <option value="VIEW_PAYMENTS">View Payments</option>
              <option value="VIEW_ANALYTICS">View Analytics</option>
              <option value="EXPORT_PAYMENTS">Export</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Email</label>
            <input
              type="email"
              name="user_email"
              value={filters.user_email}
              onChange={handleFilterChange}
              placeholder="user@example.com"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              clearFilters();
              fetchLogs();
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Resource
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.user_role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.resource_type && log.resource_id
                        ? `${log.resource_type} #${log.resource_id}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No activity logs found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total} logs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
              disabled={pagination.skip === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
              disabled={pagination.skip + pagination.limit >= pagination.total}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ActivityLogs;
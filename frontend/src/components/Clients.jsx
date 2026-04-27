import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { API_URL } from "../config/api";
import { Building2, Plus, Edit, Trash2, Users, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const Clients = ({ user, onLogout }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ name: "", contact_email: "", is_active: true });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [clientUsers, setClientUsers] = useState({});

  useEffect(() => {
    if (user?.role !== "super_admin") {
      window.location.href = "/dashboard";
    }
    fetchClients();
  }, [user]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/clients`, {
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
        
        for (const client of data.clients) {
          fetchClientUsers(client.id);
        }
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
      setMessage({ type: "error", text: "Failed to load clients" });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientUsers = async (clientId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/clients/${clientId}/users`, {
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        setClientUsers(prev => ({ ...prev, [clientId]: data.users }));
      }
    } catch (err) {
      console.error("Error fetching client users:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const url = editingClient 
        ? `${API_URL}/api/v1/clients/${editingClient.id}`
        : `${API_URL}/api/v1/clients`;
      
      const method = editingClient ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ type: "success", text: editingClient ? "Client updated successfully!" : "Client created successfully!" });
        setShowModal(false);
        setEditingClient(null);
        setFormData({ name: "", contact_email: "", is_active: true });
        fetchClients();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.detail || "Operation failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error saving client" });
    }
  };

  const handleDelete = async (clientId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/v1/clients/${clientId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Client deleted successfully!" });
        setShowDeleteConfirm(null);
        fetchClients();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.detail || "Delete failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error deleting client" });
    }
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({ name: client.name, contact_email: client.contact_email, is_active: client.is_active });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({ name: "", contact_email: "", is_active: true });
    setShowModal(true);
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

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-blue-600" />
            Client Management
          </h1>
          <p className="text-gray-600 mt-2">Manage tenant organizations and their users</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchClients} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button onClick={openCreateModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-600">{client.contact_email}</p>
                </div>
              </div>
              {client.is_active ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <XCircle className="w-3 h-3 mr-1" />
                  Inactive
                </span>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Users className="w-4 h-4 mr-2" />
              <span>{clientUsers[client.id]?.length || 0} users</span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => openEditModal(client)} className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button onClick={() => setShowDeleteConfirm(client)} className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No clients found</p>
          <button onClick={openCreateModal} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Your First Client
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">{editingClient ? "Edit Client" : "Add New Client"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="ABC Company" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                <input type="email" required value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="admin@abc.com" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label className="ml-2 text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  {editingClient ? "Update Client" : "Create Client"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Client</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>?</p>
            {clientUsers[showDeleteConfirm.id]?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">⚠️ This client has {clientUsers[showDeleteConfirm.id].length} user(s). Remove or reassign users before deleting.</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => handleDelete(showDeleteConfirm.id)} disabled={clientUsers[showDeleteConfirm.id]?.length > 0} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Clients;

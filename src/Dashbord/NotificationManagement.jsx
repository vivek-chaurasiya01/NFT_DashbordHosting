import { useState, useEffect } from "react";
import { FaBell, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSync } from "react-icons/fa";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: "🎷 Official Notification 🎷",
    message: "",
    type: "announcement",
    priority: 1,
  });

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const getAuthToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchAllNotifications = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_URL}api/notifications/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load notifications" });
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async () => {
    if (!formData.message.trim()) {
      Swal.fire({ icon: "warning", title: "Required", text: "Message is required" });
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}api/notifications/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (result.success) {
        Swal.fire({ icon: "success", title: "Created!", text: "Notification created successfully", timer: 2000 });
        setShowModal(false);
        resetForm();
        fetchAllNotifications();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Failed", text: error.message });
    }
  };

  const updateNotification = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}api/notifications/update/${currentNotification._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (result.success) {
        Swal.fire({ icon: "success", title: "Updated!", text: "Notification updated successfully", timer: 2000 });
        setShowModal(false);
        setEditMode(false);
        resetForm();
        fetchAllNotifications();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Failed", text: error.message });
    }
  };

  const deleteNotification = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Notification?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}api/notifications/delete/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (result.success) {
          Swal.fire({ icon: "success", title: "Deleted!", text: "Notification deleted successfully", timer: 2000 });
          fetchAllNotifications();
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Failed", text: "Failed to delete notification" });
      }
    }
  };

  const toggleNotification = async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}api/notifications/toggle/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.success) {
        Swal.fire({ icon: "success", title: "Success!", text: result.message, timer: 2000 });
        fetchAllNotifications();
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Failed", text: "Failed to toggle notification" });
    }
  };

  const openEditModal = (notification) => {
    setEditMode(true);
    setCurrentNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "🎷 Official Notification 🎷",
      message: "",
      type: "announcement",
      priority: 1,
    });
    setCurrentNotification(null);
    setEditMode(false);
  };

  const getTypeColor = (type) => {
    const colors = {
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      announcement: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    };
    return colors[type] || colors.announcement;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage system notifications</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAllNotifications}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <FaPlus />
            Create Notification
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold">{notifications.length}</div>
            <div className="text-indigo-100 mt-1">Total Notifications</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{notifications.filter((n) => n.isActive).length}</div>
            <div className="text-indigo-100 mt-1">Active</div>
          </div>
          <FaBell className="text-6xl opacity-20" />
        </div>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{notification.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(notification.type)}`}>
                    {notification.type}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-xs font-semibold">
                    Priority: {notification.priority}
                  </span>
                  {notification.isActive ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-semibold">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-3">{notification.message}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Created: {new Date(notification.createdAt).toLocaleString()}</span>
                  {notification.createdBy && <span>By: {notification.createdBy.name || notification.createdBy.email}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleNotification(notification._id)}
                  className={`p-3 rounded-lg ${
                    notification.isActive
                      ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                  title={notification.isActive ? "Deactivate" : "Activate"}
                >
                  {notification.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                </button>
                <button
                  onClick={() => openEditModal(notification)}
                  className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                  title="Edit"
                >
                  <FaEdit size={20} />
                </button>
                <button
                  onClick={() => deleteNotification(notification._id)}
                  className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                  title="Delete"
                >
                  <FaTrash size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editMode ? "Edit Notification" : "Create Notification"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="🎷 Official Notification 🎷"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="8"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Enter notification message..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="announcement">📢 Announcement</option>
                    <option value="info">ℹ️ Info</option>
                    <option value="warning">⚠️ Warning</option>
                    <option value="success">✅ Success</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={editMode ? updateNotification : createNotification}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editMode ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

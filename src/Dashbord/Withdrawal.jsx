import { useState, useEffect } from "react";
import { FaWallet, FaCheckCircle, FaClock, FaTimesCircle, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function Withdrawal() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("superAdminToken");

      const response = await axios.get(
        `${API_URL}api/admin/withdrawals`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setWithdrawals(response.data.data || response.data.withdrawals || []);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch withdrawal requests",
        background: "#1f2937",
        color: "white",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (transactionId, action) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("superAdminToken");

      const endpoint = action === "approved" 
        ? `${API_URL}api/admin/withdrawals/${transactionId}/approve`
        : `${API_URL}api/admin/withdrawals/${transactionId}/reject`;

      const body = action === "approved" 
        ? { txHash: `0x${Date.now().toString(16)}` }
        : { reason: "Rejected by admin" };

      const response = await axios.patch(
        endpoint,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: `Withdrawal ${action} successfully`,
          background: "#1f2937",
          color: "white",
        });
        fetchWithdrawals();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update withdrawal status",
        background: "#1f2937",
        color: "white",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return <FaCheckCircle className="text-green-400" />;
      case "pending":
        return <FaClock className="text-yellow-400" />;
      case "rejected":
      case "failed":
        return <FaTimesCircle className="text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return "bg-green-600/20 text-green-300";
      case "pending":
        return "bg-yellow-600/20 text-yellow-300";
      case "rejected":
      case "failed":
        return "bg-red-600/20 text-red-300";
      default:
        return "bg-gray-600/20 text-gray-300";
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch = 
      w.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || w.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWithdrawals.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status?.toLowerCase() === "pending").length,
    approved: withdrawals.filter(w => w.status?.toLowerCase() === "completed" || w.status?.toLowerCase() === "approved").length,
    rejected: withdrawals.filter(w => w.status?.toLowerCase() === "rejected" || w.status?.toLowerCase() === "failed").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-gray-300 font-medium">Loading Withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-6">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
              <FaWallet className="text-2xl sm:text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Withdrawal Requests</h1>
              <p className="text-green-100 mt-1 text-xs sm:text-sm">Manage user withdrawal requests</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <p className="text-blue-100 text-xs sm:text-sm">Total Requests</p>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{stats.total}</h3>
          </div>
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <p className="text-yellow-100 text-xs sm:text-sm">Pending</p>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{stats.pending}</h3>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <p className="text-green-100 text-xs sm:text-sm">Approved</p>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{stats.approved}</h3>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <p className="text-red-100 text-xs sm:text-sm">Rejected</p>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{stats.rejected}</h3>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or wallet..."
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400 text-sm" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Withdrawal Requests - Mobile Cards & Desktop Table */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-gray-700 shadow-xl">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">User</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Wallet Address</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Date & Time</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((withdrawal) => (
                    <tr key={withdrawal._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-semibold text-sm">{withdrawal.userId?.name || "N/A"}</p>
                          <p className="text-gray-400 text-xs">{withdrawal.userId?.email || "N/A"}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white font-bold text-sm">${withdrawal.amount}</td>
                      <td className="py-4 px-4">
                        <div className="max-w-[200px]">
                          <p className="text-gray-300 font-mono text-xs break-all">
                            {withdrawal.walletAddress || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white text-sm">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(withdrawal.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 w-fit ${getStatusColor(withdrawal.status)}`}>
                          {getStatusIcon(withdrawal.status)}
                          {withdrawal.status?.charAt(0).toUpperCase() + withdrawal.status?.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {withdrawal.status?.toLowerCase() === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusUpdate(withdrawal._id, "approved")}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(withdrawal._id, "rejected")}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {withdrawal.status?.toLowerCase() === "completed" && withdrawal.txHash && (
                          <p className="text-gray-400 font-mono text-xs">{withdrawal.txHash.slice(0, 10)}...</p>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">
                      No withdrawal requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          {totalPages > 1 && (
            <div className="hidden lg:flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredWithdrawals.length)} of {filteredWithdrawals.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  <FaChevronLeft className="text-xs" />
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      currentPage === index + 1
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  Next
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {currentItems.length > 0 ? (
              currentItems.map((withdrawal) => (
                <div key={withdrawal._id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{withdrawal.userId?.name || "N/A"}</p>
                      <p className="text-gray-400 text-xs mt-1">{withdrawal.userId?.email || "N/A"}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      {withdrawal.status?.charAt(0).toUpperCase() + withdrawal.status?.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 text-xs">Amount</p>
                      <p className="text-white font-bold text-sm">${withdrawal.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Request Time</p>
                      <p className="text-white text-xs">{new Date(withdrawal.createdAt).toLocaleDateString()}</p>
                      <p className="text-gray-400 text-xs">{new Date(withdrawal.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs mb-1">Wallet Address</p>
                    <div className="bg-gray-800 rounded p-2 border border-gray-700">
                      <p className="text-gray-300 font-mono text-xs break-all">
                        {withdrawal.walletAddress || "N/A"}
                      </p>
                    </div>
                  </div>

                  {withdrawal.status?.toLowerCase() === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleStatusUpdate(withdrawal._id, "approved")}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(withdrawal._id, "rejected")}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  
                  {withdrawal.status?.toLowerCase() === "completed" && withdrawal.txHash && (
                    <div>
                      <p className="text-gray-400 text-xs">Transaction Hash</p>
                      <p className="text-gray-300 font-mono text-xs mt-1">{withdrawal.txHash.slice(0, 16)}...</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                No withdrawal requests found
              </div>
            )}
          </div>

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-700 space-y-3">
              <div className="text-xs text-gray-400 text-center">
                Page {currentPage} of {totalPages} ({filteredWithdrawals.length} total)
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-white text-sm px-4">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

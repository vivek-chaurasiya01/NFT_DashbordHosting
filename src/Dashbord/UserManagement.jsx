import {
  FaSearch,
  FaUserCircle,
  FaWallet,
  FaShieldAlt,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPlan, setFilterPlan] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");

      if (!token) {
        Swal.fire("Error", "No authentication token found", "error");
        return;
      }

      const response = await axios.get(`${API_URL}api/auth/Getuser`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData =
        response.data.users || response.data.data || response.data;

      const usersArray = Array.isArray(userData) ? userData : [userData];

      const sortedUsers = usersArray.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      console.log('Users data:', sortedUsers);
      setUsers(sortedUsers);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to fetch users",
        "error",
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user) => {
    const formatDate = (d) =>
      d
        ? new Date(d).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

    const limit = user.currentPlan === 'premium' ? '∞ (Unlimited)' : `$${user.purchaseLimit || 0}`;

    Swal.fire({
      title: `<div style="color:#6366f1">👤 ${user.name}</div>`,
      width: 700,
      confirmButtonColor: "#6366f1",
      confirmButtonText: "Close",
      html: `
        <div style="text-align:left;max-height:600px;overflow-y:auto;padding:10px">
          
          <h3 style="color:#6366f1;border-bottom:2px solid #6366f1;padding-bottom:8px;margin-top:15px">📋 Basic Information</h3>
          <table style="width:100%;margin-top:10px">
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Name:</b></td><td style="padding:8px 0">${user.name}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Email:</b></td><td style="padding:8px 0">${user.email}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Mobile:</b></td><td style="padding:8px 0">${user.mobile || "N/A"}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Country:</b></td><td style="padding:8px 0">${user.country || "N/A"}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Password:</b></td><td style="padding:8px 0"><span style="background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;font-family:monospace">${user.password?.startsWith('$2') ? '------' : (user.password || '••••••••')}</span></td></tr>
          </table>

          <h3 style="color:#10b981;border-bottom:2px solid #10b981;padding-bottom:8px;margin-top:20px">💰 Financial Details</h3>
          <table style="width:100%;margin-top:10px">
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Balance:</b></td><td style="padding:8px 0;color:#10b981;font-weight:bold">$${user.balance || 0}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Registration Amount:</b></td><td style="padding:8px 0">$${user.registrationAmount || 0}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Purchase Limit:</b></td><td style="padding:8px 0;color:#10b981;font-weight:bold">${limit}</td></tr>
          </table>

          <h3 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:8px;margin-top:20px">🎯 MLM & Plan Info</h3>
          <table style="width:100%;margin-top:10px">
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Current Plan:</b></td><td style="padding:8px 0"><span style="background:#dbeafe;color:#1e40af;padding:4px 12px;border-radius:6px;text-transform:capitalize;font-weight:bold">${user.currentPlan || "basic"}</span></td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Level:</b></td><td style="padding:8px 0">Level ${user.level || 1}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Referral Code:</b></td><td style="padding:8px 0"><span style="background:#dcfce7;color:#166534;padding:4px 8px;border-radius:4px;font-family:monospace;font-weight:bold">${user.referralCode || "N/A"}</span></td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Referred By:</b></td><td style="padding:8px 0">${user.referredBy || "Direct Join"}</td></tr>
          </table>

          <h3 style="color:#f59e0b;border-bottom:2px solid #f59e0b;padding-bottom:8px;margin-top:20px">🔐 Wallet & Status</h3>
          <table style="width:100%;margin-top:10px">
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Wallet Address:</b></td><td style="padding:8px 0;font-family:monospace;font-size:12px;word-break:break-all">${user.walletAddress || "N/A"}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Account Status:</b></td><td style="padding:8px 0">${user.isActive ? "<span style='color:#10b981;font-weight:bold'>✓ Active</span>" : "<span style='color:#ef4444;font-weight:bold'>✗ Inactive</span>"}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Can Trade:</b></td><td style="padding:8px 0">${user.canTrade ? "<span style='color:#10b981'>✓ Yes</span>" : "<span style='color:#ef4444'>✗ No</span>"}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Can Withdraw:</b></td><td style="padding:8px 0">${user.canWithdraw ? "<span style='color:#10b981'>✓ Yes</span>" : "<span style='color:#ef4444'>✗ No</span>"}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Activation Paid:</b></td><td style="padding:8px 0">${user.activationPaid ? "<span style='color:#10b981'>✓ Yes</span>" : "<span style='color:#ef4444'>✗ No</span>"}</td></tr>
          </table>

          <h3 style="color:#06b6d4;border-bottom:2px solid #06b6d4;padding-bottom:8px;margin-top:20px">📅 Registration Details</h3>
          <table style="width:100%;margin-top:10px">
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Joined Date:</b></td><td style="padding:8px 0">${formatDate(user.createdAt)}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af"><b>Last Updated:</b></td><td style="padding:8px 0">${formatDate(user.updatedAt)}</td></tr>
          </table>

        </div>
      `,
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mobile?.includes(searchTerm);
    
    const matchesPlan = !filterPlan || u.currentPlan?.toLowerCase() === filterPlan.toLowerCase();
    
    let matchesDate = true;
    if (filterDateRange) {
      const userDate = new Date(u.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now - userDate) / (1000 * 60 * 60 * 24));
      
      switch(filterDateRange) {
        case 'day': matchesDate = daysDiff <= 1; break;
        case 'week': matchesDate = daysDiff <= 7; break;
        case 'month': matchesDate = daysDiff <= 30; break;
        case '3month': matchesDate = daysDiff <= 90; break;
        case '6month': matchesDate = daysDiff <= 180; break;
        case 'year': matchesDate = daysDiff <= 365; break;
        default: matchesDate = true;
      }
    }
    
    return matchesSearch && matchesPlan && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPlan, filterDateRange, itemsPerPage]);

  // Get unique plans for filter dropdown
  const plans = [...new Set(users.map(u => u.currentPlan).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-200 max-w-[95vw] mx-auto">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Header */}
        <div className="flex items-center gap-3">
          <FaUserCircle className="text-indigo-500 text-3xl" />
          <div>
            <h1 className="text-3xl font-extrabold">User Management</h1>
            <p className="text-gray-400">Admin control & overview</p>
          </div>
        </div>

        {/* Right: Search & Filters */}
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl flex flex-col gap-2 w-full md:w-auto md:min-w-[400px]">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
            <FaSearch className="text-gray-400 text-sm" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="flex-1 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg outline-none capitalize text-sm"
            >
              <option value="">🎯 All Plans</option>
              {plans.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
            
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="flex-1 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg outline-none text-sm"
            >
              <option value="">📅 All Time</option>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="3month">Last 3 Months</option>
              <option value="6month">Last 6 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== TABLE (DESKTOP) ===== */}
      <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <FaShieldAlt className="text-indigo-400" />
          <h3 className="font-bold text-xl">Users ({filteredUsers.length})</h3>
        </div>

        <table className="w-full min-w-[1400px] text-base">
          <thead className="bg-gray-800">
            <tr>
              {[
                "Name",
                "Email",
                "Password",
                "Balance",
                "Wallet Address",
                "Referral",
                "Plan",
                "Limit",
                "Joined",
                "Action",
              ].map((h) => (
                <th key={h} className="px-4 py-4 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {currentData.map((user) => (
              <tr key={user._id} className="hover:bg-gray-800/60">
                <td className="px-4 py-4 font-semibold">{user.name}</td>
                <td className="px-4 py-4 text-gray-400">{user.email}</td>

                <td className="px-4 py-4">
                  <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded font-mono text-sm">
                    {user.password?.startsWith('$2') ? '------' : (user.password || '••••')}
                  </span>
                </td>

                <td className="px-4 py-4 text-emerald-400 font-bold">
                  ${user.balance || 0}
                </td>

                {/* WALLET FIX */}
                <td className="px-4 py-4 text-sm font-mono text-gray-400 max-w-[320px] break-all">
                  <span className="hidden lg:inline">
                    {user.walletAddress || "N/A"}
                  </span>
                  <span className="lg:hidden">
                    {user.walletAddress
                      ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                      : "N/A"}
                  </span>
                </td>

                <td className="px-4 py-4 font-mono text-green-300">
                  {user.referralCode || "N/A"}
                </td>

                <td className="px-4 py-4 capitalize">
                  {user.currentPlan || "basic"}
                </td>

                <td className="px-4 py-4 text-emerald-400 font-bold">
                  {user.currentPlan === 'premium' ? '∞' : `$${user.purchaseLimit || 0}`}
                </td>

                <td className="px-4 py-4 text-gray-400">
                  <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleTimeString()}</div>
                </td>

                <td className="px-4 py-4">
                  <button
                    onClick={() => handleView(user)}
                    className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-gray-400 text-sm">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-gray-800 text-white px-2 py-1 rounded-lg outline-none cursor-pointer text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={filteredUsers.length}>All</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaChevronLeft /> Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE CARDS ===== */}
      <div className="md:hidden space-y-4">
        {currentData.map((user) => (
          <div
            key={user._id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2"
          >
            <h3 className="font-bold">{user.name}</h3>
            <p className="text-gray-400 text-sm">{user.email}</p>

            <p className="text-xs font-mono break-all">
              💼 {user.walletAddress || "N/A"}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-emerald-400 font-bold">
                <FaWallet className="inline" /> ${user.balance || 0}
              </span>
              <button
                onClick={() => handleView(user)}
                className="px-4 py-1 bg-indigo-600 rounded-lg text-sm"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

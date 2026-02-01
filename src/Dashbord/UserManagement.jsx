import {
  FaSearch,
  FaUserCircle,
  FaWallet,
  FaChartLine,
  FaShieldAlt,
  FaEye,
  FaBan,
  FaCheck,
  FaExchangeAlt,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const response = await axios.get(
        `${API_URL}api/admin/users`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const userData =
        response.data.users || response.data.data || response.data;
      const usersArray = Array.isArray(userData) ? userData : [userData];
      
      // Sort users by creation date - newest first
      const sortedUsers = usersArray.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.joinedDate || 0);
        const dateB = new Date(b.createdAt || b.joinedDate || 0);
        return dateB - dateA; // Newest first
      });
      
      setUsers(sortedUsers);
    } catch (err) {
      console.error("Fetch users error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch users";
      Swal.fire("Error", errorMessage, "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user) => {
    Swal.fire({
      title: user.name,
      html: `
        <div style="text-align:left">
          <p><b>Email:</b> ${user.email}</p>
          <p><b>Mobile:</b> ${user.mobile || "N/A"}</p>
          <p><b>Balance:</b> $${user.balance}</p>
          <p><b>Level:</b> ${user.level || 0}</p>
          <p><b>Status:</b> ${user.isActive ? "Active" : "Inactive"}</p>
          <p><b>Can Trade:</b> ${user.canTrade ? "Yes" : "No"}</p>
          <p><b>Can Withdraw:</b> ${user.canWithdraw ? "Yes" : "No"}</p>
          <p><b>Referral Code:</b> ${user.referralCode || "N/A"}</p>
          <p><b>Total Earnings:</b> $${user.totalEarnings || 0}</p>
        </div>
      `,
      confirmButtonColor: "#6366f1",
    });
  };





  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mobile?.includes(searchTerm),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-200">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <FaUserCircle className="text-indigo-500" />
            User Management
          </h1>
          <p className="text-gray-400 mt-1">Admin control & overview</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-gray-900/70 border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
        <FaSearch className="text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="flex-1 bg-transparent outline-none text-gray-200"
        />
      </div>

      {/* ===== DESKTOP / TABLET TABLE ===== */}
      <div className="hidden md:block bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <FaShieldAlt className="text-indigo-400" />
          <h3 className="font-bold text-xl">Users ({filteredUsers.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-lg">
            <thead className="bg-gray-800/70">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Mobile",
                  "Balance",
                  "Level",
                  "Status",
                  "Trading",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-800/60">
                  <td className="px-6 py-4 font-semibold text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{user.email}</td>
                  <td className="px-6 py-4">{user.mobile}</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">
                    <FaWallet className="inline" /> ${user.balance}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-600/20 rounded-full text-xs">
                      L{user.level || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        user.isActive
                          ? "bg-emerald-600/20 text-emerald-300"
                          : "bg-red-600/20 text-red-300"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        user.canTrade
                          ? "bg-emerald-600/20 text-emerald-300"
                          : "bg-red-600/20 text-red-300"
                      }`}
                    >
                      {user.canTrade ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(user)}
                        className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MOBILE CARD VIEW ===== */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">{user.name}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  user.isActive
                    ? "bg-emerald-600/20 text-emerald-300"
                    : "bg-red-600/20 text-red-300"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="text-gray-400 text-sm">{user.email}</p>
            <p className="text-sm">📞 {user.mobile}</p>

            <div className="flex justify-between items-center">
              <p className="text-emerald-400 font-bold">
                <FaWallet className="inline" /> ${user.balance}
              </p>
              <span className="px-3 py-1 bg-indigo-600/20 rounded-full text-xs">
                Level {user.level || 0}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span
                className={`px-2 py-1 rounded-full ${
                  user.canTrade
                    ? "bg-emerald-600/20 text-emerald-300"
                    : "bg-red-600/20 text-red-300"
                }`}
              >
                Trading: {user.canTrade ? "On" : "Off"}
              </span>
              <span
                className={`px-2 py-1 rounded-full ${
                  user.canWithdraw
                    ? "bg-emerald-600/20 text-emerald-300"
                    : "bg-red-600/20 text-red-300"
                }`}
              >
                Withdraw: {user.canWithdraw ? "On" : "Off"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleView(user)}
                className="py-2 bg-indigo-600 rounded-xl text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

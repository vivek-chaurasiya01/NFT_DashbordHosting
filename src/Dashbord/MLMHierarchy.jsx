import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaNetworkWired,
  FaUsers,
  FaEye,
  FaTree,
  FaChartLine,
  FaWallet,
  FaUserCheck,
  FaUserTimes,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
const API_URL = import.meta.env.VITE_API_URL;
export default function MLMHierarchy() {
  const [hierarchyData, setHierarchyData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchHierarchyData();
  }, []);

  const fetchHierarchyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire("Error", "No authentication token found", "error");
        return;
      }

      // Fetch all hierarchy data
      const response = await axios.get(`${API_URL}api/mlm/hierarchy`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data;
      const hierarchy = data.hierarchy || [];

      // Sort hierarchy by creation date - newest first
      const sortedHierarchy = hierarchy.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.joinedDate || 0);
        const dateB = new Date(b.createdAt || b.joinedDate || 0);
        return dateB - dateA; // Newest first
      });

      setHierarchyData(sortedHierarchy);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Error fetching hierarchy:", error);

      // Fallback to user data if hierarchy API fails
      try {
        const usersResponse = await axios.get(`${API_URL}api/auth/Getuser`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const users = Array.isArray(usersResponse.data.data)
          ? usersResponse.data.data
          : Array.isArray(usersResponse.data)
            ? usersResponse.data
            : [];

        // Process users into hierarchy format
        const processedHierarchy = users.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          referralCode: user.referralCode || "N/A",
          isActive: user.isActive,
          balance: user.balance || 0,
          parent: user.parentId
            ? users.find((u) => u._id === user.parentId)
            : null,
          children: users.filter((u) => u.parentId === user._id),
          hasParent: !!user.parentId,
          childrenCount: users.filter((u) => u.parentId === user._id).length,
          isRootUser: !user.parentId,
          createdAt: user.createdAt || user.joinedDate,
        }));

        // Sort by creation date - newest first
        const sortedHierarchy = processedHierarchy.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Newest first
        });

        setHierarchyData(sortedHierarchy);
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.isActive).length,
          rootUsers: users.filter((u) => !u.parentId).length,
          usersWithChildren: processedHierarchy.filter(
            (u) => u.childrenCount > 0,
          ).length,
        });
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        Swal.fire("Error", "Failed to fetch hierarchy data", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTree = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      // Try to fetch complete user tree
      const response = await axios.get(
        `${API_URL}api/mlm/user-tree/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      showUserTreeModal(response.data.data);
    } catch (error) {
      console.error("Error fetching user tree:", error);

      // Fallback: build tree from existing hierarchy data
      const user = hierarchyData.find((u) => u.id === userId);
      if (!user) {
        Swal.fire("Error", "User not found", "error");
        return;
      }

      // Build upline chain
      const upline = [];
      let currentParent = user.parent;
      let level = 1;
      while (currentParent && level <= 10) {
        // Prevent infinite loop
        upline.push({
          level,
          name: currentParent.name,
          email: currentParent.email,
          referralCode: currentParent.referralCode,
        });
        currentParent = hierarchyData.find(
          (u) => u.id === currentParent.parent?.id,
        )?.parent;
        level++;
      }

      // Get downline with nested children
      const buildDownline = (parentId, currentLevel = 1) => {
        const directChildren = hierarchyData.filter(
          (u) => u.parent?.id === parentId,
        );
        return directChildren.map((child) => ({
          level: currentLevel,
          name: child.name,
          email: child.email,
          referralCode: child.referralCode,
          children: buildDownline(child.id, currentLevel + 1),
        }));
      };

      const downline = buildDownline(userId);

      const treeData = {
        user: {
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
        },
        upline,
        downline,
        stats: {
          parentCount: upline.length,
          directChildren: user.childrenCount,
          totalDownline:
            downline.length +
            downline.reduce(
              (sum, child) => sum + (child.children?.length || 0),
              0,
            ),
        },
      };

      showUserTreeModal(treeData);
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}api/mlm/user-stats/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const stats = response.data.data;

      Swal.fire({
        title: `📊 ${stats.userName} Stats`,
        html: `
          <div style="text-align: left; padding: 20px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #333;">📈 Network Statistics</h4>
              <p><strong>Parent Count:</strong> ${stats.parentCount}</p>
              <p><strong>Direct Children:</strong> ${stats.directChildren}</p>
              <p><strong>Total Downline:</strong> ${stats.totalDownline}</p>
            </div>
          </div>
        `,
        confirmButtonColor: "#6366f1",
        width: 500,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);

      // Fallback: calculate stats from hierarchy data
      const user = hierarchyData.find((u) => u.id === userId);
      if (user) {
        const parentCount = user.parent ? 1 : 0; // Simplified
        const directChildren = user.childrenCount;
        const totalDownline = hierarchyData.filter(
          (u) => u.parent?.id === userId,
        ).length;

        Swal.fire({
          title: `📊 ${user.name} Stats`,
          html: `
            <div style="text-align: left; padding: 20px;">
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #333;">📈 Network Statistics</h4>
                <p><strong>Parent Count:</strong> ${parentCount}</p>
                <p><strong>Direct Children:</strong> ${directChildren}</p>
                <p><strong>Total Downline:</strong> ${totalDownline}</p>
              </div>
            </div>
          `,
          confirmButtonColor: "#6366f1",
          width: 500,
        });
      }
    }
  };

  const showUserTreeModal = (data) => {
    const { user, upline, downline, stats } = data;

    const createTreeStructure = () => {
      let structure = "";

      // Upline
      if (upline && upline.length > 0) {
        structure += "📈 UPLINE CHAIN:\n";
        upline.reverse().forEach((parent, index) => {
          const indent = "  ".repeat(index);
          structure += `${indent}├── ${parent.name} (${parent.referralCode})\n`;
        });
        structure += "\n";
      }

      // Current user
      structure += "🎯 CURRENT USER:\n";
      structure += `└── ${user.name} (${user.referralCode}) - YOU\n\n`;

      // Downline
      if (downline && downline.length > 0) {
        structure += "📉 DOWNLINE TREE:\n";
        const renderChildren = (children, level = 0) => {
          children.forEach((child, index) => {
            const isLast = index === children.length - 1;
            const indent = "  ".repeat(level);
            const connector = isLast ? "└── " : "├── ";
            structure += `${indent}${connector}${child.name} (${child.referralCode}) - L${child.level}\n`;

            if (child.children && child.children.length > 0) {
              renderChildren(child.children, level + 1);
            }
          });
        };
        renderChildren(downline);
      } else {
        structure += "📉 DOWNLINE TREE:\n└── No referrals yet\n";
      }

      return structure;
    };

    Swal.fire({
      title: `🌳 MY Team: ${user.name}`,
      html: `
        <div style="text-align: left; font-family: monospace; background: #1a1a1a; color: #00ff00; padding: 20px; border-radius: 10px; font-size: 14px; line-height: 1.6; max-height: 500px; overflow-y: auto;">
          <div style="background: #333; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; color: #fff;">
            <h3 style="margin: 0; color: #00ff00;">${user.name}</h3>
            <p style="margin: 5px 0; color: #ccc;">${user.email}</p>
            <p style="margin: 5px 0; color: #ffaa00;">UID: ${user.referralCode}</p>
            <div style="display: flex; justify-content: space-around; margin-top: 15px;">
              <div><strong style="color: #ff6b6b;">${stats?.parentCount || 0}</strong><br><small>Parents</small></div>
              <div><strong style="color: #4ecdc4;">${stats?.directChildren || 0}</strong><br><small>Direct</small></div>
              <div><strong style="color: #45b7d1;">${stats?.totalDownline || 0}</strong><br><small>Total</small></div>
            </div>
          </div>
          <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">${createTreeStructure()}</pre>
        </div>
      `,
      width: 700,
      showCloseButton: true,
      showConfirmButton: false,
      background: "#2a2a2a",
      color: "#fff",
    });
  };

  const filteredHierarchy = hierarchyData.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredHierarchy.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredHierarchy.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaNetworkWired className="text-purple-400" />
            🌳 MY Hierarchy Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Complete MY network visualization
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white p-4 lg:p-6 rounded-2xl shadow-lg border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-slate-300">
                  Total Users
                </p>
                <h3 className="text-2xl lg:text-3xl font-bold mt-2 text-blue-400">
                  {stats.totalUsers || 0}
                </h3>
              </div>
              <FaUsers className="text-2xl lg:text-3xl text-blue-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white p-4 lg:p-6 rounded-2xl shadow-lg border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-slate-300">
                  Active Users
                </p>
                <h3 className="text-2xl lg:text-3xl font-bold mt-2 text-green-400">
                  {stats.activeUsers || 0}
                </h3>
              </div>
              <FaUserCheck className="text-2xl lg:text-3xl text-green-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white p-4 lg:p-6 rounded-2xl shadow-lg border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-slate-300">
                  Root Users
                </p>
                <h3 className="text-2xl lg:text-3xl font-bold mt-2 text-purple-400">
                  {stats.rootUsers || 0}
                </h3>
              </div>
              <FaTree className="text-2xl lg:text-3xl text-purple-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white p-4 lg:p-6 rounded-2xl shadow-lg border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-slate-300">
                  With Children
                </p>
                <h3 className="text-2xl lg:text-3xl font-bold mt-2 text-yellow-400">
                  {stats.usersWithChildren || 0}
                </h3>
              </div>
              <FaChartLine className="text-2xl lg:text-3xl text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center gap-4">
          <FaSearch className="text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, or referral code..."
            className="flex-1 bg-transparent outline-none text-white placeholder-slate-400"
          />
        </div>

        {/* Hierarchy Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-2">
            <FaNetworkWired className="text-purple-400" />
            <h3 className="font-bold text-xl text-white">
              My Hierarchy ({filteredHierarchy.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700">
                <tr>
                  {[
                    "Name",
                    "Email",
                    "Referral Code",
                    "Parent",
                    "Children",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-white font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {currentData.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-semibold text-white">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{user.email}</td>
                    <td className="px-6 py-4 text-yellow-400 font-mono">
                      {user.referralCode}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {user.parent ? (
                        user.parent.name
                      ) : user.hasParent ? (
                        "Has Parent"
                      ) : (
                        <span className="text-purple-400 font-semibold">
                          ROOT
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                        {user.childrenCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          user.isActive
                            ? "bg-green-600/20 text-green-300"
                            : "bg-red-600/20 text-red-300"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => fetchUserTree(user.id)}
                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        title="View Tree"
                      >
                        <FaTree className="text-white" />
                      </button>
                      <button
                        onClick={() => fetchUserStats(user.id)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        title="View Stats"
                      >
                        <FaChartLine className="text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-slate-400 text-sm">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredHierarchy.length)} of {filteredHierarchy.length} users
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-slate-700 text-white px-2 py-1 rounded-lg outline-none cursor-pointer text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={filteredHierarchy.length}>All</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                            ? "bg-purple-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

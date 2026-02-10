import { useState } from "react";
import {
  FaTree,
  FaUsers,
  FaGem,
  FaMoneyBillWave,
  FaUserCheck,
  FaChevronDown,
  FaChevronUp,
  FaShoppingCart,
  FaLayerGroup,
  FaSearch,
  FaFilter,
  FaChartBar,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function NFTTreeAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [viewMode, setViewMode] = useState("chart"); // chart or list
  const [filterActive, setFilterActive] = useState("all"); // all, active, inactive

  const fetchTreeData = async (searchQuery) => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("superAdminToken");

      const response = await axios.post(
        `${API_URL}api/nft-analytics/user-nft-tree-analysis`,
        { search: searchQuery },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setData(response.data);
        // Expand first 2 levels by default
        const initialExpanded = {};
        response.data.levelWiseData.slice(0, 2).forEach((level) => {
          initialExpanded[level.level] = true;
        });
        setExpandedLevels(initialExpanded);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch NFT tree data",
        background: "#1f2937",
        color: "white",
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      fetchTreeData(query);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Search Required",
        text: "Please enter name, email, or referral code to search",
        background: "#1f2937",
        color: "white",
      });
    }
  };

  const toggleLevel = (level) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  const getFilteredData = () => {
    if (!data) return null;
    
    if (filterActive === "all") return data;
    
    const filtered = {
      ...data,
      levelWiseData: data.levelWiseData.map(level => {
        const filteredChildren = level.children.filter(child => 
          filterActive === "active" ? child.isActive : !child.isActive
        );
        return {
          ...level,
          children: filteredChildren,
          totalChildren: filteredChildren.length
        };
      }).filter(level => level.children.length > 0)
    };
    return filtered;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaTree className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  NFT Tree Analysis
                </h1>
                <p className="text-blue-100 mt-1">
                  Search & Analyze User Data
                </p>
              </div>
            </div>
            {data && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("chart")}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    viewMode === "chart"
                      ? "bg-white text-purple-600"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <FaChartBar />
                  Chart
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    viewMode === "list"
                      ? "bg-white text-purple-600"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <FaLayerGroup />
                  List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 shadow-lg">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search: Arjun Singh, TU7WKG, or email..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={!searchInput.trim() || loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch />
                  Search
                </>
              )}
            </button>
          </form>
        </div>

        {/* Data Display */}
        {data && (
          <>
            {/* User Info & Filter */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {data.user.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{data.user.name}</h2>
                    <p className="text-blue-400 font-mono">{data.user.referralCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Cards with Animation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <FaUsers className="text-3xl opacity-80" />
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    Total
                  </span>
                </div>
                <h3 className="text-3xl font-bold">{data.summary.totalChildren}</h3>
                <p className="text-blue-100 text-sm mt-1">Total Children</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <FaGem className="text-3xl opacity-80" />
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    NFTs
                  </span>
                </div>
                <h3 className="text-3xl font-bold">{data.summary.totalNFTs}</h3>
                <p className="text-purple-100 text-sm mt-1">Total NFTs Purchased</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <FaMoneyBillWave className="text-3xl opacity-80" />
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    Investment
                  </span>
                </div>
                <h3 className="text-3xl font-bold">
                  ${data.summary.totalInvestment}
                </h3>
                <p className="text-emerald-100 text-sm mt-1">Total Investment</p>
              </div>

              <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <FaUserCheck className="text-3xl opacity-80" />
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <h3 className="text-3xl font-bold">
                  {data.summary.activeChildren}
                </h3>
                <p className="text-amber-100 text-sm mt-1">Active Children</p>
              </div>
            </div>

            {/* Chart or List View */}
            {viewMode === "chart" ? (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaChartBar className="text-blue-400" />
                  Level Distribution Chart
                </h2>
                <div className="space-y-4">
                  {data && data.levelWiseData && data.levelWiseData.length > 0 ? (
                    data.levelWiseData.map((level) => {
                      const maxChildren = Math.max(...data.levelWiseData.map(l => l.totalChildren));
                      const percentage = (level.totalChildren / maxChildren) * 100;
                      return (
                        <div key={level.level} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white font-semibold">Level {level.level}</span>
                            <span className="text-gray-400">{level.totalChildren} users • ${level.totalInvestment}</span>
                          </div>
                          <div className="relative h-12 bg-gray-900 rounded-lg overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg transition-all duration-1000 ease-out flex items-center justify-between px-4"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-white font-bold text-sm">L{level.level}</span>
                              <span className="text-white font-bold text-sm">{level.totalNFTs} NFTs</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-center py-8">No data available</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaLayerGroup className="text-blue-400" />
                  Level-wise Breakdown
                </h2>
                <div className="space-y-4">
                  {data && data.levelWiseData && data.levelWiseData.length > 0 ? (
                    data.levelWiseData.map((level) => (
                    <div
                      key={level.level}
                      className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all"
                    >
                    {/* Level Header */}
                    <div
                      onClick={() => toggleLevel(level.level)}
                      className="p-4 cursor-pointer hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-900 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                          L{level.level}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            Level {level.level}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {level.children.length} Children • {level.totalNFTs} NFTs
                            • ${level.totalInvestment}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                            {level.children.length} Users
                          </span>
                          <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                            {level.totalNFTs} NFTs
                          </span>
                        </div>
                        {expandedLevels[level.level] ? (
                          <FaChevronUp className="text-gray-400" />
                        ) : (
                          <FaChevronDown className="text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Children List */}
                    {expandedLevels[level.level] && level.children && level.children.length > 0 && (
                      <div className="p-4 bg-gray-800/50 border-t border-gray-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {level.children.map((child) => (
                            <div
                              key={child.userId}
                              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 hover:shadow-lg transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                    {child.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-white">
                                      {child.name}
                                    </h4>
                                    <p className="text-gray-400 text-xs">
                                      {child.email}
                                    </p>
                                    <p className="text-blue-400 text-xs font-mono">
                                      {child.referralCode}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    child.isActive
                                      ? "bg-green-600/20 text-green-300"
                                      : "bg-red-600/20 text-red-300"
                                  }`}
                                >
                                  {child.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-gray-800 rounded p-2 text-center">
                                  <FaGem className="text-purple-400 mx-auto mb-1" />
                                  <p className="text-white font-bold">
                                    {child.nftCount}
                                  </p>
                                  <p className="text-gray-400 text-xs">NFTs</p>
                                </div>
                                <div className="bg-gray-800 rounded p-2 text-center">
                                  <FaMoneyBillWave className="text-emerald-400 mx-auto mb-1" />
                                  <p className="text-white font-bold">
                                    ${child.totalInvestment}
                                  </p>
                                  <p className="text-gray-400 text-xs">Invested</p>
                                </div>
                                <div className="bg-gray-800 rounded p-2 text-center">
                                  <FaShoppingCart className="text-blue-400 mx-auto mb-1" />
                                  <p className="text-white font-bold">
                                    {child.purchases.length}
                                  </p>
                                  <p className="text-gray-400 text-xs">Purchases</p>
                                </div>
                              </div>

                              {child.purchases.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-gray-400 text-xs font-semibold">
                                    Recent Purchases:
                                  </p>
                                  {child.purchases
                                    .slice(0, 2)
                                    .map((purchase, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-gray-800 rounded p-2 flex items-center justify-between"
                                      >
                                        <div>
                                          <p className="text-white text-xs font-mono">
                                            {purchase.nftId}
                                          </p>
                                          <p className="text-gray-400 text-xs">
                                            {new Date(
                                              purchase.date,
                                            ).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-emerald-400 font-bold text-sm">
                                            ${purchase.price}
                                          </p>
                                          <span className="text-xs px-2 py-0.5 bg-blue-600/20 text-blue-300 rounded">
                                            {purchase.holdStatus}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No data available</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

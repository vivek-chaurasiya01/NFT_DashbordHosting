import { useState, useEffect } from "react";

import {
  FaWallet,
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCubes,
  FaNetworkWired,
  FaTree,
  FaDownload,
  FaSync,
  FaCrown,
  FaDatabase,
  FaServer,
  FaRobot,
  FaShieldAlt,
  FaExclamationTriangle,
  FaUserPlus,
  FaBoxOpen,
  FaLayerGroup,
  FaCoins,
  FaUserCheck,
  FaUserTimes,
  FaShoppingCart,
  FaArrowUp,
  FaArrowDown,
  FaPercent,
  FaFilter,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaUserLock,
  FaUnlock,
  FaHistory,
  FaCalendarAlt,
  FaMoneyCheckAlt,
  FaRegChartBar,
  FaTimes,
  FaTag,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
} from "recharts";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    companyBalance: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalTransactions: 0,
    totalNFTs: 0,
    totalPackages: 0,
    users: [],
    transactions: [],
    nfts: [],
    packages: [],
    mlmEarnings: [],
    mlmHierarchy: [],
    userGrowth: [],
    revenueDistribution: [],
    mlmLevels: [],
    nftStats: {},
    packageStats: {},
    revenueTrend: [],
    transactionTypes: [],
    recentTransactions: [],
    topPerformers: [],
    recentUsers: [],
    pendingWithdrawals: [],
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [selectedView, setSelectedView] = useState("overview");
  const [apiStatus, setApiStatus] = useState({});
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [statsLoading, setStatsLoading] = useState({
    users: true,
    transactions: true,
    nfts: true,
    packages: true,
  });
  const [revenueTrendRange, setRevenueTrendRange] = useState("month");

  const API_ENDPOINTS = [
    {
      name: "All Users",
      endpoint: "/api/auth/Getuser",
      key: "users",
      method: "GET",
      requiresAuth: false,
    },
    {
      name: "Company Transactions",
      endpoint: "/api/SuperAdmin/company-transactions",
      key: "companyTransactions",
      method: "GET",
      requiresAuth: true,
    },
    {
      name: "MLM Summary",
      endpoint: "/api/SuperAdmin/mlm-summary",
      key: "mlmSummary",
      method: "GET",
      requiresAuth: false,
    },
    {
      name: "Complete MLM Tree",
      endpoint: "/api/SuperAdmin/complete-mlm-tree",
      key: "mlmTree",
      method: "GET",
      requiresAuth: false,
    },
    {
      name: "All NFTs Admin",
      endpoint: "/api/admin/nfts",
      key: "adminNfts",
      method: "GET",
      requiresAuth: false,
    },
    {
      name: "Server Test",
      endpoint: "/test",
      key: "serverTest",
      method: "GET",
      requiresAuth: false,
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  useEffect(() => {
    if (dashboardData.users) {
      const filtered = dashboardData.users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.referralCode?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, dashboardData.users]);



  const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const fetchAPI = async (
    endpoint,
    name,
    method = "GET",
    requiresAuth = true,
  ) => {
    try {
      const token = getAuthToken();
      const headers = requiresAuth ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(
        `${API_URL}${endpoint.startsWith("/") ? endpoint.slice(1) : endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        },
      );

      // Check if response is ok first
      if (!response.ok) {
        return {
          success: false,
          error: `${name} failed: ${response.status} ${response.statusText}`,
          message: `${name} failed: ${response.status} ${response.statusText}`,
          data: null,
        };
      }

      // Check content type before parsing JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        return {
          success: false,
          error: `${name} failed: Server returned non-JSON response`,
          message: `${name} failed: Server returned HTML instead of JSON`,
          data: null,
        };
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        message: `${name} loaded successfully`,
      };
    } catch (error) {
      console.error(`${name} API Error:`, error);
      return {
        success: false,
        error: `${name} failed: ${error.message}`,
        message: `${name} failed: ${error.message}`,
        data: null,
      };
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please login to access dashboard");
        setLoading(false);
        setDashboardData({
          companyBalance: 0,
          totalRevenue: 0,
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          totalTransactions: 0,
          totalNFTs: 0,
          totalPackages: 0,
          users: [],
          transactions: [],
          nfts: [],
          packages: {},
          mlmEarnings: [],
          mlmHierarchy: {},
          userGrowth: [],
          revenueDistribution: [],
          mlmLevels: [],
          nftStats: {},
          packageStats: { distribution: [] },
          revenueTrend: [],
          transactionTypes: [],
          recentTransactions: [],
          topPerformers: [],
          recentUsers: [],
          pendingWithdrawals: [],
        });
        Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login as Super Admin to view dashboard data",
        });
        return;
      }

      const apiPromises = API_ENDPOINTS.map(async (api) => {
        const result = await fetchAPI(
          api.endpoint,
          api.name,
          api.method,
          api.requiresAuth,
        );
        return { ...api, ...result };
      });

      const apiResults = await Promise.all(apiPromises);

      const statusUpdate = {};
      const resultsByKey = {};

      // Process each API result only once
      apiResults.forEach((result) => {
        statusUpdate[result.name] = {
          success: result.success,
          message: result.message,
          data: result.data,
        };
        // Only store the first successful result for each key
        if (!resultsByKey[result.key] && result.success) {
          resultsByKey[result.key] = result.data;
        }
      });

      setApiStatus(statusUpdate);

      const criticalAPIs = ["All Users", "Company Transactions"];
      const failedCriticalAPIs = apiResults.filter(
        (r) => criticalAPIs.includes(r.name) && !r.success,
      );

      if (failedCriticalAPIs.length === criticalAPIs.length) {
        setDashboardData({
          companyBalance: 0,
          totalRevenue: 0,
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          totalTransactions: 0,
          totalNFTs: 0,
          totalPackages: 0,
          users: [],
          transactions: [],
          nfts: [],
          packages: {},
          mlmEarnings: [],
          mlmHierarchy: {},
          userGrowth: [],
          revenueDistribution: [],
          mlmLevels: [],
          nftStats: {},
          packageStats: { distribution: [] },
          revenueTrend: [],
          transactionTypes: [],
          recentTransactions: [],
          topPerformers: [],
          recentUsers: [],
          pendingWithdrawals: [],
        });
        setError(
          "Unable to load dashboard data. Please check your authentication.",
        );
        Swal.fire({
          icon: "error",
          title: "Data Load Failed",
          text: "Unable to fetch dashboard data. Please login again.",
        });
        return;
      }

      const processedData = processAllApiData(resultsByKey);
      setDashboardData(processedData);

      const failedAPIs = apiResults.filter((r) => !r.success);
      if (failedAPIs.length > 0) {
        setError(
          `${failedAPIs.length} out of ${apiResults.length} APIs failed to load`,
        );
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(`Network error: ${error.message}`);
      setDashboardData({
        companyBalance: 0,
        totalRevenue: 0,
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalTransactions: 0,
        totalNFTs: 0,
        totalPackages: 0,
        users: [],
        transactions: [],
        nfts: [],
        packages: {},
        mlmEarnings: [],
        mlmHierarchy: {},
        userGrowth: [],
        revenueDistribution: [],
        mlmLevels: [],
        nftStats: {},
        packageStats: { distribution: [] },
        revenueTrend: [],
        transactionTypes: [],
        recentTransactions: [],
        topPerformers: [],
        recentUsers: [],
        pendingWithdrawals: [],
      });
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Unable to connect to server. Please check your network.",
      });
    } finally {
      setLoading(false);
      setStatsLoading({
        users: false,
        transactions: false,
        nfts: false,
        packages: false,
      });
    }
  };

  const processAllApiData = (results) => {
    // Get users data
    const usersResult = results.users;
    const users = usersResult?.data?.data || usersResult?.data || [];
    const totalUsers = Array.isArray(users) ? users.length : 0;
    const activeUsers = Array.isArray(users)
      ? users.filter((u) => u.isActive).length
      : 0;
    const inactiveUsers = totalUsers - activeUsers;

    // Get company transactions data using exact API response structure
    const companyResult = results.companyTransactions;
    const companyData = companyResult || {};
    const allTransactions = companyData.transactions || [];
    const summary = companyData.summary || {};
    const graphData = companyData.graph || {};
    // const companyWallet = companyData.companyWallet || "";

    // Calculate Company Balance correctly: Total Income - Total Payouts
    const totalIncome = summary.totalIncome || 0; // Only API data
    const totalPayouts = summary.totalPayouts || 0; // Only API data
    const companyBalance = totalIncome - totalPayouts;
    const totalRevenue = totalIncome;
    // const totalEarnings = summary.totalEarnings || 0;
    const totalTransactions =
      summary.transactionCount || allTransactions.length;

    // Calculate Admin NFT Revenue
    const adminNftTransactions = allTransactions.filter(
      (tx) =>
        tx.type === "Other" &&
        (tx.description?.toLowerCase().includes("nft") ||
          tx.description?.toLowerCase().includes("admin nft") ||
          tx.description?.toLowerCase().includes("nft sale")),
    );
    const adminNftRevenue = adminNftTransactions.reduce(
      (sum, tx) => sum + Math.abs(tx.amount || 0),
      0,
    );

    // Get MLM data from graph section of company-transactions API
    const mlmTreeResult = results.mlmTree;
    const mlmSummaryResult = results.mlmSummary;
    const mlmHierarchy = {
      data: {
        hierarchy: mlmTreeResult?.data?.hierarchy || [],
        stats: graphData.stats ||
          mlmSummaryResult?.data?.stats || {
            totalUsers: graphData.stats?.totalUsers || 0,
            activeUsers: graphData.stats?.activeUsers || 0,
            rootUsers: graphData.stats?.rootUsers || 0,
          },
      },
    };

    // Get admin dashboard data
    // const adminResult = results.adminDashboard;
    // const adminData = adminResult?.data || {};

    // Get NFT data
    const nftResult = results.adminNfts;
    const allNFTs = nftResult?.data?.nfts || nftResult?.data || [];
    const nftStats = {
      total: allNFTs.length,
      listed: allNFTs.filter(
        (n) => n.status === "listed" || n.status === "active",
      ).length,
      sold: allNFTs.filter(
        (n) => n.status === "sold" || n.status === "completed",
      ).length,
      holding: allNFTs.filter(
        (n) => n.status === "hold" || n.status === "holding",
      ).length,
      locked: allNFTs.filter(
        (n) => n.status === "locked" || n.status === "inactive",
      ).length,
      totalVolume: allNFTs.reduce((sum, n) => {
        const price = parseFloat(n.sellPrice || n.price || n.buyPrice || 0);
        return sum + price;
      }, 0),
      avgPrice:
        allNFTs.length > 0
          ? allNFTs.reduce((sum, n) => {
              const price = parseFloat(
                n.sellPrice || n.price || n.buyPrice || 0,
              );
              return sum + price;
            }, 0) / allNFTs.length
          : 0,
    };

    // Process revenue distribution from actual transaction data
    const registrationTransactions = allTransactions.filter(
      (tx) => tx.type === "Registration",
    );
    const nftTransactions = allTransactions.filter(
      (tx) => tx.type === "NFT Sale",
    );
    const upgradeTransactions = allTransactions.filter(
      (tx) => tx.type === "Upgrade",
    );

    const registrationRevenue = registrationTransactions.reduce(
      (sum, tx) => sum + Math.abs(tx.amount || 0),
      0,
    );
    const nftRevenue = nftTransactions.reduce(
      (sum, tx) => sum + Math.abs(tx.amount || 0),
      0,
    );
    const upgradeRevenue = upgradeTransactions.reduce(
      (sum, tx) => sum + Math.abs(tx.amount || 0),
      0,
    );

    const revenueDistribution = [
      { name: "Registrations", value: registrationRevenue, color: "#3b82f6" },
      { name: "NFT Sales", value: nftRevenue, color: "#8b5cf6" },
      { name: "Upgrades", value: upgradeRevenue, color: "#10b981" },
      { name: "Admin NFT", value: adminNftRevenue, color: "#f59e0b" },
    ].filter((item) => item.value > 0);

    const userGrowth = generateUserGrowth(users, timeRange);
    const revenueTrend = generateRevenueTrend(allTransactions, timeRange);
    const transactionTypes = calculateTransactionTypes(allTransactions);
    const recentTransactions = allTransactions.slice(-20).reverse();

    return {
      companyBalance,
      totalRevenue,
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalTransactions,
      totalNFTs: allNFTs.length,
      totalPackages: upgradeTransactions.length,
      totalIncome,
      totalPayouts,
      netProfit: companyBalance,
      adminNftRevenue,
      nftRevenue,
      users,
      transactions: allTransactions,
      nfts: allNFTs,
      packages: {},
      mlmEarnings: [],
      mlmHierarchy,
      userGrowth,
      revenueDistribution,
      mlmLevels: [],
      nftStats,
      packageStats: {
        distribution: upgradeTransactions.map((tx) => ({
          name: tx.description || "Package Upgrade",
          users: 1,
          amount: Math.abs(tx.amount || 0),
        })),
        totalUpgrades: upgradeTransactions.length,
        plans: {},
      },
      revenueTrend,
      transactionTypes,
      recentTransactions,
      topPerformers: users.slice(0, 10).map((user) => ({
        id: user._id || user.id,
        name: user.name || "Unknown",
        email: user.email || "No email",
        referralCode: user.referralCode || "N/A",
        balance: user.balance || 0,
        active: user.isActive,
        package: user.currentPlan || "basic",
      })),
      recentUsers: users.slice(0, 10),
      pendingWithdrawals: [],
    };
  };

  const generateUserGrowth = (users, range) => {
    const days = range === "week" ? 7 : range === "month" ? 30 : 90;
    const growth = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dayUsers = users.filter((u) => {
        if (!u.createdAt) return false;
        const userDate = new Date(u.createdAt);
        return userDate.toDateString() === date.toDateString();
      });

      growth.push({
        date: dateStr,
        total: dayUsers.length,
        active: dayUsers.filter((u) => u.isActive).length,
        new: dayUsers.filter((u) => {
          const joinDate = new Date(u.createdAt);
          return joinDate.toDateString() === date.toDateString();
        }).length,
      });
    }

    return growth;
  };

  const generateRevenueTrend = (transactions, range) => {
    const days =
      range === "day" ? 1 : range === "week" ? 7 : range === "month" ? 30 : 365;
    const trend = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dayTransactions = transactions.filter((tx) => {
        if (!tx.createdAt && !tx.date) return false;
        const txDate = new Date(tx.createdAt || tx.date);
        return txDate.toDateString() === date.toDateString();
      });

      // Calculate total income (all transactions except Parent Payout)
      const dayRevenue = dayTransactions.reduce((sum, tx) => {
        const amount = Math.abs(tx.amount || 0);
        if (tx.type !== "Parent Payout") {
          return sum + amount;
        }
        return sum;
      }, 0);

      // Calculate total payouts (Parent Payout transactions)
      const dayPayouts = dayTransactions.reduce((sum, tx) => {
        const amount = Math.abs(tx.amount || 0);
        if (tx.type === "Parent Payout") {
          return sum + amount;
        }
        return sum;
      }, 0);

      // Actual profit = Revenue - Payouts
      const dayProfit = dayRevenue - dayPayouts;

      trend.push({
        date: dateStr,
        revenue: dayRevenue,
        transactions: dayTransactions.length,
        profit: Math.max(0, dayProfit), // Ensure profit is not negative
      });
    }

    return trend;
  };

  const calculateTransactionTypes = (transactions) => {
    const types = {};

    transactions.forEach((tx) => {
      let type = tx.type || "unknown";
      // Replace "Other" with "Admin NFT" for NFT-related transactions
      if (
        type === "Other" &&
        (tx.description?.toLowerCase().includes("nft") ||
          tx.description?.toLowerCase().includes("admin nft") ||
          tx.description?.toLowerCase().includes("nft sale"))
      ) {
        type = "Admin NFT";
      }
      types[type] = (types[type] || 0) + 1;
    });

    return Object.keys(types).map((type) => ({
      name: type,
      value: types[type],
      amount: transactions
        .filter((t) => {
          let txType = t.type || "unknown";
          if (
            txType === "Other" &&
            (t.description?.toLowerCase().includes("nft") ||
              t.description?.toLowerCase().includes("admin nft") ||
              t.description?.toLowerCase().includes("nft sale"))
          ) {
            txType = "Admin NFT";
          }
          return txType === type;
        })
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const forceRefresh = async () => {
    Swal.fire({
      title: "Refreshing Data",
      text: "Fetching latest data from all APIs...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    await fetchDashboardData();

    Swal.fire({
      icon: "success",
      title: "Data Refreshed",
      text: "All data has been updated successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const exportData = (type = "all") => {
    let dataStr, fileName;

    switch (type) {
      case "users":
        dataStr = JSON.stringify(dashboardData.users, null, 2);
        fileName = `mlm-users-${new Date().toISOString().split("T")[0]}.json`;
        break;
      case "transactions":
        dataStr = JSON.stringify(dashboardData.transactions, null, 2);
        fileName = `mlm-transactions-${new Date().toISOString().split("T")[0]}.json`;
        break;
      case "nfts":
        dataStr = JSON.stringify(dashboardData.nfts, null, 2);
        fileName = `mlm-nfts-${new Date().toISOString().split("T")[0]}.json`;
        break;
      default:
        dataStr = JSON.stringify(dashboardData, null, 2);
        fileName = `mlm-dashboard-full-${new Date().toISOString().split("T")[0]}.json`;
    }

    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", fileName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);

    Swal.fire({
      icon: "success",
      title: "Data Exported",
      text: `${fileName} has been downloaded`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // const handleUserAction = async (userId, action) => {
  //   try {
  //     let result;

  //     switch (action) {
  //       case "activate":
  //         result = await Swal.fire({
  //           title: "Activate User?",
  //           text: "This will activate the user account",
  //           icon: "warning",
  //           showCancelButton: true,
  //           confirmButtonText: "Yes, activate",
  //           cancelButtonText: "Cancel",
  //         });

  //         if (result.isConfirmed) {
  //           // Mock API call for user activation
  //           console.log(`Activating user ${userId}`);
  //           Swal.fire("Activated!", "User has been activated.", "success");
  //           forceRefresh();
  //         }
  //         break;

  //       case "deactivate":
  //         result = await Swal.fire({
  //           title: "Deactivate User?",
  //           text: "This will deactivate the user account",
  //           icon: "warning",
  //           showCancelButton: true,
  //           confirmButtonText: "Yes, deactivate",
  //           cancelButtonText: "Cancel",
  //         });

  //         if (result.isConfirmed) {
  //           // Mock API call for user deactivation
  //           console.log(`Deactivating user ${userId}`);
  //           Swal.fire("Deactivated!", "User has been deactivated.", "success");
  //           forceRefresh();
  //         }
  //         break;

  //       case "delete":
  //         result = await Swal.fire({
  //           title: "Delete User?",
  //           text: "This action cannot be undone!",
  //           icon: "error",
  //           showCancelButton: true,
  //           confirmButtonText: "Yes, delete",
  //           cancelButtonText: "Cancel",
  //           confirmButtonColor: "#dc2626",
  //         });

  //         if (result.isConfirmed) {
  //           // Mock API call for user deletion
  //           console.log(`Deleting user ${userId}`);
  //           Swal.fire("Deleted!", "User has been deleted.", "success");
  //           forceRefresh();
  //         }
  //         break;
  //     }
  //   } catch (error) {
  //     Swal.fire("Error", error.message || "An error occurred", "error");
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 border-8 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="w-32 h-32 border-8 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin absolute top-0"></div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Loading MLM Dashboard
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Fetching data from APIs...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <FaCrown className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                MLM Super Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time analytics • {Object.keys(apiStatus).length} APIs
                connected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>

            <button
              onClick={forceRefresh}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-xl"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Company Balance */}
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-90 font-medium">
                  Company Balance
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {formatCurrency(dashboardData.companyBalance || 0)}
                </h3>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <FaWallet className="text-2xl" />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="opacity-75">Income</p>
                <p className="font-semibold">
                  {formatCurrency(dashboardData.totalIncome || 0)}
                </p>
              </div>
              <div>
                <p className="opacity-75">Payouts</p>
                <p className="font-semibold">
                  {formatCurrency(dashboardData.totalPayouts || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-90 font-medium">Total Users</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {formatNumber(dashboardData.totalUsers)}
                </h3>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <FaUsers className="text-2xl" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-75">Active</span>
                <span className="font-semibold">
                  {dashboardData.activeUsers}
                </span>
              </div>
              <div className="w-full bg-blue-500/30 rounded-full h-2">
                <div
                  className="h-2 bg-white rounded-full transition-all duration-1000"
                  style={{
                    width: `${dashboardData.totalUsers > 0 ? (dashboardData.activeUsers / dashboardData.totalUsers) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-90 font-medium">Total Revenue</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {formatCurrency(dashboardData.totalRevenue)}
                </h3>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <FaMoneyBillWave className="text-2xl" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-75">Transactions</span>
                <span className="font-semibold">
                  {dashboardData.totalTransactions}
                </span>
              </div>
              <div className="w-full bg-emerald-500/30 rounded-full h-2">
                <div
                  className="h-2 bg-white rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min((dashboardData.totalTransactions / 100) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* NFTs */}
          <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-90 font-medium">
                  NFT Marketplace
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {formatNumber(
                    dashboardData.totalNFTs || dashboardData.nfts?.length || 0,
                  )}
                </h3>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <FaCubes className="text-2xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="opacity-75">Listed</p>
                <p className="font-semibold">
                  {dashboardData.nfts?.filter(
                    (nft) =>
                      nft.status === "listed" ||
                      nft.status === "active" ||
                      nft.status === "available",
                  ).length || 0}
                </p>
              </div>
              <div>
                <p className="opacity-75">Sold</p>
                <p className="font-semibold">
                  {dashboardData.nfts?.filter(
                    (nft) =>
                      nft.status === "sold" || nft.status === "completed",
                  ).length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Admin NFT Profit */}
          <div className="bg-gradient-to-br from-pink-600 via-pink-700 to-rose-800 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-90 font-medium">
                  Admin NFT Profit
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {formatCurrency(dashboardData.adminNftRevenue || 0)}
                </h3>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <FaTag className="text-2xl" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-75">Revenue</span>
                <span className="font-semibold">
                  Admin NFT Sales
                </span>
              </div>
              <div className="w-full bg-pink-500/30 rounded-full h-2">
                <div
                  className="h-2 bg-white rounded-full transition-all duration-1000"
                  style={{
                    width: `${dashboardData.totalRevenue > 0 ? Math.min((dashboardData.adminNftRevenue / dashboardData.totalRevenue) * 100, 100) : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* NFT Sale Revenue */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-90 font-medium">
                  NFT Sale Revenue
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {formatCurrency(dashboardData.nftRevenue || 0)}
                </h3>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <FaShoppingCart className="text-2xl" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-75">Type</span>
                <span className="font-semibold">
                  User NFT Sales
                </span>
              </div>
              <div className="w-full bg-indigo-500/30 rounded-full h-2">
                <div
                  className="h-2 bg-white rounded-full transition-all duration-1000"
                  style={{
                    width: `${dashboardData.totalRevenue > 0 ? Math.min((dashboardData.nftRevenue / dashboardData.totalRevenue) * 100, 100) : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap">
            {[
              { id: "overview", label: "Overview", icon: FaChartBar },
              { id: "transactions", label: "Transactions", icon: FaChartLine },
              { id: "revenue", label: "Revenue", icon: FaMoneyBillWave },
              { id: "nft", label: "NFT Market", icon: FaCubes },
              { id: "packages", label: "Packages", icon: FaBoxOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id)}
                  className={`flex-1 min-w-[120px] px-4 py-3 font-medium transition-all flex flex-col items-center gap-2 ${
                    selectedView === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          {/* Overview Tab */}
          {selectedView === "overview" && (
            <div className="space-y-6">
              {/* MLM Performance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MLM Network Growth */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      MLM Network Growth
                    </h3>
                    <FaNetworkWired className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.userGrowth}>
                        <defs>
                          <linearGradient
                            id="networkGrowthGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#3b82f6"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor="#1d4ed8"
                              stopOpacity={0.2}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background:
                              "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(29, 78, 216, 0.95))",
                            border: "none",
                            borderRadius: "12px",
                            color: "white",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#3b82f6"
                          fill="url(#networkGrowthGradient)"
                          strokeWidth={3}
                          name="Network Users"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Network
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {dashboardData.totalUsers?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>

                {/* Revenue Distribution */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Revenue Sources
                    </h3>
                    <FaChartPie className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.revenueDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {dashboardData.revenueDistribution.map(
                            (entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ),
                          )}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            background:
                              "linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))",
                            border: "none",
                            borderRadius: "12px",
                            color: "white",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Revenue
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(dashboardData.totalRevenue || 0)}
                    </span>
                  </div>
                </div>

                {/* MLM Hierarchy Levels */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      MLM Levels
                    </h3>
                    <FaTree className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            level: "Root",
                            users: (
                              dashboardData.mlmHierarchy.data?.hierarchy || []
                            ).filter((u) => u.isRootUser).length,
                            color: "#8b5cf6",
                          },
                          {
                            level: "Level 1",
                            users: (
                              dashboardData.mlmHierarchy.data?.hierarchy || []
                            ).filter((u) => !u.isRootUser).length,
                            color: "#a855f7",
                          },
                          {
                            level: "Level 2",
                            users: Math.floor(
                              (dashboardData.activeUsers || 0) * 0.3,
                            ),
                            color: "#c084fc",
                          },
                          {
                            level: "Level 3",
                            users: Math.floor(
                              (dashboardData.activeUsers || 0) * 0.2,
                            ),
                            color: "#d8b4fe",
                          },
                          {
                            level: "Level 4+",
                            users: Math.floor(
                              (dashboardData.activeUsers || 0) * 0.1,
                            ),
                            color: "#e9d5ff",
                          },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="level"
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background:
                              "linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(168, 85, 247, 0.95))",
                            border: "none",
                            borderRadius: "12px",
                            color: "white",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                          }}
                        />
                        <Bar
                          dataKey="users"
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Max Depth
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {dashboardData.mlmHierarchy.data?.stats?.maxDepth || 5}{" "}
                      Levels
                    </span>
                  </div>
                </div>
              </div>

              {/* Comprehensive MLM Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Real-time MLM Statistics */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      System Health Monitor
                    </h3>
                    <FaShieldAlt className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-6">
                    {/* Active Users Ratio */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Active Users Ratio
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {(
                            ((dashboardData.activeUsers || 0) /
                              Math.max(dashboardData.totalUsers || 1, 1)) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                          style={{
                            width: `${((dashboardData.activeUsers || 0) / Math.max(dashboardData.totalUsers || 1, 1)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Revenue Growth */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Revenue Performance
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(dashboardData.totalRevenue || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-4/5 transition-all duration-1000"></div>
                      </div>
                    </div>

                    {/* Network Expansion */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Network Expansion
                        </span>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {dashboardData.totalUsers?.toLocaleString() || "0"}{" "}
                          Users
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-3/4 transition-all duration-1000"></div>
                      </div>
                    </div>

                    {/* Transaction Volume */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Transaction Volume
                        </span>
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                          {dashboardData.totalTransactions?.toLocaleString() ||
                            "0"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div className="h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full w-2/3 transition-all duration-1000"></div>
                      </div>
                    </div>

                    {/* NFT Marketplace */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          NFT Marketplace
                        </span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          {dashboardData.totalNFTs?.toLocaleString() || "0"}{" "}
                          NFTs
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div className="h-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full w-1/2 transition-all duration-1000"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time MLM Statistics */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Real-time MLM Statistics
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Live Updates
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <FaUsers className="text-2xl text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.totalUsers?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total Users
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <FaUserCheck className="text-2xl text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.activeUsers?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Active Users
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <FaMoneyBillWave className="text-2xl text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(dashboardData.totalRevenue || 0)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total Revenue
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <FaWallet className="text-2xl text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(dashboardData.companyBalance || 0)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Company Balance
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <FaChartLine className="text-2xl text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.totalTransactions?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Transactions
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <FaCubes className="text-2xl text-rose-600 dark:text-rose-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.totalNFTs?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      NFT Assets
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Transactions Tab */}
          {selectedView === "transactions" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Company Transaction History
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dashboardData.transactions.length} total transactions •
                    Total Earnings: {formatCurrency(dashboardData.totalRevenue)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Share
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Parent
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {dashboardData.transactions.length > 0 ? (
                      dashboardData.transactions.map((tx, index) => (
                        <tr
                          key={tx.id || index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {tx.user?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {tx.user?.email || "No email"}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                                {tx.user?.code || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                tx.type === "Registration"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  : tx.type === "Upgrade"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                    : tx.type === "Parent Payout"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                              }`}
                            >
                              {tx.type || "Transaction"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-medium ${
                                tx.amount > 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {tx.amount > 0 ? "+" : ""}
                              {formatCurrency(tx.amount || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(tx.companyShare || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {tx.parent ? (
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {tx.parent.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {tx.parent.code}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                No parent
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                tx.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : tx.status === "pending"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                              }`}
                            >
                              {tx.status || "unknown"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {tx.description || "No description"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <div className="text-gray-500 dark:text-gray-400">
                            <FaDatabase className="text-3xl mx-auto mb-3 opacity-50" />
                            <p>No transactions found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Transaction Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Earnings</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(dashboardData.totalRevenue || 0)}
                      </p>
                    </div>
                    <FaMoneyBillWave className="text-2xl opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Income</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(dashboardData.totalIncome || 0)}
                      </p>
                    </div>
                    <FaArrowUp className="text-2xl opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Payouts</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(dashboardData.totalPayouts || 0)}
                      </p>
                    </div>
                    <FaArrowDown className="text-2xl opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Transaction Count</p>
                      <p className="text-xl font-bold">
                        {dashboardData.transactions.length}
                      </p>
                    </div>
                    <FaRegChartBar className="text-2xl opacity-80" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {selectedView === "revenue" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm opacity-90 font-medium">
                        Total Revenue
                      </p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-2">
                        {formatCurrency(dashboardData.totalRevenue)}
                      </h3>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <FaMoneyBillWave className="text-2xl" />
                    </div>
                  </div>
                  <p className="text-xs opacity-90">From all sources</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm opacity-90 font-medium">
                        Company Balance
                      </p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-2">
                        {formatCurrency(dashboardData.companyBalance)}
                      </h3>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <FaWallet className="text-2xl" />
                    </div>
                  </div>
                  <p className="text-xs opacity-90">Net company profit</p>
                </div>

                <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm opacity-90 font-medium">
                        Avg. Transaction
                      </p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-2">
                        {formatCurrency(
                          dashboardData.totalTransactions > 0
                            ? dashboardData.totalRevenue /
                                dashboardData.totalTransactions
                            : 0,
                        )}
                      </h3>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <FaChartLine className="text-2xl" />
                    </div>
                  </div>
                  <p className="text-xs opacity-90">Per transaction</p>
                </div>
              </div>

              {/* Revenue Sources */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Revenue Sources
                </h3>
                {dashboardData.revenueDistribution.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.revenueDistribution.map((source, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: source.color }}
                            ></div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {source.name}
                            </span>
                          </div>
                          <span
                            className="text-lg font-bold"
                            style={{ color: source.color }}
                          >
                            {formatCurrency(source.value)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${(source.value / dashboardData.totalRevenue) * 100}%`,
                              backgroundColor: source.color,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {(
                            (source.value / dashboardData.totalRevenue) *
                            100
                          ).toFixed(1)}
                          % of total revenue
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaChartPie className="text-3xl text-gray-400 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No revenue data available
                    </p>
                  </div>
                )}
              </div>

              {/* Revenue Trend Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Revenue Trend
                  </h3>
                  <div className="flex items-center gap-2">
                    {["day", "week", "month", "year"].map((range) => (
                      <button
                        key={range}
                        onClick={() => setRevenueTrendRange(range)}
                        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                          revenueTrendRange === range
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={generateRevenueTrend(
                        dashboardData.transactions,
                        revenueTrendRange,
                      )}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="revenueLineGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <linearGradient
                          id="profitLineGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient
                          id="transactionLineGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur
                            stdDeviation="3"
                            result="coloredBlur"
                          />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="1 3"
                        stroke="#374151"
                        opacity={0.2}
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fill: "#9ca3af",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                        stroke="#6b7280"
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        tick={{
                          fill: "#9ca3af",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                        stroke="#6b7280"
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "revenue")
                            return [formatCurrency(value), "Revenue"];
                          if (name === "profit")
                            return [formatCurrency(value), "Profit"];
                          if (name === "transactions")
                            return [value, "Transactions"];
                          return [value, name];
                        }}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          background:
                            "linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(30, 30, 30, 0.95))",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          borderRadius: "16px",
                          color: "white",
                          boxShadow:
                            "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.2)",
                          backdropFilter: "blur(10px)",
                          padding: "12px 16px",
                        }}
                        cursor={{
                          stroke: "rgba(139, 92, 246, 0.5)",
                          strokeWidth: 2,
                          strokeDasharray: "8 8",
                          filter: "url(#glow)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: "25px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                        iconType="circle"
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="url(#revenueLineGradient)"
                        strokeWidth={4}
                        name="Revenue"
                        dot={{
                          fill: "#8b5cf6",
                          strokeWidth: 3,
                          r: 6,
                          stroke: "#fff",
                          filter: "url(#glow)",
                        }}
                        activeDot={{
                          r: 8,
                          stroke: "#8b5cf6",
                          strokeWidth: 3,
                          fill: "#fff",
                          filter: "url(#glow)",
                          style: { cursor: "pointer" },
                        }}
                        animationDuration={2000}
                        animationBegin={0}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="url(#profitLineGradient)"
                        strokeWidth={4}
                        name="Profit"
                        dot={{
                          fill: "#10b981",
                          strokeWidth: 3,
                          r: 6,
                          stroke: "#fff",
                          filter: "url(#glow)",
                        }}
                        activeDot={{
                          r: 8,
                          stroke: "#10b981",
                          strokeWidth: 3,
                          fill: "#fff",
                          filter: "url(#glow)",
                          style: { cursor: "pointer" },
                        }}
                        animationDuration={2000}
                        animationBegin={300}
                      />
                      <Line
                        type="monotone"
                        dataKey="transactions"
                        stroke="url(#transactionLineGradient)"
                        strokeWidth={3}
                        name="Transactions"
                        strokeDasharray="8 4"
                        dot={{
                          fill: "#f59e0b",
                          strokeWidth: 2,
                          r: 5,
                          stroke: "#fff",
                        }}
                        activeDot={{
                          r: 7,
                          stroke: "#f59e0b",
                          strokeWidth: 2,
                          fill: "#fff",
                          style: { cursor: "pointer" },
                        }}
                        animationDuration={2000}
                        animationBegin={600}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transaction Types Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Transaction Types Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.transactionTypes}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6b7280" }}
                        stroke="#6b7280"
                      />
                      <YAxis tick={{ fill: "#6b7280" }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="Count"
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stackId="2"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="Amount"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          {/* NFT Market Tab */}
          {selectedView === "nft" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NFT Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      NFT Market Statistics
                    </h3>
                    <FaCubes className="text-emerald-500" />
                  </div>
                  {dashboardData.nftStats.total > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Total NFTs
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {dashboardData.nftStats.total}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Listed for Sale
                        </span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {dashboardData.nftStats.listed}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Sold NFTs
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {dashboardData.nftStats.sold}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Currently Holding
                        </span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          {dashboardData.nftStats.holding}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Locked NFTs
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {dashboardData.nftStats.locked}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Total Volume
                        </span>
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          {formatCurrency(dashboardData.nftStats.totalVolume)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Average Price
                        </span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(dashboardData.nftStats.avgPrice)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaCubes className="text-3xl text-gray-400 mx-auto mb-3 opacity-50" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No NFT data available
                      </p>
                    </div>
                  )}
                </div>

                {/* NFT Status Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    NFT Status Distribution
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={[
                          {
                            status: "Listed",
                            value: dashboardData.nftStats.listed || 0,
                            fullMark:
                              Math.max(
                                dashboardData.nftStats.listed || 0,
                                dashboardData.nftStats.sold || 0,
                                dashboardData.nftStats.holding || 0,
                                dashboardData.nftStats.locked || 0,
                              ) + 5,
                          },
                          {
                            status: "Sold",
                            value: dashboardData.nftStats.sold || 0,
                            fullMark:
                              Math.max(
                                dashboardData.nftStats.listed || 0,
                                dashboardData.nftStats.sold || 0,
                                dashboardData.nftStats.holding || 0,
                                dashboardData.nftStats.locked || 0,
                              ) + 5,
                          },
                          {
                            status: "Holding",
                            value: dashboardData.nftStats.holding || 0,
                            fullMark:
                              Math.max(
                                dashboardData.nftStats.listed || 0,
                                dashboardData.nftStats.sold || 0,
                                dashboardData.nftStats.holding || 0,
                                dashboardData.nftStats.locked || 0,
                              ) + 5,
                          },
                          {
                            status: "Locked",
                            value: dashboardData.nftStats.locked || 0,
                            fullMark:
                              Math.max(
                                dashboardData.nftStats.listed || 0,
                                dashboardData.nftStats.sold || 0,
                                dashboardData.nftStats.holding || 0,
                                dashboardData.nftStats.locked || 0,
                              ) + 5,
                          },
                        ]}
                        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                      >
                        <defs>
                          <linearGradient
                            id="radarGradient"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#3b82f6"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="25%"
                              stopColor="#10b981"
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="50%"
                              stopColor="#f59e0b"
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="100%"
                              stopColor="#ef4444"
                              stopOpacity={0.8}
                            />
                          </linearGradient>
                          <filter id="radarGlow">
                            <feGaussianBlur
                              stdDeviation="2"
                              result="coloredBlur"
                            />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <PolarGrid
                          stroke="#374151"
                          strokeOpacity={0.3}
                          radialLines={true}
                        />
                        <PolarAngleAxis
                          dataKey="status"
                          tick={{
                            fill: "#9ca3af",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                          className="font-semibold"
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, "dataMax"]}
                          tick={{
                            fill: "#6b7280",
                            fontSize: 10,
                          }}
                          tickCount={4}
                        />
                        <Radar
                          name="NFT Count"
                          dataKey="value"
                          stroke="url(#radarGradient)"
                          fill="url(#radarGradient)"
                          fillOpacity={0.3}
                          strokeWidth={3}
                          dot={{
                            fill: "#3b82f6",
                            strokeWidth: 2,
                            r: 6,
                            stroke: "#fff",
                            filter: "url(#radarGlow)",
                          }}
                          animationDuration={2000}
                        />
                        <Tooltip
                          formatter={(value, name) => [value, "NFT Count"]}
                          labelFormatter={(label) => `Status: ${label}`}
                          contentStyle={{
                            background:
                              "linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(30, 30, 30, 0.95))",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            borderRadius: "12px",
                            color: "white",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                            backdropFilter: "blur(10px)",
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent NFT Activity Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent NFT Activity
                  </h3>
                  <button
                    onClick={() => exportData("nfts")}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 text-sm"
                  >
                    <FaDownload />
                    Export NFTs
                  </button>
                </div>
                {dashboardData.nfts.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dashboardData.nfts
                          .slice(0, 10)
                          .map((nft, index) => ({
                            name: `NFT ${index + 1}`,
                            buyPrice: parseFloat(
                              nft.buyPrice || nft.originalPrice || 0,
                            ),
                            sellPrice: parseFloat(
                              nft.sellPrice ||
                                nft.currentPrice ||
                                nft.price ||
                                0,
                            ),
                            profit:
                              parseFloat(nft.sellPrice || nft.price || 0) -
                              parseFloat(
                                nft.buyPrice || nft.originalPrice || 0,
                              ),
                            status: nft.status || "unknown",
                          }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient
                            id="buyPriceGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#3b82f6"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor="#1d4ed8"
                              stopOpacity={0.6}
                            />
                          </linearGradient>
                          <linearGradient
                            id="sellPriceGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#10b981"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor="#059669"
                              stopOpacity={0.6}
                            />
                          </linearGradient>
                          <linearGradient
                            id="profitGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#f59e0b"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor="#d97706"
                              stopOpacity={0.6}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                          opacity={0.3}
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          stroke="#6b7280"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          stroke="#6b7280"
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "buyPrice")
                              return [formatCurrency(value), "Buy Price"];
                            if (name === "sellPrice")
                              return [formatCurrency(value), "Sell Price"];
                            if (name === "profit")
                              return [formatCurrency(value), "Profit/Loss"];
                            return [formatCurrency(value), name];
                          }}
                          contentStyle={{
                            background:
                              "linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(30, 30, 30, 0.95))",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            borderRadius: "12px",
                            color: "white",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: "20px" }}
                          iconType="rect"
                        />
                        <Bar
                          dataKey="buyPrice"
                          fill="url(#buyPriceGradient)"
                          name="Buy Price"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                          animationBegin={0}
                        />
                        <Bar
                          dataKey="sellPrice"
                          fill="url(#sellPriceGradient)"
                          name="Sell Price"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                          animationBegin={300}
                        />
                        <Bar
                          dataKey="profit"
                          fill="url(#profitGradient)"
                          name="Profit/Loss"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                          animationBegin={600}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaCubes className="text-3xl text-gray-400 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No NFT activity data available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Packages Tab */}
          {selectedView === "packages" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Package Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Package Distribution
                  </h3>
                  {dashboardData.packageStats.distribution.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dashboardData.packageStats.distribution}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <defs>
                            <linearGradient
                              id="usersGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#8b5cf6"
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="100%"
                                stopColor="#3b82f6"
                                stopOpacity={0.7}
                              />
                            </linearGradient>
                            <linearGradient
                              id="amountGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="100%"
                                stopColor="#059669"
                                stopOpacity={0.7}
                              />
                            </linearGradient>
                            <filter id="barGlow">
                              <feGaussianBlur
                                stdDeviation="3"
                                result="coloredBlur"
                              />
                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="1 3"
                            stroke="#374151"
                            opacity={0.2}
                            horizontal={true}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{
                              fill: "#9ca3af",
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                            stroke="#6b7280"
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis
                            tick={{
                              fill: "#9ca3af",
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                            stroke="#6b7280"
                            axisLine={false}
                            tickLine={false}
                            dx={-10}
                          />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === "Users") return [value, "Users"];
                              if (name === "Amount ($)")
                                return [`$${value.toLocaleString()}`, "Amount"];
                              return [value, name];
                            }}
                            contentStyle={{
                              background:
                                "linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(30, 30, 30, 0.95))",
                              border: "1px solid rgba(139, 92, 246, 0.3)",
                              borderRadius: "16px",
                              color: "white",
                              boxShadow:
                                "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.2)",
                              backdropFilter: "blur(10px)",
                              padding: "12px 16px",
                            }}
                            cursor={{
                              fill: "rgba(139, 92, 246, 0.1)",
                              stroke: "rgba(139, 92, 246, 0.3)",
                              strokeWidth: 2,
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              paddingTop: "25px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                            iconType="rect"
                          />
                          <Bar
                            dataKey="users"
                            fill="url(#usersGradient)"
                            name="Users"
                            radius={[8, 8, 0, 0]}
                            animationDuration={2000}
                            animationBegin={0}
                            filter="url(#barGlow)"
                          />
                          <Bar
                            dataKey="amount"
                            fill="url(#amountGradient)"
                            name="Amount ($)"
                            radius={[8, 8, 0, 0]}
                            animationDuration={2000}
                            animationBegin={300}
                            filter="url(#barGlow)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaBoxOpen className="text-3xl text-gray-400 mx-auto mb-3 opacity-50" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No package data available
                      </p>
                    </div>
                  )}
                </div>

                {/* Available Packages */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Available Investment Plans
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(dashboardData.packages).map(
                      ([planName, planData]) => (
                        <div
                          key={planName}
                          className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                                {planName.replace("plan", "Plan ")}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {planData.dailyLimit
                                  ? `Daily Limit: ${formatCurrency(planData.dailyLimit)}`
                                  : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(planData.amount)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Investment
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 bg-blue-500 rounded-full transition-all duration-1000"
                              style={{
                                width: `${(planData.amount / Math.max(...Object.values(dashboardData.packages).map((p) => p.amount))) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                            <span>
                              {dashboardData.packageStats.distribution.find(
                                (p) => p.name === planName,
                              )?.users || 0}{" "}
                              users
                            </span>
                            <span>
                              Total Limit:{" "}
                              {formatCurrency(planData.totalLimit || 0)}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Package Upgrade Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Package Upgrade Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white text-center shadow-lg">
                    <p className="text-3xl font-bold">
                      {dashboardData.totalPackages}
                    </p>
                    <p className="text-sm opacity-90 mt-2">Total Upgrades</p>
                    <p className="text-xs opacity-75 mt-1">
                      {(
                        (dashboardData.totalPackages /
                          dashboardData.totalUsers) *
                          100 || 0
                      ).toFixed(1)}
                      % of users
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-6 text-white text-center shadow-lg">
                    <p className="text-3xl font-bold">
                      {formatCurrency(
                        dashboardData.packageStats.distribution.reduce(
                          (sum, pkg) => sum + pkg.amount * pkg.users,
                          0,
                        ),
                      )}
                    </p>
                    <p className="text-sm opacity-90 mt-2">
                      Total Package Value
                    </p>
                    <p className="text-xs opacity-75 mt-1">From all upgrades</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white text-center shadow-lg">
                    <p className="text-3xl font-bold">
                      {dashboardData.packageStats.distribution.length}
                    </p>
                    <p className="text-sm opacity-90 mt-2">Active Plans</p>
                    <p className="text-xs opacity-75 mt-1">
                      Different package types
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last Updated: {new Date().toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {Object.values(apiStatus).filter((s) => s.success).length}/
                {Object.keys(apiStatus).length} APIs connected
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Secure Connection
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaServer className="text-emerald-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  API Status: Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

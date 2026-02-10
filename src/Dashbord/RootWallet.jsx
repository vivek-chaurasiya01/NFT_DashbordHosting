import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaCopy,
  FaEye,
  FaTimes,
  FaUsers,
  FaFilter,
  FaSearch,
  FaChevronRight,
  FaChevronLeft,
  FaNetworkWired,
  FaTag,
  FaMoneyBillWave,
  FaGem,
  FaRocket,
  FaShieldAlt,
  FaChartPie,
  FaPercentage,
  FaCoins,
  FaExchangeAlt,
  FaReceipt,
  FaHistory,
  FaUserFriends,
  FaCaretRight,
  FaLayerGroup,
  FaHandHoldingUsd,
  FaCreditCard,
  FaChartLine,
  FaDatabase,
  FaDownload,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import {
  TbChartBar,
  TbChartLine,
  TbCurrencyDollar,
  TbTrendingUp,
  TbTrendingDown,
} from "react-icons/tb";
import {
  MdPerson,
  MdAccountBalance,
  MdTrendingUp,
  MdShowChart,
  MdOutlineAccountBalanceWallet,
  MdOutlinePayments,
  MdOutlineBarChart,
  MdOutlineRefresh,
} from "react-icons/md";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_API_URL;

export default function RootWallet() {
  const [companyData, setCompanyData] = useState({
    superUserWallet: "",
    totalBalance: 0,
    lastUpdated: "",
  });
  const [transactions, setTransactions] = useState({
    transactions: [],
    summary: {
      totalBalance: 0,
      totalTransactions: 0,
      breakdown: [],
      companyWallet: "",
    },
    pagination: {
      current: 1,
      limit: 20,
      total: 0,
      pages: 1,
    },
    lastUpdated: "",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFullWallet, setShowFullWallet] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [graphData, setGraphData] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeCard, setActiveCard] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userItemsPerPage, setUserItemsPerPage] = useState(10);

  useEffect(() => {
    fetchWalletData();
    fetchUsers();
    const interval = setInterval(() => {
      fetchWalletData();
      fetchUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("superAdminToken");

      if (!token) return;

      const response = await axios.get(
        "https://api.gtnworld.live/api/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        // Sort users by createdAt in descending order (newest first)
        const sortedUsers = (response.data.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setUsers(sortedUsers);
        // Also set graph data from the SuperAdmin API response
        const transactionRes = await axios.get(
          `${API_URL}api/SuperAdmin/company-transactions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (transactionRes.data.success && transactionRes.data.graph) {
          setGraphData(transactionRes.data.graph);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchWalletData = async (showLoader = false) => {
    try {
      if (showLoader) setRefreshing(true);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("superAdminToken");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please login again",
          background: "#0a1123",
          color: "white",
          confirmButtonColor: "#9333ea",
        });
        return;
      }

      const transactionRes = await axios.get(
        `${API_URL}api/SuperAdmin/company-transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (transactionRes.data.success) {
        const data = transactionRes.data;
        const allTransactions = data.transactions || [];

        // Calculate total payouts from parent payout transactions
        const totalPayouts = allTransactions
          .filter((tx) => tx.type === "Parent Payout")
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        setCompanyData({
          superUserWallet: data.companyWallet || "",
          totalBalance: data.summary?.totalEarnings || 0,
          lastUpdated: new Date().toISOString(),
        });

        setTransactions({
          transactions: allTransactions,
          summary: {
            totalBalance: data.summary?.totalEarnings || 0,
            totalTransactions: allTransactions.length,
            totalIncome: data.summary?.totalIncome || 0,
            totalPayouts: totalPayouts,
            companyWallet: data.companyWallet || "",
          },
          pagination: {
            current: 1,
            limit: 20,
            total: allTransactions.length,
            pages: Math.ceil(allTransactions.length / 20),
          },
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      Swal.fire({
        icon: "error",
        title: "API Error",
        text: error.response?.data?.message || "Failed to fetch wallet data",
        background: "#0a1123",
        color: "white",
        confirmButtonColor: "#9333ea",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyWalletAddress = (address) => {
    navigator.clipboard.writeText(address);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: "Wallet address copied to clipboard",
      timer: 1500,
      showConfirmButton: false,
      background: "#0a1123",
      color: "white",
    });
  };

  const formatWalletAddress = (address) => {
    if (!address) return "N/A";
    return showFullWallet
      ? address
      : `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "Registration":
        return <MdPerson className="text-blue-400" />;
      case "Parent Payout":
        return <FaUserFriends className="text-rose-400" />;
      case "NFT Sale":
      case "Token Sale":
      case "Digital Asset":
        return <FaGem className="text-purple-400" />;
      case "Upgrade":
        return <FaRocket className="text-emerald-400" />;
      case "Other":
        return <FaTag className="text-gray-400" />;
      default:
        return <FaWallet className="text-gray-400" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "Registration":
        return "bg-blue-900/30 text-blue-300 border-blue-700/50";
      case "Parent Payout":
        return "bg-rose-900/30 text-rose-300 border-rose-700/50";
      case "NFT Sale":
        return "bg-purple-900/30 text-purple-300 border-purple-700/50";
      case "Upgrade":
        return "bg-emerald-900/30 text-emerald-300 border-emerald-700/50";
      case "Other":
        return "bg-gray-800/30 text-gray-300 border-gray-700/50";
      default:
        return "bg-gray-800/30 text-gray-300 border-gray-700/50";
    }
  };

  const openTransactionModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const getCompanyEarningsForRegistration = (registrationTx) => {
    const parentPayout = transactions.transactions.find(
      (tx) =>
        tx.type === "Parent Payout" &&
        tx.user?.code === registrationTx.user?.code &&
        Math.abs(new Date(tx.date) - new Date(registrationTx.date)) < 60000,
    );

    const registrationAmount = registrationTx.amount;
    const parentPayoutAmount = parentPayout ? Math.abs(parentPayout.amount) : 0;

    return registrationAmount - parentPayoutAmount;
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.transactions;

    // Only filter by activeCard if it's not "all"
    if (activeCard !== "all") {
      if (activeCard === "Registration") {
        filtered = filtered.filter((tx) => tx.type === "Registration");
      } else if (activeCard === "Admin NFT") {
        // Show admin NFT transactions (from Other type with NFT descriptions)
        filtered = filtered.filter(
          (tx) =>
            tx.type === "Other" &&
            (tx.description?.toLowerCase().includes("nft") ||
              tx.description?.toLowerCase().includes("admin nft") ||
              tx.description?.toLowerCase().includes("nft sale")),
        );
      } else if (activeCard === "Other") {
        // Show only non-NFT Other transactions
        filtered = filtered.filter(
          (tx) =>
            tx.type === "Other" &&
            !tx.description?.toLowerCase().includes("nft") &&
            !tx.description?.toLowerCase().includes("admin nft") &&
            !tx.description?.toLowerCase().includes("nft sale"),
        );
      } else {
        filtered = filtered.filter((tx) => tx.type === activeCard);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterType !== "all") {
      if (filterType === "Admin NFT") {
        // Show admin NFT transactions
        filtered = filtered.filter(
          (tx) =>
            tx.type === "Other" &&
            (tx.description?.toLowerCase().includes("nft") ||
              tx.description?.toLowerCase().includes("admin nft") ||
              tx.description?.toLowerCase().includes("nft sale")),
        );
      } else if (filterType === "Other") {
        // Show only non-NFT Other transactions
        filtered = filtered.filter(
          (tx) =>
            tx.type === "Other" &&
            !tx.description?.toLowerCase().includes("nft") &&
            !tx.description?.toLowerCase().includes("admin nft") &&
            !tx.description?.toLowerCase().includes("nft sale"),
        );
      } else {
        filtered = filtered.filter((tx) => tx.type === filterType);
      }
    }

    if (sortOrder === "desc") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return filtered;
  }, [
    transactions.transactions,
    searchTerm,
    filterType,
    activeCard,
    sortOrder,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, activeCard]);

  // User pagination calculations
  const userTotalPages = Math.ceil(users.length / userItemsPerPage);
  const userStartIndex = (userCurrentPage - 1) * userItemsPerPage;
  const userEndIndex = userStartIndex + userItemsPerPage;
  const currentUsers = users.slice(userStartIndex, userEndIndex);

  const transactionTypes = useMemo(() => {
    const types = new Set();
    transactions.transactions.forEach((tx) => {
      if (tx.type !== "Registration") {
        types.add(tx.type);
      }
    });
    // Add Admin NFT as a custom filter option
    types.add("Admin NFT");
    return Array.from(types);
  }, [transactions.transactions]);

  const parentPayoutTransactions = useMemo(() => {
    return transactions.transactions.filter(
      (tx) => tx.type === "Parent Payout",
    );
  }, [transactions.transactions]);

  const nftSaleTransactions = useMemo(() => {
    const nftTx = transactions.transactions.filter(
      (tx) => tx.type === "NFT Sale",
    );
    console.log("NFT Sale transactions:", nftTx.length, nftTx);
    return nftTx;
  }, [transactions.transactions]);

  const adminNftTransactions = useMemo(() => {
    // Admin NFT transactions are in "Other" type with NFT-related descriptions
    const adminNfts = transactions.transactions.filter(
      (tx) =>
        tx.type === "Other" &&
        (tx.description?.toLowerCase().includes("nft") ||
          tx.description?.toLowerCase().includes("admin nft") ||
          tx.description?.toLowerCase().includes("nft sale")),
    );
    console.log(
      "Admin NFT transactions from Other:",
      adminNfts.length,
      adminNfts,
    );
    return adminNfts;
  }, [transactions.transactions]);

  const otherTransactions = useMemo(() => {
    // Filter out NFT-related transactions from Other type
    return transactions.transactions.filter(
      (tx) =>
        tx.type === "Other" &&
        !tx.description?.toLowerCase().includes("nft") &&
        !tx.description?.toLowerCase().includes("admin nft") &&
        !tx.description?.toLowerCase().includes("nft sale"),
    );
  }, [transactions.transactions]);

  const upgradeTransactions = useMemo(() => {
    return transactions.transactions.filter(
      (tx) =>
        tx.type === "Upgrade" ||
        tx.description?.toLowerCase().includes("package upgrade") ||
        tx.description?.toLowerCase().includes("upgrade payment") ||
        tx.description?.toLowerCase().includes("upgraded plan"),
    );
  }, [transactions.transactions]);

  // const registrationTransactions = useMemo(() => {
  //   const regTx = transactions.transactions.filter(
  //     (tx) => tx.type === "Registration",
  //   );
  //   console.log("Registration transactions:", regTx.length, regTx);
  //   return regTx;
  // }, [transactions.transactions]);

  const parentPayoutTotal = parentPayoutTransactions.reduce(
    (sum, tx) => sum + Math.abs(tx.amount),
    0,
  );
  const nftSaleTotal = nftSaleTransactions.reduce(
    (sum, tx) => sum + Math.abs(tx.amount || 0),
    0,
  );
  const adminNftTotal = adminNftTransactions.reduce(
    (sum, tx) => sum + Math.abs(tx.amount || 0),
    0,
  );
  const upgradeTotal = upgradeTransactions.reduce(
    (sum, tx) => sum + Math.abs(tx.amount),
    0,
  );
  const otherTotal = otherTransactions.reduce(
    (sum, tx) => sum + Math.abs(tx.amount),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b18] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-gray-300 font-medium">
            Loading wallet data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1424] text-gray-100">
      {/* Header Section */}
      <div className="bg-[#0e1424] border-b border-gray-800 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <MdOutlineAccountBalanceWallet className="text-white text-xl" />
              </div>
              Wallet Management
            </h1>
            <p className="text-gray-400 mt-1">
              Monitor and manage all platform transactions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchWalletData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-gray-200"
            >
              <MdOutlineRefresh
                className={`${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="bg-[#0a1123] rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
            onClick={() => {
              setActiveCard("all");
              setFilterType("all");
              setViewMode("list");
              setTimeout(() => {
                document
                  .getElementById("transactions-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-900/30 rounded-lg">
                <HiOutlineCurrencyDollar className="text-2xl text-blue-400" />
              </div>
              <span className="text-sm font-medium text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">
                NET PROFIT
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-2">
              After All Expenses
            </h3>
            <p className="text-3xl font-bold text-white mb-2">
              $
              {(
                transactions.summary?.totalIncome -
                transactions.summary?.totalPayouts -
                adminNftTotal -
                nftSaleTotal -
                upgradeTotal
              )?.toLocaleString() || 0}
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <MdTrendingUp className="mr-2 text-emerald-400" />
              <span>Company's actual profit</span>
            </div>
          </div>

          <div
            className="bg-[#0a1123] rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
            onClick={() => {
              setActiveCard("all");
              setFilterType("all");
              setViewMode("list");
              setTimeout(() => {
                document
                  .getElementById("transactions-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-900/30 rounded-lg">
                <TbTrendingUp className="text-2xl text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full">
                INCOME
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-2">
              Total Income
            </h3>
            <p className="text-3xl font-bold text-white mb-2">
              ${transactions.summary?.totalIncome?.toLocaleString()}
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <FaChartLine className="mr-2 text-emerald-400" />
              <span>Gross revenue generated</span>
            </div>
          </div>

          <div
            className="bg-[#0a1123] rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
            onClick={() => {
              setActiveCard("Admin NFT");
              setFilterType("Admin NFT");
              setViewMode("list");
              setTimeout(() => {
                document
                  .getElementById("transactions-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-900/30 rounded-lg">
                <FaGem className="text-2xl text-purple-400" />
              </div>
              <span className="text-sm font-medium text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">
                ADMIN NFT
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-2">
              Admin NFT Profit
            </h3>
            <p className="text-3xl font-bold text-white mb-2">
              ${adminNftTotal?.toLocaleString() || 0}
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <FaGem className="mr-2 text-purple-400" />
              <span>Admin NFT sales profit</span>
            </div>
          </div>

          <div
            className="bg-[#0a1123] rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
            onClick={() => {
              setViewMode("users");
              setActiveCard("Registration");
              setFilterType("Registration");
              setTimeout(() => {
                document
                  .getElementById("transactions-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-900/30 rounded-lg">
                <FaUsers className="text-2xl text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-cyan-400 bg-cyan-900/30 px-3 py-1 rounded-full">
                USERS
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-2">
              Total Registrations
            </h3>
            <p className="text-3xl font-bold text-white mb-2">
              {users.length || 0}
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <FaDatabase className="mr-2 text-cyan-400" />
              <span>Total registered users</span>
            </div>
          </div>
        </div>

        {/* Company Wallet Card */}
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-900/30 rounded-lg shadow-sm">
                <FaWallet className="text-2xl text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Company Wallet Address
                </h3>
                <p className="text-gray-400">Secure multi-signature wallet</p>
              </div>
            </div>

            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-900/50 px-4 py-3 rounded-lg border border-gray-700 font-mono text-gray-200 text-sm truncate">
                  {formatWalletAddress(companyData.superUserWallet)}
                </code>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFullWallet(!showFullWallet)}
                    className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                    title={
                      showFullWallet ? "Hide full address" : "Show full address"
                    }
                  >
                    <FaEye
                      className={`text-gray-300 ${showFullWallet ? "text-blue-400" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() =>
                      copyWalletAddress(companyData.superUserWallet)
                    }
                    className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                    title="Copy to clipboard"
                  >
                    <FaCopy className="text-gray-300 hover:text-blue-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              type: "Parent Payout",
              icon: FaUserFriends,
              color: "rose",
              bgColor: "bg-rose-900/30",
              textColor: "text-rose-400",
              borderColor: "border-rose-700/50",
              count: parentPayoutTransactions.length,
              amount: parentPayoutTotal,
              description: "MLM Commission Distribution",
            },
            {
              type: "NFT Sale",
              icon: FaGem,
              color: "purple",
              bgColor: "bg-purple-900/30",
              textColor: "text-purple-400",
              borderColor: "border-purple-700/50",
              count: nftSaleTransactions.length,
              amount: nftSaleTotal,
              description: `NFT Sales (${nftSaleTransactions.length} transactions)`,
            },
            {
              type: "Upgrade",
              icon: FaRocket,
              color: "emerald",
              bgColor: "bg-emerald-900/30",
              textColor: "text-emerald-400",
              borderColor: "border-emerald-700/50",
              count: upgradeTransactions.length,
              amount: upgradeTotal,
              description: "User Plan Upgrades",
            },
            {
              type: "Other",
              icon: FaTag,
              color: "gray",
              bgColor: "bg-gray-800/30",
              textColor: "text-gray-400",
              borderColor: "border-gray-700/50",
              count: otherTransactions.length,
              amount: otherTotal,
              description: "Miscellaneous Activities",
            },
          ].map((card) => (
            <div
              key={card.type}
              className={`bg-[#0a1123] rounded-xl border ${activeCard === card.type ? "border-blue-500 ring-2 ring-blue-500/30" : card.borderColor} p-5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl`}
              onClick={() => {
                setActiveCard(card.type);
                setFilterType(card.type);
                setViewMode("list");
                setTimeout(() => {
                  document
                    .getElementById("transactions-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${card.bgColor} rounded-lg`}>
                  <card.icon className={`text-xl ${card.textColor}`} />
                </div>
                <span
                  className={`text-xs font-semibold ${card.bgColor} ${card.textColor} px-3 py-1 rounded-full`}
                >
                  {card.count} TX
                </span>
              </div>
              <h3 className="text-gray-300 font-medium mb-2">{card.type}</h3>
              <p className="text-2xl font-bold text-white mb-2">
                ${card.amount.toLocaleString()}
              </p>
              <p
                className={`text-sm ${card.textColor} font-medium flex items-center gap-2`}
              >
                <FaPercentage className="text-xs" />
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div
          id="transactions-section"
          className="bg-[#0a1123] rounded-xl border border-gray-800 shadow-xl overflow-hidden"
        >
          {/* Tabs */}
          <div className="border-b border-gray-800">
            <div className="flex">
              <button
                onClick={() => {
                  setViewMode("list");
                  setActiveCard("all");
                  setFilterType("all");
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  viewMode === "list"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaReceipt />
                  <span>Transaction List</span>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                    {filteredTransactions.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setViewMode("users")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  viewMode === "users"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaUsers />
                  <span>User List</span>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                    {users.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setViewMode("graph")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  viewMode === "graph"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaNetworkWired />
                  <span>Network Graph</span>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                    {graphData?.stats?.totalUsers || 0}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {viewMode === "list" ? (
              <>
                {/* Filter Section */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200 placeholder-gray-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={filterType}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        setActiveCard(
                          e.target.value === "all" ? "all" : e.target.value,
                        );
                      }}
                      className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200"
                    >
                      <option value="all">All Types</option>
                      {transactionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                      }
                      className="p-2 bg-gray-900/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
                      title={
                        sortOrder === "desc"
                          ? "Sort ascending"
                          : "Sort descending"
                      }
                    >
                      {sortOrder === "desc" ? (
                        <FaSortAmountDown />
                      ) : (
                        <FaSortAmountUp />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterType("all");
                        setActiveCard("all");
                      }}
                      className="p-2 bg-gray-900/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
                    >
                      <FaFilter />
                    </button>
                  </div>
                </div>

                {/* Active Filter Indicator */}
                {activeCard !== "all" && (
                  <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-900/30 rounded-lg">
                          <FaFilter className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-blue-300 font-medium">
                            Showing {activeCard} transactions
                          </p>
                          <p className="text-blue-400 text-sm">
                            Filtered by {activeCard.toLowerCase()} type
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveCard("all");
                          setFilterType("all");
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:text-blue-300"
                      >
                        <FaTimes />
                        Clear filter
                      </button>
                    </div>
                  </div>
                )}

                {/* Transactions Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-800">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        {activeCard === "Registration" && (
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Company Earnings
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {currentTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-gray-900/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                                  tx.type === "Parent Payout"
                                    ? "bg-gradient-to-r from-rose-600 to-pink-600"
                                    : tx.type === "NFT Sale"
                                      ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                                      : tx.type === "Upgrade"
                                        ? "bg-gradient-to-r from-emerald-600 to-green-600"
                                        : "bg-gradient-to-r from-gray-600 to-gray-700"
                                }`}
                              >
                                {tx.user?.name?.charAt(0) || "S"}
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {tx.user?.name || "System"}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {tx.user?.email || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(tx.type)}
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTransactionColor(tx.type)}`}
                              >
                                {tx.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {tx.amount > 0 ? (
                                <FaArrowUp className="text-emerald-400" />
                              ) : (
                                <FaArrowDown className="text-rose-400" />
                              )}
                              <span
                                className={`text-lg font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}
                              >
                                {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount)}
                              </span>
                            </div>
                          </td>
                          {activeCard === "Registration" && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <FaWallet className="text-emerald-400" />
                                <span className="text-lg font-bold text-emerald-400">
                                  ${getCompanyEarningsForRegistration(tx)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                To company wallet
                              </p>
                            </td>
                          )}
                          <td className="px-6 py-4 max-w-xs">
                            <p className="text-gray-300 line-clamp-2">
                              {tx.description}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white">
                                {new Date(tx.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-400">
                                {new Date(tx.date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openTransactionModal(tx)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors border border-blue-800/50"
                            >
                              <FaEye />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaWallet className="text-2xl text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">
                        No transactions found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {filteredTransactions.length > 0 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 text-sm">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Show:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="bg-gray-900/50 border border-gray-700 text-white px-3 py-1 rounded-lg outline-none cursor-pointer text-sm"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={30}>30</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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
                                className={`px-3 py-2 rounded-lg transition-colors ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-900/50 border border-gray-700 text-gray-300 hover:bg-gray-800"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="text-gray-400 px-2">...</span>;
                          }
                          return null;
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        Next <FaChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : viewMode === "users" ? (
              /* Users View */
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">
                  Registered Users ({users.length})
                </h3>

                <div className="overflow-x-auto rounded-lg border border-gray-800">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Registration Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {currentUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-900/30 transition-colors cursor-pointer"
                          onClick={() => openUserModal(user)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-white">
                                {user.name?.charAt(0) || "U"}
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-400">
                                  Code: {user.referralCode}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-emerald-400 font-bold">
                              ${user.balance}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.currentPlan === "premium"
                                  ? "bg-purple-900/30 text-purple-300 border border-purple-700/50"
                                  : "bg-blue-900/30 text-blue-300 border border-blue-700/50"
                              }`}
                            >
                              {user.currentPlan || "basic"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.isActive
                                  ? "bg-emerald-900/30 text-emerald-300 border border-emerald-700/50"
                                  : "bg-red-900/30 text-red-300 border border-red-700/50"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-400">
                                {new Date(user.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUsers className="text-2xl text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">
                        No users found
                      </h3>
                      <p className="text-gray-500">
                        No registered users available
                      </p>
                    </div>
                  )}
                </div>

                {/* User Pagination */}
                {users.length > 0 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 text-sm">
                        Showing {userStartIndex + 1} to {Math.min(userEndIndex, users.length)} of {users.length} users
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Show:</span>
                        <select
                          value={userItemsPerPage}
                          onChange={(e) => {
                            setUserItemsPerPage(Number(e.target.value));
                            setUserCurrentPage(1);
                          }}
                          className="bg-gray-900/50 border border-gray-700 text-white px-3 py-1 rounded-lg outline-none cursor-pointer text-sm"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={30}>30</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUserCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={userCurrentPage === 1}
                        className="px-4 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        <FaChevronLeft /> Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {[...Array(userTotalPages)].map((_, index) => {
                          const page = index + 1;
                          if (
                            page === 1 ||
                            page === userTotalPages ||
                            (page >= userCurrentPage - 1 && page <= userCurrentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setUserCurrentPage(page)}
                                className={`px-3 py-2 rounded-lg transition-colors ${
                                  userCurrentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-900/50 border border-gray-700 text-gray-300 hover:bg-gray-800"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === userCurrentPage - 2 || page === userCurrentPage + 2) {
                            return <span key={page} className="text-gray-400 px-2">...</span>;
                          }
                          return null;
                        })}
                      </div>
                      <button
                        onClick={() => setUserCurrentPage(prev => Math.min(userTotalPages, prev + 1))}
                        disabled={userCurrentPage === userTotalPages}
                        className="px-4 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        Next <FaChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Graph View */
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">
                  Network Structure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <p className="text-gray-400 mb-2">Total Users</p>
                    <p className="text-3xl font-bold text-white">
                      {graphData?.stats?.totalUsers || 0}
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <p className="text-gray-400 mb-2">Active Users</p>
                    <p className="text-3xl font-bold text-white">
                      {graphData?.stats?.activeUsers || 0}
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <p className="text-gray-400 mb-2">Root Users</p>
                    <p className="text-3xl font-bold text-white">
                      {graphData?.stats?.rootUsers || 0}
                    </p>
                  </div>
                </div>

                {/* Network Visualization */}
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                  <h4 className="font-semibold text-white mb-6">
                    MLM Network Tree
                  </h4>
                  <div className="space-y-8">
                    {/* Level 0 - Root Users */}
                    <div>
                      <h5 className="text-sm font-semibold text-blue-400 mb-4">
                        Level 0 - Root Users
                      </h5>
                      <div className="flex flex-wrap gap-4">
                        {graphData?.nodes
                          ?.filter((node) => node.level === 0)
                          .map((node) => (
                            <div
                              key={node.id}
                              className="bg-gray-800/50 border border-blue-800/50 rounded-lg p-4 min-w-[200px]"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-white">
                                  {node.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-white">
                                    {node.name}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {node.email}
                                  </p>
                                </div>
                              </div>
                              <div className="text-sm text-gray-300 bg-blue-900/30 px-3 py-1 rounded">
                                Code: {node.id}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Level 1 - First Level Referrals */}
                    {graphData?.nodes?.filter((node) => node.level === 1)
                      .length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-emerald-400 mb-4">
                          Level 1 - Direct Referrals
                        </h5>
                        <div className="flex flex-wrap gap-4">
                          {graphData?.nodes
                            ?.filter((node) => node.level === 1)
                            .map((node) => (
                              <div
                                key={node.id}
                                className="bg-gray-800/50 border border-emerald-800/50 rounded-lg p-4 min-w-[200px]"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center font-bold text-white">
                                    {node.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-white">
                                      {node.name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {node.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-300 bg-emerald-900/30 px-3 py-1 rounded">
                                  Code: {node.id}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Transaction Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1123] rounded-2xl border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="border-b border-gray-800 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-900/30 rounded-xl">
                    <FaWallet className="text-2xl text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Transaction Details
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold border ${getTransactionColor(selectedTransaction.type)}`}
                      >
                        {selectedTransaction.type}
                      </span>
                      <span className="text-gray-400 flex items-center gap-2">
                        <FaHistory className="text-gray-500" />
                        {new Date(selectedTransaction.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl text-gray-400 hover:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-150px)] p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-900/30 rounded-lg">
                      <FaMoneyBillWave className="text-xl text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Amount</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedTransaction.amount > 0 ? "+" : ""}$
                        {Math.abs(selectedTransaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-900/30 rounded-lg">
                      <FaCoins className="text-xl text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Company Earnings</p>
                      <p className="text-2xl font-bold text-white">
                        $
                        {selectedTransaction.type === "Registration"
                          ? getCompanyEarningsForRegistration(
                              selectedTransaction,
                            )
                          : selectedTransaction.companyShare}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-900/30 rounded-lg">
                      <FaRocket className="text-xl text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p
                        className={`text-xl font-bold ${
                          selectedTransaction.status === "completed"
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {selectedTransaction.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-900/30 rounded-lg">
                    <MdPerson className="text-blue-400" />
                  </div>
                  User Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white text-xl">
                        {selectedTransaction.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">
                          {selectedTransaction.user?.name || "System"}
                        </h4>
                        <p className="text-blue-400">
                          {selectedTransaction.user?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-400 px-4 py-2 rounded-lg border border-blue-800/50">
                      <FaGem className="text-sm" />
                      <span className="font-semibold">
                        Code: {selectedTransaction.user?.code || "N/A"}
                      </span>
                    </div>
                  </div>

                  {selectedTransaction.parent && (
                    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center font-bold text-white text-xl">
                          {selectedTransaction.parent.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">
                            {selectedTransaction.parent.name}
                          </h4>
                          <p className="text-orange-400">
                            {selectedTransaction.parent.email}
                          </p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-orange-900/30 text-orange-400 px-4 py-2 rounded-lg border border-orange-800/50">
                        <FaHandHoldingUsd className="text-sm" />
                        <span className="font-semibold">Parent/Referrer</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <FaReceipt className="text-purple-400" />
                  </div>
                  Transaction Description
                </h3>
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                  <p className="text-gray-300 leading-relaxed">
                    {selectedTransaction.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1123] rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="border-b border-gray-800 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center font-bold text-white text-xl">
                    {selectedUser.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedUser.name}
                    </h2>
                    <p className="text-blue-400">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={closeUserModal}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl text-gray-400 hover:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-150px)] p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-900/30 rounded-lg">
                      <FaWallet className="text-xl text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Balance</p>
                      <p className="text-2xl font-bold text-white">
                        ${selectedUser.balance}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-900/30 rounded-lg">
                      <FaTag className="text-xl text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Referral Code</p>
                      <p className="text-xl font-bold text-white">
                        {selectedUser.referralCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-900/30 rounded-lg">
                      <MdPerson className="text-purple-400" />
                    </div>
                    User Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Plan</p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedUser.currentPlan === "premium"
                            ? "bg-purple-900/30 text-purple-300 border border-purple-700/50"
                            : "bg-blue-900/30 text-blue-300 border border-blue-700/50"
                        }`}
                      >
                        {selectedUser.currentPlan || "basic"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Status</p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedUser.isActive
                            ? "bg-emerald-900/30 text-emerald-300 border border-emerald-700/50"
                            : "bg-red-900/30 text-red-300 border border-red-700/50"
                        }`}
                      >
                        {selectedUser.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        Registration Date
                      </p>
                      <p className="text-white">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        Registration Time
                      </p>
                      <p className="text-white">
                        {new Date(selectedUser.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

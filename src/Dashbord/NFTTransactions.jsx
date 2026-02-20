import { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function NFTTransactions() {
  const [data, setData] = useState({
    sales: [],
    purchases: [],
    summary: {
      totalSales: 0,
      totalPurchases: 0,
      totalSalesAmount: 0,
      totalPurchasesAmount: 0,
      completedSales: 0,
      completedPurchases: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sales");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}api/nft-transactions/all`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error("Failed to fetch transactions");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load NFT transactions",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUserTransactions = async () => {
    if (!searchQuery.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Search Required",
        text: "Please enter User ID, Email, or Name",
      });
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(
        `${API_URL}api/nft-transactions/user/${searchQuery.trim()}`
      );
      const result = await response.json();

      if (result.success) {
        setData({
          sales: result.data.sales.map((sale) => ({
            transactionId: sale._id,
            seller: result.data.user,
            amount: sale.amount,
            status: sale.status,
            txHash: sale.txHash,
            date: sale.createdAt,
            description: sale.description,
          })),
          purchases: result.data.purchases.map((purchase) => ({
            transactionId: purchase._id,
            buyer: result.data.user,
            amount: purchase.amount,
            status: purchase.status,
            txHash: purchase.txHash,
            date: purchase.createdAt,
            description: purchase.description,
          })),
          summary: {
            totalSales: result.data.summary.totalSales,
            totalPurchases: result.data.summary.totalPurchases,
            totalSalesAmount: result.data.summary.totalEarned,
            totalPurchasesAmount: result.data.summary.totalSpent,
            completedSales: result.data.sales.filter((s) => s.status === "completed")
              .length,
            completedPurchases: result.data.purchases.filter(
              (p) => p.status === "completed"
            ).length,
          },
        });
        setCurrentPage(1);
        Swal.fire({
          icon: "success",
          title: "User Found",
          text: `Showing transactions for ${result.data.user.name}`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(result.message || "User not found");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Search Failed",
        text: error.message || "User not found or no transactions available",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchTransactions();
  };

  const formatCurrency = (amount) => `$${amount?.toFixed(2) || "0.00"}`;
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const currentData = activeTab === "sales" ? data.sales : data.purchases;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentData.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            NFT Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track all NFT sales and purchases
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchUserTransactions()}
              placeholder="Search by User ID, Email, or Name..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={searchUserTransactions}
            disabled={searchLoading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaUser />
            {searchLoading ? "Searching..." : "Search User"}
          </button>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          💡 Tip: Enter User ID (e.g., 6985b87fe485a459e59799a4), Email, or Name to
          search specific user transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Sales</p>
              <h3 className="text-3xl font-bold mt-2">{data.summary.totalSales}</h3>
              <p className="text-sm mt-1">
                {formatCurrency(data.summary.totalSalesAmount)}
              </p>
            </div>
            <FaMoneyBillWave className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Purchases</p>
              <h3 className="text-3xl font-bold mt-2">{data.summary.totalPurchases}</h3>
              <p className="text-sm mt-1">
                {formatCurrency(data.summary.totalPurchasesAmount)}
              </p>
            </div>
            <FaShoppingCart className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Completed</p>
              <h3 className="text-3xl font-bold mt-2">
                {data.summary.completedSales + data.summary.completedPurchases}
              </h3>
              <p className="text-sm mt-1">
                Sales: {data.summary.completedSales} | Purchases:{" "}
                {data.summary.completedPurchases}
              </p>
            </div>
            <FaCheckCircle className="text-4xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab("sales");
              setCurrentPage(1);
            }}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === "sales"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Sales ({data.sales.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("purchases");
              setCurrentPage(1);
            }}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === "purchases"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Purchases ({data.purchases.length})
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  {activeTab === "sales" ? "Seller" : "Buyer"}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tx Hash
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedData.map((tx) => {
                const user = activeTab === "sales" ? tx.seller : tx.buyer;
                return (
                  <tr
                    key={tx.transactionId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {user?.walletAddress?.slice(0, 10)}...
                          {user?.walletAddress?.slice(-8)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          tx.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {tx.status === "completed" ? (
                          <FaCheckCircle />
                        ) : (
                          <FaTimesCircle />
                        )}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4">
                      {tx.txHash ? (
                        <a
                          href={`https://polygonscan.com/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-sm"
                        >
                          {tx.txHash.slice(0, 10)}...
                          <FaExternalLinkAlt className="text-xs" />
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                          N/A
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, currentData.length)} of{" "}
              {currentData.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaChevronLeft /> Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

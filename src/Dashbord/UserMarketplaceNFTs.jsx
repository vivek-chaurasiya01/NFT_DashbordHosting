import { useState } from "react";
import {
  FaSearch,
  FaUser,
  FaGem,
  FaShoppingCart,
  FaCalendarAlt,
  FaDollarSign,
  FaLayerGroup,
} from "react-icons/fa";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserMarketplaceNFTs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const searchUserNFTs = async () => {
    if (!searchQuery.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter user email to search",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}api/nft-transactions/marketplace/${searchQuery.trim()}`
      );
      const result = await response.json();

      if (result.success) {
        setUserData(result.data);
        if (result.data.count === 0) {
          Swal.fire({
            icon: "info",
            title: "No NFTs Found",
            text: `${result.data.user.name} has no NFTs in marketplace`,
          });
        }
      } else {
        throw new Error(result.message || "User not found");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Search Failed",
        text: error.message || "User not found or no NFTs available",
      });
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Marketplace NFTs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Search user's NFTs listed in marketplace
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchUserNFTs()}
              placeholder="Enter user email (e.g., khatonreshma172@gmail.com)"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={searchUserNFTs}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaUser />
            {loading ? "Searching..." : "Search NFTs"}
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          💡 Tip: Enter user's email to find their NFTs in marketplace
        </p>
      </div>

      {/* User Info & Results */}
      {userData && (
        <>
          {/* User Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{userData.user.name}</h2>
                <p className="text-indigo-100 mt-1">{userData.user.email}</p>
                <p className="text-sm text-indigo-200 mt-2 font-mono">
                  {userData.user.walletAddress}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{userData.count}</div>
                <div className="text-indigo-100">NFTs in Marketplace</div>
              </div>
            </div>
          </div>

          {/* NFTs Grid */}
          {userData.marketplaceNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData.marketplaceNFTs.map((nft) => (
                <div
                  key={nft._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  {/* NFT Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
                    <div className="flex items-center justify-between">
                      <FaGem className="text-3xl text-white" />
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
                        Gen {nft.generation}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mt-3 truncate">
                      {nft.nftId}
                    </h3>
                  </div>

                  {/* NFT Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                        <FaLayerGroup /> Batch
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        #{nft.batchId} - Pos {nft.batchPosition}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                        <FaDollarSign /> Buy Price
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${nft.buyPrice}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                        <FaShoppingCart /> Sell Price
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        ${nft.sellPrice}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        Phase
                      </span>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-semibold capitalize">
                        {nft.phase}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        Status
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold capitalize">
                        {nft.status}
                      </span>
                    </div>

                    {nft.buyDate && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <FaCalendarAlt />
                          Listed: {formatDate(nft.buyDate)}
                        </div>
                      </div>
                    )}

                    {nft.profit !== 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          Profit
                        </span>
                        <span
                          className={`font-semibold ${
                            nft.profit > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          ${nft.profit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <FaGem className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No NFTs in Marketplace
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {userData.user.name} has no NFTs listed in the marketplace
              </p>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!userData && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Search User NFTs
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a user's email to view their NFTs in the marketplace
          </p>
        </div>
      )}
    </div>
  );
}

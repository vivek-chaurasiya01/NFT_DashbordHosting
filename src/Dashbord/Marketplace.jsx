import { useState, useEffect } from "react";
import { FaGem, FaShoppingCart, FaDollarSign, FaLayerGroup, FaUser, FaCalendarAlt, FaTag } from "react-icons/fa";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function Marketplace() {
  const [nfts, setNfts] = useState([]);
  const [summary, setSummary] = useState({ total: 0, adminNFTs: 0, userResoldNFTs: 0 });
  const [currentPhase, setCurrentPhase] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketplaceNFTs();
  }, []);

  const fetchMarketplaceNFTs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}api/nft/marketplace`);
      const result = await response.json();

      setNfts(result.nfts || []);
      setSummary(result.summary || { total: 0, adminNFTs: 0, userResoldNFTs: 0 });
      setCurrentPhase(result.currentPhase || "");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Load",
        text: error.message || "Could not fetch marketplace NFTs",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NFT Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">All NFTs available for purchase</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-4xl font-bold">{summary.total}</div>
          <div className="text-indigo-100 mt-1">Total NFTs</div>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
          <div className="text-4xl font-bold">{summary.adminNFTs}</div>
          <div className="text-blue-100 mt-1">Admin NFTs</div>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="text-4xl font-bold">{summary.userResoldNFTs}</div>
          <div className="text-green-100 mt-1">User Resold NFTs</div>
        </div>
      </div>

      {currentPhase && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <FaTag className="text-yellow-600 dark:text-yellow-400" />
            <span className="font-semibold text-yellow-800 dark:text-yellow-300">Current Phase: </span>
            <span className="text-yellow-900 dark:text-yellow-200 capitalize">{currentPhase}</span>
          </div>
        </div>
      )}

      {nfts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <FaShoppingCart className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No NFTs Available</h3>
          <p className="text-gray-600 dark:text-gray-400">Marketplace is currently empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <div
              key={nft._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
                <div className="flex items-center justify-between">
                  <FaGem className="text-3xl text-white" />
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
                    Gen {nft.generation}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mt-3 truncate">{nft.nftId}</h3>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                    <FaUser /> Seller
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[150px]">
                    {nft.seller?.name || "Unknown"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Type</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    nft.type === "admin_original" 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  }`}>
                    {nft.type === "admin_original" ? "Admin NFT" : "User Resold"}
                  </span>
                </div>

                {nft.batchId && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                      <FaLayerGroup /> Batch
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      #{nft.batchId} {nft.batchPosition && `- Pos ${nft.batchPosition}`}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                    <FaDollarSign /> Buy Price
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">${nft.buyPrice}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                    <FaShoppingCart /> Sell Price
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">${nft.sellPrice}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Phase</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-semibold capitalize">
                    {nft.phase}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Status</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold capitalize">
                    {nft.status}
                  </span>
                </div>

                {nft.createdAt && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <FaCalendarAlt />
                      Listed: {formatDate(nft.createdAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

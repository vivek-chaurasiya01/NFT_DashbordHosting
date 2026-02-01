import React, { useState, useEffect } from "react";
import { FaCubes, FaPlay, FaEye, FaRocket, FaChartLine } from "react-icons/fa";

// const API_BASE_URL = "http://localhost:5000/api/nft";
const API_URL = import.meta.env.VITE_API_URL;

export default function NFTAdmin() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nftStatus, setNftStatus] = useState(null);
  const [marketplace, setMarketplace] = useState(null);

  const apiCall = async (endpoint, method = "GET", body = null) => {
    try {
      const response = await fetch(`${API_URL}api/nft${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      const text = await response.text();

      if (!response.ok) {
        console.error("API Raw Response:", text);
        throw new Error(`HTTP ${response.status}`);
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("API Error:", error.message);
      return { error: error.message };
    }
  };

  // Initialize NFT System - Creates 500 NFTs in 125 batches
  const initializeNFTSystem = async () => {
    setLoading(true);
    const result = await apiCall("/initialize", "POST");
    if (result.message) {
      alert(
        `Success: ${result.message}\nTotal NFTs: ${result.totalNFTs}\nTotal Batches: ${result.totalBatches}\nBatch Size: ${result.batchSize}`,
      );
      fetchNFTStatus();
      fetchMarketplace();
    } else if (result.error) {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  // Get NFT Status
  const fetchNFTStatus = async () => {
    setRefreshing(true);
    const result = await apiCall("/status");
    setNftStatus(result);
    setRefreshing(false);
  };

  // Get Marketplace
  const fetchMarketplace = async () => {
    setRefreshing(true);
    const result = await apiCall("/marketplace");
    setMarketplace(result);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNFTStatus();
    fetchMarketplace();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FaCubes className="text-purple-500" />
          NFT System Admin
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage NFT system using database APIs
        </p>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Initialize NFT System */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FaPlay className="text-blue-500 text-xl" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Initialize NFT System
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Creates 500 NFTs in 125 batches (4 NFTs per batch) and saves them in
            database
          </p>
          <button
            onClick={initializeNFTSystem}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            <FaPlay />
            {loading ? "Creating NFTs..." : "Initialize NFT System"}
          </button>
        </div>

        {/* Data Refresh */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FaEye className="text-green-500 text-xl" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Refresh Data
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Refresh NFT status and marketplace data from the server
          </p>
          <div className="flex gap-3">
            <button
              onClick={fetchNFTStatus}
              disabled={refreshing}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <FaEye className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Status"}
            </button>
            <button
              onClick={fetchMarketplace}
              disabled={refreshing}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <FaEye className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Marketplace"}
            </button>
          </div>
        </div>
      </div>

      {/* NFT Status Display */}
      {nftStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FaChartLine className="text-green-500 text-xl" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              NFT System Status
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">
                    Current Phase
                  </p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100 capitalize">
                    {nftStatus.currentPhase || "Not Started"}
                  </p>
                </div>
                <FaRocket className="text-2xl text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    Available NFTs
                  </p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">
                    {nftStatus.preLaunch?.availableNFTs || 0}
                  </p>
                </div>
                <FaCubes className="text-2xl text-green-500" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-purple-400 text-sm">
                    Price Per NFT
                  </p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    ${nftStatus.preLaunch?.pricePerNFT || 10}
                  </p>
                </div>
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Pre-Launch Details:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>
                • Max {nftStatus.preLaunch?.maxPerUser || 2} NFTs per user
              </li>
              <li>
                • Price: ${nftStatus.preLaunch?.pricePerNFT || 10} per NFT
              </li>
              <li>
                • Total Available: {nftStatus.preLaunch?.availableNFTs || 0}{" "}
                NFTs
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Marketplace Status */}
      {marketplace && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FaEye className="text-orange-500 text-xl" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Marketplace Status
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 dark:text-orange-400 text-sm">
                    Current Batch
                  </p>
                  <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    Batch #{marketplace.currentBatch || 1}
                  </p>
                </div>
                <span className="text-2xl">📦</span>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                    Batch Progress
                  </p>
                  <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                    {marketplace.batchProgress || "0/4"}
                  </p>
                </div>
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Flow Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          NFT System Flow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Phase 1: Pre-Launch
            </h4>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• 500 NFTs in 125 batches</li>
              <li>• $10 each, max 2 per user</li>
              <li>• 4 NFTs per batch</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Phase 2: Trading
            </h4>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• $20 = 1 Hold + 1 Sell NFT</li>
              <li>• Previous holds become sellable</li>
              <li>• Revenue sharing system</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Phase 3: Blockchain
            </h4>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Burn NFTs for blockchain tokens</li>
              <li>• Next batch unlocks when current completes</li>
              <li>• Users can sell after all 500 admin NFTs sold</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

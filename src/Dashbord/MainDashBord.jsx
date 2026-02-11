import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaWallet,
  FaUsers,
  FaChartBar,
  FaNetworkWired,
  FaTree,
  FaUserFriends,
  FaFileAlt,
  FaSignOutAlt,
  FaCrown,
  FaUserCircle,
  FaSearch,
  FaGem,
  FaRocket,
  FaBug,
  FaServer,
  FaEnvelope,
  FaKey,
  FaSitemap,
  FaMoneyBillWave,
} from "react-icons/fa";
import { FiMoon, FiSun } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";

/* MENU STYLE */
const menuClass = ({ isActive }) =>
  `flex items-center gap-4 px-4 py-4 rounded-xl transition-colors duration-200
   ${
     isActive
       ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white"
       : "text-gray-400 hover:text-white hover:bg-white/10"
   }`;

export default function MainDashBord() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dateTime, setDateTime] = useState(new Date()); // ✅ realtime

  const navigate = useNavigate();
  const location = useLocation();

  /* SCREEN CHECK */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* DARK MODE */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* REAL TIME CLOCK */
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("root-wallet")) return "Root Wallet";
    if (path.includes("registration-flow")) return "Registration";
    if (path.includes("registration-report")) return "Reports";
    if (path.includes("user-management")) return "Users";
    if (path.includes("analytics")) return "Analytics";
    if (path.includes("system-settings")) return "Settings";
    if (path.includes("mlm-hierarchy")) return "MLM Hierarchy";
    if (path.includes("contact-us")) return "Contact Us";
    if (path.includes("nft-admin")) return "NFT Admin";
    if (path.includes("nft-tree-analysis")) return "NFT Tree Analysis";
    if (path.includes("withdrawal")) return "Withdrawal";
    if (path.includes("change-password")) return "Change Password";
    if (path.includes("api-testing")) return "API Testing";
    if (path.includes("nft-complete-system")) return "NFT Complete System";
    return "Dashboard";
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {/* DARK MODE */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full
        bg-gray-900 text-white flex items-center justify-center shadow-lg"
      >
        {darkMode ? <FiSun /> : <FiMoon />}
      </button>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => !isMobile && setSidebarCollapsed(false)}
        onMouseLeave={() => !isMobile && setSidebarCollapsed(true)}
        className={`fixed top-0 left-0 h-full z-50 flex flex-col
        bg-gradient-to-b from-gray-900 to-gray-950
        border-r border-gray-800 transition-[width,transform] duration-300
        ${
          isMobile
            ? sidebarOpen
              ? "w-full translate-x-0"
              : "-translate-x-full w-full"
            : sidebarCollapsed
              ? "w-26"
              : "w-64"
        }`}
      >
        {/* LOGO */}
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <FaCrown className="text-white text-xl" />
          </div>
          {!sidebarCollapsed && !isMobile && (
            <span className="ml-3 text-white font-bold text-lg">MLM Admin</span>
          )}
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {[
            ["Dashboard", "/Dashbord", FaHome],
            ["Root Wallet", "/Dashbord/root-wallet", FaWallet],
            ["Withdrawal", "/Dashbord/withdrawal", FaMoneyBillWave],
            ["My Hierarchy", "/Dashbord/mlm-hierarchy", FaTree],
            ["Users", "/Dashbord/user-management", FaUserFriends],
            ["Contact Us", "/Dashbord/contact-us", FaEnvelope],
            ["NFT Admin", "/Dashbord/nft-admin", FaGem],
            ["NFT Tree", "/Dashbord/nft-tree-analysis", FaSitemap],
            ["Change Password", "/Dashbord/change-password", FaKey],
            ["Analytics", "/Dashbord/analytics", FaChartBar],
          ].map(([label, path, Icon]) => (
            <NavLink
              key={label}
              to={path}
              end={path === "/Dashbord"}
              className={menuClass}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <div
                className={`flex items-center justify-center rounded-xl
                ${sidebarCollapsed && !isMobile ? "w-12 h-12" : "w-9 h-9"}
                bg-white/10`}
              >
                <Icon size={sidebarCollapsed && !isMobile ? 24 : 18} />
              </div>
              {(!sidebarCollapsed || isMobile) && (
                <span className="font-semibold">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-600 rounded-xl text-white flex items-center justify-center gap-2"
          >
            <FaSignOutAlt />
            {(!sidebarCollapsed || isMobile) && "Logout"}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div
        className={`flex-1 flex flex-col transition-all
        ${!isMobile && (sidebarCollapsed ? "lg:ml-26" : "lg:ml-64")}`}
      >
        {/* HEADER */}
        {/* HEADER */}
        <header
          className="h-20 flex items-center justify-between px-4 md:px-6
  bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
        >
          {/* LEFT */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"
              >
                <GiHamburgerMenu />
              </button>
            )}

            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-6">
            {/* DATE & TIME RIGHT */}
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-500">
                {dateTime.toLocaleDateString()}
              </p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {dateTime.toLocaleTimeString()}
              </p>
            </div>

            {/* SEARCH */}
            <div className="hidden md:flex items-center relative w-64">
              <FaSearch className="absolute left-4 text-white" />
              <input
                placeholder="Search..."
                className="w-full pl-12 pr-4 py-2.5 rounded-xl
        bg-gray-100 dark:bg-gray-800 text-white"
              />
            </div>

            {/* USER */}
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FaUserCircle className="text-white text-lg" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-950 dashboard-content">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

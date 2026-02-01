import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaLock, FaEnvelope, FaRocket } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://api.gtnworld.live/api/SuperAdmin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.message === "Login successful") {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("superAdminToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        await Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${data.user.name}!`,
          confirmButtonColor: "#9333ea",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/Dashbord");
      } else {
        throw new Error(data.message || "Invalid credentials");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.message || "Network error or invalid credentials",
        confirmButtonColor: "#9333ea",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Floating Circles Animation */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-75 animate-pulse"></div>

        <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden">
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce">
                <FaRocket size={40} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                NFT Trading
              </h1>
              <p className="text-purple-200 text-sm font-medium">
                Admin Dashboard Login
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-purple-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-purple-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white font-bold py-4 px-4 rounded-xl hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-gray-400 text-sm">
              🔒 Secure NFT Trading Platform
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

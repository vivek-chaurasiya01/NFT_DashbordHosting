import { useState, useEffect } from "react";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaShieldAlt,
  FaEnvelope,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  // Get user email from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "New password and confirm password don't match",
        confirmButtonColor: "#ef4444",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Weak Password",
        text: "Password must be at least 6 characters long",
        confirmButtonColor: "#ef4444",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("superAdminToken");

      const response = await axios.put(
        `${API_URL}api/SuperAdmin/change-password`,
        {
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "Password Updated! 🔐",
          text: "Your password has been changed successfully",
          confirmButtonColor: "#10b981",
          background: "#1f2937",
          color: "#fff",
          timer: 2000,
          showConfirmButton: false,
        });

        setFormData({
          email: formData.email, // Keep email
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Something went wrong",
        confirmButtonColor: "#ef4444",
        background: "#1f2937",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Animated Header */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl animate-pulse">
            <FaKey className="text-white text-3xl" />
          </div>
          <h2 className="mt-6 text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Change Password
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-2">
            Keep your account secure with a strong password
          </p>
        </div>

        {/* Modern Card */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <InputField
              label="Email Address"
              icon={<FaEnvelope />}
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="admin@example.com"
              disabled={true}
            />

            {/* Current Password */}
            <InputField
              label="Current Password"
              icon={<FaLock />}
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              toggle={() => toggle("current")}
              show={showPasswords.current}
              placeholder="Enter your current password"
            />

            {/* New Password */}
            <InputField
              label="New Password"
              icon={<FaLock />}
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              toggle={() => toggle("new")}
              show={showPasswords.new}
              placeholder="Create a strong password"
              helper="Minimum 6 characters required"
            />

            {/* Confirm Password */}
            <InputField
              label="Confirm New Password"
              icon={<FaShieldAlt />}
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmPassword: e.target.value,
                })
              }
              toggle={() => toggle("confirm")}
              show={showPasswords.confirm}
              placeholder="Re-enter your new password"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-4 rounded-2xl font-bold text-white text-lg
              bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
              hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700
              transform hover:scale-[1.02] transition-all duration-300 shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              focus:outline-none focus:ring-4 focus:ring-purple-500/50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Password...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <FaKey className="text-xl" />
                  Change Password
                </div>
              )}
            </button>
          </form>

          {/* Security Tips */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaShieldAlt className="text-indigo-600 dark:text-indigo-400 text-xl" />
              <p className="text-lg font-bold text-indigo-800 dark:text-indigo-200">
                Security Best Practices
              </p>
            </div>
            <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Use a combination of letters, numbers, and symbols
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Avoid using personal information in passwords
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Never share your password with anyone
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Change passwords regularly for better security
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Enhanced Input Component */
function InputField({
  label,
  icon,
  type,
  value,
  onChange,
  toggle,
  show,
  placeholder,
  helper,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required
          className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300
          ${disabled 
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-indigo-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
          }
          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
          outline-none font-medium`}
        />
        {toggle && (
          <button
            type="button"
            onClick={toggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
          >
            {show ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
          </button>
        )}
      </div>
      {helper && (
        <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          💡 {helper}
        </p>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { User, Mail, Lock, Camera, LogOut, Save, Eye, EyeOff, CheckCircle, AlertCircle, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Settings() {
  const { user, logout, updateUser } = useAuth();

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path}`;
  };

  const [profileData, setProfileData] = useState({
    name: user?.name || "Admin User",
    email: user?.email || "admin@mediconnect.com",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(getAvatarUrl(user?.avatar));
  const [avatarFile, setAvatarFile] = useState(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const fileInputRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please select an image file.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async () => {
    if (!profileData.name.trim() || !profileData.email.trim()) {
      showToast("error", "Name and email are required.");
      return;
    }
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", user?.email);
      formData.append("name", profileData.name);
      formData.append("newEmail", profileData.email);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = {
        ...res.data,
        avatar: res.data.avatar ? `http://localhost:8080${res.data.avatar}` : null,
      };
      if (updateUser) updateUser(updatedUser);
      setAvatarPreview(updatedUser.avatar);
      showToast("success", "Profile updated successfully.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast("error", "All password fields are required.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast("error", "New password must be at least 6 characters.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("error", "New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put("/auth/change-password", {
        email: user?.email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("success", "Password changed successfully.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account information and security</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            Profile Information
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-blue-100" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-100">
                  {getInitials(profileData.name)}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow transition"
              >
                <Camera size={13} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">{profileData.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profileData.email}</p>
              <button onClick={() => fileInputRef.current.click()} className="text-xs text-blue-600 hover:underline mt-1">
                Change photo
              </button>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleProfileSave}
            disabled={profileLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            <Save size={15} />
            {profileLoading ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* Dark Mode Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
            {darkMode ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-yellow-500" />}
            Appearance
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Choose how MediConnect looks for you.</p>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-yellow-100'}`}>
                {darkMode ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-yellow-500" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{darkMode ? "Dark Mode" : "Light Mode"}</p>
                <p className="text-xs text-gray-400">{darkMode ? "Switch to light theme" : "Switch to dark theme"}</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                darkMode ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                darkMode ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
            <Lock size={18} className="text-blue-500" />
            Change Password
          </h2>

          <div className="space-y-4 mb-5">
            {[
              { label: "Current Password", key: "currentPassword", show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
              { label: "New Password", key: "newPassword", show: showNew, toggle: () => setShowNew(!showNew) },
              { label: "Confirm New Password", key: "confirmPassword", show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
            ].map(({ label, key, show, toggle }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={show ? "text" : "password"}
                    value={passwordData[key]}
                    onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {passwordData.newPassword && (
            <div className="mb-4">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                    passwordData.newPassword.length >= i * 3
                      ? passwordData.newPassword.length >= 10 ? "bg-green-500"
                        : passwordData.newPassword.length >= 6 ? "bg-yellow-400" : "bg-red-400"
                      : "bg-gray-200"
                  }`} />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {passwordData.newPassword.length < 6 ? "Too short"
                  : passwordData.newPassword.length < 10 ? "Fair — try adding numbers or symbols"
                  : "Strong password"}
              </p>
            </div>
          )}

          <button
            onClick={handlePasswordSave}
            disabled={passwordLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            <Lock size={15} />
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </div>

        {/* Session */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900 p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
            <LogOut size={18} className="text-red-500" />
            Session
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sign out of your MediConnect account on this device.</p>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-5 py-2.5 rounded-lg border border-red-200 transition"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

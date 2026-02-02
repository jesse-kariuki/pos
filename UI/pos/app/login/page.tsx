"use client";

import { useState } from "react";
import { FaSignInAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const data = { 
      email: username, 
      password 
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
        const tokenToStore = result.jwt || result.token;
        if (tokenToStore) {
          localStorage.setItem("token", tokenToStore);
        } else {
          console.error("No token found in response:", result);
        }
        
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
        }

        setMessage(result.message || "Login successful! Redirecting...");
        setMessageType("success");

        setTimeout(() => {
          if (result.user && result.user.role === "ROLE_ADMIN") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/cashier";
          }
        }, 1500);
      } else {
        setMessage(result.message || result.error || "Login failed. Please check your credentials.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("A network error occurred. Please check your connection.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Desktop Layout - Fixed Full Screen */}
      <div className="hidden lg:flex fixed inset-0 overflow-hidden">
        <div className="grid grid-cols-2 h-full w-full">
          {/* Left side - Brand & Image */}
          <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 p-12 flex flex-col">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-700 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-700 rounded-full translate-x-1/3 translate-y-1/3 opacity-10"></div>
            
            {/* Logo and brand */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-12">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/30">
                  <Image 
                    src="/images/logo.jpeg" 
                    alt="ESIT Groceries Logo" 
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">ESIT GROCERIES</h1>
                  <p className="text-emerald-200 text-lg mt-2 font-medium">Fresh Products, Better Living</p>
                </div>
              </div>
              
              <div className="mt-16">
                <h2 className="text-3xl font-semibold text-white mb-6">Welcome Back!</h2>
                <p className="text-emerald-100 text-lg max-w-md leading-relaxed">
                  Sign in to access your dashboard and manage your grocery operations efficiently.
                  Experience seamless inventory management and smooth transactions.
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative z-10 mt-auto">
              <div className="relative h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                <Image 
                  src="/images/groceries.jpeg" 
                  alt="Fresh Groceries" 
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="bg-gray-900 p-14 flex flex-col justify-center overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Sign In</h2>
                <p className="text-gray-400 text-lg">Access your account to continue</p>
              </div>

              {message && (
                <div className={`animate-slide-down mb-8 p-5 rounded-2xl border ${
                  messageType === "success" 
                    ? "bg-emerald-900/30 border-emerald-700/50 text-emerald-300" 
                    : "bg-red-900/30 border-red-700/50 text-red-300"
                }`}>
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                      messageType === "success" ? "bg-emerald-800/50" : "bg-red-800/50"
                    }`}>
                      {messageType === "success" ? (
                        <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email Field */}
                <div className="space-y-4">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative group">
                    
                    <input
                      type="text"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 text-white placeholder-gray-500 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 hover:border-gray-600 shadow-inner"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Password
                    </label>
                  </div>
                  <div className="relative group">
                    
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-12 py-4 text-white placeholder-gray-500 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 hover:border-gray-600 shadow-inner"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center group"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors duration-200" />
                      ) : (
                        <FaEye className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl ${
                    loading 
                      ? "bg-gray-700 cursor-not-allowed shadow-inner" 
                      : "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-teal-700"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="text-lg">Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <FaSignInAlt className="h-6 w-6" />
                      <span className="text-lg">Sign In</span>
                    </div>
                  )}
                </button>
              </form>

              {/* Quick Tips */}
              <div className="mt-12 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                <h3 className="text-lg font-semibold text-emerald-400 mb-3">Quick Tips</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">•</span>
                    Use your registered email address
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">•</span>
                    Contact admin for password reset
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">•</span>
                    Ensure stable internet connection
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Scrollable */}
      <div className="lg:hidden min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800">
        <div className="p-6">
          {/* Logo and brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/30">
              <Image 
                src="/images/logo.jpeg" 
                alt="ESIT Groceries Logo" 
                fill
                className="object-cover"
                priority
                sizes="64px"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">ESIT GROCERIES</h1>
              <p className="text-emerald-200 text-sm mt-1 font-medium">Fresh Products, Better Living</p>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Welcome Back!</h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Sign in to access your dashboard and manage your grocery operations efficiently.
              Experience seamless inventory management and smooth transactions.
            </p>
          </div>

          {/* Mobile Form Container */}
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">Sign In</h2>
              <p className="text-gray-400">Access your account to continue</p>
            </div>

            {message && (
              <div className={`animate-slide-down mb-6 p-4 rounded-2xl border ${
                messageType === "success" 
                  ? "bg-emerald-900/30 border-emerald-700/50 text-emerald-300" 
                  : "bg-red-900/30 border-red-700/50 text-red-300"
              }`}>
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                    messageType === "success" ? "bg-emerald-800/50" : "bg-red-800/50"
                  }`}>
                    {messageType === "success" ? (
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base">{message}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-3">
                <label htmlFor="email-mobile" className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  
                  <input
                    type="text"
                    id="email-mobile"
                    name="email"
                    placeholder="you@example.com"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 text-white placeholder-gray-500 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 hover:border-gray-600 shadow-inner text-base"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="password-mobile" className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative group">
                 
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password-mobile"
                    name="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3 text-white placeholder-gray-500 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 hover:border-gray-600 shadow-inner text-base"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center group touch-manipulation"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors duration-200" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors duration-200" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-bold text-base text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl touch-manipulation ${
                  loading 
                    ? "bg-gray-700 cursor-not-allowed shadow-inner" 
                    : "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-teal-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="text-base">Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <FaSignInAlt className="h-5 w-5" />
                    <span className="text-base">Sign In</span>
                  </div>
                )}
              </button>
            </form>

            {/* Quick Tips */}
            <div className="mt-8 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <h3 className="text-base font-semibold text-emerald-400 mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  Use your registered email address
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  Contact admin for password reset
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  Ensure stable internet connection
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Image on Mobile */}
          <div className="mt-8">
            <div className="relative h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
              <Image 
                src="/images/groceries.jpeg" 
                alt="Fresh Groceries" 
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
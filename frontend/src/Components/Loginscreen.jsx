import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Loginscreen = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [imapHost, setImapHost] = useState("imap.gmail.com");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  const goToLandingpage = () => navigate("/landingpage");

  // Fill demo credentials
  const handleDemoLogin = () => {
    setEmail("qumail1611@gmail.com");
    setAppPassword("znxx feza pwag nmnb");
    setImapHost("imap.gmail.com");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const response = await fetch('https://qumail-backend-4s2a.onrender.com/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail: email, appPassword, imapHost }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid credentials");

      // Navigate to dashboard with credentials
      navigate('/dashboard', {
        state: {
          email: email,
          appPassword: appPassword,
          userName: data.name
        }
      });

    } catch (err) {
      console.error("Login error:", err);
      setAuthError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div
      style={{ backgroundColor: "#010312" }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(48, 39, 85, .8), rgba(10, 6, 34, .4))",
        }}
        className="p-4 lg:p-6 xl:p-8 rounded-lg shadow-lg max-w-sm lg:max-w-md xl:max-w-lg w-full mx-auto border-gray-100"
      >
        <h2 className="text-lg lg:text-xl xl:text-2xl font-bold mb-3 lg:mb-4 text-center text-white">
          Login with Gmail App Password
        </h2>
        <p className="text-gray-200 mb-4 lg:mb-6 text-center text-sm lg:text-base">
          Enter your Gmail address and an app-specific password (create one at
          myaccount.google.com/security if needed).
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
          <div className="mb-2 lg:mb-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 lg:py-3 px-3 lg:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              🚀 Fill Demo Credentials
            </button>
          </div>

          <input
            type="email"
            name="email"
            required
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 lg:p-3 bg-gray-800 rounded text-white text-sm lg:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <input
            type="password"
            name="appPassword"
            required
            placeholder="App Password"
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
            className="w-full p-2 lg:p-3 bg-gray-800 rounded text-white text-sm lg:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <input
            type="text"
            name="imapHost"
            placeholder="IMAP Host (optional)"
            disabled
            value={imapHost}
            onChange={(e) => setImapHost(e.target.value)}
            className="w-full p-2 lg:p-3 bg-gray-800 rounded text-white text-sm lg:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 opacity-50"
          />

          <div className="flex gap-2 lg:gap-3">
            <button
              type="button"
              onClick={goToLandingpage}
              disabled={isAuthenticating}
              className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm lg:text-base transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAuthenticating}
              className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm lg:text-base transition-colors disabled:opacity-50"
            >
              {isAuthenticating ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {authError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {authError}
          </div>
        )}
      </div>
    </div>
  );
};
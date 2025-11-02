import React, { useEffect, useState } from "react";

export default function AuthModal({ open, onClose, theme = "dark", onAuthSuccess }) {
  const [mode, setMode] = useState("initial"); // initial, login, signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setMode("initial");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setErrors({});
      setSuccessMessage("");
    }
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Get API URL dynamically based on current hostname (for network sharing)
  const getApiUrl = () => {
    // Use environment variable if set
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // Otherwise, use the same hostname as the frontend with port 8000
    // This allows network sharing: if accessing via 172.20.10.5:5173, API becomes 172.20.10.5:8000
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
    // For network IPs (e.g., 172.20.10.5), use that IP for backend too
    return `http://${hostname}:8000`;
  };
  
  const API_URL = getApiUrl();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validation
    if (!email) {
      setErrors({ email: "Email is required" });
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email" });
      setLoading(false);
      return;
    }
    if (!password) {
      setErrors({ password: "Password is required" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        if (data.detail) {
          if (data.detail.includes("email")) {
            setErrors({ email: data.detail });
          } else if (data.detail.includes("password")) {
            setErrors({ password: data.detail });
          } else {
            setErrors({ email: data.detail });
          }
        }
        setLoading(false);
        return;
      }

      // Login successful
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        createdAt: data.user.created_at,
      };

      // Store token and user data
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", "true");

      console.log("✅ Login successful - saved to localStorage:", {
        hasToken: !!data.access_token,
        user: userData.name,
        email: userData.email
      });

      setLoading(false);
      setSuccessMessage("Login successful!");

      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(userData);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      // Show more specific error message
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        setErrors({ 
          email: `Cannot connect to server at ${API_URL}. Make sure the backend is running: cd backend && python main.py` 
        });
      } else {
        setErrors({ email: `Error: ${error.message}` });
      }
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validation
    if (!name || name.trim().length < 2) {
      setErrors({ name: "Name must be at least 2 characters" });
      setLoading(false);
      return;
    }
    if (!email) {
      setErrors({ email: "Email is required" });
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email" });
      setLoading(false);
      return;
    }
    if (!password) {
      setErrors({ password: "Password is required" });
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        if (data.detail) {
          if (data.detail.includes("email") || data.detail.includes("account")) {
            setErrors({ email: data.detail });
          } else if (data.detail.includes("password")) {
            setErrors({ password: data.detail });
          } else if (data.detail.includes("name")) {
            setErrors({ name: data.detail });
          } else {
            setErrors({ email: data.detail });
          }
        }
        setLoading(false);
        return;
      }

      // Signup successful - auto login
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        createdAt: data.user.created_at,
      };

      // Now login to get token
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        localStorage.setItem("access_token", loginData.access_token);
      }

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", "true");

      console.log("✅ Signup successful - saved to localStorage:", {
        hasToken: !!localStorage.getItem("access_token"),
        user: userData.name,
        email: userData.email
      });

      setLoading(false);
      setSuccessMessage("Account created successfully!");

      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(userData);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Signup error:", error);
      // Show more specific error message
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        setErrors({ 
          email: `Cannot connect to server at ${API_URL}. Make sure the backend is running: cd backend && python main.py` 
        });
      } else {
        setErrors({ email: `Error: ${error.message}` });
      }
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    // TODO: Implement Google OAuth flow
    // For now, show a message that it's not implemented
    setErrors({ email: "Google authentication is not yet implemented. Please use email/password." });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 backdrop-blur-sm ${
          theme === "light" ? "bg-black/40" : "bg-black/70"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative glass w-full max-w-md rounded-2xl p-8 border shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg px-3 py-1.5 text-foreground-tertiary hover:bg-white/10 hover:text-foreground-primary transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
        
        {mode === "initial" && (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground-primary mb-2">Welcome to Kartsique</h3>
              <p className="text-sm text-foreground-secondary">
                Join the conversation and make your voice heard.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setMode("login")}
                className="w-full btn btn-primary rounded-xl shadow-glow"
              >
                Sign In
              </button>
              <button 
                onClick={() => setMode("signup")}
                className="w-full btn btn-outline rounded-xl"
              >
                Create Account
              </button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-transparent text-foreground-tertiary">Or continue with</span>
                </div>
              </div>
              <button 
                onClick={handleGoogleAuth}
                className="w-full btn btn-ghost rounded-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </>
        )}

        {(mode === "login" || mode === "signup") && (
          <form onSubmit={mode === "login" ? handleLogin : handleSignup}>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground-primary mb-2">
                {mode === "login" ? "Sign In" : "Create Account"}
              </h3>
              <p className="text-sm text-foreground-secondary">
                {mode === "login" 
                  ? "Welcome back! Please sign in to continue."
                  : "Join Kartsique to participate in democratic discourse."
                }
              </p>
            </div>

            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
                {successMessage}
              </div>
            )}

            <div className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground-primary placeholder-foreground-tertiary focus:outline-none focus:border-brand-glow/50 focus:ring-1 focus:ring-brand-glow/30 transition-colors [data-theme=light]:bg-white/80 [data-theme=light]:border-gray-300 [data-theme=light]:text-gray-900"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground-primary placeholder-foreground-tertiary focus:outline-none focus:border-brand-glow/50 focus:ring-1 focus:ring-brand-glow/30 transition-colors [data-theme=light]:bg-white/80 [data-theme=light]:border-gray-300 [data-theme=light]:text-gray-900"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground-primary placeholder-foreground-tertiary focus:outline-none focus:border-brand-glow/50 focus:ring-1 focus:ring-brand-glow/30 transition-colors [data-theme=light]:bg-white/80 [data-theme=light]:border-gray-300 [data-theme=light]:text-gray-900"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground-primary placeholder-foreground-tertiary focus:outline-none focus:border-brand-glow/50 focus:ring-1 focus:ring-brand-glow/30 transition-colors [data-theme=light]:bg-white/80 [data-theme=light]:border-gray-300 [data-theme=light]:text-gray-900"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-white/20 text-brand-neon focus:ring-brand-glow" />
                    <span className="ml-2 text-sm text-foreground-tertiary">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-brand-glow hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary rounded-xl shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>

              <p className="text-center text-sm text-foreground-tertiary">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-brand-glow hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-brand-glow hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </form>
        )}

        <p className="mt-6 text-xs text-foreground-tertiary text-center">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Hero from "./components/Hero.jsx";
import ActiveDebates from "./components/ActiveDebates.jsx";
import Timetable from "./components/Timetable.jsx";
import Insights from "./components/Insights.jsx";
import Footer from "./components/Footer.jsx";
import AuthModal from "./components/AuthModal.jsx";
import CallModal from "./components/CallModal.jsx";
import DebateCall from "./pages/DebateCall.jsx";
import Logo from "./components/Logo.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";

// Get API URL dynamically based on current hostname (for network sharing)
function getApiUrl() {
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
}

export default function App() {
  const API_URL = getApiUrl();
  const [showAuth, setShowAuth] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [callTopic, setCallTopic] = useState("Debate Room");
  const [debateCallId, setDebateCallId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(() => {
    // Check if user is already logged in from localStorage
    // This runs synchronously on mount to restore state immediately
    try {
      const token = localStorage.getItem("access_token");
      const saved = localStorage.getItem("user");
      
      // If we have both token and user data, restore immediately
      if (token && saved) {
        const parsedUser = JSON.parse(saved);
        // Ensure isAuthenticated flag is set
        localStorage.setItem("isAuthenticated", "true");
        console.log("✅ User restored from localStorage:", parsedUser.name);
        return parsedUser;
      }
    } catch (e) {
      console.error("❌ Error restoring user from localStorage:", e);
      // Clear corrupted data
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
    }
    console.log("ℹ️ No saved user found in localStorage");
    return null;
  });

  // Verify token on mount and restore user if valid
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");
    
    // If we don't have both token and user, clear state
    if (!token || !savedUser) {
      setUser((currentUser) => {
        if (currentUser) {
          console.log("⚠️ Inconsistent state: user in state but missing in localStorage");
        }
        return null;
      });
      return;
    }

    // Ensure user state is set from localStorage (backup in case initial state didn't work)
    try {
      const parsedUser = JSON.parse(savedUser);
      setUser((currentUser) => {
        if (!currentUser) {
          console.log("✅ User restored from localStorage in useEffect:", parsedUser.name);
          return parsedUser;
        }
        return currentUser;
      });
    } catch (e) {
      console.error("❌ Error parsing user in useEffect:", e);
    }

    // User was already restored optimistically in initial state
    // Now verify token with backend in the background (don't block UI)
    console.log("🔄 Verifying token with backend...");
    fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (res.ok) {
            const userData = await res.json();
            console.log("✅ Token verified successfully");
            return userData;
          } else if (res.status === 401) {
            // Token is invalid - clear all auth data
            console.log("❌ Token invalid (401), logging out...");
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
            setUser(null);
            throw new Error("Invalid token");
          } else {
            // Other errors (500, 503, etc.), keep user logged in
            console.warn("⚠️ Token verification failed with status:", res.status, "but keeping session");
            return null;
          }
        })
        .then((userData) => {
          if (userData) {
            // Update user data from server
            const updatedUser = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              createdAt: userData.created_at,
            };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            localStorage.setItem("isAuthenticated", "true");
          }
        })
        .catch((error) => {
          // Only clear if it's an auth error, not a network error
          if (error.message === "Invalid token") {
            console.log("❌ Token invalid, user logged out");
          } else {
            // Network error or other issues - keep user logged in
            console.warn("⚠️ Could not verify token (network error), but keeping session:", error.message);
            // Ensure user stays logged in - restore from localStorage
            const currentSavedUser = localStorage.getItem("user");
            if (currentSavedUser) {
              try {
                const parsedUser = JSON.parse(currentSavedUser);
                setUser(parsedUser);
                console.log("✅ Kept user logged in after network error");
              } catch (e) {
                console.error("❌ Error restoring user after network error:", e);
              }
            }
          }
        });
  }, [API_URL]); // Only run once on mount, don't depend on user to avoid infinite loops
  const [theme, setTheme] = useState(() => {
    // Get saved theme or default to dark
    const saved = localStorage.getItem("theme");
    return saved || "dark";
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Always scroll to top on page refresh/load
  useEffect(() => {
    // Scroll to top immediately on mount (page load/refresh)
    window.scrollTo(0, 0);
    
    // Also set scroll restoration to manual to prevent browser's default behavior
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Handle anchor link clicks for smooth scrolling with header offset
    const handleAnchorClick = (e) => {
      // Check if the clicked element or its parent is an anchor tag
      let anchor = e.target.closest('a[href^="#"]');
      if (anchor && anchor.getAttribute('href') !== '#') {
        const href = anchor.getAttribute('href');
        // Only handle if we're on the home page
        if (window.location.pathname === '/' || window.location.pathname === '') {
          e.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'smooth'
            });
            // Update URL without causing scroll
            window.history.pushState(null, '', href);
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("isAuthenticated");
    setUser(null);
  };

  const debates = [
    { topic: "Education Reform", status: "Live Now", time: "11:00–12:00", participants: 238 },
    { topic: "Employment & Wages", status: "Upcoming", time: "Today 15:00", participants: 412 },
    { topic: "Digital Rights & Privacy", status: "Upcoming", time: "Nov 3, 19:00", participants: 190 },
    { topic: "Healthcare Access", status: "Live Now", time: "Ongoing", participants: 305 },
  ];

  const timetable = [
    { date: "Nov 2", time: "15:00", topic: "Employment & Wages", age: "18–25" },
    { date: "Nov 2", time: "18:00", topic: "Local Transport", age: "26–40" },
    { date: "Nov 3", time: "11:00", topic: "Digital Rights & Privacy", age: "18–25" },
    { date: "Nov 3", time: "19:00", topic: "Healthcare Access", age: "41–60" },
  ];

  return (
    <Routes>
      <Route
        path="/debate/:debateCallId"
        element={<DebateCall user={user} />}
      />
      <Route
        path="/*"
        element={
          <>
            <HomePage
              user={user}
              theme={theme}
              setShowAuth={setShowAuth}
              showAuth={showAuth}
              showCall={showCall}
              setShowCall={setShowCall}
              callTopic={callTopic}
              setCallTopic={setCallTopic}
              handleAuthSuccess={handleAuthSuccess}
              handleLogout={handleLogout}
              toggleTheme={toggleTheme}
            debates={debates}
            timetable={timetable}
            debateCallId={debateCallId}
            setDebateCallId={setDebateCallId}
            showUserMenu={showUserMenu}
            setShowUserMenu={setShowUserMenu}
          />
            {showCall && debateCallId && user && (
              <DebateCall 
                debateCallId={debateCallId}
                user={user}
                onClose={() => {
                  setShowCall(false);
                  setDebateCallId(null);
                }}
              />
            )}
          </>
        }
      />
    </Routes>
  );
}

function HomePage({
  user,
  theme,
  setShowAuth,
  showAuth,
  showCall,
  setShowCall,
  callTopic,
  setCallTopic,
  handleAuthSuccess,
  handleLogout,
  toggleTheme,
  debates,
  timetable,
  debateCallId,
  setDebateCallId,
  showUserMenu,
  setShowUserMenu,
}) {
  return (
    <div className="font-sans min-h-screen" data-theme={theme}>
      {/* Top nav */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10 [data-theme=light]:border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <Logo isDark={theme === "light"} />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#active" className="text-gray-200 [data-theme=light]:text-gray-700 hover:text-brand-glow [data-theme=light]:hover:text-blue-600 transition-colors duration-200 font-medium px-2 py-1 rounded-md hover:bg-white/5 [data-theme=light]:hover:bg-black/5">
              Active
            </a>
            <a href="#timetable" className="text-gray-200 [data-theme=light]:text-gray-700 hover:text-brand-glow [data-theme=light]:hover:text-blue-600 transition-colors duration-200 font-medium px-2 py-1 rounded-md hover:bg-white/5 [data-theme=light]:hover:bg-black/5">
              Timetable
            </a>
            <a href="#insights" className="text-gray-200 [data-theme=light]:text-gray-700 hover:text-brand-glow [data-theme=light]:hover:text-blue-600 transition-colors duration-200 font-medium px-2 py-1 rounded-md hover:bg-white/5 [data-theme=light]:hover:bg-black/5">
              Insights
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 [data-theme=light]:bg-black/5 border border-white/10 [data-theme=light]:border-black/10 hover:bg-white/10 [data-theme=light]:hover:bg-black/10 transition-colors duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-neon flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-foreground-primary font-medium">{user.name}</span>
                  <svg className="w-4 h-4 text-foreground-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Mobile: show avatar only */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="sm:hidden w-10 h-10 rounded-full bg-brand-neon flex items-center justify-center text-white font-semibold text-sm shadow-md hover:opacity-80 transition-opacity"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                
                {/* Dropdown menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-lg border border-white/10 [data-theme=light]:border-black/10 py-2 z-50">
                      <div className="px-4 py-2 border-b border-white/10 [data-theme=light]:border-black/10">
                        <p className="text-sm font-medium text-foreground-primary">{user.name}</p>
                        <p className="text-xs text-foreground-tertiary">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 [data-theme=light]:text-red-600 hover:bg-white/5 [data-theme=light]:hover:bg-black/5 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="btn btn-primary rounded-lg shadow-glow"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Call Header - Sticky below main header */}
      <CallModal
        open={showCall}
        onClose={() => setShowCall(false)}
        theme={theme}
        topic={callTopic}
        user={user}
      />

      <main className={`space-y-24 ${showCall ? "pt-32" : "pt-24"}`}>
        <Hero 
          openAuth={() => setShowAuth(true)} 
          user={user}
          onJoinDebate={() => {
            // If user is signed in, try to join the first available debate
            if (user && debates.length > 0) {
              const firstDebate = debates[0];
              const debateCallId = uuidv4();
              setCallTopic(firstDebate.topic);
              setDebateCallId(debateCallId);
              setShowCall(true);
            } else {
              // If not signed in, show auth modal
              setShowAuth(true);
            }
          }}
        />

        <section id="active" className="max-w-7xl mx-auto px-6">
          <ActiveDebates 
            debates={debates} 
            onJoinDebate={(topic) => {
              // UUID will be generated in ActiveDebates component
            }}
            onJoinDebateModal={(topic, id) => {
              // Only open call modal if user is authenticated
              if (user) {
                setCallTopic(topic);
                setDebateCallId(id);
                setShowCall(true);
              } else {
                // Show auth modal if not authenticated
                setShowAuth(true);
              }
            }}
            onRequireAuth={() => {
              setShowAuth(true);
            }}
            user={user}
          />
        </section>

        <section id="timetable" className="max-w-7xl mx-auto px-6">
          <Timetable items={timetable} />
        </section>

        <section id="insights" className="max-w-7xl mx-auto px-6">
          <Insights />
        </section>
      </main>

      <Footer theme={theme} />
      <AuthModal 
        open={showAuth} 
        onClose={() => setShowAuth(false)} 
        theme={theme}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

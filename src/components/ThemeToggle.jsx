import React from "react";

export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className={`relative w-12 h-6 rounded-full flex items-center transition-all duration-300 ${
        theme === "light"
          ? "bg-gray-200 border border-gray-300 hover:bg-gray-300"
          : "bg-white/10 border border-white/20 hover:bg-white/15"
      }`}
      aria-label="Toggle theme"
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center ${
          theme === "light"
            ? "translate-x-6 bg-yellow-400"
            : "translate-x-0 bg-gray-300"
        }`}
      >
        {theme === "light" ? (
          <span className="text-xs">☀️</span>
        ) : (
          <span className="text-xs">🌙</span>
        )}
      </div>
    </button>
  );
}


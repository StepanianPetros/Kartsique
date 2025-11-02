import React from "react";

export default function Logo({ className = "", isDark = false }) {
  return (
    <div className={`flex items-center gap-2 ${className} group`}>
      {/* Minimalistic geometric logo - "K" shape */}
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-110"
      >
        {/* Simple "K" made of two lines forming a geometric shape */}
        <path
          d="M8 8 L8 24 M8 16 L20 8 M8 16 L20 24"
          stroke={isDark ? "#2563eb" : "#61eaff"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-200"
        />
      </svg>
      <span className={`font-display text-xl font-semibold tracking-tight transition-colors duration-200 ${
        isDark ? "text-gray-900 group-hover:text-blue-600" : "text-brand-glow"
      }`}>
        Kartsique
      </span>
    </div>
  );
}


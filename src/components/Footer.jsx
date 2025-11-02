import React from "react";
import Logo from "./Logo.jsx";

export default function Footer({ theme = "dark" }) {
  return (
    <footer className="mt-32 border-t border-white/10 dark:border-white/10 border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div className="mb-2">
            <Logo isDark={theme === "light"} className="scale-90" />
          </div>
          <nav className="flex gap-6 text-sm text-foreground-tertiary">
            <a href="#" className="hover:text-brand-glow transition-colors">About</a>
            <a href="#" className="hover:text-brand-glow transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-glow transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-glow transition-colors">Contact</a>
          </nav>
        </div>
        <p className="mt-8 text-sm text-foreground-tertiary text-center md:text-left">
          Kartsique - Turning public opinion into action. © 2024
        </p>
      </div>
    </footer>
  );
}

import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="text-2xl font-bold text-blue-600">
          Kartsique
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <a href="#home" className="text-gray-700 hover:text-blue-600">
            Home
          </a>
          <a href="#features" className="text-gray-700 hover:text-blue-600">
            Features
          </a>
          <a href="#about" className="text-gray-700 hover:text-blue-600">
            About
          </a>
          <a href="#contact" className="text-gray-700 hover:text-blue-600">
            Contact
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <a
            href="#home"
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            Home
          </a>
          <a
            href="#features"
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            Features
          </a>
          <a
            href="#about"
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            About
          </a>
          <a
            href="#contact"
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            Contact
          </a>
        </nav>
      )}
    </header>
  );
}

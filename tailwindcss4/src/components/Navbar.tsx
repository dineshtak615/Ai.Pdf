import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

// Props for NavItem component
interface NavItemProps {
  to: string;
  label: string;
  className?: string;
  activeClassName?: string;
  children?: ReactNode;
  onClick?: () => void;
}

// Props for Navbar component (currently no props, but we type children just in case)
interface NavbarProps {
  children?: ReactNode;
}

const Navbar: React.FC<NavbarProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Navigation items organized by category
  const navCategories = [
    {
      category: "Popular Tools",
      items: [
        { path: "/", label: "Home" },
        { path: "/merge", label: "Merge" },
        { path: "/split", label: "Split" },
        { path: "/compress", label: "Compress" },
        { path: "/word-to-pdf", label: "Word to PDF" },
        { path: "/pdf-to-word", label: "PDF to Word" },
      ],
    },
    {
      category: "Converters",
      items: [
        { path: "/pdf-to-powerpoint", label: "PDF to PPT" },
        { path: "/powerpoint-to-pdf", label: "PPT to PDF" },
        { path: "/pdf-to-jpg", label: "PDF to JPG" },
        { path: "/jpg-to-pdf", label: "JPG to PDF" },
      ],
    },
    {
      category: "Editing Tools",
      items: [
        { path: "/remove-pages", label: "Remove Pages" },
        { path: "/extract-pages", label: "Extract Pages" },
        { path: "/rotate", label: "Rotate" },
        { path: "/watermark", label: "Watermark" },
        { path: "/page-numbers", label: "Page Numbers" },
        { path: "/crop", label: "Crop" },
        { path: "/organize", label: "Organize" },
      ],
    },
    {
      category: "Security & More",
      items: [
        { path: "/lock-unlock", label: "Lock/Unlock" },
        { path: "/sign", label: "Sign PDF" },
        { path: "/redact", label: "Redact" },
        { path: "/optimize", label: "Optimize" },
        { path: "/compare", label: "Compare" },
        { path: "/repair", label: "Repair" },
        { path: "/chat", label: "Chat with PDF" },
      ],
    },
  ];

  // Flatten all nav items for mobile view
  const allNavItems = navCategories.flatMap((category) => category.items);

  // Initialize dark mode from local storage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedMode);
    if (savedMode) document.documentElement.classList.add("dark");
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.documentElement.classList.toggle("dark", newMode);
  };

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Custom NavLink component to handle active state properly
  const CustomNavLink: React.FC<NavItemProps> = ({
    to,
    label,
    className,
    activeClassName,
    children,
    onClick,
  }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        ${className ?? ""}
        ${isActive ? activeClassName ?? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"}
      `
      }
      onClick={onClick}
    >
      {children || label}
    </NavLink>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-3 shadow-lg transition-all duration-500 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center group" aria-label="AiPdf Home">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tighter transition-all duration-300 transform group-hover:scale-105">
              Ai.Pdf
            </span>
            <span className="ml-1.5 h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navCategories[0].items.map((item) => (
                <div key={item.path} className="group relative">
                  <CustomNavLink
                    to={item.path}
                    label={item.label}
                    className="px-3 py-2 text-sm font-medium transition-all duration-300"
                  />
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 w-0 group-hover:w-4/5 [&.active]:w-4/5"></span>
                </div>
              ))}

              {/* Mega Menu Dropdown */}
              <div className="relative group">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 cursor-pointer">
                  More Tools
                  <svg
                    className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:rotate-180"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="absolute right-0 w-[650px] origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50 p-5 grid grid-cols-3 gap-5">
                  {navCategories.slice(1).map((category, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.items.map((item) => (
                          <CustomNavLink
                            key={item.path}
                            to={item.path}
                            label={item.label}
                            className="block px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            activeClassName="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium shadow-sm"
                          >
                            <div className="flex items-center">
                              <span className="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
                              {item.label}
                            </div>
                          </CustomNavLink>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <NavLink
              to="/word-to-pdf"
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Convert Word
              </span>
            </NavLink>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              <div className="relative w-5 h-5">
                <svg
                  className={`absolute w-5 h-5 transition-all duration-500 ${isDarkMode ? "opacity-0 rotate-90" : "opacity-100 rotate-0"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                <svg
                  className={`absolute w-5 h-5 transition-all duration-500 ${isDarkMode ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              <div className="w-6 relative">
                <span
                  className={`block absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1"
                  }`}
                ></span>
                <span
                  className={`block absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`block absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-1"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-2 pb-4 space-y-2 px-4">
          {allNavItems.map((item) => (
            <CustomNavLink
              key={item.path}
              to={item.path}
              label={item.label}
              className="block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              activeClassName="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shadow-inner"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <span className="mr-3 opacity-70">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                {item.label}
              </div>
            </CustomNavLink>
          ))}
          <div className="px-4 pt-3">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              <span className="font-medium">Dark Mode</span>
              <div className="relative w-10 h-6 rounded-full bg-gray-200 dark:bg-gray-600 transition-colors duration-300">
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    isDarkMode ? "translate-x-4" : "translate-x-0.5"
                  }`}
                ></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

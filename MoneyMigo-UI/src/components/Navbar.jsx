import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Wallet, TrendingUp, PieChart, Menu, X } from "lucide-react";

function Navbar() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Wallet, label: "Transactions", path: "/transactions" },
    { icon: TrendingUp, label: "Investments", path: "/investments" },
    { icon: PieChart, label: "Analytics", path: "/analytics" },
  ];

  return (
    <nav className="bg-navbar">
      <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-4">
        <div className="text-yellow-700 font-bold text-xl">Money View</div>

        {/* Desktop Menu */}
        <div className="hidden md:block">
          <div className="flex items-center space-x-4">
            {navItems.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-300"
              >
                <item.icon size={26} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0  bg-opacity-50 z-40"
            onClick={() => setOpen(false)}
          ></div>

          <div
            className="md:hidden fixed top-0 right-0 h-full w-64 bg-neutral-900 shadow-xl z-50 transform transition-transform duration-300 translate-x-0"
          >
            <div className="p-4 relative">
              <button
                className="absolute top-4 right-4  text-neutral-300 p-2 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
                onClick={() => setOpen(false)}
              >
                <X size={24} />
              </button>

              <div className="mt-12 space-y-3">
                {navItems.map((item, i) => (
                  <Link
                    key={i}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-lg text-neutral-300 flex items-center gap-3 hover:bg-neutral-800 hover:text-white transition"
                  >
                    <item.icon size={24} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;

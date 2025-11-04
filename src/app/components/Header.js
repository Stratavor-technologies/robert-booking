"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({ userEmail, providers }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("Header userEmail: ", userEmail, providers);
  }, [userEmail, providers]);

  // Base navigation items
  const baseNavItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
    { label: "Notify-Users", href: "/notify" },
  ];

  // Add Past Bookings if user is logged in
  const navItems = userEmail
    ? [...baseNavItems, { label: "Past Bookings", href: "/past-bookings" }]
    : baseNavItems;

  // ✅ Only this triggers full page reload intentionally
  const handleReload = () => {
    window.location.href = "/"; // full reload ONLY for this button
  };

  // ✅ Client-side navigation for Past Bookings (no reload)
  const handlePastBookingsClick = (e) => {
    if (userEmail) {
      e.preventDefault();
      router.push(`/past-bookings?email=${encodeURIComponent(userEmail)}`);
    }
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-[999999]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo (client-side navigation) */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          BellyCast
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="text-gray-700 hover:text-blue-600 transition"
              onClick={
                item.label === "Past Bookings" ? handlePastBookingsClick : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info & Back to Home */}
        <div className="hidden md:flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-gray-600">Welcome, {userEmail}</span>
          )}
          <button
            onClick={handleReload} // 👈 only this reloads
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md px-6 py-4 space-y-4">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="block text-gray-700 hover:text-blue-600 transition"
              onClick={(e) => {
                if (item.label === "Past Bookings" && userEmail) {
                  e.preventDefault();
                  router.push(`/past-bookings?email=${encodeURIComponent(userEmail)}`);
                }
                setIsOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
          {userEmail && (
            <div className="border-t pt-4">
              <span className="block text-sm text-gray-600 mb-2">
                Welcome, {userEmail}
              </span>
            </div>
          )}
          <button
            onClick={handleReload} // 👈 full reload only here too
            className="block w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-center"
          >
            Back To Home
          </button>
        </div>
      )}
    </header>
  );
}

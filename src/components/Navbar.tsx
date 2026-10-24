"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-emerald-800 tracking-tight">
          Arjatala
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-emerald-700"
          >
            Dashboard
          </Link>
          <Link
            href="/peta-sampah"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-emerald-700"
          >
            Peta Sampah
          </Link>
          <Link
            href="/tentang"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-emerald-700"
          >
            Tentang Arjatala
          </Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/daftar"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Daftar
          </Link>
          <Link
            href="/masuk"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
          >
            Masuk
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-emerald-700"
            >
              Dashboard
            </Link>
            <Link
              href="/peta-sampah"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-emerald-700"
            >
              Peta Sampah
            </Link>
            <Link
              href="/tentang"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-emerald-700"
            >
              Tentang Arjatala
            </Link>
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
            <Link
              href="/daftar"
              className="rounded-lg px-3 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Daftar
            </Link>
            <Link
              href="/masuk"
              className="rounded-lg bg-emerald-700 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-800"
            >
              Masuk
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

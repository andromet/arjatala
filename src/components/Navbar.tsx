"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSessionUser, clearSessionUser, type AppUser } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getSessionUser());
    syncUser();

    window.addEventListener("arjatala-auth-change", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("arjatala-auth-change", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, [pathname]);

  // Sembunyikan Navbar di halaman login agar tampilan clean seperti desain
  if (pathname === "/masuk") return null;

  const handleLogout = () => {
    clearSessionUser();
    setUser(null);
    router.push("/");
  };

  const navLinkClass = (href: string) =>
    pathname === href
      ? "text-emerald-700 font-semibold"
      : "text-gray-600 hover:text-emerald-700 transition";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Kiri: Logo (Selalu mengarah ke '/' agar tidak 404) */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-emerald-700"
        >
          Arjatala
        </Link>

        {/* Tengah: Menu Navigasi sesuai Role */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link href="/" className={navLinkClass("/")}>
            Beranda
          </Link>
          <Link href="/peta" className={navLinkClass("/peta")}>
            Peta Sampah
          </Link>

          {user?.role === "user" && (
            <Link href="/laporan-saya" className={navLinkClass("/laporan-saya")}>
              Laporan Saya
            </Link>
          )}

          {user?.role === "admin" && (
            <Link href="/admin" className={navLinkClass("/admin")}>
              Dashboard Admin
            </Link>
          )}

          {user?.role !== "admin" && (
            <Link href="/lapor" className={navLinkClass("/lapor")}>
              Lapor Titik
            </Link>
          )}
        </nav>

        {/* Kanan: Status Akun / Tombol Masuk & Keluar */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/lapor"
                className="hidden sm:inline-block rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                + Lapor
              </Link>
              <Link
                href="/masuk"
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Masuk
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-gray-900">{user.full_name}</p>
                <p className="text-[11px] text-gray-500">
                  {user.role === "admin" ? "Administrator" : `NIM: ${user.nim}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
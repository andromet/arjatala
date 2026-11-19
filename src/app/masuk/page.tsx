"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { setSessionUser } from "@/lib/auth";

export default function MasukPage() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, nim, full_name, role")
        .eq("nim", nim.trim())
        .eq("password", password)
        .single();

      if (error || !data) {
        setErrorMsg("NIM atau kata sandi salah. Periksa kembali data akun Anda.");
        setLoading(false);
        return;
      }

      setSessionUser({
        id: data.id,
        nim: data.nim,
        full_name: data.full_name,
        role: data.role as "user" | "admin",
      });

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/laporan-saya");
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Panel Kiri: Branding & Informasi */}
      <div className="hidden lg:flex flex-col justify-between bg-[#F3F8F5] p-12 border-r border-gray-200">
        <Link href="/" className="text-2xl font-bold text-emerald-700">
          Arjatala
        </Link>

        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            DARI MAHASISWA, UNTUK LINGKUNGAN
          </p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-gray-900">
            Satu laporan Anda. Satu langkah menuju bersih.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            Masuk menggunakan NIM untuk memantau seluruh riwayat laporan sampah liar Anda secara otomatis tanpa perlu mencari kode laporan di peta.
          </p>
        </div>

        <p className="text-xs text-gray-500">
          Identitas pelapor tetap dijaga privasinya pada peta publik.
        </p>
      </div>

      {/* Panel Kanan: Form Login NIM & Password */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-emerald-700 mb-8"
          >
            ← Kembali ke beranda
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            Masuk ke <span className="text-emerald-700">Arjatala</span>
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Gunakan NIM dan kata sandi yang terdaftar untuk melanjutkan.
          </p>

          {errorMsg && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800">
                NIM / ID Pengguna
              </label>
              <input
                type="text"
                placeholder="Contoh: 1301220001"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Kata sandi
              </label>
              <input
                type="password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? "Memverifikasi akun..." : "Masuk"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
            <div className="h-px flex-1 bg-gray-200" />
            <span>atau</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <Link
            href="/peta"
            className="block w-full rounded-xl border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Jelajahi peta tanpa login
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSessionUser, type AppUser } from "@/lib/auth";
import type { ReportItem } from "@/components/PublicMapExplorer";

interface ReportLog {
  id: string;
  activity: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function LaporanSayaPage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [myReports, setMyReports] = useState<ReportItem[]>([]);
  const [selected, setSelected] = useState<ReportItem | null>(null);
  const [logs, setLogs] = useState<ReportLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getSessionUser();
    if (!currentUser || currentUser.role !== "user") {
      router.replace("/masuk");
      return;
    }
    setUser(currentUser);

    const fetchMyReports = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("reporter_nim", currentUser.nim)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const list = data as ReportItem[];
        setMyReports(list);
        if (list.length > 0) setSelected(list[0]);
      }
      setLoading(false);
    };

    fetchMyReports();
  }, [router]);

  useEffect(() => {
    if (!selected) return;
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("report_logs")
        .select("*")
        .eq("report_id", selected.id)
        .order("created_at", { ascending: true });

      setLogs((data as ReportLog[]) || []);
    };
    fetchLogs();
  }, [selected]);

  if (!user) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Laporan saya
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Pantau setiap langkah laporan milik <strong>{user.full_name}</strong> ({user.nim}) hingga lokasi kembali bersih.
          </p>
        </div>
        <Link
          href="/lapor"
          className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          + Laporan baru
        </Link>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-gray-500">Memuat riwayat laporan Anda...</p>
      ) : myReports.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-base font-semibold text-gray-800">
            Anda belum memiliki laporan sampah liar.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Laporan yang Anda buat saat login akan otomatis muncul di halaman ini.
          </p>
          <Link
            href="/lapor"
            className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Buat laporan pertama
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Kolom Kiri: Daftar Laporan Milik Mahasiswa */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">Semua laporan Anda</h2>
              <span className="text-xs text-gray-500">{myReports.length} laporan</span>
            </div>

            <div className="mt-4 space-y-3">
              {myReports.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                    selected?.id === item.id
                      ? "border-emerald-300 bg-emerald-50/70"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="font-mono text-xs text-gray-500">{item.report_code}</p>
                    <p className="mt-0.5 text-base font-bold text-gray-900">
                      {item.location_name}
                    </p>
                    <p className="text-xs text-gray-500">{item.title}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 border border-gray-200">
                    {item.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Detail Progres & Bukti Foto */}
          {selected && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-500">{selected.report_code}</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {selected.status}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">{selected.location_name}</h3>
                <p className="text-xs text-gray-500">Sampah liar · Dikirim oleh Anda</p>
              </div>

              {selected.status === "Ditolak" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <strong>Alasan Penolakan:</strong>{" "}
                  {selected.rejection_reason || "Data tidak sesuai."}
                </div>
              )}

              {/* Timeline Progres */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Timeline Penanganan
                </p>
                {logs.map((log) => (
                  <div key={log.id} className="border-l-2 border-emerald-600 pl-3">
                    <p className="text-xs font-bold text-gray-900">{log.activity}</p>
                    <p className="text-[11px] text-gray-500">{log.notes}</p>
                  </div>
                ))}
              </div>

              {/* Bukti Foto Sebelum & Sesudah */}
              <div className="border-t border-gray-100 pt-4">
                <p className="mb-2 text-xs font-bold text-gray-700">Bukti penyelesaian</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    {selected.before_image_url && (
                      <img
                        src={selected.before_image_url}
                        alt="Sebelum"
                        className="h-24 w-full rounded-xl object-cover"
                      />
                    )}
                    <p className="mt-1 text-center text-[11px] text-gray-500">Sebelum</p>
                  </div>
                  <div>
                    {selected.after_image_url ? (
                      <img
                        src={selected.after_image_url}
                        alt="Sesudah"
                        className="h-24 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 items-center justify-center rounded-xl bg-gray-100 text-[11px] text-gray-400">
                        Belum tersedia
                      </div>
                    )}
                    <p className="mt-1 text-center text-[11px] text-gray-500">Sesudah</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
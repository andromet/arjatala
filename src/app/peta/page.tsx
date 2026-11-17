"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { ReportItem } from "@/components/PublicMapExplorer";

const PublicMapExplorer = dynamic(
  () => import("@/components/PublicMapExplorer"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[460px] w-full animate-pulse rounded-2xl bg-gray-100 flex items-center justify-center text-sm text-gray-500">
        Memuat peta wilayah Bandung...
      </div>
    ),
  }
);

interface ReportLog {
  id: string;
  activity: string;
  status: string;
  notes: string | null;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Menunggu Verifikasi": "bg-amber-100 text-amber-800",
    Terverifikasi: "bg-red-100 text-red-700",
    "Dalam Penanganan": "bg-purple-100 text-purple-800",
    Selesai: "bg-emerald-100 text-emerald-800",
    Ditolak: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function PetaContent() {
  const searchParams = useSearchParams();
  const initialKode = searchParams.get("kode") || "";

  const [allReports, setAllReports] = useState<ReportItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialKode);
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [logs, setLogs] = useState<ReportLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil semua laporan dari Supabase
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const typedData = data as ReportItem[];
        setAllReports(typedData);

        // Jika ada parameter ?kode=PB-2026-XXXX di URL, langsung pilih laporan tersebut
        if (initialKode) {
          const found = typedData.find(
            (r) => r.report_code.toLowerCase() === initialKode.toLowerCase()
          );
          if (found) {
            setSelectedReport(found);
          }
        } else {
          // Default pilih titik pertama yang sudah publik
          const firstPublic = typedData.find((r) =>
            ["Terverifikasi", "Dalam Penanganan", "Selesai"].includes(r.status)
          );
          if (firstPublic) setSelectedReport(firstPublic);
        }
      }
      setLoading(false);
    };

    fetchReports();
  }, [initialKode]);

  // Ambil riwayat penanganan setiap kali selectedReport berubah
  useEffect(() => {
    if (!selectedReport) {
      setLogs([]);
      return;
    }

    const fetchLogs = async () => {
      const { data } = await supabase
        .from("report_logs")
        .select("*")
        .eq("report_id", selectedReport.id)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setLogs(data as ReportLog[]);
      } else {
        // Fallback jika data dummy awal belum punya baris di report_logs
        setLogs([
          {
            id: "init",
            activity: "Laporan tercatat di sistem",
            status: selectedReport.status,
            notes: selectedReport.description || "Titik terdata di peta wilayah.",
            created_at: selectedReport.created_at,
          },
        ]);
      }
    };

    fetchLogs();
  }, [selectedReport]);

  // Filter laporan:
  // - Secara default di peta publik hanya menampilkan yang Terverifikasi, Dalam Penanganan, Selesai
  // - KECUALI jika user mengetik kode laporan spesifik di kolom pencarian (untuk melacak laporan 'Menunggu Verifikasi' atau 'Ditolak')
  const filteredReports = allReports.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    const isExactCodeSearch =
      q.startsWith("pb-") && item.report_code.toLowerCase().includes(q);

    const isPublicStatus = ["Terverifikasi", "Dalam Penanganan", "Selesai"].includes(
      item.status
    );

    if (!isPublicStatus && !isExactCodeSearch) return false;

    const matchesStatus =
      statusFilter === "Semua" || item.status === statusFilter;

    const matchesSearch =
      !q ||
      item.report_code.toLowerCase().includes(q) ||
      item.location_name.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleSelectReport = useCallback((report: ReportItem) => {
    setSelectedReport(report);
  }, []);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900">
      {/* Header Global */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-emerald-700"
            >
              Arjatala
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-gray-600 hover:text-emerald-700">
                Beranda
              </Link>
              <Link href="/peta" className="text-emerald-700 font-semibold">
                Peta Sampah
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-emerald-700">
                Dashboard Admin
              </Link>
            </nav>
          </div>
          <Link
            href="/lapor"
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            + Laporkan titik
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Baris Judul & Pencarian / Lacak Kode Laporan */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Peta sampah & lacak laporan
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Jelajahi titik sampah liar atau masukkan nomor laporan (contoh:{" "}
              <span className="font-mono font-medium">PB-2026-0101</span>) untuk melacak status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Cari jalan atau nomor laporan (PB-2026-...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 focus:border-emerald-600 focus:outline-none"
            >
              <option value="Semua">Semua status</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Dalam Penanganan">Dalam Penanganan</option>
              <option value="Selesai">Selesai dibersihkan</option>
            </select>
          </div>
        </div>

        {/* Grid Utama: Peta (Kiri) & Panel Detail Lokasi (Kanan) */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Kolom Kiri (2/3): Peta + Legenda */}
          <div className="space-y-3 lg:col-span-2">
            <PublicMapExplorer
              reports={filteredReports}
              selectedReport={selectedReport}
              onSelectReport={handleSelectReport}
            />

            {/* Legenda Warna Marker */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-600">
              <span className="font-semibold text-gray-800">Keterangan Pin:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-600 inline-block" />
                Terverifikasi (Belum ditangani)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-purple-600 inline-block" />
                Dalam Penanganan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-600 inline-block" />
                Selesai Dibersihkan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
                Menunggu Verifikasi (Via Lacak Kode)
              </span>
            </div>
          </div>

          {/* Kolom Kanan (1/3): Kartu Detail Titik Terpilih */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            {loading ? (
              <p className="text-sm text-gray-500">Memuat detail lokasi...</p>
            ) : selectedReport ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-gray-500">
                    {selectedReport.report_code}
                  </span>
                  <StatusBadge status={selectedReport.status} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedReport.location_name}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedReport.district}</p>
                  <p className="mt-2 text-sm font-medium text-gray-800">
                    {selectedReport.title}
                  </p>
                  {selectedReport.description && (
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      {selectedReport.description}
                    </p>
                  )}
                </div>

                {/* Alert jika status Ditolak (Sesuai Userflow) */}
                {selectedReport.status === "Ditolak" && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
                    <p className="font-bold">Alasan Penolakan Admin:</p>
                    <p className="mt-1">
                      {selectedReport.rejection_reason ||
                        "Foto atau titik koordinat tidak sesuai."}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 border-t border-b border-gray-100 py-3 text-xs">
                  <div>
                    <p className="text-gray-400">KATEGORI SAMPAH</p>
                    <p className="mt-0.5 font-semibold text-gray-800">
                      {selectedReport.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">ESTIMASI VOLUME</p>
                    <p className="mt-0.5 font-semibold text-gray-800">
                      {selectedReport.estimated_volume || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">KOORDINAT</p>
                    <p className="mt-0.5 font-mono font-medium text-gray-700">
                      {selectedReport.latitude}, {selectedReport.longitude}
                    </p>
                  </div>
                </div>

                {/* Perbandingan Foto Sebelum & Sesudah (Sesuai Mockup Peta Sampah) */}
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-700">
                    Dokumentasi Kondisi
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      {selectedReport.before_image_url ? (
                        <img
                          src={selectedReport.before_image_url}
                          alt="Foto Sebelum"
                          className="h-28 w-full rounded-xl object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="flex h-28 w-full items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                          Tanpa foto
                        </div>
                      )}
                      <p className="mt-1 text-center text-xs font-medium text-gray-600">
                        Sebelum
                      </p>
                    </div>

                    <div>
                      {selectedReport.after_image_url ? (
                        <img
                          src={selectedReport.after_image_url}
                          alt="Foto Sesudah"
                          className="h-28 w-full rounded-xl object-cover border border-emerald-200"
                        />
                      ) : (
                        <div className="flex h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-2 text-center text-[11px] text-gray-400">
                          Belum tersedia
                        </div>
                      )}
                      <p className="mt-1 text-center text-xs font-medium text-gray-600">
                        Sesudah
                      </p>
                    </div>
                  </div>
                </div>

                {selectedReport.assigned_team && (
                  <div className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-900">
                    <span className="font-semibold">Tim Bertugas:</span>{" "}
                    {selectedReport.assigned_team}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-gray-500">
                Pilih salah satu titik di peta atau daftar di bawah untuk melihat detail laporan.
              </div>
            )}
          </div>
        </div>

        {/* Bagian Riwayat Penanganan (Sesuai Mockup Peta Sampah) */}
        {selectedReport && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-bold text-gray-900">Riwayat penanganan</h3>
            <p className="text-xs text-gray-500">
              {selectedReport.report_code} · {selectedReport.location_name}
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase text-gray-400">
                    <th className="py-3 pr-4">Waktu</th>
                    <th className="py-3 pr-4">Aktivitas</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={idx === 0 ? "bg-emerald-50/50" : ""}
                    >
                      <td className="py-3 pr-4 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-900">
                        {log.activity}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="py-3 text-xs text-gray-600">
                        {log.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Daftar Titik di Wilayah Ini (Alternatif Klik Selain Pin Peta) */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-bold text-gray-900">
            Daftar titik ({filteredReports.length})
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Klik baris lokasi untuk memusatkan peta dan melihat detailnya.
          </p>

          <div className="divide-y divide-gray-100">
            {filteredReports.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedReport(item)}
                className={`flex w-full items-center justify-between px-3 py-3.5 text-left transition hover:bg-gray-50 rounded-xl ${
                  selectedReport?.id === item.id ? "bg-emerald-50/70" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    <span className="font-mono text-xs text-gray-500 mr-2">
                      {item.report_code}
                    </span>
                    · {item.location_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.title} · {item.category}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </button>
            ))}

            {filteredReports.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">
                Tidak ada titik laporan yang cocok dengan filter atau pencarian Anda.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PetaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat halaman peta...</div>}>
      <PetaContent />
    </Suspense>
  );
}
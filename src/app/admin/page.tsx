"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { ReportItem } from "@/components/PublicMapExplorer";

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "Menunggu Verifikasi" | "Terverifikasi" | "Dalam Penanganan" | "Selesai" | "Ditolak"
  >("Menunggu Verifikasi");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // State form aksi admin
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [assignedTeam, setAssignedTeam] = useState("Tim Kebersihan Bojongsoang / Regu 01");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);

  const fetchAllReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const typed = data as ReportItem[];
      setReports(typed);

      // Pilih otomatis item pertama pada tab aktif jika belum ada yang dipilih
      const inTab = typed.filter((r) => r.status === activeTab);
      if (inTab.length > 0) {
        setSelectedReport((prev) =>
          prev && inTab.some((x) => x.id === prev.id) ? prev : inTab[0]
        );
      } else {
        setSelectedReport(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  // Sinkronkan pilihan saat tab status diganti
  const handleTabChange = (
    tab: "Menunggu Verifikasi" | "Terverifikasi" | "Dalam Penanganan" | "Selesai" | "Ditolak"
  ) => {
    setActiveTab(tab);
    setShowRejectBox(false);
    setRejectionReason("");
    setAfterImageFile(null);
    setAfterImagePreview(null);
    setFeedbackMsg("");

    const filtered = reports.filter((r) => r.status === tab);
    setSelectedReport(filtered.length > 0 ? filtered[0] : null);
  };

  // 1. Aksi Verifikasi (Menunggu Verifikasi -> Terverifikasi)
  const handleVerifyReport = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    setFeedbackMsg("");

    const { error } = await supabase
      .from("reports")
      .update({ status: "Terverifikasi", updated_at: new Date().toISOString() })
      .eq("id", selectedReport.id);

    if (!error) {
      await supabase.from("report_logs").insert([
        {
          report_id: selectedReport.id,
          activity: "Laporan diverifikasi",
          status: "Terverifikasi",
          notes: "Lokasi dan foto telah diperiksa admin. Titik tampil di peta publik.",
        },
      ]);
      setFeedbackMsg(`Laporan ${selectedReport.report_code} berhasil diverifikasi!`);
      await fetchAllReports();
    }
    setActionLoading(false);
  };

  // 2. Aksi Tolak Laporan (Menunggu Verifikasi -> Ditolak)
  const handleRejectReport = async () => {
    if (!selectedReport) return;
    if (!rejectionReason.trim()) {
      setFeedbackMsg("Harap isi alasan penolakan terlebih dahulu.");
      return;
    }

    setActionLoading(true);
    setFeedbackMsg("");

    const { error } = await supabase
      .from("reports")
      .update({
        status: "Ditolak",
        rejection_reason: rejectionReason.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedReport.id);

    if (!error) {
      await supabase.from("report_logs").insert([
        {
          report_id: selectedReport.id,
          activity: "Laporan ditolak",
          status: "Ditolak",
          notes: rejectionReason.trim(),
        },
      ]);
      setShowRejectBox(false);
      setRejectionReason("");
      setFeedbackMsg(`Laporan ${selectedReport.report_code} telah ditolak.`);
      await fetchAllReports();
    }
    setActionLoading(false);
  };

  // 3. Aksi Mulai Penanganan (Terverifikasi -> Dalam Penanganan)
  const handleStartHandling = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    setFeedbackMsg("");

    const { error } = await supabase
      .from("reports")
      .update({
        status: "Dalam Penanganan",
        assigned_team: assignedTeam.trim() || "Tim Kebersihan Wilayah",
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedReport.id);

    if (!error) {
      await supabase.from("report_logs").insert([
        {
          report_id: selectedReport.id,
          activity: "Tim mulai menangani",
          status: "Dalam Penanganan",
          notes: `${assignedTeam} ditugaskan menuju lokasi.`,
        },
      ]);
      setFeedbackMsg(`Tim ditugaskan untuk ${selectedReport.report_code}.`);
      await fetchAllReports();
    }
    setActionLoading(false);
  };

  // 4. Aksi Selesai Pembersihan + Upload Foto Sesudah (Dalam Penanganan -> Selesai)
  const handleCompleteReport = async () => {
    if (!selectedReport) return;
    if (!afterImageFile) {
      setFeedbackMsg("Harap unggah foto bukti kondisi sesudah dibersihkan.");
      return;
    }

    setActionLoading(true);
    setFeedbackMsg("");

    try {
      const fileExt = afterImageFile.name.split(".").pop();
      const fileName = `after_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(fileName, afterImageFile);

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage
        .from("report-images")
        .getPublicUrl(fileName);

      const afterImageUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("reports")
        .update({
          status: "Selesai",
          after_image_url: afterImageUrl,
          resolution_notes:
            resolutionNotes.trim() || "Sampah diangkut dan area sudah dibersihkan.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedReport.id);

      if (updateError) throw new Error(updateError.message);

      await supabase.from("report_logs").insert([
        {
          report_id: selectedReport.id,
          activity: "Pembersihan selesai",
          status: "Selesai",
          notes:
            resolutionNotes.trim() ||
            "Sampah diangkut. Foto bukti sesudah telah diunggah.",
        },
      ]);

      setAfterImageFile(null);
      setAfterImagePreview(null);
      setResolutionNotes("");
      setFeedbackMsg(
        `Bukti penyelesaian ${selectedReport.report_code} tersimpan! Pin peta berubah hijau.`
      );
      await fetchAllReports();
    } catch (err: any) {
      setFeedbackMsg(`Gagal menyelesaikan laporan: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Statistik Ringkas di Atas Dashboard
  const countByStatus = (st: string) => reports.filter((r) => r.status === st).length;
  const tabReports = reports.filter((r) => r.status === activeTab);

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
              <Link href="/peta" className="text-gray-600 hover:text-emerald-700">
                Peta Sampah
              </Link>
              <Link href="/admin" className="text-emerald-700 font-semibold">
                Dashboard Admin
              </Link>
            </nav>
          </div>
          <Link
            href="/peta"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Lihat Peta Publik →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Dashboard admin
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Prioritaskan laporan masuk, verifikasi lokasi, dan unggah bukti penyelesaian pembersihan.
          </p>
        </div>

        {/* 4 Kartu Statistik (Sesuai Mockup Dashboard Admin) */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">Perlu verifikasi</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {countByStatus("Menunggu Verifikasi")}
            </p>
            <p className="mt-1 text-xs text-gray-400">Menunggu pemeriksaan admin</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">Siap ditangani</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {countByStatus("Terverifikasi")}
            </p>
            <p className="mt-1 text-xs text-gray-400">Sudah tampil di peta publik</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">Dalam penanganan</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">
              {countByStatus("Dalam Penanganan")}
            </p>
            <p className="mt-1 text-xs text-gray-400">Tim sedang bertugas di lokasi</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium text-gray-500">Selesai dibersihkan</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {countByStatus("Selesai")}
            </p>
            <p className="mt-1 text-xs text-gray-400">Bukti foto sesudah terunggah</p>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {feedbackMsg}
          </div>
        )}

        {/* Grid Utama: Antrean Laporan (Kiri) & Panel Aksi Admin (Kanan) */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Kolom Kiri (2/3): Tab Filter & Daftar Antrean */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900">Antrean laporan</h2>

            {/* Tab Navigasi Status */}
            <div className="mt-4 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
              {(
                [
                  "Menunggu Verifikasi",
                  "Terverifikasi",
                  "Dalam Penanganan",
                  "Selesai",
                  "Ditolak",
                ] as const
              ).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === tab
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab} ({countByStatus(tab)})
                </button>
              ))}
            </div>

            {/* Tabel Daftar Laporan di Tab Aktif */}
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Memuat antrean laporan...
              </p>
            ) : tabReports.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">
                Tidak ada laporan dengan status <strong>{activeTab}</strong> saat ini.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-gray-100">
                {tabReports.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedReport(item);
                      setShowRejectBox(false);
                      setFeedbackMsg("");
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition hover:bg-gray-50 ${
                      selectedReport?.id === item.id
                        ? "bg-emerald-50/80 ring-1 ring-emerald-200"
                        : ""
                    }`}
                  >
                    <div>
                      <p className="font-mono text-xs font-semibold text-gray-500">
                        {item.report_code}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {item.location_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.title} · {item.category}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">
                      Periksa →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kolom Kanan (1/3): Panel Verifikasi & Penanganan Laporan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            {selectedReport ? (
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-xs font-semibold text-gray-500">
                    {selectedReport.report_code} · {selectedReport.status}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-gray-900">
                    {selectedReport.location_name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedReport.district} · ({selectedReport.latitude},{" "}
                    {selectedReport.longitude})
                  </p>
                </div>

                {/* Foto Bukti Warga */}
                {selectedReport.before_image_url ? (
                  <div>
                    <img
                      src={selectedReport.before_image_url}
                      alt="Foto laporan warga"
                      className="h-44 w-full rounded-xl object-cover border border-gray-200"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">
                      Foto kondisi awal dari pelapor
                    </p>
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                    Tidak ada foto awal
                  </div>
                )}

                <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
                  <p>
                    <strong>Judul:</strong> {selectedReport.title}
                  </p>
                  <p>
                    <strong>Deskripsi:</strong> {selectedReport.description || "-"}
                  </p>
                  <p>
                    <strong>Estimasi Volume:</strong>{" "}
                    {selectedReport.estimated_volume || "-"}
                  </p>
                </div>

                {/* AKSI 1: JIKA STATUS = MENUNGGU VERIFIKASI */}
                {selectedReport.status === "Menunggu Verifikasi" && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Foto dan lokasi sudah sesuai?
                    </p>

                    {!showRejectBox ? (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowRejectBox(true)}
                          disabled={actionLoading}
                          className="flex-1 rounded-xl border border-gray-300 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyReport}
                          disabled={actionLoading}
                          className="flex-1 rounded-xl bg-emerald-700 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
                        >
                          {actionLoading ? "Memproses..." : "Verifikasi"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5 rounded-xl border border-red-200 bg-red-50/50 p-3">
                        <label className="block text-xs font-semibold text-red-800">
                          Alasan penolakan (wajib)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Contoh: Lokasi pada pin tidak sesuai dengan foto."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full rounded-lg border border-red-200 bg-white p-2 text-xs focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowRejectBox(false)}
                            className="flex-1 rounded-lg border border-gray-300 bg-white py-1.5 text-xs font-medium text-gray-600"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={handleRejectReport}
                            disabled={actionLoading}
                            className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Kirim alasan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AKSI 2: JIKA STATUS = TERVERIFIKASI (Tugaskan Tim) */}
                {selectedReport.status === "Terverifikasi" && (
                  <div className="space-y-3 border-t border-gray-100 pt-3">
                    <label className="block text-xs font-semibold text-gray-800">
                      Tetapkan tim penanganan
                    </label>
                    <input
                      type="text"
                      value={assignedTeam}
                      onChange={(e) => setAssignedTeam(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleStartHandling}
                      disabled={actionLoading}
                      className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                      {actionLoading ? "Menyimpan..." : "Mulai penanganan"}
                    </button>
                  </div>
                )}

                {/* AKSI 3: JIKA STATUS = DALAM PENANGANAN (Upload Foto Sesudah & Selesai) */}
                {selectedReport.status === "Dalam Penanganan" && (
                  <div className="space-y-3 border-t border-gray-100 pt-3">
                    <p className="text-xs text-purple-800 font-semibold">
                      Tim bertugas: {selectedReport.assigned_team}
                    </p>
                    <div>
                      <label className="block text-xs font-semibold text-gray-800">
                        Unggah foto bukti sesudah dibersihkan *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAfterImageFile(file);
                            setAfterImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="mt-1 w-full text-xs text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
                      />
                      {afterImagePreview && (
                        <img
                          src={afterImagePreview}
                          alt="Pratinjau sesudah"
                          className="mt-2 h-32 w-full rounded-xl object-cover"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-800">
                        Catatan penyelesaian
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Sampah diangkut, tepi saluran air sudah dibersihkan."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCompleteReport}
                      disabled={actionLoading}
                      className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                      {actionLoading ? "Mengunggah bukti..." : "Tandai selesai"}
                    </button>
                  </div>
                )}

                {/* INFO JIKA SUDAH SELESAI */}
                {selectedReport.status === "Selesai" && selectedReport.after_image_url && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="mb-1 text-xs font-semibold text-emerald-700">
                      Foto Sesudah Dibersihkan:
                    </p>
                    <img
                      src={selectedReport.after_image_url}
                      alt="Bukti bersih"
                      className="h-36 w-full rounded-xl object-cover border border-emerald-200"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="py-12 text-center text-xs text-gray-400">
                Pilih salah satu laporan di sebelah kiri untuk memproses verifikasi atau penyelesaian.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
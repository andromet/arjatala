"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] w-full animate-pulse rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-500">
        Memuat peta lokasi...
      </div>
    ),
  }
);

export default function LaporPage() {
  // Step: 1 = Isi laporan, 2 = Tinjau & kirim, 3 = Laporan terkirim
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // State Form
  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [district, setDistrict] = useState("Bojongsoang, Bandung");
  const [category, setCategory] = useState("Campuran / rumah tangga");
  const [estimatedVolume, setEstimatedVolume] = useState("1–3 kantong besar");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");

  // Default koordinat Bandung (Bojongsoang / Telkom University)
  const [latitude, setLatitude] = useState<number>(-6.9748);
  const [longitude, setLongitude] = useState<number>(107.6332);
  const [gpsLoading, setGpsLoading] = useState(false);

  // State Foto
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State Tinjau & Submit
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdReportCode, setCreatedReportCode] = useState("");

  // Ambil koordinat GPS otomatis
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Browser Anda tidak mendukung deteksi lokasi GPS.");
      return;
    }
    setGpsLoading(true);
    setErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setGpsLoading(false);
      },
      () => {
        setErrorMsg(
          "Gagal mengakses GPS. Silakan klik atau geser pin pada peta secara manual."
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Handle pilih file foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran foto maksimal 5 MB.");
      return;
    }
    setErrorMsg("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Validasi tahap 1 sebelum lanjut ke tahap 2 (Tinjau laporan)
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim() || !description.trim()) {
      setErrorMsg("Harap lengkapi judul, nama jalan/lokasi, dan deskripsi kondisi sampah.");
      return;
    }
    if (!imageFile) {
      setErrorMsg("Harap unggah foto kondisi sampah sebagai bukti laporan.");
      return;
    }
    setErrorMsg("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Simpan laporan ke Supabase Storage & Database
  const handleSubmitReport = async () => {
    if (!isConfirmed) {
      setErrorMsg("Harap centang pernyataan kesesuaian lokasi dan foto terlebih dahulu.");
      return;
    }
    if (!imageFile) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Upload foto ke bucket 'report-images'
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `before_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(fileName, imageFile);

      if (uploadError) throw new Error(`Gagal mengunggah foto: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage
        .from("report-images")
        .getPublicUrl(fileName);

      const beforeImageUrl = publicUrlData.publicUrl;

      // 2. Buat nomor laporan unik format PB-2026-XXXX
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const reportCode = `PB-2026-${randomNum}`;

      // 3. Simpan ke tabel 'reports'
      const { data: insertedReport, error: insertError } = await supabase
        .from("reports")
        .insert([
          {
            report_code: reportCode,
            point_type: "liar",
            title: title.trim(),
            location_name: locationName.trim(),
            district: district.trim(),
            latitude,
            longitude,
            category,
            estimated_volume: estimatedVolume,
            description: description.trim(),
            status: "Menunggu Verifikasi",
            before_image_url: beforeImageUrl,
            reporter_name: reporterName.trim() || "Warga",
          },
        ])
        .select("id, report_code")
        .single();

      if (insertError) throw new Error(`Gagal menyimpan laporan: ${insertError.message}`);

      // 4. Catat log aktivitas awal di 'report_logs'
      await supabase.from("report_logs").insert([
        {
          report_id: insertedReport.id,
          activity: "Laporan diterima",
          status: "Menunggu Verifikasi",
          notes: "Foto kondisi awal dan koordinat berhasil diterima sistem.",
        },
      ]);

      setCreatedReportCode(insertedReport.report_code);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mengirim laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900">
      {/* Header Sederhana */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-emerald-700">
            Arjatala
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/peta" className="text-gray-600 hover:text-emerald-700">
              Peta Sampah
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-3.5 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Progress Stepper (Sesuai Desain Tinjau Laporan) */}
        {step < 3 && (
          <div className="mb-8">
            <p className="text-xs font-medium text-gray-500">
              Peta wilayah / Tambah laporan
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              {step === 1 ? "Laporkan titik sampah liar" : "Tinjau laporan"}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {step === 1
                ? "Tandai lokasi dan unggah foto kondisi sampah untuk segera diverifikasi admin."
                : "Periksa kembali informasi berikut sebelum laporan dikirim ke admin."}
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-semibold text-white">
                  {step > 1 ? "✓" : "1"}
                </span>
                <span className="text-sm font-medium text-gray-900">Isi laporan</span>
              </div>
              <span className="text-gray-400">›</span>
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    step === 2
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </span>
                <span
                  className={`text-sm font-medium ${
                    step === 2 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Tinjau & kirim
                </span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* TAHAP 1: FORM ISI LAPORAN */}
        {step === 1 && (
          <form onSubmit={handleProceedToReview} className="grid gap-6 lg:grid-cols-3">
            {/* Kolom Kiri (Detail Laporan & Foto) */}
            <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Judul Laporan *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tumpukan sampah di tepi saluran air"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Nama Jalan / Patokan Lokasi *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Telekomunikasi"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Kecamatan / Wilayah
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Kategori Sampah
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Campuran / rumah tangga">Campuran / rumah tangga</option>
                    <option value="Plastik & kemasan">Plastik & kemasan</option>
                    <option value="Sampah organik / dedaunan">Sampah organik / dedaunan</option>
                    <option value="Puing / limbah konstruksi">Puing / limbah konstruksi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Perkiraan Volume
                  </label>
                  <select
                    value={estimatedVolume}
                    onChange={(e) => setEstimatedVolume(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="1–3 kantong besar">1–3 kantong besar</option>
                    <option value="± 1 m³ (setara gerobak)">± 1 m³ (setara gerobak)</option>
                    <option value="± 2–3 m³ (tumpukan sedang)">± 2–3 m³ (tumpukan sedang)</option>
                    <option value="> 3 m³ (tumpukan besar / truk)">&gt; 3 m³ (tumpukan besar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Deskripsi Kondisi Sampah *
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan kondisi sampah, bau, atau dampaknya terhadap jalan/saluran air..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Foto Kondisi Sampah * (Maks. 5 MB)
                </label>
                <div className="mt-1.5 rounded-xl border-2 border-dashed border-gray-300 p-4 text-center hover:border-emerald-600">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Pratinjau foto sampah"
                      className="mt-4 max-h-56 w-full rounded-xl object-cover"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Nama Pelapor (Opsional — tetap privat di peta publik)
                </label>
                <input
                  type="text"
                  placeholder="Warga"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Kolom Kanan (Pilih Titik Peta & GPS) */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-900">Lokasi Kejadian *</h2>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={gpsLoading}
                    className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    {gpsLoading ? "Mencari GPS..." : "📍 Gunakan GPS Saya"}
                  </button>
                </div>
                <p className="mt-1 mb-3 text-xs text-gray-500">
                  Klik atau geser pin hijau di peta untuk menyesuaikan titik akurat.
                </p>

                <LocationPickerMap
                  lat={latitude}
                  lng={longitude}
                  onLocationChange={(newLat, newLng) => {
                    setLatitude(newLat);
                    setLongitude(newLng);
                  }}
                />

                <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  Koordinat terpilih:{" "}
                  <span className="font-mono font-semibold text-gray-900">
                    {latitude}, {longitude}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                Lanjut ke Tinjau Laporan →
              </button>
            </div>
          </form>
        )}

        {/* TAHAP 2: TINJAU LAPORAN (Sesuai Mockup Tinjau Laporan) */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Ringkasan Kiri */}
              <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">Sampah liar · {category}</p>
                <hr className="border-gray-100" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    LOKASI KEJADIAN
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">{locationName}</p>
                  <p className="text-sm text-gray-500">
                    {district} · {latitude}, {longitude}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    KONDISI SAMPAH
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{description}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Perkiraan volume: <strong className="text-gray-700">{estimatedVolume}</strong>
                  </p>
                </div>

                {imagePreview && (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Foto bukti laporan"
                      className="max-h-72 w-full rounded-xl object-cover border border-gray-200"
                    />
                    <p className="mt-1.5 text-xs text-gray-400">1 foto dilampirkan</p>
                  </div>
                )}
              </div>

              {/* Panel Kanan (Peta Mini & Info Status) */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Titik Koordinat</h3>
                  <div className="rounded-xl bg-emerald-50/70 p-3 text-xs text-emerald-900 mb-3">
                    <p className="font-semibold">📍 Lokasi GPS terpasang</p>
                    <p className="mt-0.5 font-mono">
                      {latitude}, {longitude}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full rounded-xl border border-gray-300 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Ubah titik di peta
                  </button>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                  <h3 className="text-sm font-bold text-gray-900">
                    Apa yang terjadi selanjutnya?
                  </h3>
                  <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    🕒 Menunggu Verifikasi
                  </span>
                  <p className="mt-2.5 text-xs leading-relaxed text-gray-600">
                    Admin memeriksa lokasi dan foto. Anda dapat memantau perkembangannya menggunakan Nomor Laporan Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Konfirmasi Kirim */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600"
                />
                <span className="text-sm text-gray-700">
                  <strong>Saya memastikan lokasi dan foto sesuai kondisi yang dilaporkan.</strong>
                  <span className="block text-xs text-gray-500">
                    Laporan ini akan dikirim untuk verifikasi admin.
                  </span>
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Ubah laporan
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim laporan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAHAP 3: LAPORAN TERKIRIM (Sesuai Mockup Laporan Terkirim) */}
        {step === 3 && (
          <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700">
              ✓
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Laporan berhasil dikirim
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Laporan Anda masuk ke antrean verifikasi admin.
            </p>

            <span className="mt-4 inline-block rounded-full bg-amber-100 px-3.5 py-1 text-xs font-semibold text-amber-800">
              🕒 Menunggu Verifikasi
            </span>

            <div className="my-6 border-t border-b border-gray-100 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                NOMOR LAPORAN (SIMPAN UNTUK MELACAK)
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-gray-900">
                {createdReportCode}
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-800">{title}</p>
              <p className="text-xs text-gray-500">
                {locationName}, {district}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/peta?kode=${createdReportCode}`}
                className="flex-1 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Lacak laporan saya
              </Link>
              <Link
                href="/"
                className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Kembali ke beranda
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
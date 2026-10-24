import Link from "next/link";

export default function BeforeAfterSection() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Before / After Image Cards */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Before Card */}
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <div className="flex h-48 items-center justify-center bg-gray-200 sm:h-56">
                  {/* Placeholder image */}
                  <svg
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                    />
                  </svg>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-700">Sebelum</p>
                  <p className="text-xs text-gray-400">Jl. Telekomunikasi, Bojongsoang</p>
                </div>
              </div>

              {/* After Card */}
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <div className="flex h-48 items-center justify-center bg-emerald-50 sm:h-56">
                  {/* Placeholder image */}
                  <svg
                    className="h-12 w-12 text-emerald-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                    />
                  </svg>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-700">Sesudah</p>
                  <p className="text-xs text-gray-400">Jl. Telekomunikasi, Bojongsoang</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Bukti nyata, bukan sekadar janji
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl">
              Lihat perubahan,
              <br />
              dari laporan ke tindakan.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-500">
              Arjatala memonitor aksi antara warga dan petugas. Setiap aksi
              punya riwayat yang bisa dipantau bersama.
            </p>
            <Link
              href="/pantau"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
            >
              Lihat TPS yang dibersihkan
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

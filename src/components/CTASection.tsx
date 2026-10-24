import Link from "next/link";

export default function CTASection() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-emerald-50 px-8 py-10 sm:flex-row sm:px-12">
          {/* Text */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Mulai dari lingkungan terdekat.
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Satu laporan dapat membawa perubahan.
            </p>
          </div>

          {/* Button */}
          <Link
            href="/peta-sampah"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            Buka peta publik
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

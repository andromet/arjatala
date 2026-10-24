import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-white px-4 pb-16 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        {/* Heading */}
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-[3.25rem]">
          Lingkungan bersih dimulai dari
          <br />
          <span className="italic text-emerald-700">satu titik.</span>
        </h1>

        {/* Sub-heading */}
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
          Temukan titik sampah liar dan TPS resmi di sekitar Anda.
          <br className="hidden sm:block" />
          Laporkan kondisinya, lalu pantau sampai ditangani.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/peta-sampah"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            Jelajahi peta
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/lapor"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Lapor titik
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

const exploreLinks = [
  { label: "Peta Titik Sampah", href: "/peta-sampah" },
  { label: "Lokasi yang Dipantau", href: "/pantau" },
  { label: "Pantau Laporan", href: "/pantau-laporan" },
  { label: "TPS Terdekat", href: "/tps-terdekat" },
];

const actionLinks = [
  { label: "Laporkan Sampah", href: "/lapor" },
  { label: "Cara Kerja Arjatala", href: "/tentang" },
  { label: "Tentang Arjatala", href: "/tentang" },
  { label: "Quote me Bro-mago", href: "#" },
  { label: "Supply Chain Tech", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-4 pt-16 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left – Brand & Slogan */}
          <div className="lg:col-span-5">
            <p className="text-lg font-bold leading-snug text-gray-900">
              Satu titik kepedulian, sejuta kemungkinan perubahan.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
              Kami mewujudkan lingkungan yang lebih baik. Laporkan dan
              pantau sampai tertangani dan nikmati perubahan nyata di sekitarmu.
            </p>
          </div>

          {/* Right – Link Columns */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-7 lg:justify-items-end">
            {/* Jelajahi Column */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Jelajahi
              </h3>
              <ul className="mt-4 space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-emerald-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aksi Column */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Aksi
              </h3>
              <ul className="mt-4 space-y-3">
                {actionLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-emerald-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            © 2026 Arjatala. Privacy Policy. Terms of Service.
          </p>
          <p className="text-xs text-gray-400">
            Dari kepedulian kecil, untuk perubahan yang besar.
          </p>
        </div>
      </div>
    </footer>
  );
}

const steps = [
  {
    number: "01",
    title: "Warga melapor",
    description: "Tandai lokasi dan unggah foto kondisi sampah.",
  },
  {
    number: "02",
    title: "Admin memverifikasi",
    description: "Lokasi dan foto diperiksa sebelum ditindaklanjuti.",
  },
  {
    number: "03",
    title: "Tim menangani",
    description: "Petugas membersihkan titik yang telah diverifikasi.",
  },
  {
    number: "04",
    title: "Bukti ditampilkan",
    description: "Foto sesudah dan status teresolusi untuk publik.",
  },
];

export default function WorkflowSection() {
  return (
    <section className="bg-emerald-50/70 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Heading */}
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Alurnya jelas. Perubahannya terlihat.
        </h2>

        {/* Steps Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="group">
              {/* Step Number */}
              <span className="text-sm font-bold text-emerald-700">
                {step.number}
              </span>

              {/* Divider */}
              <div className="mt-3 mb-4 h-px w-full bg-gray-200 transition-colors group-hover:bg-emerald-400" />

              {/* Title */}
              <h3 className="text-base font-semibold text-gray-900">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

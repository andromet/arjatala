"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
      Memuat peta...
    </div>
  ),
});

export default function MapSection() {
  return (
    <section className="bg-white px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
          <MapClient />
        </div>
      </div>
    </section>
  );
}

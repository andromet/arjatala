"use client";

import { useEffect, useRef } from "react";

/* ---------- marker data (Telkom University Bandung area) ---------- */
interface MarkerData {
  lat: number;
  lng: number;
  name: string;
  status: "Belum ditangani" | "Sudah ditangani" | "Sedang diproses";
  color: string;
}

const markers: MarkerData[] = [
  { lat: -6.9735, lng: 107.6308, name: "Jl. Telekomunikasi", status: "Belum ditangani", color: "#dc2626" },
  { lat: -6.9765, lng: 107.6345, name: "Jl. Sukabirus", status: "Sudah ditangani", color: "#16a34a" },
  { lat: -6.971, lng: 107.637, name: "Jl. PGA", status: "Sedang diproses", color: "#f59e0b" },
  { lat: -6.978, lng: 107.632, name: "Jl. Bojongsoang", status: "Sudah ditangani", color: "#16a34a" },
  { lat: -6.975, lng: 107.639, name: "Jl. Terusan Buah Batu", status: "Belum ditangani", color: "#dc2626" },
];

function statusIcon(status: MarkerData["status"]) {
  if (status === "Sudah ditangani") return "✅";
  if (status === "Sedang diproses") return "🔄";
  return "⚠️";
}

export default function MapClient() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hindari eksekusi di sisi server (SSR)
    if (typeof window === "undefined" || !mapRef.current) return;

    let mapInstance: any = null;

    const initMap = async () => {
      // 1. Import leaflet secara dinamis
      const L = (await import("leaflet")).default || await import("leaflet");

      // 2. Bersihkan wadah peta sepenuhnya (Trik ampuh untuk Next.js)
      const container = mapRef.current;
      if (container) {
        container.innerHTML = ""; 
        (container as any)._leaflet_id = null;
      }

      // 3. Suntikkan CSS Leaflet
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      // 4. Inisialisasi Peta
      mapInstance = L.map(mapRef.current!, {
        center: [-6.9748, 107.6332],
        zoom: 15,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      // 5. Tambahkan Marker
      markers.forEach((m) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:18px;height:18px;border-radius:50%;
            background:${m.color};border:3px solid #fff;
            box-shadow:0 1px 4px rgba(0,0,0,.3);
          "></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          popupAnchor: [0, -12],
        });

        L.marker([m.lat, m.lng], { icon })
          .addTo(mapInstance)
          .bindPopup(
            `<div style="font-family:system-ui,sans-serif;min-width:160px;">
              <p style="margin:0 0 4px;font-weight:600;font-size:14px;color:#111;">${m.name}</p>
              <p style="margin:0;font-size:13px;color:#555;">${statusIcon(m.status)} ${m.status}</p>
            </div>`,
            { closeButton: false, className: "arjatala-popup" }
          );
      });
    };

    initMap();

    // 6. Cleanup saat komponen dilepas (unmount)
    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
  }, []);

  // Tambahkan z-0 agar popup peta tidak menabrak / menutupi Navbar Anda
  return <div ref={mapRef} className="h-[420px] w-full sm:h-[480px] z-0 rounded-xl" />;
}
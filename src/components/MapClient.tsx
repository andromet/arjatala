"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface ReportMarker {
  id: string;
  report_code: string;
  latitude: number;
  longitude: number;
  location_name: string;
  title: string;
  status: string;
}

function getStatusStyle(status: string) {
  if (status === "Selesai") {
    return { color: "#16a34a", icon: "✅", label: "Selesai dibersihkan" };
  }
  if (status === "Dalam Penanganan") {
    return { color: "#7c3aed", icon: "🔄", label: "Dalam penanganan" };
  }
  return { color: "#dc2626", icon: "⚠️", label: "Terverifikasi (Belum ditangani)" };
}

export default function MapClient() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let mapInstance: any = null;

    const initMap = async () => {
      const L = (await import("leaflet")).default || (await import("leaflet"));

      const container = mapRef.current;
      if (container) {
        container.innerHTML = "";
        (container as any)._leaflet_id = null;
      }

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      mapInstance = L.map(mapRef.current!, {
        center: [-6.9748, 107.6332], // Tetap terpusat di Bojongsoang / Bandung
        zoom: 15,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Ambil data laporan dari Supabase (selain yang masih menunggu verifikasi atau ditolak)
      const { data: reports, error } = await supabase
        .from("reports")
        .select("id, report_code, latitude, longitude, location_name, title, status")
        .in("status", ["Terverifikasi", "Dalam Penanganan", "Selesai"]);

      if (error) {
        console.error("Gagal mengambil data peta:", error.message);
        return;
      }

      (reports as ReportMarker[])?.forEach((m) => {
        const style = getStatusStyle(m.status);

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:18px;height:18px;border-radius:50%;
            background:${style.color};border:3px solid #fff;
            box-shadow:0 1px 4px rgba(0,0,0,.3);
          "></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          popupAnchor: [0, -12],
        });

        L.marker([m.latitude, m.longitude], { icon })
          .addTo(mapInstance)
          .bindPopup(
            `<div style="font-family:system-ui,sans-serif;min-width:170px;">
              <p style="margin:0 0 2px;font-size:11px;color:#6b7280;font-weight:600;">${m.report_code}</p>
              <p style="margin:0 0 4px;font-weight:600;font-size:14px;color:#111;">${m.location_name}</p>
              <p style="margin:0;font-size:12px;color:#555;">${style.icon} ${style.label}</p>
            </div>`,
            { closeButton: false, className: "arjatala-popup" }
          );
      });
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
  }, []);

  return <div ref={mapRef} className="h-[420px] w-full sm:h-[480px] z-0 rounded-xl" />;
}
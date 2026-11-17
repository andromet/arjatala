"use client";

import { useEffect, useRef } from "react";

export interface ReportItem {
  id: string;
  report_code: string;
  point_type: string;
  title: string;
  location_name: string;
  district: string;
  latitude: number;
  longitude: number;
  category: string;
  estimated_volume: string | null;
  description: string | null;
  status: string;
  before_image_url: string | null;
  after_image_url: string | null;
  assigned_team: string | null;
  resolution_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
}

interface PublicMapExplorerProps {
  reports: ReportItem[];
  selectedReport: ReportItem | null;
  onSelectReport: (report: ReportItem) => void;
}

function getMarkerColor(status: string) {
  if (status === "Selesai") return "#16a34a"; // Hijau
  if (status === "Dalam Penanganan") return "#7c3aed"; // Ungu
  if (status === "Menunggu Verifikasi") return "#d97706"; // Kuning/Amber
  if (status === "Ditolak") return "#6b7280"; // Abu-abu
  return "#dc2626"; // Merah (Terverifikasi / Belum ditangani)
}

export default function PublicMapExplorer({
  reports,
  selectedReport,
  onSelectReport,
}: PublicMapExplorerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // 1. Inisialisasi Peta Utama
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default || (await import("leaflet"));
      if (!isMounted || !mapRef.current) return;

      const container = mapRef.current;
      container.innerHTML = "";
      (container as any)._leaflet_id = null;

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      const map = L.map(container, {
        center: [-6.9748, 107.6332], // Bandung (Bojongsoang)
        zoom: 15,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render ulang marker setiap kali daftar filter berubah
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = (await import("leaflet")).default || (await import("leaflet"));

      markersLayerRef.current.clearLayers();

      reports.forEach((item) => {
        const color = getMarkerColor(item.status);
        const isSelected = selectedReport?.id === item.id;

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:${isSelected ? "24px" : "18px"};
            height:${isSelected ? "24px" : "18px"};
            border-radius:50%;
            background:${color};
            border:3px solid #fff;
            box-shadow:0 2px 6px rgba(0,0,0,.35);
            transition:all 0.2s ease;
          "></div>`,
          iconSize: [isSelected ? 24 : 18, isSelected ? 24 : 18],
          iconAnchor: [isSelected ? 12 : 9, isSelected ? 12 : 9],
        });

        const marker = L.marker([item.latitude, item.longitude], { icon });
        marker.on("click", () => {
          onSelectReport(item);
        });
        marker.bindTooltip(`${item.location_name} (${item.status})`, {
          direction: "top",
          offset: [0, -10],
        });
        marker.addTo(markersLayerRef.current);
      });
    };

    updateMarkers();
  }, [reports, selectedReport, onSelectReport]);

  // 3. Geser kamera peta saat pengguna memilih titik dari daftar/pencarian
  useEffect(() => {
    if (mapInstanceRef.current && selectedReport) {
      mapInstanceRef.current.setView(
        [selectedReport.latitude, selectedReport.longitude],
        16,
        { animate: true }
      );
    }
  }, [selectedReport]);

  return (
    <div
      ref={mapRef}
      className="h-[460px] w-full rounded-2xl border border-gray-200 z-0"
    />
  );
}
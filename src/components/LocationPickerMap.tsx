"use client";

import { useEffect, useRef } from "react";

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({
  lat,
  lng,
  onLocationChange,
}: LocationPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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
        center: [lat, lng],
        zoom: 16,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:24px;height:24px;border-radius:50%;
          background:#047857;border:3px solid #fff;
          box-shadow:0 2px 6px rgba(0,0,0,.35);
          cursor:grab;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onLocationChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        onLocationChange(
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6))
        );
      });
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

  // Sinkronisasi posisi pin saat tombol "Gunakan GPS Saya" ditekan
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 16);
    }
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      className="h-[260px] w-full rounded-xl border border-gray-200 z-0"
    />
  );
}
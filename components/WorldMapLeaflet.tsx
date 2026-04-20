'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { mockAircraft, Aircraft } from '@/lib/mockAircraft';
import { Plus, Minus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export default function WorldMapLeaflet() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [zoom, setZoom] = useState(2);
  const [aircraftData, setAircraftData] = useState<Aircraft[]>(mockAircraft);
  const animationTimeRef = useRef<number>(0);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
    });

    // Add OSM tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Layer for aircraft
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    mapRef.current = map;

    map.on('zoomend', () => {
      setZoom(map.getZoom());
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Animate aircraft
  useEffect(() => {
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const dt = now - lastTime;
      lastTime = now;

      animationTimeRef.current += dt;

      setAircraftData((prevData) =>
        prevData.map((plane) => {
          const routeLength = plane.route.length;
          const totalDistance = routeLength - 1;
          const progress = (animationTimeRef.current % 30000) / 30000;
          const currentSegment = Math.floor(progress * totalDistance);
          const segmentProgress = (progress * totalDistance) % 1;

          if (currentSegment < routeLength - 1) {
            const start = plane.route[currentSegment];
            const end = plane.route[currentSegment + 1];

            const latitude = start.lat + (end.lat - start.lat) * segmentProgress;
            const longitude = start.lng + (end.lng - start.lng) * segmentProgress;

            const dLng = end.lng - start.lng;
            const dLat = end.lat - start.lat;
            const heading = Math.atan2(dLng, dLat) * (180 / Math.PI);

            return {
              ...plane,
              latitude,
              longitude,
              heading,
            };
          }

          return plane;
        })
      );

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  // Update aircraft markers
  useEffect(() => {
    if (!layerGroupRef.current || !mapRef.current) return;

    layerGroupRef.current.clearLayers();

    aircraftData.forEach((plane) => {
      // Route line
      const routeLatLngs = plane.route.map((p) => [p.lat, p.lng] as [number, number]);
      L.polyline(routeLatLngs, {
        color: '#030d2f',
        weight: 1.5,
        opacity: 0.4,
      }).addTo(layerGroupRef.current!);

      // Aircraft marker
      const planeIcon = L.divIcon({
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: radial-gradient(circle, rgba(0, 35, 63, 0.8) 0%, rgba(66, 165, 245, 0) 70%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(${plane.heading}deg);
          ">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 0L8 8L6 6L4 8Z" fill="#ffffff" stroke="white" stroke-width="0.5"/>
            </svg>
          </div>
        `,
        iconSize: [24, 24],
        className: 'aircraft-marker',
      });

      const marker = L.marker([plane.latitude, plane.longitude], {
        icon: planeIcon,
        title: plane.callsign,
      }).addTo(layerGroupRef.current!);

      // Popup with info
      marker.bindPopup(`
        <div style="font-size: 12px; color: #333;">
          <strong>${plane.callsign}</strong><br/>
          ${plane.origin} → ${plane.destination}<br/>
          Alt: ${plane.altitude}ft | Speed: ${Math.round(plane.speed)}kts
        </div>
      `);
    });
  }, [aircraftData]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(Math.min(mapRef.current.getZoom() + 1, 19));
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(Math.max(mapRef.current.getZoom() - 1, 1));
    }
  };

  return (
    <div className="relative w-full h-full rounded-[16px] overflow-hidden border border-black/10">
      {/* Leaflet Map Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: '#1a3a5f' }}
      />

      {/* Zoom Controls - Bottom Left */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-black/75 backdrop-blur-sm p-2 rounded-lg border border-slate-600 shadow-lg z-[400]">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all active:scale-95"
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all active:scale-95"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* Info Panel - Top Left */}
      <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-sm text-white text-xs p-3 rounded-lg border border-slate-600 shadow-lg z-[400]">
        <h3 className="font-bold text-sm mb-2">✈️ Live Flight Tracking</h3>
        <p className="text-slate-300 text-[11px]">Aircraft: {aircraftData.length}</p>
        <p className="text-slate-400 text-[10px] mt-1">Zoom: {zoom}</p>
      </div>

      {/* Controls - Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-sm text-white text-[10px] p-2.5 rounded-lg border border-slate-600 shadow-lg z-[400]">
        <p className="mb-1">🖱️ Drag to pan</p>
        <p>➕➖ Zoom buttons left</p>
      </div>

      <style>{`
        .leaflet-container {
          background: #1a3a5f !important;
        }
        .leaflet-control-attribution {
          display: none;
        }
        .aircraft-marker {
          filter: drop-shadow(0 0 8px rgba(66, 165, 245, 0.6));
        }
      `}</style>
    </div>
  );
}

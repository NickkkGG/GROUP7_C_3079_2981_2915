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

  // Calculate dynamic icon size based on zoom level
  const getIconSize = (zoomLevel: number) => {
    // Zoom 2: 18px, Zoom 10: 38px, Zoom 19: 68px
    const baseSize = 18 + (zoomLevel - 2) * 2.5;
    return Math.max(16, Math.min(baseSize, 68));
  };

  // Update aircraft markers
  useEffect(() => {
    if (!layerGroupRef.current || !mapRef.current) return;

    layerGroupRef.current.clearLayers();

    const iconSize = getIconSize(zoom);
    const halfSize = iconSize / 2;

    aircraftData.forEach((plane, idx) => {
      // Route line with different colors per aircraft
      const routeLatLngs = plane.route.map((p) => [p.lat, p.lng] as [number, number]);
      const routeColors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#FFA07A', // Light Salmon
        '#98D8C8', // Mint
        '#F7DC6F', // Yellow
        '#BB8FCE', // Purple
        '#85C1E2', // Light Blue
        '#F8B88B', // Peach
        '#A9CCE3', // Sky Blue
        '#F1948A', // Light Red
        '#82E0AA', // Light Green
      ];

      const lineColor = routeColors[idx % routeColors.length];

      L.polyline(routeLatLngs, {
        color: lineColor,
        weight: 3,
        opacity: 0.85,
        dashArray: '5, 5',
      }).addTo(layerGroupRef.current!);

      // Aircraft marker with realistic airplane SVG - dynamic sizing
      const planeIcon = L.divIcon({
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(${plane.heading}deg);
            filter: drop-shadow(0 0 8px rgba(66, 165, 245, 0.8)) drop-shadow(0 0 3px rgba(0,0,0,0.6));
          ">
            <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Main fuselage body -->
              <ellipse cx="50" cy="50" rx="8" ry="28" fill="#ffffff" stroke="#1e3a8a" stroke-width="1.5"/>

              <!-- Cockpit/nose -->
              <circle cx="50" cy="22" r="6" fill="#1e3a8a" stroke="#0f172a" stroke-width="1"/>
              <circle cx="50" cy="23" r="4" fill="#3b82f6" opacity="0.8"/>

              <!-- Main cabin windows -->
              <circle cx="48" cy="35" r="2" fill="#93c5fd" stroke="#1e40af" stroke-width="0.5"/>
              <circle cx="52" cy="35" r="2" fill="#93c5fd" stroke="#1e40af" stroke-width="0.5"/>
              <circle cx="48" cy="45" r="2" fill="#93c5fd" stroke="#1e40af" stroke-width="0.5"/>
              <circle cx="52" cy="45" r="2" fill="#93c5fd" stroke="#1e40af" stroke-width="0.5"/>

              <!-- Right wing -->
              <path d="M 58 48 L 95 45 Q 96 45 95 48 L 58 52 Z" fill="#2563eb" stroke="#1e40af" stroke-width="1.2" opacity="0.95"/>
              <ellipse cx="80" cy="46.5" rx="10" ry="2.5" fill="#3b82f6" opacity="0.5"/>

              <!-- Left wing -->
              <path d="M 42 48 L 5 45 Q 4 45 5 48 L 42 52 Z" fill="#2563eb" stroke="#1e40af" stroke-width="1.2" opacity="0.95"/>
              <ellipse cx="20" cy="46.5" rx="10" ry="2.5" fill="#3b82f6" opacity="0.5"/>

              <!-- Right tail -->
              <path d="M 48 70 L 70 78 Q 70.5 78 70 79 L 48 75 Z" fill="#1e40af" stroke="#0f172a" stroke-width="1"/>

              <!-- Left tail -->
              <path d="M 52 70 L 30 78 Q 29.5 78 30 79 L 52 75 Z" fill="#1e40af" stroke="#0f172a" stroke-width="1"/>

              <!-- Vertical stabilizer -->
              <path d="M 50 72 L 48 85 L 50 85 L 52 85 L 50 72 Z" fill="#1e40af" stroke="#0f172a" stroke-width="1"/>

              <!-- Landing gear (left) -->
              <g opacity="0.7">
                <line x1="45" y1="55" x2="45" y2="62" stroke="#475569" stroke-width="1"/>
                <circle cx="45" cy="63" r="1.5" fill="#475569"/>
              </g>

              <!-- Landing gear (right) -->
              <g opacity="0.7">
                <line x1="55" y1="55" x2="55" y2="62" stroke="#475569" stroke-width="1"/>
                <circle cx="55" cy="63" r="1.5" fill="#475569"/>
              </g>
            </svg>
          </div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [halfSize, halfSize],
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
  }, [aircraftData, zoom]);

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
      <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-sm text-white text-xs p-3 rounded-lg border border-slate-600 shadow-lg z-[400] max-w-xs">
        <h3 className="font-bold text-sm mb-2">✈️ Live Flight Tracking</h3>
        <p className="text-slate-300 text-[11px]">Aircraft: {aircraftData.length}</p>
        <p className="text-slate-400 text-[10px] mt-1">Zoom: {zoom}</p>
        <div className="mt-2 pt-2 border-t border-slate-600">
          <p className="text-slate-300 text-[10px] font-semibold mb-1">Flight Routes:</p>
          <div className="grid grid-cols-2 gap-1 text-[9px]">
            {aircraftData.slice(0, 4).map((ac, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][i % 4]}}></div>
                <span className="text-slate-300 truncate">{ac.callsign}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Update Badge - Top Right */}
      <div className="absolute top-4 right-4 bg-white backdrop-blur-sm px-3 py-2 rounded-full shadow-lg z-[400] flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-bold text-slate-900">LIVE UPDATE</span>
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

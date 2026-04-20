'use client';

import { useState, useEffect, useRef } from 'react';
import { mockAircraft, Aircraft } from '@/lib/mockAircraft';
import { Plus, Minus } from 'lucide-react';

export default function WorldMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aircraftData, setAircraftData] = useState<Aircraft[]>(mockAircraft);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const animationTimeRef = useRef<number>(0);

  // Load world map image
  useEffect(() => {
    const img = new Image();
    img.src = 'https://tile.openstreetmap.org/0/0/0.png'; // Simple OSM tile
    // Better: use a simple world map image
    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480"><rect fill="%231a3a5f" width="960" height="480"/><g fill="%232d5a3d"><ellipse cx="150" cy="120" rx="40" ry="60"/><ellipse cx="420" cy="100" rx="60" ry="70"/><ellipse cx="520" cy="200" rx="80" ry="100"/><ellipse cx="700" cy="150" rx="70" ry="90"/><ellipse cx="250" cy="280" rx="50" ry="80"/><ellipse cx="550" cy="350" rx="60" ry="50"/></g></svg>';

    img.onload = () => setMapImage(img);
    img.onerror = () => {
      console.log('Map image failed to load, using canvas drawing');
    };
  }, []);

  // Smooth animation loop
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

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0a1f3a');
    grad.addColorStop(1, '#1a2a4a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Ocean
    ctx.fillStyle = '#1a3a5f';
    ctx.fillRect(0, 0, width, height);

    // Draw world map (simplified continents)
    ctx.fillStyle = '#2d5a3d';
    ctx.strokeStyle = '#1a4a2a';
    ctx.lineWidth = 0.5;

    // Simple continent shapes (ellipses + rectangles)
    const continents = [
      { x: 100, y: 120, w: 50, h: 80 }, // North America
      { x: 100, y: 280, w: 40, h: 70 }, // South America
      { x: 370, y: 100, w: 80, h: 50 }, // Europe
      { x: 500, y: 150, w: 150, h: 120 }, // Asia
      { x: 350, y: 280, w: 70, h: 100 }, // Africa
      { x: 700, y: 300, w: 50, h: 60 }, // Australia
    ];

    continents.forEach((cont) => {
      ctx.beginPath();
      ctx.ellipse(cont.x, cont.y, cont.w, cont.h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Grid
    ctx.strokeStyle = '#1e4a6f';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    for (let i = -180; i <= 180; i += 45) {
      const x = ((i + 180) / 360) * width * zoom + pan.x;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let i = -90; i <= 90; i += 45) {
      const y = ((i + 90) / 180) * height * zoom + pan.y;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Routes
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    aircraftData.forEach((plane) => {
      ctx.beginPath();
      plane.route.forEach((point, idx) => {
        const x = ((point.lng + 180) / 360) * width * zoom + pan.x;
        const y = ((90 - point.lat) / 180) * height * zoom + pan.y;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Aircraft
    aircraftData.forEach((plane) => {
      const x = ((plane.longitude + 180) / 360) * width * zoom + pan.x;
      const y = ((90 - plane.latitude) / 180) * height * zoom + pan.y;

      if (x < -50 || x > width + 50 || y < -50 || y > height + 50) return;

      // Glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
      gradient.addColorStop(0, 'rgba(66, 165, 245, 0.8)');
      gradient.addColorStop(1, 'rgba(66, 165, 245, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Aircraft
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((plane.heading * Math.PI) / 180);

      ctx.fillStyle = '#42a5f5';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, 4);
      ctx.lineTo(0, 2);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(plane.callsign, x, y - 18);
      ctx.shadowColor = 'transparent';
    });
  }, [aircraftData, zoom, pan]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setZoom((prev) => Math.max(0.7, Math.min(prev * delta, 4)));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev * 0.85, 0.7));
  };

  return (
    <div className="relative w-full h-full rounded-[16px] overflow-hidden border border-black/10">
      <canvas
        ref={canvasRef}
        width={1400}
        height={700}
        className="w-full h-full cursor-grab active:cursor-grabbing bg-gradient-to-b from-slate-900 to-blue-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Info Panel - Top Left */}
      <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-sm text-white text-xs p-3 rounded-lg border border-slate-600 shadow-lg">
        <h3 className="font-bold text-sm mb-2">✈️ Live Flight Tracking</h3>
        <p className="text-slate-300 text-[11px]">Aircraft: {aircraftData.length}</p>
        <p className="text-slate-400 text-[10px] mt-1">Zoom: {zoom.toFixed(1)}x</p>
      </div>

      {/* Zoom Controls - Bottom Left */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-black/75 backdrop-blur-sm p-2 rounded-lg border border-slate-600 shadow-lg">
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

      {/* Controls - Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-sm text-white text-[10px] p-2.5 rounded-lg border border-slate-600 shadow-lg">
        <p className="mb-1">🖱️ Drag to pan</p>
        <p>⬆️⬇️ Zoom buttons left</p>
      </div>
    </div>
  );
}

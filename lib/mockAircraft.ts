export interface Aircraft {
  id: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  speed: number;
  origin: string;
  destination: string;
  status: 'active' | 'scheduled' | 'landed';
  route: Array<{ lat: number; lng: number }>;
}

export const mockAircraft: Aircraft[] = [
  {
    id: 'EP201',
    callsign: 'ALTUS201',
    latitude: -6.1275,
    longitude: 106.6537,
    altitude: 8500,
    heading: 45,
    speed: 450,
    origin: 'CGK',
    destination: 'SIN',
    status: 'active',
    route: [
      { lat: -6.1275, lng: 106.6537 }, // Jakarta
      { lat: -5.9, lng: 110.4 },
      { lat: -3.9, lng: 114.6 },
      { lat: 1.3521, lng: 103.8198 }, // Singapore
    ],
  },
  {
    id: 'EP202',
    callsign: 'ALTUS202',
    latitude: 3.1390,
    longitude: 101.6869,
    altitude: 9200,
    heading: 120,
    speed: 480,
    origin: 'SIN',
    destination: 'KUL',
    status: 'active',
    route: [
      { lat: 1.3521, lng: 103.8198 }, // Singapore
      { lat: 2.5, lng: 103.0 },
      { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
    ],
  },
  {
    id: 'EP203',
    callsign: 'ALTUS203',
    latitude: 13.9011,
    longitude: 100.8678,
    altitude: 7800,
    heading: 280,
    speed: 420,
    origin: 'KUL',
    destination: 'BKK',
    status: 'active',
    route: [
      { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
      { lat: 8.0, lng: 101.0 },
      { lat: 13.9011, lng: 100.8678 }, // Bangkok
    ],
  },
  {
    id: 'EP204',
    callsign: 'ALTUS204',
    latitude: 21.9162,
    longitude: 114.2049,
    altitude: 10500,
    heading: 35,
    speed: 490,
    origin: 'BKK',
    destination: 'HKG',
    status: 'active',
    route: [
      { lat: 13.9011, lng: 100.8678 }, // Bangkok
      { lat: 17.5, lng: 105.0 },
      { lat: 21.9162, lng: 114.2049 }, // Hong Kong
    ],
  },
  {
    id: 'EP205',
    callsign: 'ALTUS205',
    latitude: 31.1454,
    longitude: 121.8053,
    altitude: 9800,
    heading: 65,
    speed: 510,
    origin: 'HKG',
    destination: 'PVG',
    status: 'active',
    route: [
      { lat: 21.9162, lng: 114.2049 }, // Hong Kong
      { lat: 28.0, lng: 118.0 },
      { lat: 31.1454, lng: 121.8053 }, // Shanghai
    ],
  },
  {
    id: 'EP206',
    callsign: 'ALTUS206',
    latitude: -6.2663,
    longitude: 106.7300,
    altitude: 6200,
    heading: 180,
    speed: 380,
    origin: 'CGK',
    destination: 'SUB',
    status: 'active',
    route: [
      { lat: -6.1275, lng: 106.6537 }, // Jakarta
      { lat: -6.5, lng: 107.5 },
      { lat: -7.2108, lng: 112.7461 }, // Surabaya
    ],
  },
  {
    id: 'EP207',
    callsign: 'ALTUS207',
    latitude: -7.6500,
    longitude: 110.3900,
    altitude: 5500,
    heading: 200,
    speed: 350,
    origin: 'CGK',
    destination: 'JOG',
    status: 'active',
    route: [
      { lat: -6.1275, lng: 106.6537 }, // Jakarta
      { lat: -6.8, lng: 108.5 },
      { lat: -7.6500, lng: 110.3900 }, // Yogyakarta
    ],
  },
  {
    id: 'EP208',
    callsign: 'ALTUS208',
    latitude: 1.3521,
    longitude: 103.8198,
    altitude: 8200,
    heading: 310,
    speed: 440,
    origin: 'SIN',
    destination: 'PEN',
    status: 'active',
    route: [
      { lat: 1.3521, lng: 103.8198 }, // Singapore
      { lat: 5.3, lng: 103.5 },
      { lat: 5.2833, lng: 100.2667 }, // Penang
    ],
  },
  {
    id: 'EP209',
    callsign: 'ALTUS209',
    latitude: -8.7500,
    longitude: 115.2167,
    altitude: 7000,
    heading: 90,
    speed: 410,
    origin: 'SUB',
    destination: 'DPS',
    status: 'active',
    route: [
      { lat: -7.2108, lng: 112.7461 }, // Surabaya
      { lat: -7.8, lng: 114.0 },
      { lat: -8.7500, lng: 115.2167 }, // Bali
    ],
  },
  {
    id: 'EP210',
    callsign: 'ALTUS210',
    latitude: 6.9271,
    longitude: 122.1338,
    altitude: 9500,
    heading: 155,
    speed: 470,
    origin: 'DPS',
    destination: 'DVO',
    status: 'active',
    route: [
      { lat: -8.7500, lng: 115.2167 }, // Bali
      { lat: 0.0, lng: 117.0 },
      { lat: 6.9271, lng: 122.1338 }, // Davao
    ],
  },
  {
    id: 'EP211',
    callsign: 'ALTUS211',
    latitude: 14.6091,
    longitude: 121.0223,
    altitude: 8900,
    heading: 0,
    speed: 460,
    origin: 'DVO',
    destination: 'MNL',
    status: 'active',
    route: [
      { lat: 6.9271, lng: 122.1338 }, // Davao
      { lat: 10.5, lng: 121.5 },
      { lat: 14.6091, lng: 121.0223 }, // Manila
    ],
  },
  {
    id: 'EP212',
    callsign: 'ALTUS212',
    latitude: 22.3193,
    longitude: 114.1694,
    altitude: 10200,
    heading: 340,
    speed: 500,
    origin: 'MNL',
    destination: 'HKG',
    status: 'active',
    route: [
      { lat: 14.6091, lng: 121.0223 }, // Manila
      { lat: 18.0, lng: 117.5 },
      { lat: 22.3193, lng: 114.1694 }, // Hong Kong
    ],
  },
];

// Helper function untuk animate pesawat bergerak
export function getAnimatedAircraft(aircraft: Aircraft[], time: number): Aircraft[] {
  return aircraft.map((plane) => {
    const routeLength = plane.route.length;
    const totalDistance = routeLength - 1;
    const progress = (time % 100) / 100; // Loop animation setiap 100ms
    const currentSegment = Math.floor(progress * totalDistance);
    const segmentProgress = (progress * totalDistance) % 1;

    if (currentSegment < routeLength - 1) {
      const start = plane.route[currentSegment];
      const end = plane.route[currentSegment + 1];

      const latitude = start.lat + (end.lat - start.lat) * segmentProgress;
      const longitude = start.lng + (end.lng - start.lng) * segmentProgress;

      return {
        ...plane,
        latitude,
        longitude,
      };
    }

    return plane;
  });
}

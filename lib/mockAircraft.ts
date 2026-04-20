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
  // North America Routes
  {
    id: 'EP201',
    callsign: 'ALTUS201',
    latitude: 33.7490,
    longitude: -84.3880,
    altitude: 10500,
    heading: 45,
    speed: 500,
    origin: 'ATL',
    destination: 'NYC',
    status: 'active',
    route: [
      { lat: 33.7490, lng: -84.3880 }, // Atlanta
      { lat: 35.0, lng: -82.0 },
      { lat: 40.6895, lng: -74.0342 }, // New York
    ],
  },
  {
    id: 'EP202',
    callsign: 'ALTUS202',
    latitude: 37.6213,
    longitude: -122.3790,
    altitude: 9200,
    heading: 120,
    speed: 480,
    origin: 'SFO',
    destination: 'LAX',
    status: 'active',
    route: [
      { lat: 37.6213, lng: -122.3790 }, // San Francisco
      { lat: 36.5, lng: -120.0 },
      { lat: 33.9425, lng: -118.4081 }, // Los Angeles
    ],
  },

  // Europe Routes
  {
    id: 'EP203',
    callsign: 'ALTUS203',
    latitude: 51.4700,
    longitude: -0.4615,
    altitude: 7800,
    heading: 280,
    speed: 470,
    origin: 'LHR',
    destination: 'CDG',
    status: 'active',
    route: [
      { lat: 51.4700, lng: -0.4615 }, // London
      { lat: 50.5, lng: -2.0 },
      { lat: 48.8566, lng: 2.3522 }, // Paris
    ],
  },
  {
    id: 'EP204',
    callsign: 'ALTUS204',
    latitude: 48.3519,
    longitude: 11.7861,
    altitude: 8900,
    heading: 35,
    speed: 490,
    origin: 'CDG',
    destination: 'MUC',
    status: 'active',
    route: [
      { lat: 48.8566, lng: 2.3522 }, // Paris
      { lat: 49.0, lng: 6.0 },
      { lat: 48.3519, lng: 11.7861 }, // Munich
    ],
  },

  // Middle East Routes
  {
    id: 'EP205',
    callsign: 'ALTUS205',
    latitude: 25.2854,
    longitude: 55.3677,
    altitude: 9500,
    heading: 65,
    speed: 510,
    origin: 'DXB',
    destination: 'DXB',
    status: 'active',
    route: [
      { lat: 25.2854, lng: 55.3677 }, // Dubai
      { lat: 23.0, lng: 56.0 },
      { lat: 31.9454, lng: 35.9284 }, // Amman
    ],
  },
  {
    id: 'EP206',
    callsign: 'ALTUS206',
    latitude: 31.9454,
    longitude: 35.9284,
    altitude: 8200,
    heading: 180,
    speed: 420,
    origin: 'AMM',
    destination: 'CAI',
    status: 'active',
    route: [
      { lat: 31.9454, lng: 35.9284 }, // Amman
      { lat: 29.0, lng: 32.0 },
      { lat: 30.1219, lng: 31.4056 }, // Cairo
    ],
  },

  // Africa Route
  {
    id: 'EP207',
    callsign: 'ALTUS207',
    latitude: -33.9249,
    longitude: 18.6024,
    altitude: 9800,
    heading: 200,
    speed: 450,
    origin: 'CPT',
    destination: 'JNB',
    status: 'active',
    route: [
      { lat: -33.9249, lng: 18.6024 }, // Cape Town
      { lat: -31.5, lng: 28.0 },
      { lat: -26.1393, lng: 28.2426 }, // Johannesburg
    ],
  },

  // Asia Routes
  {
    id: 'EP208',
    callsign: 'ALTUS208',
    latitude: 35.5494,
    longitude: 139.7798,
    altitude: 10200,
    heading: 310,
    speed: 500,
    origin: 'NRT',
    destination: 'HND',
    status: 'active',
    route: [
      { lat: 35.7660, lng: 140.3866 }, // Narita Tokyo
      { lat: 35.5, lng: 139.0 },
      { lat: 35.5494, lng: 139.7798 }, // Haneda Tokyo
    ],
  },
  {
    id: 'EP209',
    callsign: 'ALTUS209',
    latitude: -33.9461,
    longitude: 151.1772,
    altitude: 10100,
    heading: 90,
    speed: 460,
    origin: 'SYD',
    destination: 'MEL',
    status: 'active',
    route: [
      { lat: -33.9461, lng: 151.1772 }, // Sydney
      { lat: -34.0, lng: 148.0 },
      { lat: -37.6733, lng: 144.8433 }, // Melbourne
    ],
  },

  // South America Route
  {
    id: 'EP210',
    callsign: 'ALTUS210',
    latitude: -23.4345,
    longitude: -46.4796,
    altitude: 9000,
    heading: 155,
    speed: 470,
    origin: 'GIG',
    destination: 'GRU',
    status: 'active',
    route: [
      { lat: -22.8068, lng: -43.1729 }, // Rio de Janeiro
      { lat: -23.2, lng: -45.0 },
      { lat: -23.4345, lng: -46.4796 }, // São Paulo
    ],
  },

  // Additional Asia Routes
  {
    id: 'EP211',
    callsign: 'ALTUS211',
    latitude: 22.3193,
    longitude: 114.1694,
    altitude: 8500,
    heading: 0,
    speed: 480,
    origin: 'HKG',
    destination: 'SIN',
    status: 'active',
    route: [
      { lat: 22.3193, lng: 114.1694 }, // Hong Kong
      { lat: 7.0, lng: 108.0 },
      { lat: 1.3521, lng: 103.8198 }, // Singapore
    ],
  },
  {
    id: 'EP212',
    callsign: 'ALTUS212',
    latitude: 13.1939,
    longitude: 77.5941,
    altitude: 9700,
    heading: 340,
    speed: 500,
    origin: 'DEL',
    destination: 'BOM',
    status: 'active',
    route: [
      { lat: 28.5664, lng: 77.2038 }, // Delhi
      { lat: 21.0, lng: 77.0 },
      { lat: 19.0896, lng: 72.8656 }, // Mumbai
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

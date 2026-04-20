export const mockShipments = [
  {
    id: 1,
    awb: 'AWB-EP-24001',
    origin: 'SIN (Singapore)',
    destination: 'CGK (Jakarta)',
    weight: '125 kg',
    status: 'on-time',
    flight: 'EP201',
    timestamp: '2024-10-24 08:00',
    sender: 'PT Global Tech',
  },
  {
    id: 2,
    awb: 'AWB-EP-24002',
    origin: 'KUL (Kuala Lumpur)',
    destination: 'SUB (Surabaya)',
    weight: '45 kg',
    status: 'on-time',
    flight: 'EP202',
    timestamp: '2024-10-24 09:15',
    sender: 'Medicorp Logistics',
  },
  {
    id: 3,
    awb: 'AWB-EP-24003',
    origin: 'BKK (Bangkok)',
    destination: 'DPS (Bali)',
    weight: '210 kg',
    status: 'delayed',
    flight: 'EP203',
    timestamp: '2024-10-24 07:30',
    sender: 'Express Retail',
  },
  {
    id: 4,
    awb: 'AWB-EP-24004',
    origin: 'PEN (Penang)',
    destination: 'KNO (Medan)',
    weight: '89 kg',
    status: 'on-time',
    flight: 'EP204',
    timestamp: '2024-10-24 10:00',
    sender: 'Agro Nusantara',
  },
  {
    id: 5,
    awb: 'AWB-EP-24005',
    origin: 'CGK (Jakarta)',
    destination: 'BPN (Balikpapan)',
    weight: '50 kg',
    status: 'departed',
    flight: 'EP205',
    timestamp: '2024-10-24 06:45',
    sender: 'Tech Devices Inc.',
  },
];

export const mockTrackingTimeline = [
  { step: 'Received', status: 'completed', timestamp: '2024-10-24 08:00', location: 'SIN Hub' },
  { step: 'Sortation', status: 'completed', timestamp: '2024-10-24 08:30', location: 'SIN Sorting Center' },
  { step: 'Loaded to Aircraft', status: 'completed', timestamp: '2024-10-24 10:00', location: 'SIN Hangar' },
  { step: 'Departed', status: 'completed', timestamp: '2024-10-24 11:30', location: 'SIN Airport' },
  { step: 'Arrived', status: 'pending', timestamp: 'Expected 14:30', location: 'CGK Airport' },
];

export const mockFlights = [
  { flight: 'EP201', route: 'SIN → CGK', scheduled: '11:00', status: 'on-time', capacity: 75 },
  { flight: 'EP202', route: 'KUL → SUB', scheduled: '11:00', status: 'on-time', capacity: 45 },
  { flight: 'EP203', route: 'BKK → DPS', scheduled: '11:00', status: 'delayed', capacity: 85 },
  { flight: 'EP204', route: 'PEN → KNO', scheduled: '11:00', status: 'on-time', capacity: 60 },
  { flight: 'EP205', route: 'CGK → BPN', scheduled: '11:00', status: 'on-time', capacity: 55 },
  { flight: 'EP206', route: 'JKT → SBY', scheduled: '11:00', status: 'on-time', capacity: 70 },
];

export const mockStats = {
  totalShipments: 1728,
  shipmentsChange: '+12%',
  onTime: 42,
  onTimeChange: '+5%',
  delayed: 3,
  delayedChange: '-2%',
  readyToLoad: 156,
};

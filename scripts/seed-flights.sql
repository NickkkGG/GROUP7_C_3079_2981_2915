-- Seed more domestic flight routes for Indonesia
-- This script adds comprehensive flight routes between major Indonesian cities

-- Jakarta Routes
INSERT INTO flights (flight_number, aircraft_id, departure_city, arrival_city, departure_time, arrival_time, status) VALUES
('ALT101', 1, 'Jakarta (CGK)', 'Surabaya (SUB)', '2026-05-26 06:00:00', '2026-05-26 07:30:00', 'scheduled'),
('ALT102', 2, 'Jakarta (CGK)', 'Medan (KNO)', '2026-05-26 07:00:00', '2026-05-26 09:30:00', 'scheduled'),
('ALT103', 3, 'Jakarta (CGK)', 'Denpasar/Bali (DPS)', '2026-05-26 08:00:00', '2026-05-26 10:00:00', 'scheduled'),
('ALT104', 1, 'Jakarta (CGK)', 'Makassar (UPG)', '2026-05-26 09:00:00', '2026-05-26 12:00:00', 'scheduled'),
('ALT105', 2, 'Jakarta (CGK)', 'Balikpapan (BPN)', '2026-05-26 10:00:00', '2026-05-26 12:30:00', 'scheduled'),
('ALT106', 3, 'Jakarta (CGK)', 'Yogyakarta (YIA)', '2026-05-26 11:00:00', '2026-05-26 12:00:00', 'scheduled'),
('ALT107', 1, 'Jakarta (CGK)', 'Bandung (BDO)', '2026-05-26 12:00:00', '2026-05-26 12:45:00', 'scheduled'),
('ALT108', 2, 'Jakarta (CGK)', 'Palembang (PLM)', '2026-05-26 13:00:00', '2026-05-26 14:00:00', 'scheduled'),
('ALT109', 3, 'Jakarta (CGK)', 'Manado (MDC)', '2026-05-26 14:00:00', '2026-05-26 18:00:00', 'scheduled'),
('ALT110', 1, 'Jakarta (CGK)', 'Pontianak (PNK)', '2026-05-26 15:00:00', '2026-05-26 16:30:00', 'scheduled'),

-- Surabaya Routes
('ALT201', 2, 'Surabaya (SUB)', 'Jakarta (CGK)', '2026-05-26 08:00:00', '2026-05-26 09:30:00', 'scheduled'),
('ALT202', 3, 'Surabaya (SUB)', 'Denpasar/Bali (DPS)', '2026-05-26 09:00:00', '2026-05-26 10:00:00', 'scheduled'),
('ALT203', 1, 'Surabaya (SUB)', 'Makassar (UPG)', '2026-05-26 10:00:00', '2026-05-26 12:30:00', 'scheduled'),
('ALT204', 2, 'Surabaya (SUB)', 'Yogyakarta (YIA)', '2026-05-26 11:00:00', '2026-05-26 11:45:00', 'scheduled'),
('ALT205', 3, 'Surabaya (SUB)', 'Balikpapan (BPN)', '2026-05-26 12:00:00', '2026-05-26 14:00:00', 'scheduled'),
('ALT206', 1, 'Surabaya (SUB)', 'Medan (KNO)', '2026-05-26 13:00:00', '2026-05-26 16:00:00', 'scheduled'),

-- Medan Routes
('ALT301', 3, 'Medan (KNO)', 'Jakarta (CGK)', '2026-05-26 10:00:00', '2026-05-26 12:30:00', 'scheduled'),
('ALT302', 1, 'Medan (KNO)', 'Surabaya (SUB)', '2026-05-26 11:00:00', '2026-05-26 14:00:00', 'scheduled'),
('ALT303', 2, 'Medan (KNO)', 'Denpasar/Bali (DPS)', '2026-05-26 12:00:00', '2026-05-26 15:30:00', 'scheduled'),
('ALT304', 3, 'Medan (KNO)', 'Batam (BTH)', '2026-05-26 13:00:00', '2026-05-26 14:00:00', 'scheduled'),
('ALT305', 1, 'Medan (KNO)', 'Pekanbaru (PKU)', '2026-05-26 14:00:00', '2026-05-26 15:00:00', 'scheduled'),

-- Bali/Denpasar Routes
('ALT401', 2, 'Denpasar/Bali (DPS)', 'Jakarta (CGK)', '2026-05-26 11:00:00', '2026-05-26 13:00:00', 'scheduled'),
('ALT402', 3, 'Denpasar/Bali (DPS)', 'Surabaya (SUB)', '2026-05-26 12:00:00', '2026-05-26 13:00:00', 'scheduled'),
('ALT403', 1, 'Denpasar/Bali (DPS)', 'Makassar (UPG)', '2026-05-26 13:00:00', '2026-05-26 14:30:00', 'scheduled'),
('ALT404', 2, 'Denpasar/Bali (DPS)', 'Yogyakarta (YIA)', '2026-05-26 14:00:00', '2026-05-26 15:00:00', 'scheduled'),
('ALT405', 3, 'Denpasar/Bali (DPS)', 'Medan (KNO)', '2026-05-26 15:00:00', '2026-05-26 18:30:00', 'scheduled'),
('ALT406', 1, 'Denpasar/Bali (DPS)', 'Lombok (LOP)', '2026-05-26 16:00:00', '2026-05-26 16:30:00', 'scheduled'),

-- Makassar Routes
('ALT501', 2, 'Makassar (UPG)', 'Jakarta (CGK)', '2026-05-26 13:00:00', '2026-05-26 16:00:00', 'scheduled'),
('ALT502', 3, 'Makassar (UPG)', 'Surabaya (SUB)', '2026-05-26 14:00:00', '2026-05-26 16:30:00', 'scheduled'),
('ALT503', 1, 'Makassar (UPG)', 'Denpasar/Bali (DPS)', '2026-05-26 15:00:00', '2026-05-26 16:30:00', 'scheduled'),
('ALT504', 2, 'Makassar (UPG)', 'Manado (MDC)', '2026-05-26 16:00:00', '2026-05-26 17:30:00', 'scheduled'),
('ALT505', 3, 'Makassar (UPG)', 'Balikpapan (BPN)', '2026-05-26 17:00:00', '2026-05-26 18:30:00', 'scheduled'),

-- Yogyakarta Routes
('ALT601', 1, 'Yogyakarta (YIA)', 'Jakarta (CGK)', '2026-05-26 13:00:00', '2026-05-26 14:00:00', 'scheduled'),
('ALT602', 2, 'Yogyakarta (YIA)', 'Surabaya (SUB)', '2026-05-26 14:00:00', '2026-05-26 14:45:00', 'scheduled'),
('ALT603', 3, 'Yogyakarta (YIA)', 'Denpasar/Bali (DPS)', '2026-05-26 15:00:00', '2026-05-26 16:00:00', 'scheduled'),
('ALT604', 1, 'Yogyakarta (YIA)', 'Bandung (BDO)', '2026-05-26 16:00:00', '2026-05-26 17:00:00', 'scheduled'),

-- Balikpapan Routes
('ALT701', 2, 'Balikpapan (BPN)', 'Jakarta (CGK)', '2026-05-26 13:00:00', '2026-05-26 15:30:00', 'scheduled'),
('ALT702', 3, 'Balikpapan (BPN)', 'Surabaya (SUB)', '2026-05-26 14:00:00', '2026-05-26 16:00:00', 'scheduled'),
('ALT703', 1, 'Balikpapan (BPN)', 'Makassar (UPG)', '2026-05-26 15:00:00', '2026-05-26 16:30:00', 'scheduled'),
('ALT704', 2, 'Balikpapan (BPN)', 'Manado (MDC)', '2026-05-26 16:00:00', '2026-05-26 18:00:00', 'scheduled'),

-- Bandung Routes
('ALT801', 3, 'Bandung (BDO)', 'Jakarta (CGK)', '2026-05-26 14:00:00', '2026-05-26 14:45:00', 'scheduled'),
('ALT802', 1, 'Bandung (BDO)', 'Denpasar/Bali (DPS)', '2026-05-26 15:00:00', '2026-05-26 17:00:00', 'scheduled'),
('ALT803', 2, 'Bandung (BDO)', 'Yogyakarta (YIA)', '2026-05-26 16:00:00', '2026-05-26 17:00:00', 'scheduled'),

-- Manado Routes
('ALT901', 3, 'Manado (MDC)', 'Jakarta (CGK)', '2026-05-26 19:00:00', '2026-05-26 23:00:00', 'scheduled'),
('ALT902', 1, 'Manado (MDC)', 'Makassar (UPG)', '2026-05-26 18:00:00', '2026-05-26 19:30:00', 'scheduled'),
('ALT903', 2, 'Manado (MDC)', 'Balikpapan (BPN)', '2026-05-26 19:00:00', '2026-05-26 21:00:00', 'scheduled'),

-- Palembang Routes
('ALT1001', 3, 'Palembang (PLM)', 'Jakarta (CGK)', '2026-05-26 15:00:00', '2026-05-26 16:00:00', 'scheduled'),
('ALT1002', 1, 'Palembang (PLM)', 'Medan (KNO)', '2026-05-26 16:00:00', '2026-05-26 17:30:00', 'scheduled'),
('ALT1003', 2, 'Palembang (PLM)', 'Batam (BTH)', '2026-05-26 17:00:00', '2026-05-26 18:00:00', 'scheduled');

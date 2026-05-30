import { sql } from '@vercel/postgres';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Seed Aircraft (15 aircraft - Data Master)
    console.log('✈️ Seeding aircraft...');
    const aircraftData = [
      { registration: 'PK-GIA', model: 'Boeing 737-800', airline: 'Garuda Indonesia', capacity: 162 },
      { registration: 'PK-LHI', model: 'Airbus A320', airline: 'Lion Air', capacity: 180 },
      { registration: 'PK-AXC', model: 'Airbus A330-300', airline: 'AirAsia', capacity: 277 },
      { registration: 'PK-CGA', model: 'Boeing 777-300ER', airline: 'Citilink', capacity: 396 },
      { registration: 'PK-SRI', model: 'Boeing 737-900ER', airline: 'Sriwijaya Air', capacity: 215 },
      { registration: 'PK-BAT', model: 'Airbus A320neo', airline: 'Batik Air', capacity: 180 },
      { registration: 'PK-NAM', model: 'Boeing 737 MAX 8', airline: 'Nam Air', capacity: 189 },
      { registration: 'PK-TRA', model: 'ATR 72-600', airline: 'TransNusa', capacity: 72 },
      { registration: 'PK-WGS', model: 'Airbus A320', airline: 'Wings Air', capacity: 180 },
      { registration: 'PK-XPR', model: 'Boeing 737-800', airline: 'Xpress Air', capacity: 162 },
      { registration: 'PK-GIB', model: 'Boeing 777-200ER', airline: 'Garuda Indonesia', capacity: 268 },
      { registration: 'PK-LHJ', model: 'Airbus A321', airline: 'Lion Air', capacity: 220 },
      { registration: 'PK-AXD', model: 'Airbus A320', airline: 'AirAsia', capacity: 180 },
      { registration: 'PK-CGB', model: 'Boeing 737-800', airline: 'Citilink', capacity: 162 },
      { registration: 'PK-SRJ', model: 'Boeing 737-500', airline: 'Sriwijaya Air', capacity: 120 },
    ];

    for (const aircraft of aircraftData) {
      await sql`
        INSERT INTO aircraft (registration, model, airline, capacity, status)
        VALUES (${aircraft.registration}, ${aircraft.model}, ${aircraft.airline}, ${aircraft.capacity}, 'active')
        ON CONFLICT (registration) DO NOTHING;
      `;
    }
    console.log('✅ Aircraft seeded (15 records)');

    // 2. Seed Flights (60 flights - Bulk insert)
    console.log('🛫 Seeding flights...');
    const cities = [
      'CGK (Jakarta)', 'SUB (Surabaya)', 'DPS (Bali)', 'UPG (Makassar)',
      'KNO (Medan)', 'BPN (Balikpapan)', 'SIN (Singapore)', 'KUL (Kuala Lumpur)',
      'BKK (Bangkok)', 'PEN (Penang)', 'HKG (Hong Kong)', 'SYD (Sydney)'
    ];

    const flightStatuses = ['on-time', 'on-time', 'on-time', 'on-time', 'on-time', 'delayed', 'delayed', 'boarding', 'departed'];

    const flightValues: string[] = [];
    for (let i = 1; i <= 60; i++) {
      const flightNumber = `EP${200 + i}`;
      const aircraftId = ((i - 1) % 15) + 1; // Distribute across 15 aircraft
      const departureCity = cities[Math.floor(Math.random() * cities.length)];
      let arrivalCity = cities[Math.floor(Math.random() * cities.length)];

      while (arrivalCity === departureCity) {
        arrivalCity = cities[Math.floor(Math.random() * cities.length)];
      }

      const departureTime = new Date(2026, 4, 21, 8 + (i % 12), (i * 15) % 60);
      const arrivalTime = new Date(departureTime.getTime() + (2 + Math.random() * 4) * 60 * 60 * 1000);
      const status = flightStatuses[Math.floor(Math.random() * flightStatuses.length)];

      flightValues.push(`('${flightNumber}', ${aircraftId}, '${departureCity}', '${arrivalCity}', '${departureTime.toISOString()}', '${arrivalTime.toISOString()}', '${status}')`);
    }

    if (flightValues.length > 0) {
      await sql.query(`
        INSERT INTO flights (flight_number, aircraft_id, departure_city, arrival_city, departure_time, arrival_time, status)
        VALUES ${flightValues.join(', ')}
        ON CONFLICT (flight_number) DO NOTHING;
      `);
    }
    console.log('✅ Flights seeded (60 records)');

    // 3. Seed Shipments (120 shipments - Bulk insert)
    console.log('📦 Seeding shipments...');
    const senders = [
      'PT Global Tech', 'Medicorp Logistics', 'Express Retail', 'Agro Nusantara',
      'Tech Devices Inc.', 'Fashion Forward', 'Auto Parts Co.', 'Food Distributors',
      'Electronics Hub', 'Textile Industries', 'Pharma Solutions', 'Book Publishers',
      'Furniture Makers', 'Cosmetics Ltd.', 'Sports Equipment', 'Toy Factory'
    ];

    const recipients = [
      'John Anderson', 'Sarah Williams', 'Michael Chen', 'Emily Rodriguez',
      'David Kim', 'Lisa Thompson', 'James Wilson', 'Maria Garcia',
      'Robert Lee', 'Jennifer Martinez', 'William Brown', 'Patricia Davis',
      'Richard Taylor', 'Linda Johnson', 'Thomas Moore', 'Barbara White'
    ];

    const addresses = [
      'Jl. Sudirman No. 123, Jakarta', 'Jl. Gatot Subroto 456, Surabaya',
      'Jl. Ahmad Yani 789, Bali', 'Jl. Diponegoro 321, Makassar',
      'Jl. Imam Bonjol 654, Medan', 'Jl. Veteran 987, Balikpapan',
      '123 Orchard Road, Singapore', '456 Jalan Sultan, Kuala Lumpur',
      '789 Sukhumvit Road, Bangkok', '321 Penang Road, Penang',
      '654 Nathan Road, Hong Kong', '987 George Street, Sydney'
    ];

    const notesList = [
      'Handle with care - fragile items',
      'Temperature sensitive - keep cool',
      'Urgent delivery required',
      'Signature required upon delivery',
      'Contains electronic equipment',
      'Perishable goods - expedite delivery',
      'High value shipment - extra security',
      'Medical supplies - priority handling',
      null, null, null, null
    ];

    const shipmentValues: string[] = [];
    for (let i = 1; i <= 120; i++) {
      const trackingNumber = `AWB-EP-${24000 + i}`;
      const flightId = ((i - 1) % 60) + 1; // Distribute across 60 flights
      const sender = senders[Math.floor(Math.random() * senders.length)].replace(/'/g, "''");
      const senderContact = `+62 ${Math.floor(Math.random() * 900000000 + 100000000)}`;
      const senderAddress = addresses[Math.floor(Math.random() * addresses.length)].replace(/'/g, "''");
      const origin = cities[Math.floor(Math.random() * cities.length)];
      let destination = cities[Math.floor(Math.random() * cities.length)];

      while (destination === origin) {
        destination = cities[Math.floor(Math.random() * cities.length)];
      }

      const recipientName = recipients[Math.floor(Math.random() * recipients.length)];
      const recipientContact = `+62 ${Math.floor(Math.random() * 900000000 + 100000000)}`;
      const recipientAddress = addresses[Math.floor(Math.random() * addresses.length)].replace(/'/g, "''");
      const weight = (Math.random() * 200 + 20).toFixed(2);
      const notes = notesList[Math.floor(Math.random() * notesList.length)];
      const notesEscaped = notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL';

      const itemTypes = ['General Cargo', 'Electronics', 'Documents', 'Perishable', 'Fragile', 'Garments'];
      const serviceTypes = ['Regular', 'Express', 'Priority'];
      const rates: Record<string, number> = { Regular: 5000, Express: 10000, Priority: 15000 };
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      const tariff = (rates[serviceType] * parseFloat(weight)).toFixed(2);

      let status = 'booked';
      if (i % 5 === 0) status = 'delivered';
      else if (i % 4 === 0) status = 'arrived';
      else if (i % 3 === 0) status = 'in_transit';
      else if (i % 2 === 0) status = 'received';

      shipmentValues.push(`('${trackingNumber}', ${flightId}, '${sender}', '${senderContact}', '${senderAddress}', '${recipientName}', '${recipientContact}', '${recipientAddress}', '${origin}', '${destination}', ${weight}, '${itemType}', '${serviceType}', ${tariff}, '${status}', ${notesEscaped})`);
    }

    if (shipmentValues.length > 0) {
      await sql.query(`
        INSERT INTO shipments (tracking_number, flight_id, sender, sender_contact, sender_address, recipient_name, recipient_contact, recipient_address, origin, destination, weight, item_type, service_type, tariff, status, notes)
        VALUES ${shipmentValues.join(', ')}
        ON CONFLICT (tracking_number) DO NOTHING;
      `);
    }
    console.log('✅ Shipments seeded (120 records)');

    // 4. Seed Tracking History (Bulk insert)
    console.log('📍 Seeding tracking history...');

    const trackingStatuses = [
      { status: 'booked', location: 'Origin Warehouse', notes: 'Shipment booked and awaiting pickup' },
      { status: 'received', location: 'Origin Hub', notes: 'Package received at origin facility' },
      { status: 'in_transit', location: 'In Flight', notes: 'Package loaded on aircraft' },
      { status: 'arrived', location: 'Destination Hub', notes: 'Package arrived at destination facility' },
      { status: 'delivered', location: 'Final Destination', notes: 'Package delivered to recipient' }
    ];

    const historyValues: string[] = [];
    for (let i = 1; i <= 120; i++) {
      const trackingNumber = `AWB-EP-${24000 + i}`;

      let statusLevel = 1;
      if (i % 5 === 0) statusLevel = 5;
      else if (i % 4 === 0) statusLevel = 4;
      else if (i % 3 === 0) statusLevel = 3;
      else if (i % 2 === 0) statusLevel = 2;

      for (let j = 0; j < statusLevel; j++) {
        const historyEntry = trackingStatuses[j];
        const timestamp = new Date(2026, 4, 19 + j, 10 + (i % 8), (i * 10) % 60);
        historyValues.push(`('${trackingNumber}', '${historyEntry.status}', '${historyEntry.location}', '${historyEntry.notes}', '${timestamp.toISOString()}')`);
      }
    }

    if (historyValues.length > 0) {
      await sql.query(`
        INSERT INTO tracking_history (tracking_number, status, location, notes, timestamp)
        VALUES ${historyValues.join(', ')}
        ON CONFLICT DO NOTHING;
      `);
    }

    console.log('✅ Tracking history seeded');

    // 5. Seed Users (10 test users)
    console.log('👥 Seeding users...');
    const users = [
      { fullname: 'Admin User', email: 'admin@altus.com', password: 'admin123', role: 'operator' },
      { fullname: 'John Doe', email: 'john@example.com', password: 'user123', role: 'user' },
      { fullname: 'Jane Smith', email: 'jane@example.com', password: 'user123', role: 'user' },
      { fullname: 'Operator One', email: 'operator@altus.com', password: 'operator123', role: 'operator' },
      { fullname: 'Guest User', email: 'guest@example.com', password: 'guest123', role: 'guest' },
      { fullname: 'Alice Johnson', email: 'alice@example.com', password: 'user123', role: 'user' },
      { fullname: 'Bob Williams', email: 'bob@example.com', password: 'user123', role: 'user' },
      { fullname: 'Charlie Brown', email: 'charlie@example.com', password: 'user123', role: 'user' },
      { fullname: 'Diana Prince', email: 'diana@example.com', password: 'user123', role: 'user' },
      { fullname: 'Operator Two', email: 'operator2@altus.com', password: 'operator123', role: 'operator' },
    ];

    for (const user of users) {
      await sql`
        INSERT INTO users (fullname, email, password, role)
        VALUES (${user.fullname}, ${user.email}, ${user.password}, ${user.role})
        ON CONFLICT (email) DO NOTHING;
      `;
    }
    console.log('✅ Users seeded (10 records)');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('   - Aircraft: 15 records');
    console.log('   - Flights: 60 records');
    console.log('   - Shipments: 120 records');
    console.log('   - Tracking History: ~300 records');
    console.log('   - Users: 10 records');

    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

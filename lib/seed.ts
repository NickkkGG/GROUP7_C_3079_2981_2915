import { sql } from '@vercel/postgres';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Seed Aircraft (10 aircraft)
    console.log('📦 Seeding aircraft...');
    const aircraftData = [
      { registration: 'PK-GIA', model: 'Boeing 737-800', airline: 'Garuda Indonesia' },
      { registration: 'PK-LHI', model: 'Airbus A320', airline: 'Lion Air' },
      { registration: 'PK-AXC', model: 'Airbus A330-300', airline: 'AirAsia' },
      { registration: 'PK-CGA', model: 'Boeing 777-300ER', airline: 'Citilink' },
      { registration: 'PK-SRI', model: 'Boeing 737-900ER', airline: 'Sriwijaya Air' },
      { registration: 'PK-BAT', model: 'Airbus A320neo', airline: 'Batik Air' },
      { registration: 'PK-NAM', model: 'Boeing 737 MAX 8', airline: 'Nam Air' },
      { registration: 'PK-TRA', model: 'ATR 72-600', airline: 'TransNusa' },
      { registration: 'PK-WGS', model: 'Airbus A320', airline: 'Wings Air' },
      { registration: 'PK-XPR', model: 'Boeing 737-800', airline: 'Xpress Air' },
    ];

    for (const aircraft of aircraftData) {
      await sql`
        INSERT INTO aircraft (registration, model, airline, status)
        VALUES (${aircraft.registration}, ${aircraft.model}, ${aircraft.airline}, 'active')
        ON CONFLICT (registration) DO NOTHING;
      `;
    }
    console.log('✅ Aircraft seeded');

    // 2. Seed Flights (30 flights)
    console.log('✈️ Seeding flights...');
    const cities = [
      'CGK (Jakarta)', 'SUB (Surabaya)', 'DPS (Bali)', 'UPG (Makassar)',
      'KNO (Medan)', 'BPN (Balikpapan)', 'SIN (Singapore)', 'KUL (Kuala Lumpur)',
      'BKK (Bangkok)', 'PEN (Penang)', 'HKG (Hong Kong)', 'SYD (Sydney)'
    ];

    const statuses = ['on-time', 'on-time', 'on-time', 'on-time', 'delayed', 'departed'];

    for (let i = 1; i <= 30; i++) {
      const flightNumber = `EP${200 + i}`;
      const aircraftId = (i % 10) + 1;
      const departureCity = cities[Math.floor(Math.random() * cities.length)];
      let arrivalCity = cities[Math.floor(Math.random() * cities.length)];

      // Ensure departure and arrival are different
      while (arrivalCity === departureCity) {
        arrivalCity = cities[Math.floor(Math.random() * cities.length)];
      }

      const departureTime = new Date(2026, 4, 16, 8 + (i % 12), (i * 15) % 60);
      const arrivalTime = new Date(departureTime.getTime() + (2 + Math.random() * 4) * 60 * 60 * 1000);
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await sql`
        INSERT INTO flights (flight_number, aircraft_id, departure_city, arrival_city, departure_time, arrival_time, status)
        VALUES (${flightNumber}, ${aircraftId}, ${departureCity}, ${arrivalCity}, ${departureTime.toISOString()}, ${arrivalTime.toISOString()}, ${status})
        ON CONFLICT (flight_number) DO NOTHING;
      `;
    }
    console.log('✅ Flights seeded');

    // 3. Seed Shipments (50 shipments)
    console.log('📦 Seeding shipments...');
    const senders = [
      'PT Global Tech', 'Medicorp Logistics', 'Express Retail', 'Agro Nusantara',
      'Tech Devices Inc.', 'Fashion Forward', 'Auto Parts Co.', 'Food Distributors',
      'Electronics Hub', 'Textile Industries', 'Pharma Solutions', 'Book Publishers',
      'Furniture Makers', 'Cosmetics Ltd.', 'Sports Equipment', 'Toy Factory'
    ];

    const shipmentStatuses = ['pending', 'in-transit', 'in-transit', 'delivered', 'on-hold'];

    for (let i = 1; i <= 50; i++) {
      const trackingNumber = `AWB-EP-${24000 + i}`;
      const flightId = (i % 30) + 1;
      const sender = senders[Math.floor(Math.random() * senders.length)];
      const origin = cities[Math.floor(Math.random() * cities.length)];
      let destination = cities[Math.floor(Math.random() * cities.length)];

      while (destination === origin) {
        destination = cities[Math.floor(Math.random() * cities.length)];
      }

      const weight = (Math.random() * 200 + 20).toFixed(2);
      const status = shipmentStatuses[Math.floor(Math.random() * shipmentStatuses.length)];

      await sql`
        INSERT INTO shipments (tracking_number, flight_id, origin, destination, weight, status)
        VALUES (${trackingNumber}, ${flightId}, ${origin}, ${destination}, ${weight}, ${status})
        ON CONFLICT (tracking_number) DO NOTHING;
      `;
    }
    console.log('✅ Shipments seeded');

    // 4. Seed Users (5 test users)
    console.log('👥 Seeding users...');
    const users = [
      { fullname: 'Admin User', email: 'admin@altus.com', password: 'admin123', role: 'operator' },
      { fullname: 'John Doe', email: 'john@example.com', password: 'user123', role: 'user' },
      { fullname: 'Jane Smith', email: 'jane@example.com', password: 'user123', role: 'user' },
      { fullname: 'Operator One', email: 'operator@altus.com', password: 'operator123', role: 'operator' },
      { fullname: 'Guest User', email: 'guest@example.com', password: 'guest123', role: 'guest' },
    ];

    for (const user of users) {
      await sql`
        INSERT INTO users (fullname, email, password, role)
        VALUES (${user.fullname}, ${user.email}, ${user.password}, ${user.role})
        ON CONFLICT (email) DO NOTHING;
      `;
    }
    console.log('✅ Users seeded');

    console.log('🎉 Database seeding completed successfully!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

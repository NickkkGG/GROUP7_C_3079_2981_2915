'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DatabaseAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInitDatabase = async () => {
    if (!confirm('This will DROP all existing tables and recreate them. Continue?')) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/db/init');
      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Database initialized successfully!');
      } else {
        setError(`❌ Error: ${data.error || 'Failed to initialize database'}`);
      }
    } catch (err) {
      setError('❌ Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!confirm('This will insert dummy data into the database. Continue?')) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/db/seed');
      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Database seeded successfully! Added 50 shipments, 30 flights, 10 aircraft, and 5 users.');
      } else {
        setError(`❌ Error: ${data.error || 'Failed to seed database'}`);
      }
    } catch (err) {
      setError('❌ Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInitAndSeed = async () => {
    if (!confirm('This will DROP all tables, recreate them, and insert dummy data. Continue?')) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Step 1: Init
      setMessage('🔄 Step 1/2: Initializing database...');
      const initResponse = await fetch('/api/db/init');
      const initData = await initResponse.json();

      if (!initResponse.ok) {
        setError(`❌ Init failed: ${initData.error}`);
        setLoading(false);
        return;
      }

      // Step 2: Seed
      setMessage('🔄 Step 2/2: Seeding database...');
      const seedResponse = await fetch('/api/db/seed');
      const seedData = await seedResponse.json();

      if (!seedResponse.ok) {
        setError(`❌ Seed failed: ${seedData.error}`);
        setLoading(false);
        return;
      }

      setMessage('🎉 Database initialized and seeded successfully!');
    } catch (err) {
      setError('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">🛠️ Database Admin</h1>
          <p className="text-slate-600">Manage your Altus database</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-blue-900 mb-2">📋 What will be seeded:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✈️ 10 Aircraft (Boeing, Airbus models)</li>
              <li>🛫 30 Flights (various routes and statuses)</li>
              <li>📦 50 Shipments (with tracking numbers)</li>
              <li>👥 5 Test Users (admin, operators, users)</li>
            </ul>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <h3 className="font-bold text-amber-900 mb-2">⚠️ Warning:</h3>
            <p className="text-sm text-amber-800">
              "Init Database" will <strong>DELETE ALL EXISTING DATA</strong>. Use with caution!
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleInitAndSeed}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? '⏳ Processing...' : '🚀 Init + Seed Database (Recommended)'}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleInitDatabase}
              disabled={loading}
              className="bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? '⏳' : '🗑️ Init Only'}
            </button>

            <button
              onClick={handleSeedDatabase}
              disabled={loading}
              className="bg-blue-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? '⏳' : '🌱 Seed Only'}
            </button>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-300 transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>

        {message && (
          <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-green-800 font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="font-bold text-slate-900 mb-2 text-sm">📝 Test Accounts:</h3>
          <div className="text-xs text-slate-700 space-y-1 font-mono">
            <div>👨‍💼 Admin: admin@altus.com / admin123</div>
            <div>👤 User: john@example.com / user123</div>
            <div>🔧 Operator: operator@altus.com / operator123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

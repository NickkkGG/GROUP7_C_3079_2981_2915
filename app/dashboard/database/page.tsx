'use client';

import { useState } from 'react';
import TopNavbar from '@/components/TopNavbar';

export default function DatabasePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInit = async () => {
    if (!confirm('This will DROP all existing tables and recreate them. Continue?')) {
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/db/init');
      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Database initialized successfully! Tables created.');
      } else {
        setError(`❌ Error: ${data.error || 'Failed to initialize database'}`);
      }
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('This will seed the database with sample data. Continue?')) {
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/db/seed');
      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Database seeded successfully! Added 10 aircraft, 60 flights, 120 shipments, tracking history, and 5 users.');
      } else {
        setError(`❌ Error: ${data.error || 'Failed to seed database'}`);
      }
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBoth = async () => {
    if (!confirm('This will DROP all tables, recreate them, and seed with data. Continue?')) {
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Step 1: Init
      setMessage('⏳ Step 1/2: Initializing database...');
      const initResponse = await fetch('/api/db/init');
      const initData = await initResponse.json();

      if (!initResponse.ok) {
        setError(`❌ Init failed: ${initData.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      // Step 2: Seed
      setMessage('⏳ Step 2/2: Seeding database...');
      const seedResponse = await fetch('/api/db/seed');
      const seedData = await seedResponse.json();

      if (!seedResponse.ok) {
        setError(`❌ Seed failed: ${seedData.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      setMessage('✅ Complete! Database initialized and seeded successfully.');
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#ffe9d4] animate-fade-in">
      <TopNavbar
        title="Database Management"
        subtitle="Initialize and seed database tables"
      />
      <div className="p-4 flex flex-col overflow-y-auto flex-1">
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] backdrop-blur-md overflow-hidden flex flex-col flex-1 p-8">
          <h1 className="text-slate-900 font-bold text-2xl mb-2">Database Operations</h1>
          <p className="text-slate-600 text-sm mb-8">
            Manage your database schema and sample data
          </p>

          {/* Status Messages */}
          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border-[2px] border-emerald-500 rounded-[16px] text-emerald-700 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-[2px] border-red-500 rounded-[16px] text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4 max-w-2xl">
            {/* Init Only */}
            <div className="bg-white border-[2px] border-black/20 rounded-[16px] p-6">
              <h2 className="text-slate-900 font-bold text-lg mb-2">1. Initialize Database</h2>
              <p className="text-slate-600 text-sm mb-4">
                Drops all existing tables and recreates them with the latest schema (including sender column).
              </p>
              <button
                onClick={handleInit}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white font-bold text-sm rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Processing...' : 'Initialize Tables'}
              </button>
            </div>

            {/* Seed Only */}
            <div className="bg-white border-[2px] border-black/20 rounded-[16px] p-6">
              <h2 className="text-slate-900 font-bold text-lg mb-2">2. Seed Database</h2>
              <p className="text-slate-600 text-sm mb-4">
                Populates tables with sample data: 10 aircraft, 60 flights, 120 shipments with company senders, tracking history, and 5 users.
              </p>
              <button
                onClick={handleSeed}
                disabled={loading}
                className="px-6 py-3 bg-emerald-500 text-white font-bold text-sm rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Processing...' : 'Seed Data'}
              </button>
            </div>

            {/* Both */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-[2px] border-cyan-500 rounded-[16px] p-6">
              <h2 className="text-slate-900 font-bold text-lg mb-2">3. Full Reset (Recommended)</h2>
              <p className="text-slate-600 text-sm mb-4">
                Runs both operations: drops tables, recreates schema, and seeds with fresh data. This is what you need to apply the sender column changes.
              </p>
              <button
                onClick={handleBoth}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm rounded-full hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
              >
                {loading ? 'Processing...' : 'Initialize + Seed (Full Reset)'}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-amber-50 border-[2px] border-amber-400 rounded-[16px] max-w-2xl">
            <p className="text-amber-900 text-sm font-semibold mb-2">⚠️ Important Notes:</p>
            <ul className="text-amber-800 text-xs space-y-1 list-disc list-inside">
              <li>Initialize will DELETE all existing data</li>
              <li>Run "Full Reset" to apply the new sender column changes</li>
              <li>After running, push changes to GitHub manually</li>
              <li>Vercel will automatically deploy when you push</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

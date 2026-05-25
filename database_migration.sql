-- Migration: Add missing fields to shipments table
-- Run this in Neon SQL Editor

ALTER TABLE shipments
ADD COLUMN IF NOT EXISTS sender_contact VARCHAR(50),
ADD COLUMN IF NOT EXISTS sender_address TEXT,
ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS recipient_contact VARCHAR(50),
ADD COLUMN IF NOT EXISTS recipient_address TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verify the changes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'shipments'
ORDER BY ordinal_position;

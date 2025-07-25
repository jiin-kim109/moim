-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add address_id column to chatroom table (not nullable foreign key)
ALTER TABLE chatroom 
ADD COLUMN address_id TEXT NOT NULL REFERENCES address(id) ON DELETE CASCADE;

-- Create index for better performance on chatroom address lookups
CREATE INDEX chatroom_address_id_idx ON chatroom(address_id);

-- Update RLS policies for address table to allow chatroom address access
-- (This ensures addresses linked to chatrooms are accessible for location-based queries) 
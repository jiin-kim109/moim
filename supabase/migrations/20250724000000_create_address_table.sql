-- Create address table
CREATE TABLE address (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    place_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    longitude DECIMAL(15, 10),
    latitude DECIMAL(15, 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add address_id column to user_profile table (nullable foreign key)
ALTER TABLE user_profile 
ADD COLUMN address_id TEXT REFERENCES address(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX address_coordinates_idx ON address(longitude, latitude);
CREATE INDEX user_profile_address_id_idx ON user_profile(address_id);

-- Enable Row Level Security for address table
ALTER TABLE address ENABLE ROW LEVEL SECURITY;

-- RLS policies for address table
-- Allow all users to view addresses (needed for displaying user locations in chatrooms)
CREATE POLICY "All users can view addresses" ON address
    FOR SELECT USING (true);

-- Users can create addresses
CREATE POLICY "Users can create addresses" ON address
    FOR INSERT WITH CHECK (true);

-- Users can update addresses that are linked to their profile
CREATE POLICY "Users can update their addresses" ON address
    FOR UPDATE USING (
        id IN (
            SELECT address_id FROM user_profile 
            WHERE id = auth.uid() AND address_id IS NOT NULL
        )
    );

-- Users can delete addresses that are linked to their profile
CREATE POLICY "Users can delete their addresses" ON address
    FOR DELETE USING (
        id IN (
            SELECT address_id FROM user_profile 
            WHERE id = auth.uid() AND address_id IS NOT NULL
        )
    );

-- Trigger to automatically update updated_at timestamp for address
CREATE TRIGGER update_address_updated_at
    BEFORE UPDATE ON address
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 
-- Create location-based chatroom recommendation function using PostGIS
-- This function finds chatrooms within a specified radius of user's location
-- and returns them sorted by participant count (highest first)
-- Adds geom column with triggers to automatically sync with lat/lng columns

-- Add neighborhood_distance_km column to user_profile table
ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS neighborhood_distance_km INTEGER DEFAULT 30;

-- Add geometry column to address table for efficient spatial queries
ALTER TABLE address 
ADD COLUMN IF NOT EXISTS geom geometry(POINT, 4326);

-- Create index on geometry column for fast spatial queries
CREATE INDEX IF NOT EXISTS address_geom_idx ON address USING GIST (geom);

-- Function to automatically set geometry when lat/lng is inserted/updated
CREATE OR REPLACE FUNCTION sync_address_geometry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
        NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    ELSE
        NEW.geom = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic geometry sync on INSERT and UPDATE
DROP TRIGGER IF EXISTS sync_address_geometry_trigger ON address;
CREATE TRIGGER sync_address_geometry_trigger
    BEFORE INSERT OR UPDATE ON address
    FOR EACH ROW EXECUTE FUNCTION sync_address_geometry();

-- Function to get location-based chatroom query
CREATE OR REPLACE FUNCTION get_chatrooms_by_location(
    user_id UUID,
    page_size INTEGER DEFAULT 50,
    page_number INTEGER DEFAULT 1
)
RETURNS TABLE (
    id TEXT,
    title TEXT,
    host_id UUID,
    description TEXT,
    thumbnail_url TEXT,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    address JSONB,
    participant_count BIGINT,
    distance_km DECIMAL
) AS $$
DECLARE
    user_geom geometry;
    user_distance_km INTEGER;
BEGIN
    -- Get user's location and neighborhood distance from their profile
    SELECT ua.geom, up.neighborhood_distance_km 
    INTO user_geom, user_distance_km
    FROM user_profile up
    INNER JOIN address ua ON up.address_id = ua.id
    WHERE up.id = user_id AND ua.geom IS NOT NULL;
    
    -- If user has no location set, return empty result
    IF user_geom IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.host_id,
        c.description,
        c.thumbnail_url,
        c.max_participants,
        c.created_at,
        c.updated_at,
        jsonb_build_object(
            'id', a.id,
            'place_name', a.place_name,
            'address', a.address,
            'city', a.city,
            'state', a.state,
            'postal_code', a.postal_code,
            'country', a.country,
            'longitude', a.longitude,
            'latitude', a.latitude
        ) as address,
        COALESCE(participant_counts.count, 0) as participant_count,
        ROUND(
            ST_Distance(
                user_geom::geography,
                a.geom::geography
            )::numeric / 1000, 2
        ) as distance_km
    FROM chatroom c
    INNER JOIN address a ON c.address_id = a.id
    LEFT JOIN (
        SELECT 
            chatroom_id, 
            COUNT(*) as count
        FROM chatroom_participants 
        GROUP BY chatroom_id
    ) participant_counts ON c.id = participant_counts.chatroom_id
    WHERE 
        a.geom IS NOT NULL
        AND ST_DWithin(
            user_geom::geography,
            a.geom::geography,
            user_distance_km * 1000  -- Convert km to meters
        )
    ORDER BY 
        participant_counts.count DESC NULLS LAST,  -- Highest participant count first
        distance_km ASC,                          -- Then by closest distance
        c.created_at DESC                         -- Finally by newest
    LIMIT page_size
    OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_chatrooms_by_location(UUID, INTEGER, INTEGER) TO authenticated;

-- Add comments to document the functions
COMMENT ON FUNCTION get_chatrooms_by_location(UUID, INTEGER, INTEGER) IS 'Returns paginated chatrooms within user''s neighborhood distance, sorted by participant count (highest first). Parameters: user_id, page_size (default 20), page_number (default 1).';
COMMENT ON FUNCTION sync_address_geometry() IS 'Trigger function to automatically sync geom column when longitude/latitude are updated';
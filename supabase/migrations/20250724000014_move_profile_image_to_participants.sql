-- Move profile_image_url from user_profile to chatroom_participants
-- This allows different profile images per chatroom, similar to nicknames

-- Add profile_image_url column to chatroom_participants table
ALTER TABLE chatroom_participants 
ADD COLUMN profile_image_url TEXT DEFAULT NULL;

-- Remove profile_image_url column from user_profile table
-- First, copy any existing profile images to a temporary storage if needed
-- (In this case, we'll just drop the column since we're changing the model)
ALTER TABLE user_profile 
DROP COLUMN IF EXISTS profile_image_url;

-- Update RLS policies to prevent users from viewing other users' user_profile records
-- Drop the existing broad SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON user_profile;

-- Create a more restrictive policy that only allows users to view their own profile
CREATE POLICY "Users can view own profile only" ON user_profile
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own chatroom participant profile images
CREATE POLICY "Users can update their participant profile images" ON chatroom_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Update banned_users table to match new structure
-- Add profile_image_url column to banned_users table
ALTER TABLE banned_users 
ADD COLUMN profile_image_url TEXT DEFAULT NULL;

-- Rename last_nickname to nickname in banned_users table
ALTER TABLE banned_users 
RENAME COLUMN last_nickname TO nickname;

-- Add comments to document the changes
COMMENT ON COLUMN chatroom_participants.profile_image_url IS 'Profile image URL specific to this chatroom, allows different images per room';
COMMENT ON COLUMN banned_users.profile_image_url IS 'Profile image URL of the user when they were banned from this chatroom';
COMMENT ON COLUMN banned_users.nickname IS 'The nickname the user had when they were banned from this chatroom';
COMMENT ON POLICY "Users can view own profile only" ON user_profile IS 'Restricts user profile access to own profile only for privacy';
COMMENT ON POLICY "Users can update their participant profile images" ON chatroom_participants IS 'Allows users to update their own profile image in chatroom participants';

-- Add push notification token field to user_profile table
-- This will store the Expo push token for sending notifications

ALTER TABLE user_profile 
ADD COLUMN push_notification_token TEXT DEFAULT NULL;

-- Create index for better performance when querying by push token
CREATE INDEX user_profile_push_token_idx ON user_profile(push_notification_token) 
WHERE push_notification_token IS NOT NULL;

-- Add RLS policy to allow users to update their own push token
CREATE POLICY "Users can update own push token" ON user_profile
    FOR UPDATE USING (auth.uid() = id);

-- Add comment to document the new field
COMMENT ON COLUMN user_profile.push_notification_token IS 'Expo push notification token for sending mobile notifications';

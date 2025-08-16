-- Add last_read_message_id to chatroom_participants table
-- This allows tracking the last message each participant has read per chatroom

-- Add last_read_message_id column to chatroom_participants table
ALTER TABLE chatroom_participants 
ADD COLUMN last_read_message_id TEXT DEFAULT NULL REFERENCES chat_messages(id) ON DELETE SET NULL;

-- Create index for better performance when querying last read messages
CREATE INDEX chatroom_participants_last_read_message_idx ON chatroom_participants(last_read_message_id) 
WHERE last_read_message_id IS NOT NULL;

-- Create composite index for efficient participant + last read message queries
CREATE INDEX chatroom_participants_user_chatroom_last_read_idx ON chatroom_participants(user_id, chatroom_id, last_read_message_id);

-- Add RLS policy to allow users to update their own last read message
-- The existing "Users can update their own participant records" policy should cover this,
-- but let's be explicit about last_read_message_id updates
CREATE POLICY "Users can update their last read message" ON chatroom_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Add comment to document the new field
COMMENT ON COLUMN chatroom_participants.last_read_message_id IS 'ID of the last message this participant has read in this chatroom';

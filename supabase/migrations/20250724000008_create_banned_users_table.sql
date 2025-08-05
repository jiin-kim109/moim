-- Create banned_users table to track users banned from chatrooms
CREATE TABLE banned_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    chatroom_id TEXT NOT NULL REFERENCES chatroom(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    last_nickname TEXT NOT NULL,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chatroom_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX banned_users_chatroom_id_idx ON banned_users(chatroom_id);
CREATE INDEX banned_users_user_id_idx ON banned_users(user_id);
CREATE INDEX banned_users_banned_at_idx ON banned_users(banned_at);

-- Enable Row Level Security
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for banned_users table
-- Only chatroom hosts can view banned users in their chatrooms
CREATE POLICY "Hosts can view banned users in their chatrooms" ON banned_users
    FOR SELECT USING (
        chatroom_id IN (
            SELECT id FROM chatroom 
            WHERE host_id = auth.uid()
        )
    );

-- Only chatroom hosts can add users to banned list
CREATE POLICY "Hosts can ban users from their chatrooms" ON banned_users
    FOR INSERT WITH CHECK (
        chatroom_id IN (
            SELECT id FROM chatroom 
            WHERE host_id = auth.uid()
        )
    );

-- Only chatroom hosts can remove users from banned list
CREATE POLICY "Hosts can unban users from their chatrooms" ON banned_users
    FOR DELETE USING (
        chatroom_id IN (
            SELECT id FROM chatroom 
            WHERE host_id = auth.uid()
        )
    );

-- Only chatroom hosts can update banned user records
CREATE POLICY "Hosts can update banned user records" ON banned_users
    FOR UPDATE USING (
        chatroom_id IN (
            SELECT id FROM chatroom 
            WHERE host_id = auth.uid()
        )
    );

-- Add comments to document the table and policies
COMMENT ON TABLE banned_users IS 'Tracks users banned from specific chatrooms by their hosts';
COMMENT ON COLUMN banned_users.last_nickname IS 'The nickname the user had when they were banned';
COMMENT ON COLUMN banned_users.banned_at IS 'Timestamp when the user was banned from the chatroom';

-- RLS policy to prevent banned users from joining
-- Drop the existing INSERT policy for chatroom_participants
DROP POLICY IF EXISTS "Users can join chatrooms" ON chatroom_participants;

-- Create new INSERT policy that prevents banned users from joining
CREATE POLICY "Users can join chatrooms unless banned" ON chatroom_participants
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM banned_users 
            WHERE chatroom_id = chatroom_participants.chatroom_id 
            AND user_id = auth.uid()
        )
    ); 
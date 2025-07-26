-- Create chat_messages table
CREATE TABLE chat_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    chatroom_id TEXT NOT NULL REFERENCES chatroom(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX chat_messages_chatroom_id_idx ON chat_messages(chatroom_id);
CREATE INDEX chat_messages_sender_id_idx ON chat_messages(sender_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);

-- Composite index for efficient chatroom message queries ordered by time
CREATE INDEX chat_messages_chatroom_created_at_idx ON chat_messages(chatroom_id, created_at);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_messages table
-- Only chatroom participants can view messages in that chatroom
CREATE POLICY "Participants can view chatroom messages" ON chat_messages
    FOR SELECT USING (
        chatroom_id IN (
            SELECT chatroom_id FROM chatroom_participants 
            WHERE user_id = (SELECT id FROM user_profile WHERE auth_id = auth.uid())
        )
    );

-- Only chatroom participants can send messages to that chatroom
CREATE POLICY "Participants can send messages" ON chat_messages
    FOR INSERT WITH CHECK (
        sender_id = (SELECT id FROM user_profile WHERE auth_id = auth.uid())
        AND chatroom_id IN (
            SELECT chatroom_id FROM chatroom_participants 
            WHERE user_id = (SELECT id FROM user_profile WHERE auth_id = auth.uid())
        )
    );

-- Only message senders can update their own messages
CREATE POLICY "Senders can update their messages" ON chat_messages
    FOR UPDATE USING (
        sender_id = (SELECT id FROM user_profile WHERE auth_id = auth.uid())
    );



-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages; 
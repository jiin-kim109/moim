-- Create chatroom table
CREATE TABLE chatroom (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    host_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatroom_participants table
CREATE TABLE chatroom_participants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    chatroom_id TEXT NOT NULL REFERENCES chatroom(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chatroom_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX chatroom_host_id_idx ON chatroom(host_id);
CREATE INDEX chatroom_participants_chatroom_id_idx ON chatroom_participants(chatroom_id);
CREATE INDEX chatroom_participants_user_id_idx ON chatroom_participants(user_id);

-- Create unique index for nicknames within each chatroom
CREATE UNIQUE INDEX chatroom_participants_unique_nickname_per_room 
ON chatroom_participants(chatroom_id, nickname);

-- Enable Row Level Security
ALTER TABLE chatroom ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatroom_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for chatroom table
-- For now, allow all authenticated users to view all chatrooms for discovery
CREATE POLICY "All users can view chatrooms" ON chatroom
    FOR SELECT USING (true);

-- Users can update chatrooms they host
CREATE POLICY "Hosts can update their chatrooms" ON chatroom
    FOR UPDATE USING (host_id = auth.uid());

-- Users can create chatrooms
CREATE POLICY "Users can create chatrooms" ON chatroom
    FOR INSERT WITH CHECK (host_id = auth.uid());

-- Users can delete chatrooms they host
CREATE POLICY "Hosts can delete their chatrooms" ON chatroom
    FOR DELETE USING (host_id = auth.uid());

-- RLS policies for chatroom_participants table
-- Allow all users to view participant information (needed for participant counts)
CREATE POLICY "All users can view participants" ON chatroom_participants
    FOR SELECT USING (true);

-- Hosts can add participants to their chatrooms
CREATE POLICY "Hosts can add participants" ON chatroom_participants
    FOR INSERT WITH CHECK (
        chatroom_id IN (
            SELECT id FROM chatroom 
            WHERE host_id = auth.uid()
        )
    );

-- Users can remove themselves from chatrooms, hosts can remove any participant
CREATE POLICY "Users can leave chatrooms or hosts can remove participants" ON chatroom_participants
    FOR DELETE USING (
        user_id = auth.uid()
        OR chatroom_id IN (
            SELECT id FROM chatroom 
            WHERE host_id = auth.uid()
        )
    );

-- Trigger to automatically update updated_at timestamp for chatroom
CREATE TRIGGER update_chatroom_updated_at
    BEFORE UPDATE ON chatroom
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically add host as participant when creating a chatroom
CREATE OR REPLACE FUNCTION public.add_host_as_participant()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.chatroom_participants (chatroom_id, user_id, nickname)
    VALUES (NEW.id, NEW.host_id, 'Host');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically add host as participant
CREATE TRIGGER add_host_as_participant_trigger
    AFTER INSERT ON chatroom
    FOR EACH ROW EXECUTE FUNCTION public.add_host_as_participant();

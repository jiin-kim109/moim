-- Add unread count functionality to chat messages
-- This tracks how many participants haven't read each message

-- Create last_read_messages table to track user's last read message per chatroom
CREATE TABLE last_read_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    chatroom_id TEXT NOT NULL REFERENCES chatroom(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    last_read_message_id TEXT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chatroom_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX last_read_messages_chatroom_id_idx ON last_read_messages(chatroom_id);
CREATE INDEX last_read_messages_user_id_idx ON last_read_messages(user_id);
CREATE INDEX last_read_messages_message_id_idx ON last_read_messages(last_read_message_id);

-- Enable Row Level Security
ALTER TABLE last_read_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for last_read_messages table
-- Users can view their own last read messages
CREATE POLICY "Users can view own last read messages" ON last_read_messages
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own last read messages
CREATE POLICY "Users can insert own last read messages" ON last_read_messages
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own last read messages
CREATE POLICY "Users can update own last read messages" ON last_read_messages
    FOR UPDATE USING (user_id = auth.uid());

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_last_read_messages_updated_at
    BEFORE UPDATE ON last_read_messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add unread_count column to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN unread_count INTEGER DEFAULT 0;

-- Create index for better performance when querying unread counts
CREATE INDEX chat_messages_unread_count_idx ON chat_messages(unread_count) 
WHERE unread_count > 0;

-- Create composite index for efficient chatroom + unread count queries
CREATE INDEX chat_messages_chatroom_unread_idx ON chat_messages(chatroom_id, unread_count);

-- Function to calculate unread count for a specific message
CREATE OR REPLACE FUNCTION calculate_message_unread_count(message_id_param TEXT)
RETURNS INTEGER AS $$
DECLARE
    message_chatroom_id TEXT;
    message_created_at TIMESTAMP WITH TIME ZONE;
    total_participants INTEGER;
    read_participants INTEGER;
BEGIN
    -- Get message details
    SELECT chatroom_id, created_at 
    INTO message_chatroom_id, message_created_at
    FROM chat_messages 
    WHERE id = message_id_param;
    
    IF message_chatroom_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Count total participants in the chatroom
    SELECT COUNT(*) 
    INTO total_participants
    FROM chatroom_participants 
    WHERE chatroom_id = message_chatroom_id;
    
    -- Count participants who have read this message
    -- A participant has read this message if their last_read_message_id is this message or a later message
    SELECT COUNT(*) 
    INTO read_participants
    FROM chatroom_participants cp
    INNER JOIN last_read_messages lrm ON cp.user_id = lrm.user_id AND cp.chatroom_id = lrm.chatroom_id
    INNER JOIN chat_messages cm ON lrm.last_read_message_id = cm.id
    WHERE cp.chatroom_id = message_chatroom_id
    AND cm.created_at >= message_created_at;
    
    -- Return unread count (total participants minus those who have read it)
    RETURN total_participants - read_participants;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to set initial unread count when a message is created
CREATE OR REPLACE FUNCTION set_initial_unread_count()
RETURNS TRIGGER AS $$
DECLARE
    participant_count INTEGER;
BEGIN
    -- Count participants in the chatroom
    SELECT COUNT(*)
    INTO participant_count
    FROM chatroom_participants 
    WHERE chatroom_id = NEW.chatroom_id;
    
    -- Set unread_count to the number of participants minus sender
    NEW.unread_count = GREATEST(participant_count, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate unread counts when last_read_message_id is updated
CREATE OR REPLACE FUNCTION recalculate_unread_counts()
RETURNS TRIGGER AS $$
DECLARE
    message_record RECORD;
    recipient UUID;
    payload JSONB;
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.last_read_message_id IS DISTINCT FROM NEW.last_read_message_id THEN
        -- Recalculate unread counts for all messages in this chatroom that have unread_count > 0
        FOR message_record IN 
            SELECT id 
            FROM chat_messages 
            WHERE chatroom_id = NEW.chatroom_id 
            AND unread_count > 0
        LOOP
            UPDATE chat_messages 
            SET unread_count = calculate_message_unread_count(message_record.id)
            WHERE id = message_record.id;
        END LOOP;

        -- Broadcast last_read_message_updated event to all participants in the chatroom
        payload := jsonb_build_object(
            'type', 'last_read_message_updated',
            'chatroom_id', NEW.chatroom_id,
            'updated_by_user_id', NEW.user_id,
            'old_last_read_message_id', OLD.last_read_message_id,
            'new_last_read_message_id', NEW.last_read_message_id
        );
        
        FOR recipient IN SELECT user_id FROM public.get_chatroom_participant_ids(NEW.chatroom_id) LOOP
            PERFORM public.broadcast_to_user(recipient, 'last_read_message_updated', payload);
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set initial unread count when a message is created
CREATE TRIGGER set_initial_unread_count_trigger
    BEFORE INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION set_initial_unread_count();

-- Create trigger to recalculate unread counts when last_read_message_id is updated
CREATE TRIGGER recalculate_unread_counts_trigger
    AFTER UPDATE OF last_read_message_id ON last_read_messages
    FOR EACH ROW EXECUTE FUNCTION recalculate_unread_counts();

-- Function to update last read message when user exits chatroom
CREATE OR REPLACE FUNCTION update_last_read_on_exit()
RETURNS TRIGGER AS $$
DECLARE
    latest_message_id TEXT;
BEGIN
    -- Get the latest message in the chatroom
    SELECT id INTO latest_message_id
    FROM chat_messages
    WHERE chatroom_id = OLD.chatroom_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If there are messages in the chatroom, update the user's last read message
    IF latest_message_id IS NOT NULL THEN
        INSERT INTO last_read_messages (chatroom_id, user_id, last_read_message_id)
        VALUES (OLD.chatroom_id, OLD.user_id, latest_message_id)
        ON CONFLICT (chatroom_id, user_id)
        DO UPDATE SET 
            last_read_message_id = latest_message_id,
            updated_at = NOW();
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last read message when user exits chatroom
CREATE TRIGGER update_last_read_on_exit_trigger
    BEFORE DELETE ON chatroom_participants
    FOR EACH ROW EXECUTE FUNCTION update_last_read_on_exit();

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_message_unread_count(TEXT) TO authenticated;

-- Add comments to document the new functionality
COMMENT ON TABLE last_read_messages IS 'Tracks the last message each user has read in each chatroom, persists even if user leaves/rejoins';
COMMENT ON COLUMN chat_messages.unread_count IS 'Number of chatroom participants who have not read this message';
COMMENT ON FUNCTION calculate_message_unread_count(TEXT) IS 'Calculates the current unread count for a specific message based on last_read_messages table';
COMMENT ON FUNCTION set_initial_unread_count() IS 'Sets initial unread count when a message is created (total participants minus sender)';
COMMENT ON FUNCTION recalculate_unread_counts() IS 'Recalculates unread counts for all unread messages in a chatroom when a user updates their last_read_message_id';
COMMENT ON FUNCTION update_last_read_on_exit() IS 'Automatically marks all messages as read when a user exits a chatroom to properly decrement unread counts';

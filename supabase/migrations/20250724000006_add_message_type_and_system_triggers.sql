-- Add message type enum and system message triggers

-- Create enum for message types
CREATE TYPE message_type AS ENUM ('user_message', 'system_message');

-- Add message_type column to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN message_type message_type DEFAULT 'user_message';

-- Create index for better performance on message type queries
CREATE INDEX chat_messages_message_type_idx ON chat_messages(message_type);

-- Function to broadcast system message to chatroom channel
CREATE OR REPLACE FUNCTION broadcast_system_message(message_record chat_messages, chatroom_id TEXT)
RETURNS VOID AS $$
BEGIN
    PERFORM realtime.send(
        jsonb_build_object(
            'type', 'system_message',
            'payload', row_to_json(message_record)
        ),
        'system_message_created',
        chatroom_id,
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add system message when participant leaves chatroom
CREATE OR REPLACE FUNCTION add_participant_exit_message()
RETURNS TRIGGER AS $$
DECLARE
    new_message chat_messages%ROWTYPE;
BEGIN
    -- Insert system message about participant leaving
    INSERT INTO chat_messages (chatroom_id, sender_id, message, message_type)
    VALUES (
        OLD.chatroom_id,
        OLD.user_id,
        OLD.nickname || ' left the chatroom',
        'system_message'
    )
    RETURNING * INTO new_message;
    
    -- Broadcast the system message to the chatroom channel
    PERFORM broadcast_system_message(new_message, OLD.chatroom_id);
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add system message when chatroom host changes
CREATE OR REPLACE FUNCTION add_host_change_message()
RETURNS TRIGGER AS $$
DECLARE
    new_host_nickname TEXT;
    new_message chat_messages%ROWTYPE;
BEGIN
    -- Only trigger if host_id actually changed
    IF OLD.host_id != NEW.host_id THEN
        -- Get the nickname of the new host from chatroom_participants
        SELECT nickname INTO new_host_nickname
        FROM chatroom_participants
        WHERE chatroom_id = NEW.id AND user_id = NEW.host_id
        LIMIT 1;
        
        -- If we found the nickname, insert the system message
        IF new_host_nickname IS NOT NULL THEN
            INSERT INTO chat_messages (chatroom_id, sender_id, message, message_type)
            VALUES (
                NEW.id,
                NEW.host_id,
                'Chatroom host changed to ' || new_host_nickname,
                'system_message'
            )
            RETURNING * INTO new_message;
            
            -- Broadcast the system message to the chatroom channel
            PERFORM broadcast_system_message(new_message, NEW.id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for participant exit messages
CREATE TRIGGER participant_exit_system_message
    AFTER DELETE ON chatroom_participants
    FOR EACH ROW EXECUTE FUNCTION add_participant_exit_message();

-- Create trigger for host change messages
CREATE TRIGGER host_change_system_message
    AFTER UPDATE ON chatroom
    FOR EACH ROW EXECUTE FUNCTION add_host_change_message();

-- Add comments to document the functions and triggers
COMMENT ON FUNCTION broadcast_system_message(chat_messages, TEXT) IS 'Broadcasts system message to specific chatroom channel via realtime';
COMMENT ON FUNCTION add_participant_exit_message() IS 'Automatically adds system message when a participant leaves a chatroom';
COMMENT ON FUNCTION add_host_change_message() IS 'Automatically adds system message when chatroom host changes';
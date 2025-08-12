-- Simplified message broadcasts - unified approach
-- Instead of separate system/user message broadcasts, use single broadcast_message_created
-- Payload only contains message_id, client fetches full message details

-- Drop existing triggers that depend on the functions first
DROP TRIGGER IF EXISTS chat_messages_broadcast_created ON public.chat_messages;
DROP TRIGGER IF EXISTS chat_messages_broadcast_deleted ON public.chat_messages;

-- Drop existing broadcast functions and recreate with simplified logic
DROP FUNCTION IF EXISTS public.broadcast_system_message(chat_messages, TEXT);
DROP FUNCTION IF EXISTS public.broadcast_message_created();
DROP FUNCTION IF EXISTS public.broadcast_message_deleted();

-- Single unified broadcast function for message creation
CREATE OR REPLACE FUNCTION public.broadcast_message_created()
RETURNS TRIGGER AS $$
DECLARE
  recipient UUID;
  payload JSONB;
BEGIN
  payload := jsonb_build_object(
    'type', 'message_created',
    'chatroom_id', NEW.chatroom_id,
    'message_id', NEW.id
  );

  -- Broadcast to all participants except sender
  FOR recipient IN SELECT user_id FROM public.get_chatroom_participant_ids(NEW.chatroom_id) WHERE user_id != NEW.sender_id LOOP
    PERFORM public.broadcast_to_user(recipient, 'message_created', payload);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unified broadcast function for message deletion
CREATE OR REPLACE FUNCTION public.broadcast_message_deleted()
RETURNS TRIGGER AS $$
DECLARE
  recipient UUID;
  payload JSONB;
BEGIN
  IF NEW.is_deleted IS DISTINCT FROM OLD.is_deleted AND NEW.is_deleted = true THEN
    payload := jsonb_build_object(
      'type', 'message_deleted',
      'chatroom_id', NEW.chatroom_id,
      'message_id', NEW.id
    );
    
    -- Broadcast to all participants except sender
    FOR recipient IN SELECT user_id FROM public.get_chatroom_participant_ids(NEW.chatroom_id) WHERE user_id != NEW.sender_id LOOP
      PERFORM public.broadcast_to_user(recipient, 'message_deleted', payload);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update triggers to use unified broadcast function
DROP TRIGGER IF EXISTS chat_messages_broadcast_created ON public.chat_messages;
CREATE TRIGGER chat_messages_broadcast_created
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_message_created();

DROP TRIGGER IF EXISTS chat_messages_broadcast_deleted ON public.chat_messages;
CREATE TRIGGER chat_messages_broadcast_deleted
AFTER UPDATE OF is_deleted ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_message_deleted();

-- Update system message trigger functions to use broadcast_message_created directly
-- No need for separate broadcast_system_message function anymore

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
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add system message when participant joins chatroom
CREATE OR REPLACE FUNCTION add_participant_join_message()
RETURNS TRIGGER AS $$
DECLARE
    new_message chat_messages%ROWTYPE;
    chatroom_host_id UUID;
BEGIN
    -- Get the host_id of the chatroom
    SELECT host_id INTO chatroom_host_id
    FROM chatroom
    WHERE id = NEW.chatroom_id;
    
    -- Only create join message if the participant is not the host
    IF NEW.user_id != chatroom_host_id THEN
        -- Insert system message about participant joining
        INSERT INTO chat_messages (chatroom_id, sender_id, message, message_type)
        VALUES (
            NEW.chatroom_id,
            NEW.user_id,
            NEW.nickname || ' joined the chatroom',
            'system_message'
        )
        RETURNING * INTO new_message;
    END IF;
    
    RETURN NEW;
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
                new_host_nickname || ' is now the host of the chatroom!',
                'system_message'
            )
            RETURNING * INTO new_message;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add system message when participant nickname changes
CREATE OR REPLACE FUNCTION add_nickname_change_message()
RETURNS TRIGGER AS $$
DECLARE
    new_message chat_messages%ROWTYPE;
BEGIN
    -- Only trigger if nickname actually changed
    IF OLD.nickname != NEW.nickname THEN
        -- Insert system message about nickname change
        INSERT INTO chat_messages (chatroom_id, sender_id, message, message_type)
        VALUES (
            NEW.chatroom_id,
            NEW.user_id,
            OLD.nickname || ' changed nickname to ' || NEW.nickname,
            'system_message'
        )
        RETURNING * INTO new_message;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION public.broadcast_message_created() IS 'Broadcasts message_created event with message_id to all chatroom participants except sender';
COMMENT ON FUNCTION public.broadcast_message_deleted() IS 'Broadcasts message_deleted event with message_id to all chatroom participants except sender';
COMMENT ON FUNCTION add_participant_join_message() IS 'Automatically adds system message when a participant joins a chatroom';
COMMENT ON FUNCTION add_participant_exit_message() IS 'Automatically adds system message when a participant leaves a chatroom';
COMMENT ON FUNCTION add_host_change_message() IS 'Automatically adds system message when chatroom host changes';
COMMENT ON FUNCTION add_nickname_change_message() IS 'Automatically adds system message when a participant changes their nickname';

-- Realtime user-channel events
-- Broadcasts are sent to channel named by user_id (UUID string)

-- Helper to broadcast to a specific user channel
CREATE OR REPLACE FUNCTION public.broadcast_to_user(
  user_uuid UUID,
  event_name TEXT,
  payload JSONB
)
RETURNS VOID AS $$
BEGIN
  PERFORM realtime.send(
    payload,
    event_name,
    user_uuid::text,
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Derive participants of a chatroom
CREATE OR REPLACE FUNCTION public.get_chatroom_participant_ids(chatroom_id_in TEXT)
RETURNS TABLE (user_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT cp.user_id
  FROM public.chatroom_participants cp
  WHERE cp.chatroom_id = chatroom_id_in;
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper to resolve sender nickname within a chatroom
CREATE OR REPLACE FUNCTION public.get_sender_nickname(chatroom_id_in TEXT, user_id_in UUID)
RETURNS TEXT AS $$
DECLARE
  nick TEXT;
BEGIN
  SELECT nickname INTO nick
  FROM public.chatroom_participants
  WHERE chatroom_id = chatroom_id_in AND user_id = user_id_in
  LIMIT 1;
  RETURN nick;
END;
$$ LANGUAGE plpgsql STABLE;

-- When a user message is inserted, broadcast message_created to all participants' user channels
CREATE OR REPLACE FUNCTION public.broadcast_message_created()
RETURNS TRIGGER AS $$
DECLARE
  recipient UUID;
  payload JSONB;
  nick TEXT;
BEGIN
  nick := public.get_sender_nickname(NEW.chatroom_id, NEW.sender_id);
  payload := jsonb_build_object(
    'type', 'message_created',
    'chatroom_id', NEW.chatroom_id,
    'message', (to_jsonb(NEW) || jsonb_build_object('sender_nickname', nick))
  );

  FOR recipient IN SELECT user_id FROM public.get_chatroom_participant_ids(NEW.chatroom_id) WHERE user_id != NEW.sender_id LOOP
    PERFORM public.broadcast_to_user(recipient, 'message_created', payload);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS chat_messages_broadcast_created ON public.chat_messages;
CREATE TRIGGER chat_messages_broadcast_created
AFTER INSERT ON public.chat_messages
FOR EACH ROW
WHEN (NEW.message_type = 'user_message')
EXECUTE FUNCTION public.broadcast_message_created();

-- When a message is soft-deleted/marked deleted, broadcast message_deleted
CREATE OR REPLACE FUNCTION public.broadcast_message_deleted()
RETURNS TRIGGER AS $$
DECLARE
  recipient UUID;
  payload JSONB;
  nick TEXT;
BEGIN
  IF NEW.is_deleted IS DISTINCT FROM OLD.is_deleted AND NEW.is_deleted = true THEN
    nick := public.get_sender_nickname(NEW.chatroom_id, NEW.sender_id);
    payload := jsonb_build_object(
      'type', 'message_deleted',
      'chatroom_id', NEW.chatroom_id,
      'message', (to_jsonb(NEW) || jsonb_build_object('sender_nickname', nick))
    );
    FOR recipient IN SELECT user_id FROM public.get_chatroom_participant_ids(NEW.chatroom_id) WHERE user_id != NEW.sender_id LOOP
      PERFORM public.broadcast_to_user(recipient, 'message_deleted', payload);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS chat_messages_broadcast_deleted ON public.chat_messages;
CREATE TRIGGER chat_messages_broadcast_deleted
AFTER UPDATE OF is_deleted ON public.chat_messages
FOR EACH ROW
WHEN (NEW.message_type = 'user_message')
EXECUTE FUNCTION public.broadcast_message_deleted();

-- Override existing system broadcast function to publish to user channels
CREATE OR REPLACE FUNCTION public.broadcast_system_message(message_record chat_messages, chatroom_id TEXT)
RETURNS VOID AS $$
DECLARE
  recipient UUID;
  payload JSONB;
BEGIN
  payload := jsonb_build_object(
    'type', 'system_message_created',
    'chatroom_id', chatroom_id,
    'message', to_jsonb(message_record)
  );
  FOR recipient IN SELECT user_id FROM public.get_chatroom_participant_ids(chatroom_id) LOOP
    PERFORM public.broadcast_to_user(recipient, 'system_message_created', payload);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



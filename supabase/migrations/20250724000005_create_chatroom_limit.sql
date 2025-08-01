-- Add constraint to limit each user to hosting maximum 10 chatrooms
-- This constraint prevents users from creating more than 10 chatrooms as host

-- Create a function to check chatroom host limit
CREATE OR REPLACE FUNCTION check_chatroom_host_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user already hosts 10 or more chatrooms
    IF (SELECT COUNT(*) FROM chatroom WHERE host_id = NEW.host_id) >= 10 THEN
        RAISE EXCEPTION 'User cannot host more than 10 chatrooms';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the limit on INSERT
CREATE TRIGGER enforce_chatroom_host_limit
    BEFORE INSERT ON chatroom
    FOR EACH ROW EXECUTE FUNCTION check_chatroom_host_limit();

-- Create a function to check chatroom participant limit
CREATE OR REPLACE FUNCTION check_chatroom_participant_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_participant_count INTEGER;
    max_participants INTEGER;
BEGIN
    -- Get the current participant count and max_participants for the chatroom
    SELECT 
        COUNT(cp.user_id),
        c.max_participants
    INTO 
        current_participant_count,
        max_participants
    FROM chatroom c
    LEFT JOIN chatroom_participants cp ON c.id = cp.chatroom_id
    WHERE c.id = NEW.chatroom_id
    GROUP BY c.max_participants;
    
    -- If max_participants is set and would be exceeded, raise exception
    IF max_participants IS NOT NULL AND current_participant_count >= max_participants THEN
        RAISE EXCEPTION 'Chatroom has reached maximum participant limit of %', max_participants;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce participant limit on INSERT
CREATE TRIGGER enforce_chatroom_participant_limit
    BEFORE INSERT ON chatroom_participants
    FOR EACH ROW EXECUTE FUNCTION check_chatroom_participant_limit();

-- Add comments to document the constraints
COMMENT ON FUNCTION check_chatroom_host_limit() IS 'Enforces a maximum of 10 chatrooms per host user';
COMMENT ON FUNCTION check_chatroom_participant_limit() IS 'Enforces chatroom max_participants limit when users join'; 
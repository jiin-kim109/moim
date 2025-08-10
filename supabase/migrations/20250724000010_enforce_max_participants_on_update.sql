-- Enforce that max_participants cannot be set below the current participant count
-- Adds a trigger on chatroom BEFORE UPDATE OF max_participants

CREATE OR REPLACE FUNCTION prevent_lowering_max_below_current()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Only validate when the value actually changes
  IF TG_OP = 'UPDATE' AND NEW.max_participants IS DISTINCT FROM OLD.max_participants THEN
    -- Allow NULL (means no limit)
    IF NEW.max_participants IS NOT NULL THEN
      SELECT COUNT(*) INTO current_count
      FROM chatroom_participants
      WHERE chatroom_id = NEW.id;

      IF NEW.max_participants < current_count THEN
        RAISE EXCEPTION 'Cannot set max_participants (%) below current participant count (%)', NEW.max_participants, current_count;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure a clean trigger state before creating
DROP TRIGGER IF EXISTS enforce_max_participants_on_update ON chatroom;

CREATE TRIGGER enforce_max_participants_on_update
  BEFORE UPDATE OF max_participants ON chatroom
  FOR EACH ROW
  EXECUTE FUNCTION prevent_lowering_max_below_current();

-- Documentation
COMMENT ON FUNCTION prevent_lowering_max_below_current() IS 'Prevents lowering chatroom.max_participants below the current participant count.';
COMMENT ON TRIGGER enforce_max_participants_on_update ON chatroom IS 'Validates max_participants against existing participant count before update.';


-- Delete chatroom automatically when the last participant leaves
CREATE OR REPLACE FUNCTION delete_chatroom_if_no_participants()
RETURNS TRIGGER AS $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM chatroom_participants
  WHERE chatroom_id = OLD.chatroom_id;

  IF remaining_count = 0 THEN
    DELETE FROM chatroom WHERE id = OLD.chatroom_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure a clean trigger state before creating
DROP TRIGGER IF EXISTS delete_empty_chatroom_trigger ON chatroom_participants;

CREATE TRIGGER delete_empty_chatroom_trigger
  AFTER DELETE ON chatroom_participants
  FOR EACH ROW
  EXECUTE FUNCTION delete_chatroom_if_no_participants();

COMMENT ON FUNCTION delete_chatroom_if_no_participants() IS 'Deletes chatroom when its last participant leaves (participants count becomes zero).';
COMMENT ON TRIGGER delete_empty_chatroom_trigger ON chatroom_participants IS 'Removes chatroom after the last participant is deleted.';


-- Auto-transfer of host to next oldest participant
CREATE OR REPLACE FUNCTION transfer_host_if_exiting()
RETURNS TRIGGER AS $$
DECLARE
  current_host UUID;
  new_host UUID;
BEGIN
  SELECT host_id INTO current_host FROM chatroom WHERE id = OLD.chatroom_id;

  IF current_host = OLD.user_id THEN
    -- Pick the next oldest joined participant (excluding the exiting host)
    SELECT user_id INTO new_host
    FROM chatroom_participants
    WHERE chatroom_id = OLD.chatroom_id AND user_id <> OLD.user_id
    ORDER BY joined_at ASC
    LIMIT 1;

    IF new_host IS NOT NULL THEN
      UPDATE chatroom SET host_id = new_host WHERE id = OLD.chatroom_id;
    END IF;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS transfer_host_if_exiting_trigger ON chatroom_participants;
CREATE TRIGGER transfer_host_if_exiting_trigger
  BEFORE DELETE ON chatroom_participants
  FOR EACH ROW
  EXECUTE FUNCTION transfer_host_if_exiting();

COMMENT ON FUNCTION transfer_host_if_exiting() IS 'Automatically transfers chatroom host to the next oldest participant when the host exits.';
COMMENT ON TRIGGER transfer_host_if_exiting_trigger ON chatroom_participants IS 'Transfers host before participant deletion when the exiting user is the host.';

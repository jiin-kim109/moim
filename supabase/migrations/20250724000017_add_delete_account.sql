-- Add notification preference field
ALTER TABLE user_profile 
ADD COLUMN notification_enabled BOOLEAN DEFAULT TRUE;

-- Add soft deletion field
ALTER TABLE user_profile 
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Add comment to document the new fields
COMMENT ON COLUMN user_profile.notification_enabled IS 'Whether the user wants to receive push notifications (default: true)';
COMMENT ON COLUMN user_profile.is_deleted IS 'Soft deletion flag - true when user account is deleted (default: false)';

-- Create function to allow users to delete their own account (soft delete)
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to delete account';
  END IF;
  
  -- Soft delete: mark as deleted and clear personal data
  UPDATE user_profile 
  SET 
    is_deleted = TRUE,
    username = NULL,
    push_notification_token = NULL,
    updated_at = NOW()
  WHERE id = current_user_id;
  
  -- Hard delete from auth.users (this will prevent login)
  DELETE FROM auth.users WHERE id = current_user_id;
  
  -- Note: user_profile record is preserved for data integrity of chatrooms, messages, etc.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_own_account() TO authenticated;

-- Add comment to document the function
COMMENT ON FUNCTION delete_own_account() IS 'Allows authenticated users to delete their own account and all associated data';
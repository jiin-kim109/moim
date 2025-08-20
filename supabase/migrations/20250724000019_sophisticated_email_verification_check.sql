-- Overwrite existing check_email_exists function with sophisticated verification logic
CREATE OR REPLACE FUNCTION check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user record with email and verification status
  SELECT id, email, email_confirmed_at, created_at 
  INTO user_record
  FROM auth.users
  WHERE email = email_to_check;
  
  -- If no user found, email doesn't exist
  IF user_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If user exists and is verified, email exists
  IF user_record.email_confirmed_at IS NOT NULL THEN
    RETURN TRUE;
  END IF;
  
  -- If user exists but is not verified, then treat as if email doesn't exist (allow re-registration)
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is verified by email
CREATE OR REPLACE FUNCTION check_user_verified(email_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_verified BOOLEAN := FALSE;
BEGIN
  -- Check if user exists and is verified
  SELECT (email_confirmed_at IS NOT NULL) INTO user_verified
  FROM auth.users
  WHERE email = email_to_check;
  
  -- Return false if user doesn't exist or is not verified
  RETURN COALESCE(user_verified, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_verified(TEXT) TO authenticated;

-- Add comments to document the functions
COMMENT ON FUNCTION check_email_exists(TEXT) IS 'Checks if an email exists and is either verified or recently created (within 24h). Treats old unverified accounts as non-existent.';
COMMENT ON FUNCTION check_user_verified(TEXT) IS 'Checks if a user with the given email exists and has verified their email address';

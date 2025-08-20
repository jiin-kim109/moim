-- Create function to check if email already exists in auth.users
CREATE OR REPLACE FUNCTION check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  email_count INTEGER;
BEGIN
  -- Count users with the given email
  SELECT COUNT(*) INTO email_count
  FROM auth.users
  WHERE email = email_to_check;
  
  -- Return true if email exists, false otherwise
  RETURN email_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO authenticated;

-- Add comment to document the function
COMMENT ON FUNCTION check_email_exists(TEXT) IS 'Checks if an email address already exists in the auth.users table';
-- Create user_profile table
CREATE TABLE user_profile (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username TEXT,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on auth_id to ensure one profile per user
CREATE UNIQUE INDEX user_profile_auth_id_key ON user_profile(auth_id);

-- Create unique index on username (allows multiple NULLs but ensures unique non-NULL values)
CREATE UNIQUE INDEX user_profile_username_key ON user_profile(username) WHERE username IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON user_profile
    FOR SELECT USING (auth.uid() = auth_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profile
    FOR UPDATE USING (auth.uid() = auth_id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profile (auth_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_user_profile_updated_at
    BEFORE UPDATE ON user_profile
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

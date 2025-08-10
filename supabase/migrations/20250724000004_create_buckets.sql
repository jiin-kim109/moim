-- Create storage bucket for chatroom thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chatroom-thumbnails',
  'chatroom-thumbnails', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Enable RLS on storage.objects
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- Skipped, because storage.objects by default has RLS enabled

-- Policy to allow authenticated users to upload thumbnails
CREATE POLICY "Allow authenticated users to upload chatroom thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id = 'chatroom-thumbnails'
  );

-- Policy to allow public read access to chatroom thumbnails
CREATE POLICY "Allow public read access to chatroom thumbnails" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chatroom-thumbnails'
  );

-- Policy to allow users to update their own uploaded thumbnails
CREATE POLICY "Allow users to update their chatroom thumbnails" ON storage.objects
  FOR UPDATE USING (
    auth.uid() = owner::uuid
    AND bucket_id = 'chatroom-thumbnails'
  );

-- Policy to allow users to delete their own uploaded thumbnails
CREATE POLICY "Allow users to delete their chatroom thumbnails" ON storage.objects
  FOR DELETE USING (
    auth.uid() = owner::uuid
    AND bucket_id = 'chatroom-thumbnails'
  );

-- Policy to allow authenticated users to upload profile images
CREATE POLICY "Allow authenticated users to upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id = 'profile-images'
  );

-- Policy to allow public read access to profile images
CREATE POLICY "Allow public read access to profile images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-images'
  );

-- Policy to allow users to update their own uploaded profile images
CREATE POLICY "Allow users to update their profile images" ON storage.objects
  FOR UPDATE USING (
    auth.uid() = owner::uuid
    AND bucket_id = 'profile-images'
  );

-- Policy to allow users to delete their own uploaded profile images
CREATE POLICY "Allow users to delete their profile images" ON storage.objects
  FOR DELETE USING (
    auth.uid() = owner::uuid
    AND bucket_id = 'profile-images'
  ); 
-- Run in Supabase Dashboard → SQL Editor (once per project)
-- Creates the public image bucket and RLS policies for authenticated uploads.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'platform-images',
  'platform-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public read platform images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'platform-images');

CREATE POLICY "Authenticated users upload own platform images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'platform-images'
  AND (storage.foldername(name))[1] IN ('avatars', 'feed', 'community')
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);

CREATE POLICY "Authenticated users update own platform images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'platform-images'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);

CREATE POLICY "Authenticated users delete own platform images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'platform-images'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);

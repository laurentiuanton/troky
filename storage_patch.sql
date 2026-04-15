-- Create the Storage Bucket for listing images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('anunturi', 'anunturi', true) 
ON CONFLICT (id) DO NOTHING;

-- Grant public read access to images
CREATE POLICY "Images publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'anunturi' );

-- Grant insert access to authenticated users
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'anunturi' AND auth.role() = 'authenticated' );

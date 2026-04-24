-- Fix: Permite oricărui utilizator autentificat să creeze anunțuri
-- Problema: auth.role() = 'authenticated' nu mai funcționează corect în unele versiuni Supabase
-- Soluția: folosim auth.uid() IS NOT NULL care este universal

DROP POLICY IF EXISTS "Authenticated users can create listings." ON public.listings;
CREATE POLICY "Authenticated users can create listings." ON public.listings 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix: Permite oricărui utilizator să-și insereze propriul profil
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix: Permite inserarea de imagini de către proprietarul anunțului
DROP POLICY IF EXISTS "Users can insert images for their listings." ON public.listing_images;
CREATE POLICY "Users can insert images for their listings." ON public.listing_images 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND user_id = auth.uid())
  );

-- Fix: Permite trimiterea de mesaje
DROP POLICY IF EXISTS "Authenticated users can insert messages." ON public.messages;
CREATE POLICY "Authenticated users can insert messages." ON public.messages 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = sender_id);

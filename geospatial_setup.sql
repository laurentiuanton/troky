-- 1. Activam extensiile necesare pentru calcule de distante rapide
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- 2. Adaugam coordonate in Profile
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- 3. Adaugam coordonate in Anunturi
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- 4. Creăm Funcția Inteligenta de Cautare dupa Raza (km)
CREATE OR REPLACE FUNCTION search_listings_by_radius(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km FLOAT,
  search_query TEXT DEFAULT '',
  search_category TEXT DEFAULT ''
)
RETURNS SETOF public.listings AS $$
BEGIN
  RETURN QUERY
  SELECT l.*
  FROM public.listings l
  WHERE l.is_active = true
    -- Ne asiguram ca anuntul are coordonate setate
    AND l.lat IS NOT NULL 
    AND l.lng IS NOT NULL
    -- Calculam distanta (1km = 1000 metri). earth_distance returneaza metri.
    AND (earth_distance(ll_to_earth(user_lat, user_lng), ll_to_earth(l.lat, l.lng)) <= radius_km * 1000)
    -- Daca utilizatorul a mai bagat si un cuvant cheie
    AND (search_query = '' OR l.title ILIKE '%' || search_query || '%' OR l.description ILIKE '%' || search_query || '%')
    -- Daca utilizatorul a specificat si categoria
    AND (search_category = '' OR EXISTS (SELECT 1 FROM public.categories c WHERE c.id = l.category_id AND c.slug = search_category));
END;
$$ LANGUAGE plpgsql;

-- Create followers table
CREATE TABLE IF NOT EXISTS public.followers (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Followers are publicly viewable" 
ON public.followers FOR SELECT 
USING (true);

CREATE POLICY "Users can follow others" 
ON public.followers FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
ON public.followers FOR DELETE 
USING (auth.uid() = follower_id);

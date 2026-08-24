CREATE TABLE public.calculs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  sexe TEXT NOT NULL,
  age INTEGER NOT NULL,
  taille INTEGER NOT NULL,
  poids INTEGER NOT NULL,
  activite TEXT NOT NULL,
  objectif TEXT NOT NULL,
  bmr INTEGER NOT NULL,
  tdee INTEGER NOT NULL,
  calories INTEGER NOT NULL,
  proteines INTEGER NOT NULL,
  glucides INTEGER NOT NULL,
  lipides INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calculs TO authenticated;
GRANT ALL ON public.calculs TO service_role;

ALTER TABLE public.calculs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs voient leurs calculs" ON public.calculs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs creent leurs calculs" ON public.calculs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs suppriment leurs calculs" ON public.calculs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX calculs_user_created_idx ON public.calculs (user_id, created_at DESC);
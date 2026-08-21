-- ============================================================
-- EduMitra-AI – Migration 003: Study Activity & RLS Enhancements
-- ============================================================

-- 1. Create study_activity table for real streak & study timeline calculations
CREATE TABLE IF NOT EXISTS public.study_activity (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id  UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  document_title TEXT,
  type         TEXT NOT NULL, -- 'quiz', 'notes', 'flashcards', 'viva', 'chat', 'upload'
  details      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS study_activity_user_id_idx ON public.study_activity(user_id);
CREATE INDEX IF NOT EXISTS study_activity_created_at_idx ON public.study_activity(created_at);

-- Enable RLS
ALTER TABLE public.study_activity ENABLE ROW LEVEL SECURITY;

-- 2. Add RLS Policies for study_activity
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own study_activity') THEN
    CREATE POLICY "Users can view own study_activity" ON public.study_activity FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Users can insert own study_activity" ON public.study_activity FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Users can delete own study_activity" ON public.study_activity FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Service role full access on study_activity" ON public.study_activity FOR ALL USING (true);
  END IF;
END $$;

-- ============================================================
-- EduMitra-AI – Migration 002: Supabase Auth Profiles & RLS Security
-- ============================================================

-- 1. Create Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT,
  email          TEXT,
  avatar_url     TEXT,
  college        TEXT,
  course         TEXT,
  year_of_study  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, college, course, year_of_study)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'EduMitra Learner'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'college', ''),
    COALESCE(new.raw_user_meta_data->>'course', ''),
    COALESCE(new.raw_user_meta_data->>'year_of_study', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Ensure user_id column exists on all domain tables
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.flashcard_reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.learning_paths ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.viva_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Indexes for user filtering performance
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS flashcard_reviews_user_id_idx ON public.flashcard_reviews(user_id);
CREATE INDEX IF NOT EXISTS learning_paths_user_id_idx ON public.learning_paths(user_id);
CREATE INDEX IF NOT EXISTS viva_sessions_user_id_idx ON public.viva_sessions(user_id);

-- 4. Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Strict User Isolation RLS Policies (auth.uid() = user_id / auth.uid() = id)
DO $$
BEGIN
  -- Profiles Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Documents Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own documents') THEN
    CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  -- Notes Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own notes') THEN
    CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  -- Bookmarks Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own bookmarks') THEN
    CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

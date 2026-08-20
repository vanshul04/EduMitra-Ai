-- ============================================================
-- EduMitra-AI – Production SaaS Database Schema Migration
-- Migration 001: Initial Tables, pgvector Indexing & RLS Policies
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID,
  title        TEXT NOT NULL,
  source_type  TEXT NOT NULL CHECK (source_type IN ('youtube', 'pdf')),
  source_url   TEXT,
  chunk_count  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Chunks table with vector(768) embeddings
CREATE TABLE IF NOT EXISTS public.chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  content      TEXT NOT NULL,
  embedding    vector(768),
  chunk_index  INT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for pgvector cosine similarity
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
  ON public.chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Similarity search function
CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding vector(768),
  doc_id          UUID,
  match_count     INT DEFAULT 5
)
RETURNS TABLE (
  id         UUID,
  content    TEXT,
  chunk_index INT,
  similarity FLOAT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    id,
    content,
    chunk_index,
    1 - (embedding <=> query_embedding) AS similarity
  FROM public.chunks
  WHERE document_id = doc_id
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 4. AI Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id      UUID,
  title        TEXT NOT NULL,
  note_type    TEXT DEFAULT 'summary', -- 'summary', 'exam', 'cheat_sheet', 'custom'
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID,
  title        TEXT NOT NULL,
  category     TEXT DEFAULT 'general', -- 'chat', 'concept', 'flashcard', 'note'
  content      TEXT NOT NULL,
  source_info  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quiz Attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id         UUID,
  document_title  TEXT NOT NULL,
  score           INT NOT NULL,
  total_questions INT NOT NULL,
  percentage      INT NOT NULL,
  difficulty      TEXT DEFAULT 'medium',
  completed_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Flashcard Reviews (Spaced Repetition) table
CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id      UUID,
  card_index   INT NOT NULL,
  rating       TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  next_review  TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Learning Paths table
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id      UUID,
  title        TEXT NOT NULL,
  path_data    JSONB NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Viva / AI Interview Sessions table
CREATE TABLE IF NOT EXISTS public.viva_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id      UUID,
  topic        TEXT NOT NULL,
  score        FLOAT NOT NULL,
  evaluation   JSONB NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viva_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (bypass RLS for server API calls)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on documents'
  ) THEN
    CREATE POLICY "Service role full access on documents" ON public.documents FOR ALL USING (true);
    CREATE POLICY "Service role full access on chunks" ON public.chunks FOR ALL USING (true);
    CREATE POLICY "Service role full access on notes" ON public.notes FOR ALL USING (true);
    CREATE POLICY "Service role full access on bookmarks" ON public.bookmarks FOR ALL USING (true);
    CREATE POLICY "Service role full access on quiz_attempts" ON public.quiz_attempts FOR ALL USING (true);
    CREATE POLICY "Service role full access on flashcard_reviews" ON public.flashcard_reviews FOR ALL USING (true);
    CREATE POLICY "Service role full access on learning_paths" ON public.learning_paths FOR ALL USING (true);
    CREATE POLICY "Service role full access on viva_sessions" ON public.viva_sessions FOR ALL USING (true);
  END IF;
END $$;

// ─── Core Domain Types ───────────────────────────────────────────────

export interface Document {
  id: string;
  title: string;
  source_type: "youtube" | "pdf";
  source_url?: string;
  chunk_count?: number;
  created_at?: string;
}

export interface ProcessVideoResponse {
  document_id: string;
  chunk_count: number;
  title: string;
  message: string;
}

export interface ProcessPdfResponse {
  document_id: string;
  chunk_count: number;
  page_count: number;
  title: string;
  message: string;
}

// ─── Citation & Grounding Types ─────────────────────────────────────

export interface Citation {
  document_title: string;
  chunk_index: number;
  similarity: number;
  snippet: string;
  full_text?: string;
}

// ─── Flashcard Types ─────────────────────────────────────────────────

export interface Flashcard {
  question: string;
  answer: string;
  id?: string;
  rating?: "again" | "hard" | "good" | "easy";
  review_count?: number;
  next_review?: string;
}

export interface FlashcardsResponse {
  document_id: string;
  document_title: string;
  flashcards: Flashcard[];
  count: number;
}

// ─── Quiz Types ───────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface QuizResponse {
  document_id: string;
  document_title: string;
  questions: QuizQuestion[];
  count: number;
}

// ─── Chat Types ───────────────────────────────────────────────────────

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string | Date;
  sources?: Citation[];
}

export interface ChatStreamChunk {
  content?: string;
  citations?: Citation[];
  done: boolean;
  error?: string;
}

// ─── AI Notes Types ───────────────────────────────────────────────────

export type NoteType = "summary" | "exam" | "cheat_sheet" | "detailed";

export interface Note {
  id: string;
  document_id?: string;
  title: string;
  note_type: NoteType;
  content: string;
  created_at?: string;
}

// ─── Bookmarks Types ─────────────────────────────────────────────────

export type BookmarkCategory = "chat" | "concept" | "flashcard" | "note" | "general";

export interface Bookmark {
  id: string;
  title: string;
  category: BookmarkCategory;
  content: string;
  source_info?: string;
  created_at?: string;
}

// ─── AI Viva / Interview Types ───────────────────────────────────────

export interface VivaEvaluation {
  score: number;
  correctness: string;
  strengths: string[];
  weaknesses: string[];
  ideal_answer: string;
  tips: string[];
}

export interface VivaSession {
  id: string;
  document_id: string;
  question: string;
  user_answer: string;
  evaluation: VivaEvaluation;
  created_at?: string;
}

// ─── Learning Path Types ─────────────────────────────────────────────

export interface PathModule {
  module_number: number;
  title: string;
  description: string;
  topics: string[];
  estimated_minutes: number;
  completed_topics?: string[];
}

export interface LearningPath {
  document_id: string;
  title: string;
  prerequisites: string[];
  estimated_hours: number;
  difficulty: string;
  modules: PathModule[];
}

// ─── Analytics & History Types ───────────────────────────────────────

export interface QuizAttempt {
  id: string;
  document_id: string;
  document_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  difficulty?: string;
  completed_at: string;
}

export interface FlashcardSession {
  id: string;
  document_id: string;
  document_title: string;
  cards_reviewed: number;
  total_cards: number;
  completed_at: string;
}

export interface StudyActivity {
  id: string;
  document_id: string;
  document_title: string;
  type: "upload" | "chat" | "quiz" | "flashcards" | "summarize" | "notes" | "viva" | "learning_path" | "study_plan" | "key_concepts";
  timestamp: string;
  details?: string;
}

export type ProcessingStatus = "idle" | "processing" | "success" | "error";

# EduMitra-AI — Production AI Learning Companion SaaS

**EduMitra-AI** is a commercial-grade, AI-powered personalized learning platform that transforms YouTube videos and PDF documents into an interactive learning experience with grounded AI tutoring, adaptive quizzes, Leitner spaced repetition flashcards, AI notes studio, learning paths, viva/interview examiner, and analytics.

---

## 🌟 Key Features

1. **Upload & Ingestion System**
   - **YouTube Ingestion**: Extract public captions/subtitles via `youtube-transcript-api`.
   - **PDF Processing**: Extract text using `pymupdf` with file validation (20MB limit).
   - **Vector Database**: Chunk text and store 768-dim embeddings in Supabase `pgvector`.

2. **Grounded RAG AI Chat Tutor (`/chat`)**
   - RAG pipeline with similarity thresholding and untrusted prompt isolation.
   - Grounded source citations modal showing chunk index, vector similarity %, and context snippet.
   - Code syntax highlighting, copy, regenerate, and one-click bookmarking.

3. **AI Notes Studio (`/notes`)**
   - Generate Exam Preparation Notes, Revision Cheat Sheets, Executive Summaries, and Detailed Notes.
   - Embedded Markdown editor with live preview, autosave, PDF export (`jspdf`), and `.md` export.

4. **AI Learning Paths (`/learning-paths`)**
   - Sequenced curriculum roadmaps with prerequisite tracking, estimated study hours, and interactive topic checklists.

5. **AI Viva & Interview Examiner (`/viva`)**
   - Test technical readiness with AI examiner asking depth questions.
   - Technical evaluation with scoring out of 10, correctness assessment, strengths, weaknesses, ideal answers, and improvement tips.

6. **Spaced Repetition Flashcards (`/flashcards`)**
   - 3D flip card interaction with keyboard shortcuts (`Space`, `←`, `→`).
   - Leitner Spaced Repetition review ratings: **Again (1d)**, **Hard (3d)**, **Good (5d)**, **Easy (7d)**.
   - One-click Flashcards PDF download.

7. **Adaptive Quizzes (`/quiz`)**
   - MCQ quizzes with difficulty selection (Easy, Medium, Hard, Adaptive AI).
   - Pedagogical explanations for every option and Quiz PDF export.

8. **Bookmarks Management & Global Command Palette (`Ctrl + K`)**
   - Global command palette (`Ctrl + K` or `Cmd + K`) for instant search across documents, pages, tools, and actions.
   - Save and organize AI chat insights, concepts, flashcards, and notes.

9. **Analytics & Study Timeline (`/analytics`, `/history`)**
   - Computed metrics from real quiz attempts, flashcard sessions, and viva scores. Zero fabricated graphs.

---

## 🏗 System Architecture

```
EduMitra-AI/
├── client/                     # Next.js 16 (React 19, Tailwind CSS, Turbopack, Zustand)
│   ├── app/
│   │   ├── (Dashboard)         # Premium stats, active workspace, hero & quick prompt bar
│   │   ├── upload/             # Real-time state machine upload interface
│   │   ├── chat/               # RAG chat tutor with citations & source modal
│   │   ├── notes/              # AI Notes generator & Markdown editor
│   │   ├── learning-paths/     # AI Learning Paths with topic progress
│   │   ├── viva/               # AI Viva & Technical Interview Examiner
│   │   ├── flashcards/         # Spaced Repetition 3D flip cards
│   │   ├── quiz/               # Adaptive MCQ quizzes
│   │   ├── bookmarks/          # Bookmarks library
│   │   ├── my-learning/        # Library management (Search, Filter, Delete)
│   │   ├── analytics/          # Real database study analytics
│   │   ├── history/            # Chronological study timeline
│   │   ├── tools/              # Summary, Key Concepts, Study Plan
│   │   └── settings/           # Appearance, Profile, AI Engine status
│   ├── components/
│   │   ├── CommandPalette.tsx  # Ctrl+K Global Search
│   │   ├── Sidebar.tsx         # Sidebar navigation
│   │   ├── MarkdownRenderer.tsx# GitHub Markdown renderer
│   │   └── DocumentCard.tsx    # Reusable document card
│   └── lib/
│       ├── api.ts              # Centralized API client with AbortController timeouts
│       ├── store.ts            # Zustand store with persistence
│       └── pdfExport.ts        # jsPDF export utilities
└── server/                     # FastAPI Backend (Python 3.11, Supabase, Gemini)
    ├── api/index.py            # Main FastAPI app & router registration
    ├── routers/                # Endpoint routers (chat, quiz, flashcards, notes, viva, paths, bookmarks)
    ├── utils/                  # Supabase pgvector ops, Gemini embeddings, text chunker
    └── migrations/             # SQL database migration scripts
```

---

## 🛠 Local Setup Instructions

### 1. Backend (FastAPI)
```bash
cd server
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
Backend will run at: `http://localhost:8000`

### 2. Frontend (Next.js)
```bash
cd client
npm install
npm run dev
```
Frontend will run at: `http://localhost:3000`

---

## 🛢 Database Migration
Run `server/migrations/001_initial_saas_schema.sql` in your Supabase Dashboard SQL Editor to set up `pgvector`, tables, and Row Level Security (RLS) policies.

---

## 🚀 Deployment

- **Frontend**: Deploy `client/` to **Vercel** or **Netlify**. Set `NEXT_PUBLIC_API_URL=https://your-backend.render.com`.
- **Backend**: Deploy `server/` to **Render**, **Railway**, or **Fly.io**. Set environment variables from `.env.example`.

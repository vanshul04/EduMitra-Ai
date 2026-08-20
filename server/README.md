# EduMitra-AI Backend Service

FastAPI backend providing vector retrieval-augmented generation (RAG), PDF parsing, YouTube transcript extraction, MCQ quiz generation, flashcard deck generation, AI study tools, and PDF export.

## Requirements

Install dependencies:
```bash
pip install -r requirements.txt
```

Run server:
```bash
python main.py
```
Server runs at `http://localhost:8000`.

## API Endpoints

- `POST /process-video` - Process YouTube transcript
- `POST /process-pdf` - Extract & chunk PDF
- `GET /documents` - List uploaded documents
- `DELETE /documents/{id}` - Delete document
- `POST /chat` - Grounded RAG Chat with SSE streaming
- `POST /generate-quiz` - Generate MCQ quiz
- `POST /generate-flashcards` - Generate flashcard deck
- `POST /summarize` - Executive document summary
- `POST /key-concepts` - Extract key concepts & formulas
- `POST /study-plan` - Generate 5-day study roadmap
- `POST /export-quiz-pdf` - Server-side PDF generation for Quiz
- `POST /export-flashcards-pdf` - Server-side PDF generation for Flashcards

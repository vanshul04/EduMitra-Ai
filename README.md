# 🎓 EduMitra-AI

### AI-Powered Personalized Learning Platform

> **Learn smarter. Understand deeper. Learn with AI.**

EduMitra-AI is a full-stack AI-powered learning platform that transforms
YouTube videos and PDF documents into an interactive, personalized learning
experience.

Instead of simply consuming educational content, users can upload learning
material and interact with it through an AI tutor, generate notes, create
quizzes, study with flashcards, ask context-aware questions, and track their
learning journey.

---

## 🌐 Live Demo
<img width="1886" height="913" alt="image" src="https://github.com/user-attachments/assets/49eb61b0-a884-4f55-a633-258e4f859572" />
<img width="1869" height="908" alt="image" src="https://github.com/user-attachments/assets/13ee868c-c37b-4221-81bc-7ec2aec1169a" />


### 🚀 EduMitra-AI

**Frontend:**  
👉 https://edu-mitra-ai-five.vercel.app/

**Backend API:**  
👉 https://edumitra-ai-backendd.onrender.com

> The backend is deployed using Render and the application uses Supabase
> for authentication and database services.

---

# ✨ What is EduMitra-AI?

EduMitra-AI is designed around one simple idea:

> **Turn passive learning material into an interactive AI-powered learning
> environment.**

A student can provide a:

- 🎥 YouTube video
- 📄 PDF document
<img width="1883" height="898" alt="image" src="https://github.com/user-attachments/assets/57834a2f-ef51-4678-b59f-a361eba896d2" />

EduMitra-AI processes the content, converts it into searchable knowledge,
and allows the student to interact with that knowledge using AI.

The platform combines:

- Generative AI
- Retrieval-Augmented Generation (RAG)
- Vector embeddings
- Semantic search
- AI tutoring
- Automatic note generation
- Quiz generation
- Flashcards
- Authentication
- Personalized learning
- PDF exports
- Secure user data isolation

into a single learning platform.

---

# 🚀 Core Features

## 🎥 YouTube Learning

Paste a YouTube video URL and EduMitra-AI:

1. Extracts the video ID
2. Retrieves the available transcript
3. Cleans and processes the transcript
4. Splits the content into chunks
5. Generates vector embeddings
6. Stores the embeddings in Supabase
7. Makes the content searchable through RAG

Users can then ask questions directly about the video.

---

## 📄 PDF Learning

Upload educational PDFs and turn them into interactive AI learning material.

The platform processes the document and allows users to:

- Ask questions
- Generate notes
- Generate quizzes
- Create flashcards
- Search the document semantically
- Study using an AI tutor

---

# 🤖 AI Tutor

EduMitra-AI provides a context-aware AI tutor rather than a generic chatbot.

The AI retrieves relevant sections from the uploaded learning material before
generating an answer.
<img width="1889" height="884" alt="image" src="https://github.com/user-attachments/assets/6212e193-8187-4294-a028-c768e148a3b8" />


### Example

```text
Student Question
       ↓
Query Embedding
       ↓
Vector Similarity Search
       ↓
Relevant Document Chunks
       ↓
RAG Context
       ↓
AI Model
       ↓
Context-Aware Answer
````

This helps keep responses grounded in the user's learning material.

---

# 🧠 Retrieval-Augmented Generation

EduMitra-AI uses a RAG architecture to connect the AI model with the user's
uploaded content.

### RAG Pipeline

```text
                 ┌─────────────────┐
                 │ YouTube / PDF   │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Content Parser  │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Text Chunking   │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Gemini Embedding│
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │   pgvector      │
                 │    Supabase     │
                 └────────┬────────┘
                          ↓
                    User Question
                          ↓
                 ┌─────────────────┐
                 │ Query Embedding │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Similarity Search│
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Relevant Chunks │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │   Gemini AI     │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ AI Tutor Answer │
                 └─────────────────┘
```

---

# 📝 AI Notes

EduMitra-AI can convert learning material into structured study notes.

Instead of receiving a large block of generated text, the system organizes
learning content into readable sections containing:

* Headings
* Key concepts
* Explanations
* Important points
* Examples
* Structured Markdown
* Study-friendly formatting

---
<img width="1884" height="897" alt="image" src="https://github.com/user-attachments/assets/69b55dcf-37b0-474a-b395-32287d3a4fc6" />


# 🧪 AI Quiz Generator

Generate quizzes directly from uploaded learning material.

Features include:

* Multiple-choice questions
* AI-generated answers
* Explanations
* Score calculation
* Performance tracking
* Document-based questions
* Interactive quiz experience
<img width="1899" height="883" alt="image" src="https://github.com/user-attachments/assets/600650eb-131c-4424-b611-cba198f2e6d3" />


Users can also export quizzes as PDF documents.

---

# 🃏 AI Flashcards

Automatically generate flashcards from learning material.

Each flashcard contains:
<img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/1bc3a8dd-efd2-4dec-95e0-cb617456b34b" />


```text
┌──────────────────────────────┐
│           QUESTION           │
│                              │
│       What is RAG?           │
└──────────────────────────────┘

              ↓

┌──────────────────────────────┐
│            ANSWER            │
│                              │
│ Retrieval-Augmented          │
│ Generation combines          │
│ retrieval with generation.   │
└──────────────────────────────┘
```

Flashcards can also be downloaded for offline study.


---

# 📊 Learning Dashboard

EduMitra-AI provides a centralized learning dashboard where users can manage:

* Uploaded documents
* Learning materials
* Notes
* Quizzes
* Flashcards
* Learning progress
* Profile information
* Study activities

---

# 🔐 Authentication & Security

EduMitra-AI implements production-oriented authentication and data isolation.

### Authentication

* Supabase Authentication
* Email/password login
* Email verification
* Google OAuth support
* Password reset
* JWT-based authentication
* Protected frontend routes

### Data Security

* PostgreSQL Row Level Security
* User-specific document ownership
* User-specific learning data
* Server-side service credentials
* Protected API endpoints
* Environment-based secrets

The application is designed so that one authenticated user cannot access
another user's learning data.

---

# 🏗️ System Architecture

```text
                    ┌───────────────────────────┐
                    │       User / Student      │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │       Next.js Client      │
                    │                           │
                    │ • Dashboard               │
                    │ • AI Chat                 │
                    │ • Notes                   │
                    │ • Quiz                    │
                    │ • Flashcards              │
                    │ • Authentication          │
                    └─────────────┬─────────────┘
                                  │
                           REST / SSE API
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │       FastAPI Server      │
                    │                           │
                    │ • Authentication          │
                    │ • RAG                     │
                    │ • Document Processing     │
                    │ • AI Generation           │
                    │ • PDF Processing          │
                    │ • Quiz Generation         │
                    │ • Flashcards              │
                    └───────┬─────────┬─────────┘
                            │         │
                ┌───────────┘         └────────────┐
                ▼                                  ▼
      ┌───────────────────┐              ┌───────────────────┐
      │     Gemini AI     │              │     Supabase      │
      │                   │              │                   │
      │ • Generation      │              │ • PostgreSQL       │
      │ • Embeddings      │              │ • pgvector         │
      │ • AI Tutor        │              │ • Authentication   │
      └───────────────────┘              │ • RLS              │
                                         └───────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology    | Purpose               |
| ------------- | --------------------- |
| Next.js       | Frontend framework    |
| React         | UI development        |
| TypeScript    | Type-safe development |
| Tailwind CSS  | Styling               |
| Framer Motion | Animations            |
| Supabase Auth | Authentication        |

## Backend

| Technology | Purpose             |
| ---------- | ------------------- |
| Python     | Backend development |
| FastAPI    | REST API            |
| Uvicorn    | ASGI server         |
| Pydantic   | Data validation     |
| Docker     | Containerization    |

## AI / Machine Learning

| Technology        | Purpose             |
| ----------------- | ------------------- |
| Google Gemini     | AI generation       |
| Gemini Embeddings | Semantic embeddings |
| RAG               | Context-aware AI    |
| Vector Search     | Knowledge retrieval |

## Database

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Supabase   | Backend infrastructure    |
| PostgreSQL | Relational database       |
| pgvector   | Vector similarity search  |
| RLS        | User-level data isolation |

## Deployment

| Service  | Purpose                   |
| -------- | ------------------------- |
| Render   | Backend deployment        |
| Supabase | Database + authentication |
| GitHub   | Source control            |

---

# 📂 Project Structure

```text
EduMitra-Ai/
│
├── client/
│   ├── app/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── dashboard/
│   │   ├── chat/
│   │   ├── notes/
│   │   ├── quiz/
│   │   ├── flashcards/
│   │   └── settings/
│   │
│   ├── components/
│   ├── auth/
│   ├── lib/
│   └── ...
│
├── server/
│   ├── api/
│   ├── routers/
│   │   ├── process_video.py
│   │   ├── process_pdf.py
│   │   ├── chat.py
│   │   ├── notes.py
│   │   ├── quiz.py
│   │   ├── flashcards.py
│   │   └── pdf_export.py
│   │
│   ├── utils/
│   ├── migrations/
│   ├── config.py
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── README.md
├── LICENSE
└── .gitignore
```

---

# 🔄 Application Workflow

## 1. Authentication

```text
User
 ↓
Login / Signup
 ↓
Supabase Auth
 ↓
JWT Session
 ↓
Protected Application
```

## 2. Upload Learning Material

```text
YouTube URL / PDF
        ↓
Content Extraction
        ↓
Text Processing
        ↓
Chunking
        ↓
Embedding Generation
        ↓
Supabase Vector Database
```

## 3. Ask AI

```text
Question
   ↓
Query Embedding
   ↓
Vector Search
   ↓
Relevant Chunks
   ↓
Prompt Construction
   ↓
Gemini
   ↓
Streaming Response
```

---

# ⚡ AI Chat Streaming

The AI tutor uses Server-Sent Events (SSE) to stream responses to the
frontend.

Instead of waiting for the entire response:

```text
Request
   ↓
AI Generation
   ↓
Token / Chunk
   ↓
Frontend
   ↓
Token / Chunk
   ↓
Frontend
   ↓
Complete Response
```

This creates a more responsive AI-chat experience.

---

# 📄 PDF Export

EduMitra-AI supports generating downloadable learning resources.

Users can export:

* 🧪 Quizzes
* 🃏 Flashcards
* 📚 Study material

This makes AI-generated learning content useful beyond the application.

---

# 🌱 Future Roadmap

EduMitra-AI is designed to evolve into a complete AI learning ecosystem.

Potential future improvements include:

* [ ] AI-generated personalized study plans
* [ ] Adaptive difficulty
* [ ] Learning streaks
* [ ] Advanced analytics
* [ ] Spaced repetition
* [ ] Voice-based AI tutor
* [ ] Multi-language learning
* [ ] YouTube chapter extraction
* [ ] Collaborative classrooms
* [ ] Teacher dashboard
* [ ] Course creation
* [ ] AI exam preparation
* [ ] Mobile application
* [ ] Offline learning
* [ ] Advanced recommendation engine

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Python 3.12+
* Node.js 18+
* npm
* Git
* Supabase account
* Gemini API key

---

# 🔧 Backend Setup

Clone the repository:

```bash
git clone https://github.com/vanshul04/EduMitra-Ai.git
```

Enter the project:

```bash
cd EduMitra-Ai/server
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create:

```text
server/.env
```

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_ID=your_gemini_model
EMBEDDING_MODEL=your_embedding_model

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

Start the backend:

```bash
python main.py
```

---

# 💻 Frontend Setup

Open a new terminal:

```bash
cd EduMitra-Ai/client
```

Install dependencies:

```bash
npm install
```

Create:

```text
client/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🔑 Environment Variables

Never commit real credentials.

Required backend variables:

```env
GEMINI_API_KEY=
GEMINI_MODEL_ID=
EMBEDDING_MODEL=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

Required frontend variables:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

See `.env.example` files for configuration structure.

---

# 🐳 Docker

The backend includes Docker support.

Build:

```bash
docker build -t edumitra-ai .
```

Run:

```bash
docker run -p 8000:8000 edumitra-ai
```

---

# ☁️ Deployment

## Backend

The FastAPI backend is deployed using Render.

Production API:

```text
https://edumitra-ai-backendd.onrender.com
```

## Database

Supabase provides:

* PostgreSQL
* pgvector
* Authentication
* Row Level Security

## Frontend

Deploy the Next.js frontend using a suitable hosting provider and configure:

```env
NEXT_PUBLIC_API_URL=https://edumitra-ai-backendd.onrender.com
```

---

# 🧪 API Overview

| Endpoint         | Method | Purpose                 |
| ---------------- | ------ | ----------------------- |
| `/documents`     | GET    | Retrieve user documents |
| `/process-video` | POST   | Process YouTube video   |
| `/process-pdf`   | POST   | Process PDF             |
| `/chat`          | POST   | AI RAG chat             |
| `/notes`         | POST   | Generate notes          |
| `/quiz`          | POST   | Generate quiz           |
| `/flashcards`    | POST   | Generate flashcards     |
| `/pdf-export`    | POST   | Export learning content |

> Endpoint availability may change as the platform evolves.

---

# 🔐 Security Principles

EduMitra-AI follows several security principles:

### Authentication

Every protected request requires an authenticated session.

### Authorization

Users can access only resources associated with their account.

### Database Isolation

Supabase Row Level Security policies enforce user-level data isolation.

### Secret Management

API keys and service credentials are stored in environment variables.

### AI Context Security

Retrieved document content is treated as untrusted reference material
rather than executable instructions.

---

# 🧩 Engineering Highlights

This project demonstrates practical implementation of:

* Full-stack application architecture
* REST API design
* AI integration
* Retrieval-Augmented Generation
* Vector databases
* Semantic search
* Embedding pipelines
* Streaming AI responses
* Authentication
* JWT authorization
* PostgreSQL RLS
* Docker
* Cloud deployment
* PDF processing
* YouTube transcript processing
* AI-generated educational content

---

# 📈 Why EduMitra-AI?

Traditional learning tools generally separate:

```text
Videos
PDFs
Notes
Quizzes
Flashcards
Progress
```

EduMitra-AI brings these workflows together:

```text
             ┌──────────────────┐
             │ Learning Material│
             └────────┬─────────┘
                      ↓
             ┌──────────────────┐
             │    EduMitra-AI   │
             └────────┬─────────┘
                      ↓
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
     Notes          Quiz        Flashcards
       │              │              │
       └──────────────┼──────────────┘
                      ↓
                  AI Tutor
                      ↓
              Personalized Learning
```

---

# 🤝 Contribution

EduMitra-AI is primarily maintained as a portfolio and showcase project.

The source repository is **not an open-source project**, and contributions or
modifications are not automatically permitted.

However, if you have:

* A security vulnerability
* A significant bug report
* A useful technical suggestion
* A potential collaboration
* An improvement proposal

you may open an Issue for discussion or contact the author.

### Contribution Process

For approved contributions:

```text
Fork / Access
     ↓
Create Feature Branch
     ↓
Implement Change
     ↓
Test Locally
     ↓
Create Pull Request
     ↓
Code Review
     ↓
Approval
     ↓
Merge
```

Before proposing a contribution, please open an Issue describing the change
and wait for approval.

---

# 🐛 Bug Reports

If you discover a bug, please provide:

* Description of the issue
* Steps to reproduce
* Expected behavior
* Actual behavior
* Browser / OS
* Relevant logs
* Screenshots if applicable

Please **never include API keys, passwords, access tokens, or other secrets
in Issues or Pull Requests.**

---

# 🔒 Responsible Disclosure

If you discover a security vulnerability, please do not publicly disclose
credentials, tokens, personal information, or an exploitable vulnerability
before contacting the project owner.

Security-related reports should be handled privately whenever possible.

---

# 📜 License

Copyright © 2026 Vanshul Lalwani.

**All Rights Reserved.**

This repository is published for portfolio, demonstration, educational review,
and technical evaluation purposes.

No permission is granted to copy, reproduce, modify, redistribute, deploy,
commercialize, or create derivative works from this project without prior
written permission.

See the `LICENSE` file for complete terms.

---

# 👨‍💻 Author

## Vanshul Lalwani

Computer Science Engineering Student

Interested in:

* Artificial Intelligence
* Generative AI
* Machine Learning
* Full-Stack Development
* RAG Systems
* AI Agents
* Cloud & Deployment

---

# ⭐ Project

If you are reviewing this project as a recruiter, interviewer, developer, or
technical evaluator, the live application provides the best demonstration of
the platform.

### 🚀 EduMitra-AI

**Live Application:**
https://edu-mitra-ai-five.vercel.app/

**Backend API:**
[https://edumitra-ai-backendd.onrender.com](https://edumitra-ai-backendd.onrender.com)

---

<p align="center">

### 🎓 EduMitra-AI

**Transforming passive content into personalized learning.**

Built with ❤️ by **Vanshul Lalwani**

</p>
``-

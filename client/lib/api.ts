import {
  ProcessVideoResponse,
  ProcessPdfResponse,
  FlashcardsResponse,
  QuizResponse,
  ChatMessage,
  ChatStreamChunk,
  Document,
  Note,
  Bookmark,
  VivaEvaluation,
  LearningPath,
} from "./types";

import { supabase } from "./supabaseClient";

/**
 * ============================================================
 * EduMitra-AI API Configuration
 * ============================================================
 *
 * Production:
 *   https://edumitra-ai-backendd.onrender.com
 *
 * Local:
 *   http://localhost:8000
 *
 * IMPORTANT:
 * We normalize the URL so a trailing "/" never creates "//".
 */
const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://edumitra-ai-backendd.onrender.com";

const API_URL = RAW_API_URL.replace(/\/+$/, "");

const REQUEST_TIMEOUT_MS = 180000; // 3 minutes


// ============================================================
// Helpers
// ============================================================

/**
 * Safely extract an error message from a failed fetch response.
 */
async function extractErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await res.json();

      return (
        data?.detail ||
        data?.message ||
        fallback
      );
    } catch {
      return fallback;
    }
  }

  try {
    const text = await res.text();

    if (text.length < 500) {
      return text;
    }
  } catch {
    // Ignore parsing errors
  }

  return `${fallback} (HTTP ${res.status})`;
}


/**
 * Authenticated fetch helper.
 *
 * Automatically:
 * - attaches Supabase JWT
 * - applies timeout
 * - normalizes API URL
 */
async function fetchWithTimeout(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {

  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  const headers = new Headers(options.headers || {});

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      headers.set(
        "Authorization",
        `Bearer ${session.access_token}`
      );
    }
  } catch (err) {
    console.warn(
      "Could not retrieve Supabase session:",
      err
    );
  }

  /**
   * Always construct URL safely.
   *
   * Example:
   * API_URL = https://...onrender.com
   * endpoint = /documents
   *
   * Result:
   * https://...onrender.com/documents
   */
  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_URL}${cleanEndpoint}`;

  console.log(`[API] ${options.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return response;

  } catch (error: unknown) {

    clearTimeout(timeoutId);

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "Processing timed out. The server is taking longer than expected. Please try again."
      );
    }

    if (
      error instanceof TypeError &&
      (error.message.includes("Failed to fetch") || error.message.includes("fetch failed"))
    ) {
      throw new Error(
        `Unable to connect to EduMitra backend API (${API_URL}). Please verify that the server is running.`
      );
    }

    throw error;
  }
}


// ============================================================
// Document Management
// ============================================================

export async function fetchDocuments(
  sourceType?: string,
  search?: string
): Promise<Document[]> {

  const params = new URLSearchParams();

  if (sourceType) {
    params.append("source_type", sourceType);
  }

  if (search) {
    params.append("search", search);
  }

  try {

    const query = params.toString();

    const endpoint = query
      ? `/documents?${query}`
      : "/documents";

    const res = await fetchWithTimeout(
      endpoint,
      {},
      10000
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    return data.documents || [];

  } catch (err) {

    console.error(
      "fetchDocuments error:",
      err
    );

    return [];
  }
}


export async function deleteDocumentApi(
  documentId: string
): Promise<boolean> {

  const res = await fetchWithTimeout(
    `/documents/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
    },
    10000
  );

  return res.ok;
}


// ============================================================
// Process Video & PDF
// ============================================================

export async function processVideo(
  url: string
): Promise<ProcessVideoResponse> {

  const res = await fetchWithTimeout(
    "/process-video",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
      }),
    }
  );

  if (!res.ok) {

    const errText =
      await extractErrorMessage(
        res,
        "Failed to process YouTube video"
      );

    console.error(
      "processVideo error:",
      res.status,
      errText
    );

    throw new Error(errText);
  }

  return res.json();
}


export async function processPdf(
  file: File
): Promise<ProcessPdfResponse> {

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const res = await fetchWithTimeout(
    "/process-pdf",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {

    const errText =
      await extractErrorMessage(
        res,
        "Failed to process PDF document"
      );

    console.error(
      "processPdf error:",
      res.status,
      errText
    );

    throw new Error(errText);
  }

  return res.json();
}


// ============================================================
// Flashcards & Quiz
// ============================================================

export async function generateFlashcards(
  documentId: string
): Promise<FlashcardsResponse> {

  const res = await fetchWithTimeout(
    "/generate-flashcards",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: documentId,
      }),
    }
  );

  if (!res.ok) {

    const errText =
      await extractErrorMessage(
        res,
        "Failed to generate flashcards"
      );

    console.error(
      "generateFlashcards error:",
      res.status,
      errText
    );

    throw new Error(errText);
  }

  return res.json();
}


export async function generateQuiz(
  documentId: string
): Promise<QuizResponse> {

  const res = await fetchWithTimeout(
    "/generate-quiz",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: documentId,
      }),
    }
  );

  if (!res.ok) {

    const errText =
      await extractErrorMessage(
        res,
        "Failed to generate quiz"
      );

    console.error(
      "generateQuiz error:",
      res.status,
      errText
    );

    throw new Error(errText);
  }

  return res.json();
}


// ============================================================
// AI Tools
// ============================================================

export async function summarizeDocumentApi(
  documentId: string
): Promise<{
  title: string;
  summary: string;
}> {

  const res = await fetchWithTimeout(
    "/summarize",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: documentId,
      }),
    }
  );

  if (!res.ok) {

    throw new Error(
      await extractErrorMessage(
        res,
        "Failed to summarize document"
      )
    );
  }

  return res.json();
}


export async function extractKeyConceptsApi(
  documentId: string
): Promise<{
  title: string;
  key_concepts: string;
}> {

  const res = await fetchWithTimeout(
    "/key-concepts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: documentId,
      }),
    }
  );

  if (!res.ok) {

    throw new Error(
      await extractErrorMessage(
        res,
        "Failed to extract key concepts"
      )
    );
  }

  return res.json();
}


export async function generateStudyPlanApi(
  documentId: string
): Promise<{
  title: string;
  study_plan: string;
}> {

  const res = await fetchWithTimeout(
    "/study-plan",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: documentId,
      }),
    }
  );

  if (!res.ok) {

    throw new Error(
      await extractErrorMessage(
        res,
        "Failed to generate study plan"
      )
    );
  }

  return res.json();
}


// ============================================================
// AI Notes
// ============================================================

export async function generateNotesApi(
  documentId: string,
  noteType = "exam"
): Promise<{
  title: string;
  content: string;
  note_type: string;
}> {

  const res = await fetchWithTimeout(
    "/notes/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: documentId,
        note_type: noteType,
      }),
    }
  );

  if (!res.ok) {

    throw new Error(
      await extractErrorMessage(
        res,
        "Failed to generate notes"
      )
    );
  }

  return res.json();
}


export async function fetchNotesApi(): Promise<Note[]> {

  const res = await fetchWithTimeout(
    "/notes",
    {},
    10000
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();

  return data.notes || [];
}


export async function saveNoteApi(
  note: {
    document_id?: string;
    title: string;
    note_type: string;
    content: string;
  }
): Promise<Note> {

  const res = await fetchWithTimeout(
    "/notes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    }
  );

  if (!res.ok) {

    throw new Error(
      await extractErrorMessage(
        res,
        "Failed to save note"
      )
    );
  }

  const data = await res.json();

  return data.note;
}


// ============================================================
// AI Viva / Interview Mode
// ============================================================

export async function startVivaApi(
  documentId: string,
  difficulty = "medium",
  numQuestions = 3
): Promise<{
  document_title: string;
  questions: string[];
}> {

  const res = await fetchWithTimeout(
    "/viva/start",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: documentId,
        difficulty,
        num_questions: numQuestions,
      }),
    }
  );

  if (!res.ok) {

    throw new Error(
      await extractErrorMessage(
        res,
        "Failed to start viva session"
      )
    );
  }

  return res.json();
}


export async function evaluateVivaApi(
  documentId: string,
  question: string,
  userAnswer: string
): Promise<{
  evaluation: VivaEvaluation;
}> {

  const res = await fetchWithTimeout(
    "/viva/evaluate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: documentId,
        question,
        user_answer: userAnswer,
      }),
    }
  );

  if (!res.ok) {

    throw new Error(
      await extractErrorMessage(
        res,
        "Failed to evaluate viva answer"
      )
    );
  }

  return res.json();
}


// ============================================================
// AI Learning Paths
// ============================================================

export async function generateLearningPathApi(
  documentId: string
): Promise<{
  path: LearningPath;
}> {

  const res = await fetchWithTimeout(
    "/learning-path/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: documentId,
      }),
    }
  );

  if (!res.ok) {

    throw new Error(
      await extractErrorMessage(
        res,
        "Failed to generate learning path"
      )
    );
  }

  return res.json();
}


// ============================================================
// Bookmarks
// ============================================================

export async function fetchBookmarksApi(): Promise<Bookmark[]> {

  const res = await fetchWithTimeout(
    "/bookmarks",
    {},
    10000
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();

  return data.bookmarks || [];
}


export async function addBookmarkApi(
  bookmark: {
    title: string;
    category: string;
    content: string;
    source_info?: string;
  }
): Promise<Bookmark> {

  const res = await fetchWithTimeout(
    "/bookmarks",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookmark),
    }
  );

  if (!res.ok) {

    throw new Error(
      await extractErrorMessage(
        res,
        "Failed to save bookmark"
      )
    );
  }

  const data = await res.json();

  return data.bookmark;
}


export async function deleteBookmarkApi(
  id: string
): Promise<boolean> {

  const res = await fetchWithTimeout(
    `/bookmarks/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
    10000
  );

  return res.ok;
}


// ============================================================
// Chat — SSE Streaming with Citations
// ============================================================

export async function* chatStream(
  documentId: string,
  message: string,
  history: ChatMessage[]
): AsyncGenerator<ChatStreamChunk> {

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

  let res: Response;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
  };


  // Attach Supabase JWT
  try {

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {

      headers["Authorization"] =
        `Bearer ${session.access_token}`;
    }

  } catch (err) {

    console.warn(
      "Could not retrieve Supabase session:",
      err
    );
  }


  // Send request
  try {

    res = await fetch(
      `${API_URL}/chat`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          document_id: documentId,
          message,
          history: history.map(
            (m) => ({
              role: m.role,
              content: m.content,
            })
          ),
        }),
        signal: controller.signal,
      }
    );

  } catch (err: unknown) {

    clearTimeout(timeoutId);

    if (
      err instanceof Error &&
      err.name === "AbortError"
    ) {
      throw new Error(
        "Chat request timed out. Please try again."
      );
    }

    throw err;
  }


  // HTTP error
  if (!res.ok) {

    clearTimeout(timeoutId);

    const err =
      await res.json().catch(
        () => ({
          detail:
            "Chat request failed",
        })
      );

    throw new Error(
      err.detail ||
      "Chat request failed"
    );
  }


  const reader =
    res.body?.getReader();

  if (!reader) {

    clearTimeout(timeoutId);

    throw new Error(
      "No response body received"
    );
  }


  const decoder =
    new TextDecoder();

  let buffer = "";


  try {

    while (true) {

      const {
        done,
        value,
      } = await reader.read();

      if (done) {
        break;
      }


      buffer += decoder.decode(
        value,
        {
          stream: true,
        }
      );


      const lines =
        buffer.split("\n");

      buffer =
        lines.pop() || "";


      for (const line of lines) {

        if (!line.startsWith("data:")) {
          continue;
        }


        const jsonStr =
          line
            .slice(5)
            .trim();


        if (!jsonStr) {
          continue;
        }


        try {

          const chunk:
            ChatStreamChunk =
            JSON.parse(jsonStr);

          yield chunk;


          if (chunk.done) {
            return;
          }

        } catch {

          // Ignore malformed SSE chunks
          console.warn(
            "Skipping malformed SSE chunk"
          );
        }
      }
    }

  } finally {

    clearTimeout(timeoutId);

    try {
      reader.releaseLock();
    } catch {
      // Ignore
    }
  }
}
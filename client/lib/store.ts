import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Flashcard,
  QuizQuestion,
  ChatMessage,
  Document,
  QuizAttempt,
  FlashcardSession,
  StudyActivity,
  Note,
  Bookmark,
  VivaSession,
  LearningPath,
} from "./types";

interface DocumentInfo {
  id: string;
  title: string;
  source_type: "youtube" | "pdf";
}

interface LearningStore {
  userName: string;
  setUserName: (name: string) => void;

  currentDocument: DocumentInfo | null;
  setCurrentDocument: (doc: DocumentInfo | null) => void;

  documentsList: Document[];
  setDocumentsList: (docs: Document[]) => void;
  addDocumentToList: (doc: Document) => void;
  removeDocumentFromList: (id: string) => void;

  flashcards: Flashcard[];
  setFlashcards: (cards: Flashcard[]) => void;
  clearFlashcards: () => void;

  quizQuestions: QuizQuestion[];
  setQuizQuestions: (questions: QuizQuestion[]) => void;
  clearQuiz: () => void;

  chatHistory: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (content: string, sources?: any[]) => void;
  clearChatHistory: () => void;

  quizAttempts: QuizAttempt[];
  recordQuizAttempt: (attempt: Omit<QuizAttempt, "id" | "completed_at">) => void;

  flashcardSessions: FlashcardSession[];
  recordFlashcardSession: (session: Omit<FlashcardSession, "id" | "completed_at">) => void;

  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  deleteNote: (id: string) => void;

  bookmarks: Bookmark[];
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (bookmark: Bookmark) => void;
  deleteBookmark: (id: string) => void;

  vivaSessions: VivaSession[];
  recordVivaSession: (session: VivaSession) => void;

  learningPaths: Record<string, LearningPath>;
  setLearningPathForDoc: (docId: string, path: LearningPath) => void;
  toggleTopicCompletion: (docId: string, moduleIdx: number, topic: string) => void;

  activities: StudyActivity[];
  logActivity: (activity: Omit<StudyActivity, "id" | "timestamp">) => void;

  resetAll: () => void;
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set) => ({
      userName: "Vanshul",
      setUserName: (name) => set({ userName: name }),

      currentDocument: null,
      setCurrentDocument: (doc) => set({ currentDocument: doc }),

      documentsList: [],
      setDocumentsList: (docs) => set({ documentsList: docs }),
      addDocumentToList: (doc) =>
        set((state) => ({
          documentsList: [doc, ...state.documentsList.filter((d) => d.id !== doc.id)],
        })),
      removeDocumentFromList: (id) =>
        set((state) => ({
          documentsList: state.documentsList.filter((d) => d.id !== id),
          currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
        })),

      flashcards: [],
      setFlashcards: (cards) => set({ flashcards: cards }),
      clearFlashcards: () => set({ flashcards: [] }),

      quizQuestions: [],
      setQuizQuestions: (questions) => set({ quizQuestions: questions }),
      clearQuiz: () => set({ quizQuestions: [] }),

      chatHistory: [],
      addChatMessage: (msg) =>
        set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
      updateLastAssistantMessage: (content, sources) =>
        set((state) => {
          const history = [...state.chatHistory];
          for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].role === "assistant") {
              history[i] = {
                ...history[i],
                content,
                sources: sources || history[i].sources,
              };
              break;
            }
          }
          return { chatHistory: history };
        }),
      clearChatHistory: () => set({ chatHistory: [] }),

      quizAttempts: [],
      recordQuizAttempt: (attempt) =>
        set((state) => ({
          quizAttempts: [
            {
              ...attempt,
              id: `quiz-${Date.now()}`,
              completed_at: new Date().toISOString(),
            },
            ...state.quizAttempts,
          ],
        })),

      flashcardSessions: [],
      recordFlashcardSession: (session) =>
        set((state) => ({
          flashcardSessions: [
            {
              ...session,
              id: `fc-${Date.now()}`,
              completed_at: new Date().toISOString(),
            },
            ...state.flashcardSessions,
          ],
        })),

      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes.filter((n) => n.id !== note.id)] })),
      deleteNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

      bookmarks: [],
      setBookmarks: (bookmarks) => set({ bookmarks }),
      addBookmark: (bookmark) => set((state) => ({ bookmarks: [bookmark, ...state.bookmarks.filter((b) => b.id !== bookmark.id)] })),
      deleteBookmark: (id) => set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) })),

      vivaSessions: [],
      recordVivaSession: (session) => set((state) => ({ vivaSessions: [session, ...state.vivaSessions] })),

      learningPaths: {},
      setLearningPathForDoc: (docId, path) =>
        set((state) => ({
          learningPaths: { ...state.learningPaths, [docId]: path },
        })),
      toggleTopicCompletion: (docId, moduleIdx, topic) =>
        set((state) => {
          const currentPath = state.learningPaths[docId];
          if (!currentPath) return state;

          const updatedModules = [...currentPath.modules];
          const mod = { ...updatedModules[moduleIdx] };
          const completed = new Set(mod.completed_topics || []);

          if (completed.has(topic)) {
            completed.delete(topic);
          } else {
            completed.add(topic);
          }

          mod.completed_topics = Array.from(completed);
          updatedModules[moduleIdx] = mod;

          return {
            learningPaths: {
              ...state.learningPaths,
              [docId]: { ...currentPath, modules: updatedModules },
            },
          };
        }),

      activities: [],
      logActivity: (act) =>
        set((state) => ({
          activities: [
            {
              ...act,
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
            ...state.activities,
          ],
        })),

      resetAll: () => set({ flashcards: [], quizQuestions: [], chatHistory: [] }),
    }),
    {
      name: "edumitra-ai-saas-store",
      partialize: (state) => ({
        userName: state.userName,
        currentDocument: state.currentDocument,
        documentsList: state.documentsList,
        quizAttempts: state.quizAttempts,
        flashcardSessions: state.flashcardSessions,
        notes: state.notes,
        bookmarks: state.bookmarks,
        vivaSessions: state.vivaSessions,
        learningPaths: state.learningPaths,
        activities: state.activities,
      }),
    }
  )
);

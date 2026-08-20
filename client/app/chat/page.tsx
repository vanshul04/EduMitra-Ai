"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { chatStream, addBookmarkApi } from "@/lib/api";
import { useLearningStore } from "@/lib/store";
import { ChatMessage, Citation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { EmptyState } from "@/components/EmptyState";

const SUGGESTED_PROMPTS = [
  "Summarize this document",
  "Explain this topic simply",
  "Give me exam questions",
  "Teach me step by step",
  "What are the key concepts?",
];

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");

  const {
    currentDocument,
    chatHistory,
    addChatMessage,
    updateLastAssistantMessage,
    clearChatHistory,
    addBookmark,
    logActivity,
  } = useLearningStore();

  const [input, setInput] = useState(initialQuery || "");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<number, "up" | "down">>({});
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  const [viewingSource, setViewingSource] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = useCallback(
    async (textOverride?: string) => {
      const messageText = (textOverride || input).trim();
      if (!messageText || isStreaming || !currentDocument) return;

      const userMessage: ChatMessage = {
        role: "user",
        content: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const historySnapshot = [...chatHistory];

      addChatMessage(userMessage);
      if (!textOverride) setInput("");
      setIsStreaming(true);

      const assistantPlaceholder: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: [],
      };
      addChatMessage(assistantPlaceholder);

      try {
        let fullResponse = "";
        let collectedCitations: Citation[] = [];
        const stream = chatStream(currentDocument.id, userMessage.content, historySnapshot);

        for await (const chunk of stream) {
          if (chunk.error) {
            toast.error(chunk.error);
            updateLastAssistantMessage("Sorry, I encountered an issue accessing knowledge chunks. Please try again.");
            break;
          }

          if (chunk.citations && chunk.citations.length > 0) {
            collectedCitations = chunk.citations;
          }

          if (chunk.content) {
            fullResponse += chunk.content;
            updateLastAssistantMessage(fullResponse, collectedCitations);
          }
        }

        if (!fullResponse) {
          updateLastAssistantMessage("I couldn't generate a response for that query. Please try rephrasing.");
        }

        logActivity({
          document_id: currentDocument.id,
          document_title: currentDocument.title,
          type: "chat",
          details: `Chat query: "${messageText.slice(0, 30)}..."`,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Chat failed";
        toast.error(msg);
        updateLastAssistantMessage("Sorry, I encountered an error generating the response.");
      } finally {
        setIsStreaming(false);
        textareaRef.current?.focus();
      }
    },
    [input, isStreaming, currentDocument, chatHistory, addChatMessage, updateLastAssistantMessage, logActivity]
  );

  useEffect(() => {
    if (initialQuery && currentDocument && chatHistory.length === 0) {
      handleSend(initialQuery);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleBookmarkMessage = (msg: ChatMessage) => {
    if (!msg.content || !currentDocument) return;
    const title = `Insight from ${currentDocument.title}`;
    const newB = {
      id: `bm-${Date.now()}`,
      title,
      category: "chat" as const,
      content: msg.content.slice(0, 400),
      source_info: `Chat grounded in ${currentDocument.title}`,
      created_at: new Date().toISOString(),
    };
    addBookmark(newB);
    addBookmarkApi(newB).catch(() => {});
    toast.success("Message saved to Bookmarks!");
  };

  const handleFeedback = (idx: number, type: "up" | "down") => {
    setFeedbackState((prev) => ({ ...prev, [idx]: type }));
    toast.success(type === "up" ? "Thanks for your positive feedback!" : "Feedback recorded.");
  };

  const handleRegenerate = () => {
    if (chatHistory.length < 2 || isStreaming) return;
    const lastUserMsg = [...chatHistory].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon={MessageSquare}
          title="No document loaded for AI Chat"
          description="Upload a document or select one from your library to start an interactive grounded chat session."
          actionLabel="Go to Upload"
          onAction={() => router.push("/upload")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-[#06060a]">
      {/* Header Bar */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#090912] px-6 py-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              EduMitra AI Tutor
              <span className="flex items-center text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Sparkles className="h-2.5 w-2.5 mr-1" /> RAG Grounded
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-indigo-500" /> {currentDocument.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              clearChatHistory();
              toast.success("Chat history cleared");
            }}
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
            disabled={chatHistory.length === 0 || isStreaming}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear Chat
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <ScrollArea className="flex-1 px-4 md:px-8 py-6">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
              <Bot className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Ask anything about your document
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              EduMitra-AI uses Retrieval-Augmented Generation (RAG) to search your uploaded file and answer accurately with exact context.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 hover:shadow-sm"
                >
                  ✨ {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto pb-6">
            {chatHistory.map((msg, idx) => {
              const isUser = msg.role === "user";
              const isLastAssistant = !isUser && idx === chatHistory.length - 1;

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3.5 transition-all",
                    isUser ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-md",
                      isUser
                        ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                        : "bg-slate-900 dark:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30"
                    )}
                  >
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  <div className="flex-1 max-w-[85%] space-y-1.5">
                    <div className={cn("flex items-center gap-2 text-[10px] text-slate-400", isUser && "justify-end")}>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {isUser ? "You" : "EduMitra-AI"}
                      </span>
                      {msg.timestamp && <span>· {String(msg.timestamp)}</span>}
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-5 py-4 text-sm shadow-sm leading-relaxed",
                        isUser
                          ? "bg-indigo-600 text-white font-medium rounded-tr-none"
                          : "bg-white dark:bg-[#0f101d] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/10 rounded-tl-none"
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : msg.content ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium py-1">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>EduMitra-AI is retrieving knowledge & generating answer...</span>
                        </div>
                      )}
                    </div>

                    {/* Grounded Source Citations Section */}
                    {!isUser && msg.content && (
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() =>
                            setExpandedSources((prev) => ({ ...prev, [idx]: !prev[idx] }))
                          }
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <FileText className="h-3 w-3" /> Grounded RAG Sources ({msg.sources?.length || 1})
                          {expandedSources[idx] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>

                        {expandedSources[idx] && (
                          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                            <p className="font-semibold text-indigo-500 text-[11px]">
                              Retrieved Vector Similarity Context:
                            </p>
                            {msg.sources && msg.sources.length > 0 ? (
                              <div className="space-y-2">
                                {msg.sources.map((cite: any, cIdx: number) => (
                                  <div
                                    key={cIdx}
                                    onClick={() => setViewingSource(cite)}
                                    className="p-2.5 rounded-lg border border-indigo-500/10 bg-white/5 cursor-pointer hover:border-indigo-500/40 transition-colors"
                                  >
                                    <div className="flex items-center justify-between text-[10px] font-semibold text-indigo-400 mb-1">
                                      <span>Chunk #{cite.chunk_index !== undefined ? cite.chunk_index : cIdx + 1}</span>
                                      {cite.similarity && <span>{cite.similarity}% Match</span>}
                                    </div>
                                    <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                                      &quot;{cite.snippet || cite}&quot;
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px]">Grounded in active workspace document.</p>
                            )}
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyMessage(idx, msg.content)}
                            className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Copy message"
                          >
                            {copiedIdx === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleBookmarkMessage(msg)}
                            className="h-7 w-7 text-slate-400 hover:text-indigo-500"
                            title="Save to Bookmarks"
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleFeedback(idx, "up")}
                            className={cn(
                              "h-7 w-7 text-slate-400 hover:text-emerald-500",
                              feedbackState[idx] === "up" && "text-emerald-500"
                            )}
                            title="Helpful response"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleFeedback(idx, "down")}
                            className={cn(
                              "h-7 w-7 text-slate-400 hover:text-rose-500",
                              feedbackState[idx] === "down" && "text-rose-500"
                            )}
                            title="Needs improvement"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>

                          {isLastAssistant && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRegenerate}
                              className="h-7 text-xs text-slate-400 hover:text-indigo-500 gap-1 ml-auto"
                              title="Regenerate response"
                            >
                              <RotateCcw className="h-3 w-3" /> Regenerate
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* View Full Source Citation Modal */}
      {viewingSource && (
        <Dialog open={Boolean(viewingSource)} onOpenChange={() => setViewingSource(null)}>
          <DialogContent className="max-w-xl p-6 border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] rounded-3xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                  Source Citation Context
                </Badge>
                {viewingSource.similarity && (
                  <span className="text-xs font-bold text-emerald-500">
                    {viewingSource.similarity}% Vector Similarity
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {viewingSource.document_title || currentDocument.title} (Chunk #{viewingSource.chunk_index})
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 leading-relaxed overflow-y-auto max-h-64">
                {viewingSource.full_text || viewingSource.snippet || String(viewingSource)}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Input Composer Bar */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#090912] p-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask EduMitra-AI anything about "${currentDocument.title}"... (Enter = Send, Shift+Enter = newline)`}
              rows={2}
              disabled={isStreaming}
              className="flex-1 resize-none bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 text-xs rounded-xl"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="h-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold border-0 px-5 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-40"
            >
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>EduMitra-AI answers are grounded in your document vector database.</span>
            <span>Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const codeString = React.Children.toArray(children).join("");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const language = className?.replace("language-", "") || "text";

  return (
    <div className="relative my-4 rounded-xl border border-slate-700/60 bg-slate-900/90 font-mono text-sm overflow-hidden shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2 text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-indigo-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-slate-200 leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <CodeBlock className={className}>{children}</CodeBlock>
            ) : (
              <code
                className="rounded bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-500/20"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-semibold text-slate-800 dark:text-slate-200">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="mb-4 my-2 list-disc space-y-1.5 pl-6 text-slate-700 dark:text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 my-2 list-decimal space-y-1.5 pl-6 text-slate-700 dark:text-slate-300">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 px-4 py-3 italic text-slate-700 dark:text-slate-300 rounded-r-lg">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-100 dark:bg-slate-800/60 font-semibold text-slate-900 dark:text-slate-200">{children}</thead>,
          th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/40 text-slate-700 dark:text-slate-300">{children}</td>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-500">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

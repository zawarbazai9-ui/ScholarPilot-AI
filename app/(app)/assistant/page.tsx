'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import {
  listContextFiles,
  uploadContextFile,
  deleteContextFile,
} from '@/lib/db';
import type { ContextFile } from '@/lib/types';

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTIONS = [
  'Which scholarships am I most likely to win?',
  'What should I prioritize this week?',
  'How can I improve my eligibility score?',
  'Help me plan my essay timeline',
  'What are the best fully funded scholarships for my field?',
  'How do I write a strong SOP?',
];

const ACCEPTED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ACCEPTED_EXTENSIONS = '.pdf,.txt,.md,.docx';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function extractText(file: File): Promise<string> {
  if (file.type === 'text/plain' || file.name.endsWith('.md')) {
    return file.text();
  }
  if (file.type === 'application/pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items.map((item: { str: string }) => item.str).join(' '));
      }
      return pages.join('\n\n');
    } catch {
      return `[PDF file: ${file.name} — text extraction unavailable]`;
    }
  }
  if (
    file.type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return `[DOCX file: ${file.name} — upload as PDF or TXT for full context]`;
  }
  return '';
}

function getFileIcon(type: string): string {
  if (type === 'application/pdf') return 'picture_as_pdf';
  if (type === 'text/plain' || type === 'text/markdown') return 'description';
  return 'article';
}

export default function AssistantPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextFiles, setContextFiles] = useState<ContextFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    if (!user) return;
    try {
      const files = await listContextFiles(user.id);
      setContextFiles(files);
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (messages.length > 0) return;
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hi${profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! I'm your ScholarPilot AI assistant. I can help you with scholarship recommendations, eligibility advice, essay planning, deadline management, and anything else related to your academic journey. What would you like to know?`,
      },
    ]);
  }, [profile, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, thinking]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 128) + 'px';
    }
  }, [input]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const content = await extractText(file);
      await uploadContextFile(
        {
          name: file.name,
          file_type: file.type,
          file_size: file.size,
          content,
        },
        user.id
      );
      await loadFiles();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDeleteFile(id: string) {
    try {
      await deleteContextFile(id);
      setContextFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      setError(msg);
    }
  }

  async function send(text: string) {
    if (!text.trim() || thinking || !user) return;

    const userMsg: Msg = { id: cryptoId(), role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setThinking(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to get response');

      setMessages((prev) => [
        ...prev,
        { id: cryptoId(), role: 'assistant', content: data.reply },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: cryptoId(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${msg}. Please try again.`,
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function handleClear() {
    setMessages([]);
    setError(null);
  }

  return (
    <>
      <div className="flex h-[calc(100vh-9rem)] gap-6">
        {/* Left Sidebar */}
        <aside className="hidden w-80 shrink-0 flex-col gap-6 lg:flex sticky top-24 max-h-[calc(100vh-9rem)] overflow-y-auto scrollbar-hide">
          {/* Context Files */}
          <section className="rounded-2xl bg-surface-container-low p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-headline-sm font-bold text-on-surface">
              <span className="material-symbols-outlined text-xl text-primary">folder</span>
              Context Files
            </h2>
            {contextFiles.length > 0 ? (
              <div className="flex flex-col gap-2">
                {contextFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3 border border-outline-variant group"
                  >
                    <span className="material-symbols-outlined text-primary">
                      {getFileIcon(file.file_type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-on-surface">
                        {file.name}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {formatSize(file.file_size)} &middot; {timeAgo(file.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/10 transition-all"
                      aria-label={`Delete ${file.name}`}
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-on-surface-variant/60 mb-3">
                Upload transcripts, resumes, or SOP drafts so the AI can reference them.
              </p>
            )}
            <label className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 text-center text-label-md font-medium text-primary transition-colors hover:bg-tertiary-container/10 hover:text-on-tertiary-container">
              <span className="material-symbols-outlined text-lg">
                {uploading ? 'progress_activity' : 'upload_file'}
              </span>
              {uploading ? 'Uploading…' : 'Upload File'}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </section>

          {/* Quick Actions */}
          <section className="rounded-2xl bg-surface-container-low p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-headline-sm font-bold text-on-surface">
              <span className="material-symbols-outlined text-xl text-tertiary-container">bolt</span>
              Quick Actions
            </h2>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left p-md bg-surface-bright border border-outline-variant rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-tertiary-container/10 hover:border-on-tertiary-container hover:text-on-tertiary-container transition-all flex items-center justify-between group"
                >
                  <span className="pr-2">{s}</span>
                  <span className="material-symbols-outlined text-lg opacity-0 transition-opacity group-hover:opacity-100">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* System Status */}
          <section className="rounded-2xl bg-surface-container-low p-5">
            <h2 className="mb-3 text-headline-sm font-bold text-on-surface">System Status</h2>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-body-sm text-on-surface-variant">Online &middot; Ready to assist</span>
            </div>
          </section>
        </aside>

        {/* Main Chat Panel */}
        <main className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
            <div>
              <h1 className="flex items-center gap-2 font-display text-headline-md font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                AI Assistant
              </h1>
              <p className="text-body-sm text-on-surface-variant">
                Ask me anything about scholarships, applications, essays, and more.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 rounded-full border border-outline-variant px-3 py-1.5 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Clear
                </button>
              )}
              <span className="flex items-center gap-1.5 rounded-full border border-outline-variant px-3 py-1.5 text-label-md text-on-surface-variant">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Online
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-error/30 bg-error-container/10 px-4 py-2.5 text-body-sm text-on-error-container">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
              <button onClick={() => setError(null)} className="ml-auto">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}

          {/* Scrollable Chat Area */}
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {thinking && (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-container ai-glow">
                  <span className="material-symbols-outlined text-on-tertiary-container text-lg">
                    auto_awesome
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-outline-variant bg-surface-container-low px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-outline-variant p-4 sm:p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="ai-glass flex items-end gap-3 rounded-2xl border-2 border-outline-variant bg-surface-container-high p-3 shadow-xl transition-all focus-within:border-primary focus-within:shadow-2xl"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-tertiary-container/15 hover:text-primary"
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask about scholarships, deadlines, essays…"
                className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              />

              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-tertiary-container/15 hover:text-primary"
              >
                <span className="material-symbols-outlined">mic</span>
              </button>

              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed ai-glow"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
            <p className="mt-2 text-center text-label-sm text-on-surface-variant/60">
              AI-generated responses may contain inaccuracies. Verify important information.
            </p>
          </div>
        </main>
      </div>

      {/* Hidden file input for sidebar + chat attachment */}
      <input
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id="context-file-input-global"
      />
    </>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      {isUser ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
        </div>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-container ai-glow">
          <span className="material-symbols-outlined text-on-tertiary-container text-lg">
            auto_awesome
          </span>
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-body-md leading-relaxed',
          isUser
            ? 'rounded-tr-none bg-primary text-on-primary'
            : 'rounded-tl-none bg-surface-container-low border border-outline-variant text-on-surface'
        )}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
      </div>
    </div>
  );
}

function cryptoId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

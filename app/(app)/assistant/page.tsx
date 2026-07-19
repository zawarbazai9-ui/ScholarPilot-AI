'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Send,
  User as UserIcon,
  Bot,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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

export default function AssistantPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 128) + 'px';
    }
  }, [input]);

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
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-4xl flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Assistant
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask me anything about scholarships, applications, essays, and more.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
          <Badge variant="outline" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Online
          </Badge>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 space-y-5 overflow-y-auto bg-muted/20 p-4 sm:p-6"
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}
          {thinking && (
            <div className="flex items-start gap-3">
              <Avatar role="assistant" />
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border bg-card px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="border-t bg-background px-4 py-3 sm:px-6">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t bg-background p-3 sm:p-4"
        >
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
            className="max-h-32 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || thinking}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <Avatar role={msg.role} />
      <div
        className={cn(
          'max-w-[80%] space-y-3 rounded-2xl border px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'rounded-tr-sm bg-primary text-primary-foreground'
            : 'rounded-tl-sm bg-card'
        )}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
      </div>
    </div>
  );
}

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        role === 'assistant'
          ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {role === 'assistant' ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
    </div>
  );
}

function cryptoId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

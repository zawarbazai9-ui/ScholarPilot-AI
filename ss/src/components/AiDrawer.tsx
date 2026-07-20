import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type AiDrawerProps = {
  open: boolean;
  onClose: () => void;
  scholarshipName: string;
};

const SUGGESTED = [
  'How should I structure my Gates statement?',
  'What makes a strong reference letter?',
  'How can I stand out in the interview?',
];

const ASSISTANT_REPLIES = [
  'For your Gates statement, open with a specific moment that shows your leadership, then connect it to how a Cambridge degree multiplies your impact. Keep 60% on the "improving lives of others" theme — that is the Gates committee\'s north star.',
  'Strong reference letters are specific, not superlative. Ask referees to include one concrete example of your intellectual initiative and one of your collaborative leadership. Share your CV and statement draft with them so the letter echoes, not repeats, your voice.',
  'In the interview, expect probing follow-ups on anything in your statement. Practice out loud and prepare a 90-second answer to "tell us about yourself" that ends on why Cambridge, why now. They reward authenticity over polish.',
];

export function AiDrawer({ open, onClose, scholarshipName }: AiDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi! I'm your AI Admissions Copilot. Ask me anything about the ${scholarshipName} — from your statement to interview prep.`,
        },
      ]);
    }
  }, [open, scholarshipName, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = ASSISTANT_REPLIES[messages.length % ASSISTANT_REPLIES.length];
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: 'assistant', content: reply },
      ]);
      setTyping(false);
    }, 900);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface-container-lowest z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-lg border-b border-outline-variant/30 bg-primary-container">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-on-tertiary-container rounded-lg flex items-center justify-center">
              <Icon name="auto_awesome" className="text-white text-[20px]" fill />
            </div>
            <div>
              <h3 className="font-headline-sm text-white leading-tight">AI Advisor</h3>
              <p className="text-xs text-white/70">{scholarshipName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <Icon name="close" className="text-[22px]" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-lg space-y-md">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-md rounded-2xl text-body-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-secondary text-white rounded-br-sm'
                    : 'bg-surface-container text-on-surface rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-surface-container text-on-surface p-md rounded-2xl rounded-bl-sm flex gap-1">
                <span className="w-2 h-2 bg-on-primary-container/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-on-primary-container/60 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                <span className="w-2 h-2 bg-on-primary-container/60 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="px-lg pb-sm flex flex-wrap gap-sm">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs text-secondary bg-secondary-fixed/60 hover:bg-secondary-fixed px-3 py-1.5 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="p-lg border-t border-outline-variant/30">
          <div className="flex items-end gap-sm bg-surface-container rounded-2xl px-md py-sm focus-within:ring-2 focus-within:ring-secondary/30 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask about deadlines, essays, references…"
              className="flex-1 bg-transparent text-body-sm text-on-surface outline-none resize-none py-1.5 max-h-24"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              className="w-9 h-9 bg-secondary text-white rounded-full flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-40 shrink-0"
              aria-label="Send"
            >
              <Icon name="send" className="text-[18px]" fill />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

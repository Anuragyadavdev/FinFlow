import { useState, useRef, useEffect } from 'react';
import { FiSend, FiCpu, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ChatBubble from '../components/feature/ChatBubble';
import TypingIndicator from '../components/feature/TypingIndicator';
import { useAskAi, useAiSamples } from '../hooks/queries/useAi';
import { useAuthStore } from '../store/authStore';

const WELCOME = `Hi! I'm your **AI Financial Assistant**. I can help you understand your money using your real data.

Try asking me something like:
- Where did my money go this month?
- How much did I save?
- Any unusual transactions?
- Which category increased the most?`;

export default function AiAssistant() {
  const user = useAuthStore((s) => s.user);
  const askMut = useAskAi();
  const { data: samples = [] } = useAiSamples();

  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'ai', content: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, typing]);

  const send = (text) => {
    const q = (text ?? input).trim();
    if (!q || typing) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: q };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    askMut.mutate(q, {
      onSuccess: (data) => {
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: 'ai',
            content: data.answer,
            meta: {
              intent: data.intent,
              sourceData: data.sourceData,
              suggestedFollowUps: data.suggestedFollowUps,
              fallback: data.fallback,
            },
            onFollowUp: send,
          },
        ]);
      },
      onError: (err) => {
        setMessages((m) => [
          ...m,
          {
            id: `e-${Date.now()}`,
            role: 'ai',
            content: `Sorry, something went wrong: **${err.message}**`,
          },
        ]);
      },
      onSettled: () => setTyping(false),
    });
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-primary">
            <FiCpu className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Financial Assistant</h1>
            <p className="text-xs text-gray-400">
              Hi {user?.fullName?.split(' ')[0] || 'there'} — ask me anything about your finances
            </p>
          </div>
        </div>
        <Badge variant="cyan" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
          Gemini
        </Badge>
      </div>

      {/* Messages area */}
      <GlassCard className="!p-0 flex-1 flex flex-col overflow-hidden">
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-5 space-y-5"
        >
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}
          {typing && <TypingIndicator />}
        </div>

        {/* Quick chips */}
        {messages.length <= 1 && samples.length > 0 && (
          <div className="px-5 pb-3">
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
              <FiZap size={12} /> Try one
            </div>
            <div className="flex flex-wrap gap-2">
              {samples.slice(0, 5).map((s, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about your spending, savings, investments…"
              rows={1}
              disabled={typing}
              className="input-base resize-none max-h-32 min-h-[44px] py-3"
              style={{ height: 'auto' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              }}
            />
            <Button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              loading={typing}
              className="!px-5"
            >
              {!typing && <FiSend size={16} />}
            </Button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            AI uses your real data. Numbers come from deterministic calculations — never invented.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
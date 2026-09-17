import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { FiChevronDown, FiCopy, FiCheck, FiCpu, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Copied');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-primary-600'
            : 'bg-gradient-to-br from-accent-cyan/30 to-primary-500/30 border border-primary-500/30'
        }`}
      >
        {isUser ? (
          <FiUser className="text-white" size={16} />
        ) : (
          <FiCpu className="text-primary-300" size={16} />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm'
              : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-semibold
              prose-p:my-2 prose-ul:my-2 prose-ol:my-2
              prose-li:my-0.5 prose-strong:text-white
              prose-code:text-primary-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-a:text-primary-400">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Meta row */}
        {!isUser && (
          <div className="flex items-center gap-2 px-1">
            {message.meta?.intent && (
              <Badge variant="primary" className="!text-[10px]">
                {message.meta.intent.replace('_', ' ').toLowerCase()}
              </Badge>
            )}
            {message.meta?.fallback && (
              <Badge variant="amber" className="!text-[10px]">
                offline mode
              </Badge>
            )}
            <button
              onClick={copy}
              className="rounded-lg p-1 text-gray-500 hover:text-white transition"
              title="Copy"
            >
              {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
            </button>
            {message.meta?.sourceData && (
              <button
                onClick={() => setSourcesOpen((v) => !v)}
                className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white transition"
              >
                source
                <FiChevronDown
                  size={12}
                  className={`transition-transform ${sourcesOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
        )}

        {/* Source data expandable */}
        <AnimatePresence>
          {sourcesOpen && message.meta?.sourceData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden w-full"
            >
              <pre className="text-[10px] leading-relaxed bg-black/40 border border-white/5 rounded-xl p-3 overflow-x-auto text-gray-400 font-mono max-h-60">
{JSON.stringify(message.meta.sourceData, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Follow-up chips */}
        {message.meta?.suggestedFollowUps?.length > 0 && message.onFollowUp && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {message.meta.suggestedFollowUps.slice(0, 3).map((f, i) => (
              <button
                key={i}
                onClick={() => message.onFollowUp(f)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-primary-500/30 text-primary-300 hover:bg-primary-500/10 transition"
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
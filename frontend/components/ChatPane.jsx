"use client"

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react"
import { Pencil, RefreshCw, Check, X, Square, Sparkles, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Message from "./Message"
import Composer from "./Composer"
import { cls } from "./utils"

// ─── Typing Indicator ───────────────────────────────────────────────────────
function ThinkingMessage({ onPause }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 px-1"
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-[13px] shadow-sm dark:border-zinc-700/80 dark:bg-zinc-800">
        ✱
      </div>
      <div className="flex items-center gap-3 py-2">
        <div className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        <span className="text-[13px] text-zinc-500 dark:text-zinc-400">Thinking…</span>
        <button
          onClick={onPause}
          className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 active:scale-95"
        >
          <Square className="h-2.5 w-2.5" /> Stop
        </button>
      </div>
    </motion.div>
  )
}

// ─── Suggestion Chips ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: "Explain a diagnosis", icon: "🩺" },
  { label: "Drug interactions", icon: "💊" },
  { label: "Summarize research", icon: "📄" },
  { label: "Write a report", icon: "✍️" },
]

function EmptyState({ onSuggestion }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/20"
      >
        <Sparkles className="h-8 w-8 text-white" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-1.5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
      >
        How can I help you?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-10 max-w-xs text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400"
      >
        Ask me anything — medical guidance, research, or general questions.
      </motion.p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => onSuggestion(s.label)}
            className="group flex items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left text-[13px] font-medium text-zinc-700 shadow-sm transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80 active:scale-[0.97]"
          >
            <span className="text-base">{s.icon}</span>
            <span className="leading-tight">{s.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ─── Main ChatPane ────────────────────────────────────────────────────────────
const ChatPane = forwardRef(function ChatPane(
  { conversation, onSend, onEditMessage, onResendMessage, isThinking, onPauseThinking },
  ref,
) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const composerRef = useRef(null)
  const bottomRef = useRef(null)

  useImperativeHandle(ref, () => ({
    insertTemplate: (templateContent) => composerRef.current?.insertTemplate(templateContent),
  }), [])

  // Auto-scroll to bottom when messages change
  const messages = Array.isArray(conversation?.messages) ? conversation.messages : []
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, isThinking])

  function handleSuggestion(text) {
    composerRef.current?.setValue?.(text)
    composerRef.current?.focus?.()
  }

  function startEdit(m) { setEditingId(m.id); setDraft(m.content) }
  function cancelEdit() { setEditingId(null); setDraft("") }
  function saveEdit() {
    if (!editingId) return
    onEditMessage?.(editingId, draft)
    cancelEdit()
  }
  function saveAndResend() {
    if (!editingId) return
    onEditMessage?.(editingId, draft)
    onResendMessage?.(editingId)
    cancelEdit()
  }

  async function copyToClipboard(text, id) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  if (!conversation) return null

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-white dark:bg-[#212121]">
      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto max-w-3xl px-4 py-8">
          {messages.length === 0 ? (
            <EmptyState onSuggestion={handleSuggestion} />
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="group"
                  >
                    {editingId === m.id ? (
                      /* ── Edit Mode ── */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/60"
                      >
                        <textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          className="w-full min-h-[80px] resize-y rounded-xl bg-zinc-50 p-3 text-[14px] text-zinc-900 outline-none ring-0 dark:bg-zinc-900/80 dark:text-zinc-100"
                          rows={3}
                          autoFocus
                        />
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={saveEdit}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-[12px] font-medium text-white shadow-sm hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors active:scale-95"
                          >
                            <Check className="h-3.5 w-3.5" /> Save
                          </button>
                          <button
                            onClick={saveAndResend}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-[12px] font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-95"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Save & Resend
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[12px] text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95"
                          >
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      /* ── Normal Message ── */
                      <div className="relative">
                        <Message role={m.role} content={m.content} />

                        {/* Hover action bar */}
                        <div
                          className={cls(
                            "mt-1.5 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                            m.role === "user" ? "justify-end pr-1" : "justify-start pl-10"
                          )}
                        >
                          {/* Copy */}
                          <button
                            onClick={() => copyToClipboard(m.content, m.id)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 active:scale-95"
                            title="Copy"
                          >
                            {copiedId === m.id ? (
                              <><Check className="h-3 w-3 text-emerald-500" /> Copied</>
                            ) : (
                              <><Copy className="h-3 w-3" /> Copy</>
                            )}
                          </button>

                          {m.role === "user" && (
                            <>
                              <button
                                onClick={() => startEdit(m)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 active:scale-95"
                              >
                                <Pencil className="h-3 w-3" /> Edit
                              </button>
                              <button
                                onClick={() => onResendMessage?.(m.id)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 active:scale-95"
                              >
                                <RefreshCw className="h-3 w-3" /> Resend
                              </button>
                            </>
                          )}

                          {m.role === "assistant" && (
                            <div className="flex items-center gap-0.5 ml-1">
                              <button className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-all active:scale-95">
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-all active:scale-95">
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isThinking && <ThinkingMessage onPause={onPauseThinking} />}

              {/* Scroll anchor */}
              <div ref={bottomRef} className="h-1" />
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <Composer
        ref={composerRef}
        onSend={async (text) => {
          if (!text.trim()) return
          setBusy(true)
          await onSend?.(text)
          setBusy(false)
        }}
        busy={busy}
      />
    </div>
  )
})

export default ChatPane

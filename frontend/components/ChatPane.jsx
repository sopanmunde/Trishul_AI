"use client"

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react"
import {
  Pencil,
  RefreshCw,
  Check,
  X,
  Square,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Stethoscope,
  Pill,
  BookOpen,
  FileText,
} from "lucide-react"
import { TrishulLogo } from "./TrishulLogo"
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
      {/* AI avatar — Trident logo */}
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
        <svg
          className="w-[55%] h-[55%] text-zinc-900 dark:text-zinc-100"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <line x1="12" y1="3" x2="12" y2="21" />
          <path d="M5 7 C5 3 19 3 19 7" />
          <line x1="5" y1="7" x2="5" y2="13" />
          <line x1="19" y1="7" x2="19" y2="13" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </svg>
      </div>
      <div className="flex items-center gap-3 py-2">
        {/* Staggered dots — zinc palette */}
        <div className="flex items-center gap-[5px]">
          {[0, 160, 320].map((delay) => (
            <motion.div
              key={delay}
              className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500"
              animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: delay / 1000, ease: "easeInOut" }}
            />
          ))}
        </div>
        <span className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">Thinking…</span>
        <button
          onClick={onPause}
          className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95"
        >
          <Square className="h-2.5 w-2.5" /> Stop
        </button>
      </div>
    </motion.div>
  )
}

// ─── Suggestion Chips ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: "Explain a diagnosis", icon: Stethoscope },
  { label: "Drug interactions", icon: Pill },
  { label: "Summarize research", icon: BookOpen },
  { label: "Write a report", icon: FileText },
]

function EmptyState({ onSuggestion }) {
  // EmptyState is now inlined in the main render tree below for better layout integration
  return null
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
    } catch { }
  }

  if (!conversation) return null

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-white dark:bg-[#212121]">
      {messages.length === 0 ? (
        /* ── ChatGPT Style Centered Empty State ── */
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-8">
          <div className="flex flex-1 flex-col items-center justify-center w-full">
            <div className="w-full max-w-3xl flex flex-col items-center justify-center">
              {/* Logo & Headline */}
              <div className="flex flex-col items-center justify-center text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="mb-4"
                >
                  <TrishulLogo size="xl" glow animate={false} />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
                >
                  <span className="animate-shimmer-text">How can I help you?</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.4 }}
                  className="max-w-md text-[13.5px] leading-relaxed text-zinc-500 dark:text-zinc-400"
                >
                  Medical guidance, research, drug interactions &amp; more.
                </motion.p>
              </div>

              {/* Composer (Chat Box) - Positioned in the middle/upper side */}
              <div className="w-full">
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

              {/* Suggestion pills — directly below Composer */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 px-1">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 + i * 0.06, duration: 0.35 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestion(s.label)}
                    className="group flex items-center gap-2 rounded-full border border-zinc-200 bg-white/50 px-4 py-2 text-left shadow-sm backdrop-blur-sm transition-all duration-150 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    {s.icon && (
                      <s.icon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors" />
                    )}
                    <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                      {s.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Hint stays down of the chat panel */}
          <p className="mx-auto mt-7 text-center text-[11px] text-zinc-400/70 dark:text-zinc-600">
            Trishul AI can make mistakes. Verify important information.
          </p>
        </div>
      ) : (
        /* ── Active Conversation Layout ── */
        <>
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="mx-auto max-w-3xl px-4 py-8">
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
                          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-sm"
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
                              m.role === "user" ? "justify-end pr-1" : "justify-start pl-12"
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
            </div>
          </div>

          {/* Composer at the bottom */}
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

          {/* Footer Hint below Composer */}
          <p className="mx-auto pb-4 text-center text-[11px] text-zinc-400/70 dark:text-zinc-600">
            Trishul AI can make mistakes. Verify important information.
          </p>
        </>
      )}
    </div>
  )
})

export default ChatPane

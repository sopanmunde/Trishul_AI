"use client"

import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react"
import { Send, Loader2, Plus, Mic, StopCircle } from "lucide-react"
import ComposerActionsPopover from "./ComposerActionsPopover"
import { cls } from "./utils"

const Composer = forwardRef(function Composer({ onSend, busy }, ref) {
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  // Auto-grow textarea
  useEffect(() => {
    if (!inputRef.current) return
    const ta = inputRef.current
    const lineHeight = 24
    ta.style.height = "auto"
    const lines = Math.max(1, Math.ceil(ta.scrollHeight / lineHeight))
    if (lines <= 12) {
      ta.style.height = `${Math.max(24, ta.scrollHeight)}px`
      ta.style.overflowY = "hidden"
    } else {
      ta.style.height = `${12 * lineHeight}px`
      ta.style.overflowY = "auto"
    }
  }, [value])

  useImperativeHandle(ref, () => ({
    insertTemplate: (templateContent) => {
      setValue((prev) => {
        const next = prev ? `${prev}\n\n${templateContent}` : templateContent
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.setSelectionRange(next.length, next.length)
        }, 0)
        return next
      })
    },
    setValue: (text) => {
      setValue(text)
      setTimeout(() => inputRef.current?.focus(), 0)
    },
    focus: () => inputRef.current?.focus(),
  }), [])

  async function handleSend() {
    if (!value.trim() || sending || busy) return
    const text = value
    setValue("")
    setSending(true)
    try {
      await onSend?.(text)
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const hasContent = value.trim().length > 0

  return (
    <div className="px-3 pb-5 pt-2">
      {/* Input card */}
      <div
        className={cls(
          "mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-white transition-all duration-200 dark:bg-zinc-900",
          isFocused
            ? "border-zinc-300 shadow-[0_0_0_4px_rgba(161,161,170,0.10)] dark:border-zinc-600 dark:shadow-[0_0_0_4px_rgba(255,255,255,0.04)]"
            : "border-zinc-200 shadow-sm dark:border-zinc-800",
        )}
      >
        {/* Textarea */}
        <div className="px-4 pt-3.5 pb-1">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask anything…"
            rows={1}
            className="w-full resize-none bg-transparent text-[14px] leading-6 text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1">
          {/* + Attachment */}
          <ComposerActionsPopover>
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 active:scale-95"
              title="Actions"
            >
              <Plus className="h-4 w-4" />
            </button>
          </ComposerActionsPopover>

          {/* Mic + Send */}
          <div className="flex items-center gap-1.5">
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 active:scale-95"
              title="Voice input"
            >
              <Mic className="h-4 w-4" />
            </button>

            <button
              onClick={handleSend}
              disabled={!hasContent && !busy}
              title={busy ? "Stop" : "Send (Enter)"}
              className={cls(
                "inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 active:scale-95",
                hasContent || busy
                  ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600",
              )}
            >
              {sending || busy ? <StopCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-zinc-400 dark:text-zinc-600">
        Trishul AI can make mistakes. Verify important information.
      </p>
    </div>
  )
})

export default Composer

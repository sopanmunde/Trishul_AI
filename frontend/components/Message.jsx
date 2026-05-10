import { useState } from "react"
import { cls } from "./utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import { Copy, Check } from "lucide-react"

// Code block with copy button
function CodeBlock({ children, className, ...props }) {
  const [copied, setCopied] = useState(false)
  const code = typeof children === "string" ? children : ""

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="group/code relative my-3 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-950 shadow-sm dark:border-zinc-700/60">
      {/* Language tag + Copy button */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 bg-zinc-900 px-4 py-2">
        <span className="text-[11px] font-medium text-zinc-500">
          {className?.replace("language-", "") || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-500 transition-all hover:bg-zinc-800 hover:text-zinc-300 active:scale-95"
        >
          {copied ? (
            <><Check className="h-3 w-3 text-emerald-400" /> Copied</>
          ) : (
            <><Copy className="h-3 w-3" /> Copy</>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className={className} {...props}>{children}</code>
      </pre>
    </div>
  )
}

export default function Message({ role, content, children }) {
  const isUser = role === "user"

  return (
    <div className={cls("flex gap-3 px-1", isUser ? "justify-end" : "justify-start")}>
      {/* AI avatar */}
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-[12px] font-semibold text-zinc-600 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300">
          ✱
        </div>
      )}

      <div
        className={cls(
          "max-w-[80%] text-[14px] leading-relaxed",
          isUser
            ? "rounded-2xl rounded-tr-sm bg-zinc-100 px-4 py-2.5 text-zinc-900 shadow-sm dark:bg-zinc-800/80 dark:text-zinc-100"
            : "rounded-2xl rounded-tl-sm px-1 py-0.5 text-zinc-900 dark:text-zinc-100",
        )}
      >
        {content !== undefined ? (
          isUser ? (
            <span className="whitespace-pre-wrap break-words">{content}</span>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:my-2 prose-p:leading-relaxed prose-headings:font-semibold prose-headings:tracking-tight prose-li:my-0.5 prose-code:rounded-md prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-zinc-800 prose-code:font-mono prose-code:text-[12px] dark:prose-code:bg-zinc-800 dark:prose-code:text-zinc-200 prose-pre:my-0 prose-pre:p-0 prose-pre:bg-transparent prose-pre:shadow-none prose-blockquote:border-l-zinc-300 dark:prose-blockquote:border-l-zinc-600 prose-blockquote:text-zinc-500 dark:prose-blockquote:text-zinc-400 prose-table:text-[13px]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre: ({ node, ...props }) => <div {...props} />,
                  code: ({ node, inline, className, children, ...props }) =>
                    inline ? (
                      <code className={cls("rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[12px] dark:bg-zinc-800", className)} {...props}>
                        {children}
                      </code>
                    ) : (
                      <CodeBlock className={className} {...props}>{children}</CodeBlock>
                    ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )
        ) : (
          children
        )}
      </div>
    </div>
  )
}

import { cls } from "./utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

export default function Message({ role, content, children }) {
  const isUser = role === "user"
  return (
    <div className={cls("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 grid h-7 w-7 place-items-center rounded-lg border border-zinc-200 bg-white text-[12px] text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 shrink-0">
          ✱
        </div>
      )}
      <div
        className={cls(
          "max-w-[82%] px-4 py-3 text-sm",
          isUser
            ? "rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            : "rounded-xl bg-transparent text-zinc-900 dark:text-zinc-100 prose dark:prose-invert prose-sm max-w-none prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-700",
        )}
      >
        {content !== undefined ? (
          <div className="whitespace-pre-wrap break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

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
        <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full border border-black/10 dark:border-white/10 bg-white text-[12px] text-black shadow-sm dark:bg-[#212121] dark:text-white shrink-0">
          ✱
        </div>
      )}
      <div
        className={cls(
          "max-w-[80%] px-4 py-3 text-sm",
          isUser
            ? "rounded-2xl bg-[#f4f4f4] text-[#0d0d0d] dark:bg-[#2f2f2f] dark:text-[#ececec]"
            : "bg-transparent text-[#0d0d0d] dark:text-[#ececec] prose dark:prose-invert prose-sm max-w-none prose-pre:bg-[#2f2f2f] prose-pre:border-none",
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

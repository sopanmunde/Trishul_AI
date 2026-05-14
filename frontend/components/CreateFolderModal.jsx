"use client"
import { useState } from "react"
import { X, Lightbulb, Plus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { motion, AnimatePresence } from "framer-motion"

export default function FolderPopover({ children, onCreateFolder }) {
  const [open, setOpen] = useState(false)
  const [folderName, setFolderName] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (folderName.trim()) {
      onCreateFolder(folderName.trim())
      setFolderName("")
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="p-0 w-[320px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.96, x: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
                <h2 className="text-[13.5px] font-semibold text-zinc-900 dark:text-zinc-100">Create folder</h2>
                <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors">
                  <X className="h-3.5 w-3.5 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4">
                <div className="relative">
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="E.g. Marketing Projects"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-[13px] outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-700"
                    autoFocus
                  />
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-[12px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <span className="font-semibold block mb-0.5 text-zinc-800 dark:text-zinc-200">What's a folder?</span>
                    Folders help you group related chats, files, and templates to keep your workspace organized.
                  </div>
                </div>

                <div className="flex gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl border border-zinc-200 px-4 py-2 text-[12.5px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!folderName.trim()}
                    className="flex-1 rounded-xl bg-zinc-900 px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-sm shadow-zinc-900/10"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}

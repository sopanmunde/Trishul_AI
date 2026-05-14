"use client"
import { useState, useEffect } from "react"
import { X, Lightbulb, BookOpen } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { motion, AnimatePresence } from "framer-motion"

export default function TemplatePopover({ children, onCreateTemplate, editingTemplate = null }) {
  const [open, setOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateContent, setTemplateContent] = useState("")

  useEffect(() => {
    if (editingTemplate) {
      setTemplateName(editingTemplate.name || "")
      setTemplateContent(editingTemplate.content || "")
      setOpen(true)
    }
  }, [editingTemplate])

  const isEditing = !!editingTemplate

  const handleSubmit = (e) => {
    e.preventDefault()
    if (templateName.trim() && templateContent.trim()) {
      const templateData = {
        name: templateName.trim(),
        content: templateContent.trim(),
        snippet: templateContent.trim().slice(0, 100) + (templateContent.trim().length > 100 ? "..." : ""),
        createdAt: editingTemplate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (isEditing) {
        onCreateTemplate({ ...templateData, id: editingTemplate.id })
      } else {
        onCreateTemplate(templateData)
      }

      handleClose()
    }
  }

  const handleClose = () => {
    setTemplateName("")
    setTemplateContent("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="p-0 w-[400px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
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
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-[13.5px] font-semibold text-zinc-900 dark:text-zinc-100">
                    {isEditing ? "Edit Template" : "New Template"}
                  </h2>
                </div>
                <button onClick={handleClose} className="rounded-lg p-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors">
                  <X className="h-3.5 w-3.5 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label htmlFor="templateName" className="block text-[12px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
                    Name
                  </label>
                  <input
                    id="templateName"
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="E.g. Email Response"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-[13px] outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-700"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="templateContent" className="block text-[12px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
                    Content
                  </label>
                  <textarea
                    id="templateContent"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    placeholder="Enter template text..."
                    rows={6}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-[13px] outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-700 resize-none"
                  />
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-[11.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Templates are automatically inserted into the chat box when selected from your list.
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-xl border border-zinc-200 px-4 py-2 text-[12.5px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!templateName.trim() || !templateContent.trim()}
                    className="flex-1 rounded-xl bg-zinc-900 px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-sm shadow-zinc-900/10"
                  >
                    {isEditing ? "Update" : "Save"}
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

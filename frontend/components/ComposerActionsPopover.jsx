"use client"
import { useState, useRef } from "react"
import { Paperclip, Bot, Search, Palette, BookOpen, MoreHorizontal, Globe, ChevronLeft } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

const menuItemClass =
  "group flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-300 rounded-xl transition-all duration-150 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] active:scale-[0.98]"

export default function ComposerActionsPopover({ children }) {
  const [open, setOpen] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith(".pdf")) {
      alert("Only PDF files are supported currently.")
      return
    }
    setIsUploading(true)
    const token = localStorage.getItem("token")
    const formData = new FormData()
    formData.append("file", file)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!response.ok) throw new Error("Upload failed")
      const result = await response.json()
      alert(`Upload successful! Indexed ${result.chunks} chunks.`)
    } catch (error) {
      console.error("Error uploading document:", error)
      alert("Failed to upload document.")
    } finally {
      setIsUploading(false)
      setOpen(false)
    }
  }

  const mainActions = [
    {
      icon: Paperclip,
      label: isUploading ? "Uploading…" : "Add photos & files",
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      action: () => fileInputRef.current?.click(),
    },
    {
      icon: Bot,
      label: "Agent mode",
      color: "text-violet-500 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-500/10",
      badge: "NEW",
      action: () => console.log("Agent mode"),
    },
    {
      icon: Search,
      label: "Deep research",
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      action: () => console.log("Deep research"),
    },
    {
      icon: Palette,
      label: "Create image",
      color: "text-orange-500 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      action: () => console.log("Create image"),
    },
    {
      icon: BookOpen,
      label: "Study and learn",
      color: "text-pink-500 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-500/10",
      action: () => console.log("Study and learn"),
    },
  ]

  const moreActions = [
    {
      icon: Globe,
      label: "Web search",
      color: "text-sky-500 dark:text-sky-400",
      bg: "bg-sky-50 dark:bg-sky-500/10",
    },
    {
      icon: Palette,
      label: "Canvas",
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
    },
    {
      customIcon: (
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 via-green-400 to-yellow-400 flex items-center justify-center shadow-sm">
          <div className="h-3 w-3 bg-white rounded" />
        </div>
      ),
      label: "Connect Google Drive",
    },
    {
      customIcon: (
        <div className="h-8 w-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
          <div className="h-3 w-3 bg-white rounded" />
        </div>
      ),
      label: "Connect OneDrive",
    },
    {
      customIcon: (
        <div className="h-8 w-8 rounded-xl bg-teal-500 flex items-center justify-center shadow-sm">
          <div className="h-3 w-3 bg-white rounded" />
        </div>
      ),
      label: "Connect Sharepoint",
    },
  ]

  const handleAction = (action) => {
    action?.()
    setOpen(false)
    setShowMore(false)
  }

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen)
    if (!newOpen) setShowMore(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="p-0 w-auto overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-zinc-950/90"
        align="start"
        side="top"
      >
        {!showMore ? (
          <div className="p-2 min-w-[230px]">
            {/* Header */}
            <div className="px-3 pb-1.5 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                Actions
              </p>
            </div>

            <div className="space-y-px">
              {mainActions.map((action, i) => {
                const Icon = action.icon
                return (
                  <button key={i} onClick={() => handleAction(action.action)} className={menuItemClass}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${action.bg}`}>
                      <Icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <span className="font-medium">{action.label}</span>
                    {action.badge && (
                      <span className="ml-auto rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                        {action.badge}
                      </span>
                    )}
                  </button>
                )
              })}

              <div className="my-1.5 mx-1 h-px bg-zinc-100 dark:bg-white/[0.06]" />

              <button onClick={() => setShowMore(true)} className={menuItemClass}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/[0.06]">
                  <MoreHorizontal className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <span className="font-medium">More</span>
                <ChevronLeft className="ml-auto h-3.5 w-3.5 rotate-180 text-zinc-400" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 min-w-[230px]">
            {/* Back button */}
            <button
              onClick={() => setShowMore(false)}
              className="mb-1 flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[12px] font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <div className="px-3 pb-1.5 pt-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                Integrations
              </p>
            </div>

            <div className="space-y-px">
              {moreActions.map((action, i) => {
                const Icon = action.icon
                return (
                  <button key={i} onClick={() => handleAction(action.action)} className={menuItemClass}>
                    {action.customIcon ? (
                      action.customIcon
                    ) : (
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${action.bg}`}>
                        <Icon className={`h-4 w-4 ${action.color}`} />
                      </div>
                    )}
                    <span className="font-medium">{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </PopoverContent>
      <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleUpload} />
    </Popover>
  )
}

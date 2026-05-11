"use client"
import { useState, useRef } from "react"
import { Paperclip, Bot, Search, Palette, BookOpen, MoreHorizontal, Globe, ChevronLeft, Zap, ChevronRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { motion, AnimatePresence } from "framer-motion"

/* ── icon wrapper with colorful glow ─────────────────────────────────────── */
function ActionIcon({ icon: Icon, color, bg, customIcon }) {
  if (customIcon) return customIcon
  return (
    <div className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}>
      <Icon className={`h-3.5 w-3.5 ${color}`} />
    </div>
  )
}

/* ── single action row ───────────────────────────────────────────────────── */
function ActionRow({ action, index, onAction }) {
  const Icon = action.icon
  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      whileHover={{ x: 2 }}
      onClick={() => onAction(action.action)}
      className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] text-left text-zinc-700 dark:text-zinc-300 transition-all duration-150 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] active:scale-[0.97]"
    >
      <ActionIcon icon={Icon} color={action.color} bg={action.bg} customIcon={action.customIcon} />
      <span className="font-medium flex-1">{action.label}</span>
      {action.badge && (
        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${action.badgeStyle}`}>
          {action.badge}
        </span>
      )}
    </motion.button>
  )
}

/* ── section label ───────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div className="px-2.5 pt-2 pb-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
        {children}
      </p>
    </div>
  )
}

/* ── divider ─────────────────────────────────────────────────────────────── */
function Divider() {
  return <div className="mx-2 my-1 h-px bg-zinc-100 dark:bg-zinc-800/60" />
}

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
      label: isUploading ? "Uploading…" : "Add files",
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
      badgeStyle: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
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
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 via-green-400 to-yellow-400 flex items-center justify-center shadow-sm shrink-0">
          <div className="h-2.5 w-2.5 bg-white rounded" />
        </div>
      ),
      label: "Google Drive",
    },
    {
      customIcon: (
        <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm shrink-0">
          <div className="h-2.5 w-2.5 bg-white rounded" />
        </div>
      ),
      label: "OneDrive",
    },
    {
      customIcon: (
        <div className="h-7 w-7 rounded-lg bg-teal-500 flex items-center justify-center shadow-sm shrink-0">
          <div className="h-2.5 w-2.5 bg-white rounded" />
        </div>
      ),
      label: "SharePoint",
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
        className="p-0 w-auto overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-2xl dark:border-zinc-800/70 dark:bg-zinc-950"
        align="start"
        side="top"
        sideOffset={8}
      >
        <AnimatePresence mode="wait">
          {!showMore ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="min-w-[220px] p-1.5"
            >
              <SectionLabel>Actions</SectionLabel>

              <div className="space-y-px">
                {mainActions.map((action, i) => (
                  <ActionRow key={i} action={action} index={i} onAction={handleAction} />
                ))}
              </div>

              <Divider />

              {/* More button */}
              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => setShowMore(true)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] text-left text-zinc-700 dark:text-zinc-300 transition-all duration-150 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] active:scale-[0.97]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <MoreHorizontal className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <span className="font-medium flex-1">More</span>
                <ChevronRight className="h-3 w-3 text-zinc-400" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="more"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="min-w-[220px] p-1.5"
            >
              {/* Back */}
              <button
                onClick={() => setShowMore(false)}
                className="mb-1 flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </button>

              <SectionLabel>Integrations</SectionLabel>

              <div className="space-y-px">
                {moreActions.map((action, i) => (
                  <ActionRow key={i} action={action} index={i} onAction={handleAction} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>

      <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleUpload} />
    </Popover>
  )
}

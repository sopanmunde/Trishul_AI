"use client"
import { useState } from "react"
import { Globe, HelpCircle, Crown, BookOpen, LogOut, ChevronRight, Settings, Sparkles } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { UserProfileModal } from "./UserProfileModal"

const menuItemClass =
  "group flex items-center gap-3 w-full px-3 py-2.5 text-[13px] text-left text-zinc-700 dark:text-zinc-300 rounded-xl transition-all duration-150 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] active:scale-[0.98]"

export default function SettingsPopover({ children, onUserUpdate = () => {} }) {
  const [open, setOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 overflow-hidden rounded-[24px] border border-zinc-200/80 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-zinc-950/95"
        align="end"
        side="right"
        sideOffset={12}
      >
        <div className="p-2.5">
          {/* Workspace card */}
          <div className="mb-2 flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.04]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">Personal</div>
              <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-500">Free plan</div>
            </div>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 shadow-sm">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-px">
            <button
              onClick={() => { setOpen(false); setIsProfileOpen(true) }}
              className={menuItemClass}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.07]">
                <Settings className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <span className="font-medium">Settings</span>
            </button>

            <button className={menuItemClass}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.07]">
                <Globe className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <span className="font-medium">Language</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-400" />
            </button>

            <button className={menuItemClass}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.07]">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <span className="font-medium">Get help</span>
            </button>
          </div>

          <div className="my-2 mx-1 h-px bg-zinc-100 dark:bg-white/[0.05]" />

          {/* Section 2 — Upgrade */}
          <div className="space-y-px">
            <button className={menuItemClass}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                <Crown className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <span className="font-medium">Upgrade plan</span>
              <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                PRO
              </span>
            </button>

            <button className={menuItemClass}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.07]">
                <BookOpen className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <span className="font-medium">Learn more</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-400" />
            </button>
          </div>

          <div className="my-2 mx-1 h-px bg-zinc-100 dark:bg-white/[0.05]" />

          {/* Log out */}
          <button
            onClick={() => {
              localStorage.removeItem("token")
              document.cookie = "auth_token=; path=/; max-age=0"
              window.location.href = "/login"
            }}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-left text-red-600 transition-all duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 active:scale-[0.98]"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
              <LogOut className="h-3.5 w-3.5 text-red-500" />
            </div>
            <span className="font-bold">Log out</span>
          </button>
        </div>
      </PopoverContent>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdate={onUserUpdate}
      />
    </Popover>
  )
}

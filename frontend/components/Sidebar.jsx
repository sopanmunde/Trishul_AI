"use client"
import { motion, AnimatePresence } from "framer-motion"
import {
  PanelLeftClose, PanelLeftOpen, SearchIcon, Plus, FolderIcon,
  FileText, Settings, Asterisk, PenSquare, Sparkles, ChevronRight
} from "lucide-react"
import SidebarSection from "./SidebarSection"
import ConversationRow from "./ConversationRow"
import FolderRow from "./FolderRow"
import TemplateRow from "./TemplateRow"
import ThemeToggle from "./ThemeToggle"
import CreateFolderModal from "./CreateFolderModal"
import CreateTemplateModal from "./CreateTemplateModal"
import SearchModal from "./SearchModal"
import SettingsPopover from "./SettingsPopover"
import { cls } from "./utils"
import { useState, useEffect } from "react"

// ── Date grouping helpers ────────────────────────────────────────────────────
function groupByDate(conversations) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOf7DaysAgo = new Date(startOfToday); startOf7DaysAgo.setDate(startOfToday.getDate() - 7)
  const startOf30DaysAgo = new Date(startOfToday); startOf30DaysAgo.setDate(startOfToday.getDate() - 30)

  const groups = { Today: [], Yesterday: [], "Previous 7 Days": [], "Previous 30 Days": [], Older: [] }

  for (const c of conversations) {
    const d = new Date(c.updatedAt || c.updated_at || 0)
    if (d >= startOfToday) groups["Today"].push(c)
    else if (d >= startOfYesterday) groups["Yesterday"].push(c)
    else if (d >= startOf7DaysAgo) groups["Previous 7 Days"].push(c)
    else if (d >= startOf30DaysAgo) groups["Previous 30 Days"].push(c)
    else groups["Older"].push(c)
  }
  return groups
}

// ── Icon button reused throughout ───────────────────────────────────────────
function SidebarIconBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 active:scale-95"
    >
      {children}
    </button>
  )
}

// ── Collapsed rail ───────────────────────────────────────────────────────────
function CollapsedSidebar({ setSidebarCollapsed, createNewChat, onSearchClick, onFoldersClick, showSearchModal, setShowSearchModal, conversations, selectedId, onSelect, togglePin }) {
  return (
    <>
      <motion.aside
        initial={{ width: 320 }}
        animate={{ width: 56 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="z-50 flex h-full shrink-0 flex-col border-r border-zinc-200 bg-[#f9f9f9] dark:border-zinc-800/80 dark:bg-[#171717]"
      >
        <div className="flex items-center justify-center border-b border-zinc-200 px-2 py-3 dark:border-zinc-800/80">
          <SidebarIconBtn onClick={() => setSidebarCollapsed(false)} title="Open sidebar">
            <PanelLeftOpen className="h-4.5 w-4.5" />
          </SidebarIconBtn>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1.5 pt-3">
          <SidebarIconBtn onClick={createNewChat} title="New Chat">
            <PenSquare className="h-4.5 w-4.5" />
          </SidebarIconBtn>
          <SidebarIconBtn onClick={onSearchClick} title="Search">
            <SearchIcon className="h-4.5 w-4.5" />
          </SidebarIconBtn>
          <SidebarIconBtn onClick={onFoldersClick} title="Folders">
            <FolderIcon className="h-4.5 w-4.5" />
          </SidebarIconBtn>
        </div>

        <div className="flex flex-col items-center gap-1.5 pb-4">
          <SettingsPopover onUserUpdate={onUserUpdate}>
            <SidebarIconBtn title="Settings">
              <Settings className="h-4.5 w-4.5" />
            </SidebarIconBtn>
          </SettingsPopover>
        </div>
      </motion.aside>

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        togglePin={togglePin}
        createNewChat={createNewChat}
      />
    </>
  )
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({
  open, onClose, theme, setTheme,
  collapsed, setCollapsed,
  conversations, pinned, recent,
  folders, folderCounts,
  selectedId, onSelect, togglePin,
  query, setQuery, searchRef,
  createFolder, createNewChat,
  templates = [], setTemplates = () => {}, onUseTemplate = () => {},
  sidebarCollapsed = false, setSidebarCollapsed = () => {},
  onDeleteConversation = () => {}, onRenameConversation = () => {},
  user = null, onUserUpdate = () => {},
}) {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleGroup = (label) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const getConversationsByFolder = (folderName) =>
    conversations.filter((c) => c.folder === folderName)

  const handleCreateFolder = (name) => createFolder(name)
  const handleDeleteFolder = (name) => {}
  const handleRenameFolder = (old, next) => {}

  const handleCreateTemplate = (data) => {
    if (editingTemplate) {
      setTemplates(templates.map((t) => t.id === editingTemplate.id ? { ...data, id: editingTemplate.id } : t))
      setEditingTemplate(null)
    } else {
      setTemplates([...templates, { ...data, id: Date.now().toString() }])
    }
    setShowCreateTemplateModal(false)
  }

  const handleEditTemplate = (t) => { setEditingTemplate(t); setShowCreateTemplateModal(true) }
  const handleRenameTemplate = (id, name) => setTemplates(templates.map((t) => t.id === id ? { ...t, name } : t))
  const handleDeleteTemplate = (id) => setTemplates(templates.filter((t) => t.id !== id))
  const handleUseTemplate = (t) => onUseTemplate(t)

  const userInitials = user
    ? ((user.first_name?.[0] || "") + (user.last_name?.[0] || "")).toUpperCase() || user.username?.[0]?.toUpperCase() || "U"
    : "U"
  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
    : "Loading…"

  const nonPinned = (recent || []).filter((c) => !c.pinned)
  const grouped = groupByDate(nonPinned)
  const groupOrder = ["Today", "Yesterday", "Previous 7 Days", "Previous 30 Days", "Older"]

  if (sidebarCollapsed) {
    return (
      <CollapsedSidebar
        setSidebarCollapsed={setSidebarCollapsed}
        createNewChat={createNewChat}
        onSearchClick={() => setShowSearchModal(true)}
        onFoldersClick={() => { setSidebarCollapsed(false); setCollapsed((s) => ({ ...s, folders: false })) }}
        showSearchModal={showSearchModal}
        setShowSearchModal={setShowSearchModal}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        togglePin={togglePin}
      />
    )
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(open || mounted) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className={cls(
              "z-50 flex h-full w-[260px] shrink-0 flex-col border-r border-zinc-200 bg-[#f9f9f9] dark:border-zinc-800/80 dark:bg-[#171717]",
              "fixed inset-y-0 left-0 md:static md:translate-x-0 shadow-xl md:shadow-none",
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800/60">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="truncate text-[14px] font-bold text-zinc-900 dark:text-zinc-100">Trishul AI</span>
              </div>

              <div className="flex items-center gap-0.5">
                <SidebarIconBtn onClick={createNewChat} title="New Chat (⌘N)">
                  <PenSquare className="h-4.5 w-4.5" />
                </SidebarIconBtn>
                <SidebarIconBtn onClick={() => setSidebarCollapsed(true)} title="Collapse sidebar">
                  <PanelLeftClose className="h-4.5 w-4.5 hidden md:block" />
                </SidebarIconBtn>
                <button
                  onClick={onClose}
                  className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                >
                  <PanelLeftClose className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-3 pt-3 space-y-3">
              <button
                onClick={createNewChat}
                className="group flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:border-zinc-700 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">New Chat</span>
                </div>
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
                  ⌘N
                </div>
              </button>

              <div className="relative group">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search chats…"
                  onClick={() => setShowSearchModal(true)}
                  onFocus={() => setShowSearchModal(true)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-100/50 py-2.5 pl-9 pr-3 text-[13px] text-zinc-800 placeholder:text-zinc-400 outline-none ring-0 transition-all focus:border-violet-500/30 focus:bg-white focus:shadow-[0_0_0_3px_rgba(139,92,246,0.06)] dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-violet-500/30 dark:focus:bg-zinc-900"
                />
              </div>
            </div>

            {/* Nav */}
            <nav className="mt-2 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
              {/* Pinned */}
              {pinned && pinned.length > 0 && (
                <SidebarSection
                  title="Pinned"
                  collapsed={collapsed.pinned}
                  onToggle={() => setCollapsed((s) => ({ ...s, pinned: !s.pinned }))}
                >
                  {pinned.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => { onSelect(c.id); onClose?.() }}
                      onTogglePin={() => togglePin(c.id)}
                      onDelete={onDeleteConversation}
                      onRename={onRenameConversation}
                    />
                  ))}
                </SidebarSection>
              )}

              {/* Grouped by date */}
              {groupOrder.map((label) => {
                const items = grouped[label]
                if (!items || items.length === 0) return null
                return (
                  <SidebarSection
                    key={label}
                    title={label}
                    collapsed={collapsedGroups[label]}
                    onToggle={() => toggleGroup(label)}
                  >
                    {items.map((c) => (
                      <ConversationRow
                        key={c.id}
                        data={c}
                        active={c.id === selectedId}
                        onSelect={() => { onSelect(c.id); onClose?.() }}
                        onTogglePin={() => togglePin(c.id)}
                        onDelete={onDeleteConversation}
                        onRename={onRenameConversation}
                      />
                    ))}
                  </SidebarSection>
                )
              })}

              {/* Empty state */}
              {(!recent || recent.length === 0) && (!pinned || pinned.length === 0) && (
                <div className="mt-8 select-none rounded-[20px] border border-dashed border-zinc-200 px-4 py-8 text-center text-[12px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
                  <div className="mb-2 flex justify-center opacity-20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  No conversations yet.<br />Start a new chat to begin.
                </div>
              )}

              {/* Folders */}
              <SidebarSection
                title="Folders"
                collapsed={collapsed.folders}
                onToggle={() => setCollapsed((s) => ({ ...s, folders: !s.folders }))}
              >
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="mb-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px] font-medium text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> New folder
                </button>
                {folders.map((f) => (
                  <FolderRow
                    key={f.id}
                    name={f.name}
                    count={folderCounts[f.name] || 0}
                    conversations={getConversationsByFolder(f.name)}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    togglePin={togglePin}
                    onDeleteFolder={handleDeleteFolder}
                    onRenameFolder={handleRenameFolder}
                    onDeleteConversation={onDeleteConversation}
                    onRenameConversation={onRenameConversation}
                  />
                ))}
              </SidebarSection>

              {/* Templates */}
              <SidebarSection
                title="Templates"
                collapsed={collapsed.templates}
                onToggle={() => setCollapsed((s) => ({ ...s, templates: !s.templates }))}
              >
                <button
                  onClick={() => setShowCreateTemplateModal(true)}
                  className="mb-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px] font-medium text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> New template
                </button>
                {(Array.isArray(templates) ? templates : []).map((t) => (
                  <TemplateRow
                    key={t.id}
                    template={t}
                    onUseTemplate={handleUseTemplate}
                    onEditTemplate={handleEditTemplate}
                    onRenameTemplate={handleRenameTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                  />
                ))}
              </SidebarSection>
            </nav>

            {/* Footer / Profile */}
            <div className="mt-auto p-3">
              <SettingsPopover onUserUpdate={onUserUpdate}>
                <button className="group flex w-full items-center gap-3 rounded-2xl border border-transparent bg-white/40 p-2 text-left transition-all hover:border-zinc-200 hover:bg-white hover:shadow-md dark:bg-zinc-800/20 dark:hover:border-zinc-700/50 dark:hover:bg-zinc-800/40 active:scale-[0.98]">
                  <div className="relative">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-[12px] font-bold text-white shadow-lg shadow-violet-500/20">
                      {userInitials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#f9f9f9] bg-emerald-500 dark:border-[#171717]" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-zinc-900 dark:text-zinc-100">{userName}</div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                      <span className="flex h-1 w-1 rounded-full bg-violet-400" />
                      Free plan
                    </div>
                  </div>

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors group-hover:bg-zinc-100 group-hover:text-zinc-900 dark:group-hover:bg-zinc-700/50 dark:group-hover:text-zinc-100">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              </SettingsPopover>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />
      <CreateTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => { setShowCreateTemplateModal(false); setEditingTemplate(null) }}
        onCreateTemplate={handleCreateTemplate}
        editingTemplate={editingTemplate}
      />
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        togglePin={togglePin}
        createNewChat={createNewChat}
      />
    </>
  )
}

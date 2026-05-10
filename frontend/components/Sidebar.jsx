"use client"
import { motion, AnimatePresence } from "framer-motion"
import {
  PanelLeftClose,
  PanelLeftOpen,
  SearchIcon,
  Plus,
  Star,
  Clock,
  FolderIcon,
  FileText,
  Settings,
  Asterisk,
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

export default function Sidebar({
  open,
  onClose,
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  conversations,
  pinned,
  recent,
  folders,
  folderCounts,
  selectedId,
  onSelect,
  togglePin,
  query,
  setQuery,
  searchRef,
  createFolder,
  createNewChat,
  templates = [],
  setTemplates = () => {},
  onUseTemplate = () => {},
  sidebarCollapsed = false,
  setSidebarCollapsed = () => {},
  onDeleteConversation = () => {},
  onRenameConversation = () => {},
}) {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    setMounted(true)
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
        // Sometimes the NEXT_PUBLIC_API_BASE_URL contains /api, handle it gracefully
        const url = apiUrl.endsWith("/api") ? `${apiUrl}/me` : `${apiUrl.replace(/\/$/, "")}/api/me`
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch (err) {
        console.error("Failed to fetch user:", err)
      }
    }
    fetchUser()
  }, [])

  const handleSearchClick = () => {
    setShowSearchModal(true)
  }

  const handleNewChatClick = () => {
    createNewChat()
  }

  const handleFoldersClick = () => {
    // Expand sidebar and open folders section
    setSidebarCollapsed(false)
    setCollapsed((s) => ({ ...s, folders: false }))
  }

  const getConversationsByFolder = (folderName) => {
    return conversations.filter((conv) => conv.folder === folderName)
  }

  const handleCreateFolder = (folderName) => {
    createFolder(folderName)
  }

  const handleDeleteFolder = (folderName) => {
    const updatedConversations = conversations.map((conv) =>
      conv.folder === folderName ? { ...conv, folder: null } : conv,
    )
    console.log("Delete folder:", folderName, "Updated conversations:", updatedConversations)
  }

  const handleRenameFolder = (oldName, newName) => {
    const updatedConversations = conversations.map((conv) =>
      conv.folder === oldName ? { ...conv, folder: newName } : conv,
    )
    console.log("Rename folder:", oldName, "to", newName, "Updated conversations:", updatedConversations)
  }

  const handleCreateTemplate = (templateData) => {
    if (editingTemplate) {
      const updatedTemplates = templates.map((t) =>
        t.id === editingTemplate.id ? { ...templateData, id: editingTemplate.id } : t,
      )
      setTemplates(updatedTemplates)
      setEditingTemplate(null)
    } else {
      const newTemplate = {
        ...templateData,
        id: Date.now().toString(),
      }
      setTemplates([...templates, newTemplate])
    }
    setShowCreateTemplateModal(false)
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setShowCreateTemplateModal(true)
  }

  const handleRenameTemplate = (templateId, newName) => {
    const updatedTemplates = templates.map((t) =>
      t.id === templateId ? { ...t, name: newName, updatedAt: new Date().toISOString() } : t,
    )
    setTemplates(updatedTemplates)
  }

  const handleDeleteTemplate = (templateId) => {
    const updatedTemplates = templates.filter((t) => t.id !== templateId)
    setTemplates(updatedTemplates)
  }

  const handleUseTemplate = (template) => {
    onUseTemplate(template)
  }

  if (sidebarCollapsed) {
    return (
      <>
        <motion.aside
          initial={{ width: 320 }}
          animate={{ width: 64 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="z-50 flex h-full shrink-0 flex-col border-r border-zinc-200 bg-[#f9f9f9] dark:border-zinc-800/80 dark:bg-[#171717]"
        >
          <div className="flex items-center justify-center border-b border-zinc-200 px-3 py-[13px] dark:border-zinc-800/80">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 pt-4">
            <button
              onClick={handleNewChatClick}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              title="New Chat"
            >
              <Plus className="h-5 w-5" />
            </button>

            <button
              onClick={handleSearchClick}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              title="Search chats"
            >
              <SearchIcon className="h-5 w-5" />
            </button>

            <button
              onClick={handleFoldersClick}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              title="Folders"
            >
              <FolderIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-auto flex flex-col items-center gap-2 pb-4">
            <SettingsPopover>
              <button
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
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

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(open || mounted) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -340 }}
            animate={{ x: open ? 0 : 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={cls(
              "z-50 flex h-full w-72 shrink-0 flex-col border-r border-zinc-200 bg-[#f9f9f9] dark:border-zinc-800/80 dark:bg-[#171717]",
              "fixed inset-y-0 left-0 md:static md:translate-x-0",
            )}
          >
            <div className="flex items-center gap-2 px-3 py-[13px] border-b border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-black text-white shadow-sm dark:bg-white dark:text-black">
                  <Asterisk className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Trishul AI</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden md:block rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Close sidebar"
                  title="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>

                <button
                  onClick={onClose}
                  className="md:hidden rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-3 pt-3">
              <label htmlFor="search" className="sr-only">
                Search conversations
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="search"
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  onClick={() => setShowSearchModal(true)}
                  onFocus={() => setShowSearchModal(true)}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-100/80 py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
                />
              </div>
            </div>

            <div className="px-3 pt-3">
              <button
                onClick={createNewChat}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
                title="New Chat (⌘N)"
              >
                <Plus className="h-4 w-4" /> Start New Chat
              </button>
            </div>

            <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
              <SidebarSection
                icon={<Star className="h-4 w-4" />}
                title="PINNED CHATS"
                collapsed={collapsed.pinned}
                onToggle={() => setCollapsed((s) => ({ ...s, pinned: !s.pinned }))}
              >
                {pinned.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-zinc-300 px-3 py-3 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                    Pin important threads for quick access.
                  </div>
                ) : (
                  pinned.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                      onDelete={onDeleteConversation}
                      onRename={onRenameConversation}
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<Clock className="h-4 w-4" />}
                title="RECENT"
                collapsed={collapsed.recent}
                onToggle={() => setCollapsed((s) => ({ ...s, recent: !s.recent }))}
              >
                {recent.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-zinc-300 px-3 py-3 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                    No conversations yet. Start a new one!
                  </div>
                ) : (
                  recent.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                      onDelete={onDeleteConversation}
                      onRename={onRenameConversation}
                      showMeta
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<FolderIcon className="h-4 w-4" />}
                title="FOLDERS"
                collapsed={collapsed.folders}
                onToggle={() => setCollapsed((s) => ({ ...s, folders: !s.folders }))}
              >
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="mb-1 inline-flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create folder
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
                </div>
              </SidebarSection>

              <SidebarSection
                icon={<FileText className="h-4 w-4" />}
                title="TEMPLATES"
                collapsed={collapsed.templates}
                onToggle={() => setCollapsed((s) => ({ ...s, templates: !s.templates }))}
              >
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateTemplateModal(true)}
                    className="mb-1 inline-flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create template
                  </button>

                  {(Array.isArray(templates) ? templates : []).map((template) => (
                    <TemplateRow
                      key={template.id}
                      template={template}
                      onUseTemplate={handleUseTemplate}
                      onEditTemplate={handleEditTemplate}
                      onRenameTemplate={handleRenameTemplate}
                      onDeleteTemplate={handleDeleteTemplate}
                    />
                  ))}

                  {(!templates || templates.length === 0) && (
                    <div className="select-none rounded-lg border border-dashed border-zinc-300 px-3 py-3 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                      No templates yet. Create your first prompt template.
                    </div>
                  )}
                </div>
              </SidebarSection>
            </nav>

            <div className="mt-auto border-t border-zinc-200 px-3 py-3 dark:border-zinc-800/80">
              <div className="flex items-center justify-between mb-2">
                <ThemeToggle theme={theme} setTheme={setTheme} />
                <SettingsPopover>
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </button>
                </SettingsPopover>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm hover:bg-zinc-50 transition-colors cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900 uppercase">
                  {user ? (
                    (user.first_name?.[0] || "") + (user.last_name?.[0] || "") || user.username?.[0] || "U"
                  ) : "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username : "Loading..."}
                  </div>
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">Free plan</div>
                </div>
              </div>
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
        onClose={() => {
          setShowCreateTemplateModal(false)
          setEditingTemplate(null)
        }}
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

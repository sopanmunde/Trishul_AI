"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Mail, AtSign, Check, AlertCircle, Loader2, Sparkles, Camera, Shield, Trash2, ChevronRight, Fingerprint, CreditCard } from "lucide-react"

export function UserProfileModal({ isOpen, onClose, onUpdate = () => {} }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [focusedField, setFocusedField] = useState(null)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile()
    } else {
      setError("")
      setSuccess("")
    }
  }, [isOpen])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch profile")
      const data = await res.json()
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        username: data.username || "",
        email: data.email || "",
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")
    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${apiUrl}/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to update profile")
      
      // Update successful
      setSuccess("Profile updated successfully!")
      onUpdate() // Trigger refresh in parent
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const initials =
    ((formData.first_name?.[0] || "") + (formData.last_name?.[0] || "")).toUpperCase() ||
    formData.username?.[0]?.toUpperCase() ||
    "U"

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white/[0.02] px-4 py-2.5 text-[14px] text-white outline-none transition-all duration-300 placeholder:text-zinc-700 ${
      focusedField === field
        ? "border-violet-500/50 bg-violet-500/[0.04] ring-1 ring-violet-500/30"
        : "border-white/[0.08] hover:border-white/[0.12]"
    }`

  const tabs = [
    { id: "general", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl md:left-[260px]"
            onClick={onClose}
          />

          <motion.div
            key="drawer"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md border-l border-white/[0.08] bg-[#09090b]/98 shadow-2xl backdrop-blur-3xl"
          >
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent" />
            
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between px-6 pt-8 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
                  <p className="text-[12px] text-zinc-500 font-medium">Manage your Trishul AI account</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-all hover:bg-white/[0.1] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 mb-6">
                <div className="flex p-1 gap-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-bold transition-all ${
                        activeTab === tab.id
                          ? "text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTabCompact"
                          className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.1]"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <tab.icon className="relative z-10 h-3.5 w-3.5" />
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-10 scrollbar-none">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                    <p className="text-[13px] text-zinc-500">Syncing data…</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {activeTab === "general" && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                      >
                        <div className="flex flex-col items-center py-4">
                          <div className="relative group/avatar mb-4">
                            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-blue-600 text-3xl font-bold text-white shadow-2xl shadow-violet-500/20">
                              {initials}
                            </div>
                            <button
                              type="button"
                              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-white/[0.1] text-zinc-400 shadow-xl transition-all hover:bg-zinc-800 hover:text-white"
                            >
                              <Camera className="h-4 w-4" />
                            </button>
                          </div>
                          <h3 className="text-lg font-bold text-white">{formData.first_name} {formData.last_name}</h3>
                          <p className="text-[12px] text-zinc-500 font-medium">{formData.email}</p>
                        </div>

                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 px-1">First Name</label>
                              <input
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                onFocus={() => setFocusedField("first_name")}
                                onBlur={() => setFocusedField(null)}
                                className={inputClass("first_name")}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 px-1">Last Name</label>
                              <input
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                onFocus={() => setFocusedField("last_name")}
                                onBlur={() => setFocusedField(null)}
                                className={inputClass("last_name")}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 px-1">Username</label>
                            <div className="relative">
                              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                              <input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onFocus={() => setFocusedField("username")}
                                onBlur={() => setFocusedField(null)}
                                className={`${inputClass("username")} pl-11`}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "security" && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-1.5 space-y-1">
                          {[
                            { icon: Fingerprint, label: "Biometric Login", status: "Active" },
                            { icon: Shield, label: "2-Factor Auth", status: "Off" },
                          ].map((item, idx) => (
                            <button key={idx} type="button" className="flex w-full items-center justify-between rounded-xl px-3 py-3 hover:bg-white/[0.04] transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-white/[0.05] flex items-center justify-center">
                                  <item.icon className="h-4.5 w-4.5 text-zinc-400" />
                                </div>
                                <span className="text-[13px] font-bold text-white">{item.label}</span>
                              </div>
                              <span className={`text-[11px] font-bold ${item.status === 'Active' ? 'text-emerald-500' : 'text-zinc-500'}`}>{item.status}</span>
                            </button>
                          ))}
                        </div>

                        <div className="pt-6">
                          <button
                            type="button"
                            className="group flex w-full items-center justify-between rounded-2xl border border-red-500/10 bg-red-500/[0.02] px-4 py-4 hover:bg-red-500/[0.06] transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <Trash2 className="h-4.5 w-4.5 text-red-500" />
                              <span className="text-[14px] font-bold text-white">Delete Account</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    <AnimatePresence>
                      {success && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-3 rounded-xl bg-emerald-500/90 p-3 text-[13px] font-bold text-white shadow-lg backdrop-blur-md"
                        >
                          <Check className="h-4 w-4" />
                          {success}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] py-3 text-[13px] font-bold text-zinc-400 hover:bg-white/[0.06] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="relative flex-[1.5] group overflow-hidden rounded-xl py-3 text-[13px] font-bold text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600" />
                        <span className="relative flex items-center justify-center gap-2">
                          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          Save Settings
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

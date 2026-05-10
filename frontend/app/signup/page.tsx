"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft, Sparkles, Check } from "lucide-react"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Signup failed")
      setSuccess(true)
      setTimeout(() => { window.location.href = "/login" }, 1500)
    } catch (err: any) {
      setError(err.message || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `relative rounded-xl border transition-all duration-200 ${
      focusedField === field
        ? "border-violet-500/60 bg-violet-500/[0.06] shadow-[0_0_0_3px_rgba(139,92,246,0.12)]"
        : "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.12]"
    }`

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] flex items-center justify-center p-4 py-10">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-bl from-violet-600/18 via-transparent to-transparent blur-3xl animate-[spin_22s_linear_infinite]" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-tr from-blue-600/12 via-transparent to-transparent blur-3xl animate-[spin_28s_linear_infinite_reverse]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-purple-500/8 to-transparent blur-3xl" />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff15 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo + heading */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/25 mb-5">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">
            Create account
          </h1>
          <p className="text-[13px] text-zinc-500">
            Join Trishul AI — it&apos;s free to start
          </p>
        </div>

        {/* Glass card */}
        <div className="relative">
          <div className="absolute -inset-px rounded-[22px] bg-gradient-to-b from-white/10 to-white/[0.03] blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative rounded-[20px] border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-6 shadow-2xl"
          >
            {/* Success state */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3.5 py-3 text-[13px] text-emerald-400"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-3 w-3" />
                </div>
                Account created! Redirecting to login…
              </motion.div>
            )}

            {/* Error state */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3.5 py-3 text-[13px] text-red-400"
              >
                <svg className="h-4 w-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5" autoComplete="off">
              {/* First + Last name row */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "first_name", label: "First name", placeholder: "John" },
                  { id: "last_name", label: "Last name", placeholder: "Doe" },
                ].map((f) => (
                  <div key={f.id} className="space-y-1.5">
                    <label className="block text-[12px] font-medium text-zinc-400">{f.label}</label>
                    <div className={inputClass(f.id)}>
                      <input
                        id={f.id}
                        name={f.id}
                        type="text"
                        value={formData[f.id as keyof typeof formData]}
                        onChange={handleChange}
                        onFocus={() => setFocusedField(f.id)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={f.placeholder}
                        className="w-full bg-transparent px-3 py-2.5 text-[13px] text-white placeholder:text-zinc-600 outline-none"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-zinc-300">Username</label>
                <div className={inputClass("username")}>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="johndoe"
                    className="w-full bg-transparent px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-600 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-zinc-300">Email</label>
                <div className={inputClass("email")}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-600 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-zinc-300">Password</label>
                <div className={inputClass("password")}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full bg-transparent px-3.5 py-2.5 pr-10 text-[14px] text-white placeholder:text-zinc-600 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-zinc-300">Confirm password</label>
                <div className={inputClass("confirmPassword")}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full bg-transparent px-3.5 py-2.5 pr-10 text-[14px] text-white placeholder:text-zinc-600 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-white/10 bg-white/5 accent-violet-500"
                  required
                />
                <span className="text-[12px] leading-relaxed text-zinc-500">
                  I agree to the{" "}
                  <Link href="#" className="text-violet-400 hover:text-violet-300 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-violet-400 hover:text-violet-300 transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="relative mt-1 w-full overflow-hidden rounded-xl py-2.5 text-[14px] font-medium text-white transition-all duration-200 disabled:opacity-60 active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0 rounded-xl shadow-inner shadow-white/10" />
                <span className="relative">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account…
                    </span>
                  ) : (
                    "Create account"
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wide">or</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  label: "Google",
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  ),
                },
                {
                  label: "GitHub",
                  icon: (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  ),
                },
              ].map((provider) => (
                <button
                  key={provider.label}
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-[13px] font-medium text-zinc-300 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.08] active:scale-95"
                >
                  {provider.icon}
                  {provider.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer link */}
        <p className="mt-5 text-center text-[13px] text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

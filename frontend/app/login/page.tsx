"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft, Loader2, Check } from "lucide-react"
import { TrishulLogo } from "@/components/TrishulLogo"

/* ─── Password strength meter ─────────────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const barColors = ["bg-zinc-200 dark:bg-zinc-700", "bg-red-500", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"]
  const labels = ["", "Weak", "Fair", "Good", "Strong"]
  const labelColors = ["", "text-red-500", "text-amber-500", "text-yellow-500", "text-emerald-500"]
  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? barColors[score] : "bg-zinc-200 dark:bg-zinc-700"}`}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-[11px] font-medium ${labelColors[score]}`}>{labels[score]}</p>
      )}
    </div>
  )
}

/* ─── Reusable input field ────────────────────────────────────────────────── */
function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  suffix,
}: {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  suffix?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="
            w-full rounded-lg border border-zinc-200 dark:border-zinc-800
            bg-white dark:bg-zinc-900
            px-3 py-2.5 pr-10
            text-sm text-zinc-900 dark:text-zinc-100
            placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            outline-none
            focus:border-zinc-400 dark:focus:border-zinc-500
            focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800
            transition-all duration-150
          "
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
    </div>
  )
}

/* ─── Main unified auth page ─────────────────────────────────────────────── */
export default function AuthPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    username: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const toggle = () => {
    setIsSignUp((s) => !s)
    setError("")
    setSuccess(false)
    setForm((p) => ({ ...p, password: "", confirmPassword: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (isSignUp && form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      if (isSignUp) {
        const res = await fetch("http://localhost:8000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            username: form.username,
            first_name: form.first_name,
            last_name: form.last_name,
            password: form.password,
            confirm_password: form.confirmPassword,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || "Signup failed")
        setSuccess(true)
        setTimeout(() => {
          setIsSignUp(false)
          setSuccess(false)
          setForm((p) => ({ ...p, password: "", confirmPassword: "" }))
        }, 1600)
      } else {
        const res = await fetch("http://localhost:8000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || "Login failed")
        localStorage.setItem("token", data.access_token)
        document.cookie = `auth_token=${data.access_token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      tabIndex={-1}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-5 left-5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <div className="w-full max-w-[380px]">
        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <TrishulLogo size="lg" className="mb-5" animate={false} />
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup-title" : "login-title"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {isSignUp ? "Create an account" : "Welcome back"}
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {isSignUp
                  ? "Fill in your details to get started."
                  : "Sign in to your Trishul AI account."}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
          <div className="p-6">
            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3.5 py-3 text-sm text-red-600 dark:text-red-400 flex items-start gap-2"
                >
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success banner */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 flex items-center gap-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-3 text-sm text-emerald-700 dark:text-emerald-400"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  Account created! Switching to sign in…
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* Sign-up-only fields */}
              <AnimatePresence initial={false}>
                {isSignUp && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First name" name="first_name" value={form.first_name} onChange={handleChange} required={isSignUp} />
                      <Field label="Last name" name="last_name" value={form.last_name} onChange={handleChange} />
                    </div>
                    <Field label="Username" name="username" value={form.username} onChange={handleChange} placeholder="johndoe" required={isSignUp} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Common fields */}
              <Field
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  {!isSignUp && (
                    <Link href="#" className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="
                      w-full rounded-lg border border-zinc-200 dark:border-zinc-800
                      bg-white dark:bg-zinc-900
                      px-3 py-2.5 pr-10
                      text-sm text-zinc-900 dark:text-zinc-100
                      placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                      outline-none
                      focus:border-zinc-400 dark:focus:border-zinc-500
                      focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800
                      transition-all duration-150
                    "
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {eyeBtn(showPassword, () => setShowPassword((s) => !s))}
                  </div>
                </div>
                {isSignUp && <PasswordStrength password={form.password} />}
              </div>

              {/* Confirm password — sign-up only */}
              <AnimatePresence initial={false}>
                {isSignUp && (
                  <motion.div
                    key="confirm-pw"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 pt-1">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Confirm password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required={isSignUp}
                          className="
                            w-full rounded-lg border border-zinc-200 dark:border-zinc-800
                            bg-white dark:bg-zinc-900
                            px-3 py-2.5 pr-10
                            text-sm text-zinc-900 dark:text-zinc-100
                            placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                            outline-none
                            focus:border-zinc-400 dark:focus:border-zinc-500
                            focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800
                            transition-all duration-150
                          "
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {eyeBtn(showConfirm, () => setShowConfirm((s) => !s))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full mt-2 flex items-center justify-center gap-2
                  rounded-lg py-2.5 px-4
                  bg-zinc-900 dark:bg-zinc-100
                  text-white dark:text-zinc-900
                  text-sm font-semibold
                  hover:bg-zinc-700 dark:hover:bg-zinc-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-150
                  active:scale-[0.98]
                "
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSignUp ? "Create account" : "Sign in"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">or</span>
              <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
            </div>

            {/* Social providers */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-[0.98]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-[0.98]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>

        {/* Toggle mode */}
        <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={toggle}
            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-2 transition-colors"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  )
}

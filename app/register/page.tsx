"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Gamepad2,
  Mail,
  Lock,
  User,
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { signUpWithEmail, signInWithGoogle } from "@/lib/firebase-auth"
import { useAuth } from "@/context/AuthContext"

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Redirect if already logged in — inside useEffect, not during render
  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Hasła nie są zgodne.")
      return
    }
    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.")
      return
    }

    setSubmitting(true)
    try {
      await signUpWithEmail(email, password, displayName)
      router.push("/")
    } catch (err: any) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "Konto z tym adresem e-mail już istnieje."
          : err.code === "auth/weak-password"
            ? "Hasło jest zbyt słabe."
            : "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleRegister = async () => {
    setError("")
    setSubmitting(true)
    try {
      await signInWithGoogle()
      router.push("/")
    } catch {
      setError("Nie udało się zarejestrować przez Google. Spróbuj ponownie.")
    } finally {
      setSubmitting(false)
    }
  }

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white">
        <Loader2 className="w-10 h-10 animate-spin text-neonCyan" />
        <span className="font-orbitron text-sm tracking-widest text-neonCyan mt-4 animate-pulse">
          SPRAWDZANIE SESJI...
        </span>
      </div>
    )
  }

  // Already logged in — redirect handled by useEffect
  if (user) return null

  return (
    <div className="min-h-screen flex flex-col bg-cyberDark text-white select-none relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-125 h-125 rounded-full bg-neonPink/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-125 h-125 rounded-full bg-xboxGreen/5 blur-[140px] pointer-events-none" />

      <main className="grow flex items-center justify-center px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-xboxGreen shadow-[0_0_20px_#107c10] flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
            </Link>
            <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl tracking-widest text-gradient">
              UTWÓRZ KONTO
            </h1>
            <p className="font-rajdhani text-gray-400 font-semibold tracking-wider text-sm">
              Dołącz do społeczności graczy Xbox 360 Classics
            </p>
          </div>

          <div className="backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-rajdhani text-sm font-semibold"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleEmailRegister} className="space-y-4">
              {/* Display Name */}
              <div className="space-y-2">
                <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                  Nazwa gracza
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Twoja nazwa gracza"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-base tracking-wider placeholder-gray-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                  Adres e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gracz@xbox360.pl"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-base tracking-wider placeholder-gray-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                  Hasło
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 znaków"
                    required
                    className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-base tracking-wider placeholder-gray-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                  Potwierdź hasło
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Powtórz hasło"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-base tracking-wider placeholder-gray-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-linear-to-r from-xboxGreen to-xboxGreen-light text-black font-rajdhani text-sm font-bold tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(16,124,16,0.4)] hover:shadow-[0_0_30px_rgba(16,124,16,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>{submitting ? "Rejestracja..." : "Załóż konto"}</span>
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-rajdhani text-xs text-gray-500 font-bold tracking-wider uppercase">
                lub
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={handleGoogleRegister}
              disabled={submitting}
              className="w-full py-3.5 bg-white/5 border border-white/10 hover:border-white/25 text-white font-rajdhani text-sm font-bold tracking-widest uppercase rounded-xl transition-all duration-300 hover:bg-white/10 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Zarejestruj przez Google</span>
            </button>

            <div className="text-center pt-2">
              <p className="font-rajdhani text-sm text-gray-400 font-semibold tracking-wider">
                Masz już konto?{" "}
                <Link
                  href="/login"
                  className="text-neonCyan hover:text-white font-bold transition-colors"
                >
                  Zaloguj się
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-neonCyan/40 font-rajdhani text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3" />
              Powered by Xbox 360 Classics
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

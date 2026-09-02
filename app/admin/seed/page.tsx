"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Package,
  RefreshCw,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { seedProducts } from "@/lib/seed-firestore"

export default function SeedPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle",
  )
  const [result, setResult] = useState<{
    created: number
    skipped: number
  } | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [user, isAdmin, authLoading, router])

  const handleSeed = async () => {
    setStatus("running")
    setResult(null)
    setErrorMsg("")
    try {
      const res = await seedProducts()
      setResult(res)
      setStatus("done")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setErrorMsg(message)
      setStatus("error")
    }
  }

  if (authLoading || !user) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white'>
        <Loader2 className='w-10 h-10 animate-spin text-neonCyan' />
        <span className='font-orbitron text-sm tracking-widest text-neonCyan mt-4 animate-pulse'>
          WERYFIKOWANIE...
        </span>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white px-4'>
        <AlertCircle className='w-12 h-12 text-red-400 mb-4' />
        <h1 className='font-orbitron font-extrabold text-xl text-white tracking-widest mb-2'>
          BRAK DOSTĘPU
        </h1>
        <p className='font-rajdhani text-gray-400 font-semibold mb-6'>
          Tylko administratorzy mogą uruchamiać seed.
        </p>
        <Link
          href='/'
          className='flex items-center gap-2 px-6 py-3 bg-neonCyan/10 border border-neonCyan/30 text-neonCyan font-rajdhani text-sm font-bold tracking-wider rounded-xl hover:bg-neonCyan/20 transition-all'
        >
          <ArrowLeft className='w-4 h-4' /> Wróć na stronę główną
        </Link>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col bg-cyberDark text-white select-none relative'>
      <div className='absolute top-24 left-1/4 w-125 h-125 rounded-full bg-neonCyan/5 blur-[120px] pointer-events-none' />

      <main className='grow max-w-2xl mx-auto px-4 sm:px-6 py-10 relative z-10 w-full'>
        {/* Header */}
        <div className='flex items-center gap-3 mb-8'>
          <div className='w-12 h-12 rounded-2xl bg-xboxGreen/15 border border-xboxGreen/40 shadow-[0_0_15px_rgba(16,124,16,0.3)] flex items-center justify-center'>
            <Database className='w-6 h-6 text-xboxGreen' />
          </div>
          <div>
            <h1 className='font-orbitron font-extrabold text-2xl sm:text-3xl tracking-widest text-white'>
              SEED <span className='text-gradient-xbox'>FIRESTORE</span>
            </h1>
            <p className='font-rajdhani text-gray-400 font-semibold tracking-wider text-sm'>
              Inicjalizuj kolekcję produktów w bazie danych
            </p>
          </div>
        </div>

        {/* Seed Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6'
        >
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-neonCyan'>
              <Package className='w-5 h-5' />
              <h3 className='font-orbitron font-bold text-sm tracking-wider uppercase'>
                Kolekcja: products
              </h3>
            </div>
            <p className='font-rajdhani text-gray-400 font-semibold text-sm'>
              Skrypt doda wszystkie gry z{" "}
              <code className='text-neonCyan bg-white/5 px-1.5 py-0.5 rounded'>
                games.json
              </code>{" "}
              do kolekcji{" "}
              <code className='text-neonCyan bg-white/5 px-1.5 py-0.5 rounded'>
                products
              </code>{" "}
              w Firestore. Istniejące produkty (po ID) zostaną pominięte.
            </p>
            <div className='p-3 rounded-xl bg-white/5 border border-white/10 font-rajdhani text-xs text-gray-400'>
              <p>
                📄 Pole <strong className='text-white'>id</strong>: cyfrowe ID
                gry (1, 2, 3...)
              </p>
              <p>
                📂 Kategoria: <strong className='text-white'>xbox360</strong>
              </p>
              <p>
                🔢 Łącznie gier w katalogu:{" "}
                <strong className='text-white'>17</strong>
              </p>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleSeed}
            disabled={status === "running"}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 font-rajdhani text-lg font-bold tracking-wider uppercase rounded-2xl transition-all duration-300 ${
              status === "running"
                ? "bg-white/10 text-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-xboxGreen to-xboxGreen-light text-black shadow-[0_0_20px_rgba(16,124,16,0.4)] hover:shadow-[0_0_30px_rgba(16,124,16,0.6)] hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {status === "running" ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin' />
                Seedsz dane do Firestore...
              </>
            ) : status === "done" ? (
              <>
                <RefreshCw className='w-5 h-5' />
                Uruchom ponownie
              </>
            ) : (
              <>
                <Database className='w-5 h-5' />
                Uruchom Seed
              </>
            )}
          </button>

          {/* Result */}
          {status === "done" && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='p-4 rounded-xl bg-xboxGreen/10 border border-xboxGreen/30 space-y-2'
            >
              <div className='flex items-center gap-2 text-xboxGreen'>
                <CheckCircle2 className='w-5 h-5' />
                <span className='font-orbitron font-bold text-sm'>
                  Seed zakończony!
                </span>
              </div>
              <div className='font-rajdhani text-sm space-y-1'>
                <p className='text-white'>
                  ✅ Utworzono: <strong>{result.created}</strong> produktów
                </p>
                <p className='text-gray-400'>
                  ⏭️ Pominięto (istniejące): <strong>{result.skipped}</strong>
                </p>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2'
            >
              <div className='flex items-center gap-2 text-red-400'>
                <AlertCircle className='w-5 h-5' />
                <span className='font-orbitron font-bold text-sm'>Błąd!</span>
              </div>
              <p className='font-rajdhani text-sm text-red-300'>{errorMsg}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Back link */}
        <div className='mt-6 text-center'>
          <Link
            href='/admin'
            className='inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-neonCyan bg-white/5 hover:bg-neonCyan/10 text-gray-300 hover:text-white font-rajdhani text-sm font-bold tracking-wider transition-all'
          >
            <ArrowLeft className='w-4 h-4 text-neonCyan' />
            Wróć do panelu admina
          </Link>
        </div>
      </main>
    </div>
  )
}

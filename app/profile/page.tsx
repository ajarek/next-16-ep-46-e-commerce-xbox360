"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Mail,
  ShieldCheck,
  Calendar,
  ShoppingCart,
  TrendingUp,
  Loader2,
  ArrowLeft,
  Gamepad2,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getUserOrders, type OrderDoc } from "@/lib/firebase-firestore"
import Image from "next/image"

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      getUserOrders(user.uid)
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoadingOrders(false))
    }
  }, [user])

  if (authLoading || !user) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white'>
        <Loader2 className='w-10 h-10 animate-spin text-neonCyan' />
        <span className='font-orbitron text-sm tracking-widest text-neonCyan mt-4 animate-pulse'>
          ŁADOWANIE PROFILU...
        </span>
      </div>
    )
  }

  const getInitials = () => {
    const name = profile?.displayName || user.email || "U"
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const statusColors: Record<OrderDoc["status"], string> = {
    pending: "bg-neonOrange/20 text-neonOrange",
    processing: "bg-neonCyan/20 text-neonCyan",
    completed: "bg-xboxGreen/20 text-xboxGreen",
    cancelled: "bg-red-500/20 text-red-400",
  }

  const statusLabels: Record<OrderDoc["status"], string> = {
    pending: "Oczekujące",
    processing: "W realizacji",
    completed: "Zakończone",
    cancelled: "Anulowane",
  }

  return (
    <div className='min-h-screen flex flex-col bg-cyberDark text-white select-none relative'>
      <div className='absolute top-24 left-1/4 w-125 h-125 rounded-full bg-neonCyan/5 blur-[120px] pointer-events-none' />

      <main className='grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-neonCyan bg-white/5 hover:bg-neonCyan/10 text-gray-300 hover:text-white font-rajdhani text-sm font-bold tracking-wider transition-all mb-8'
        >
          <ArrowLeft className='w-4 h-4 text-neonCyan' />
          Wróć
        </Link>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 mb-8'
        >
          <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
            {/* Avatar */}
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt='Zdjęcie profilowe'
                width={96}
                height={96}
                className='w-24 h-24 rounded-full object-cover border-2 border-xboxGreen shadow-[0_0_20px_rgba(16,124,16,0.4)]'
              />
            ) : (
              <div className='w-24 h-24 rounded-full bg-xboxGreen/20 border-2 border-xboxGreen flex items-center justify-center text-xboxGreen font-orbitron text-3xl font-bold shadow-[0_0_20px_rgba(16,124,16,0.4)]'>
                {getInitials()}
              </div>
            )}

            <div className='text-center sm:text-left space-y-2'>
              <h1 className='font-orbitron font-extrabold text-2xl tracking-widest text-white'>
                {profile?.displayName || "Gracz"}
              </h1>
              <div className='flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm font-rajdhani text-gray-400'>
                <span className='flex items-center gap-1'>
                  <Mail className='w-3.5 h-3.5' /> {user.email}
                </span>
                {profile?.role === "admin" && (
                  <span className='flex items-center gap-1 px-2 py-0.5 bg-xboxGreen/20 border border-xboxGreen/40 rounded-full text-xboxGreen font-bold text-xs'>
                    <ShieldCheck className='w-3 h-3' /> Admin
                  </span>
                )}
              </div>
              <p className='font-rajdhani text-xs text-gray-500 flex items-center gap-1 justify-center sm:justify-start'>
                <Calendar className='w-3 h-3' />
                Dołączył:{" "}
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("pl-PL")
                  : "Brak danych"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            <div className='p-3 rounded-xl bg-white/5 border border-white/10 text-center'>
              <ShoppingCart className='w-5 h-5 text-neonCyan mx-auto mb-1' />
              <p className='font-orbitron font-bold text-lg text-white'>
                {profile?.ordersCount ?? 0}
              </p>
              <p className='font-rajdhani text-[11px] text-gray-500 font-bold uppercase tracking-wider'>
                Zamówień
              </p>
            </div>
            <div className='p-3 rounded-xl bg-white/5 border border-white/10 text-center'>
              <TrendingUp className='w-5 h-5 text-xboxGreen mx-auto mb-1' />
              <p className='font-orbitron font-bold text-lg text-white'>
                {(profile?.totalSpent ?? 0).toFixed(0)} PLN
              </p>
              <p className='font-rajdhani text-[11px] text-gray-500 font-bold uppercase tracking-wider'>
                Wydano łącznie
              </p>
            </div>
            <div className='p-3 rounded-xl bg-white/5 border border-white/10 text-center'>
              <Gamepad2 className='w-5 h-5 text-neonPink mx-auto mb-1' />
              <p className='font-orbitron font-bold text-lg text-white'>
                {profile?.wishlist?.length ?? 0}
              </p>
              <p className='font-rajdhani text-[11px] text-gray-500 font-bold uppercase tracking-wider'>
                Na liście życzeń
              </p>
            </div>
            <div className='p-3 rounded-xl bg-white/5 border border-white/10 text-center'>
              <ShieldCheck className='w-5 h-5 text-neonOrange mx-auto mb-1' />
              <p className='font-orbitron font-bold text-lg text-white capitalize'>
                {profile?.role ?? "user"}
              </p>
              <p className='font-rajdhani text-[11px] text-gray-500 font-bold uppercase tracking-wider'>
                Rola
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4'
        >
          <h3 className='font-orbitron font-bold text-lg tracking-wider text-neonCyan flex items-center gap-2'>
            <ShoppingCart className='w-5 h-5' />
            MOJE ZAMÓWIENIA
          </h3>
          <div className='h-0.5 bg-linear-to-r from-neonCyan via-neonBlue to-transparent shadow-[0_0_8px_#00ffff]' />

          {loadingOrders ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-neonCyan' />
            </div>
          ) : orders.length === 0 ? (
            <div className='text-center py-12 space-y-3'>
              <Gamepad2 className='w-10 h-10 text-gray-600 mx-auto' />
              <p className='font-rajdhani text-gray-400 font-semibold'>
                Nie masz jeszcze żadnych zamówień.
              </p>
              <Link
                href='/store'
                className='inline-flex items-center gap-2 px-5 py-2.5 bg-neonCyan/10 border border-neonCyan/30 text-neonCyan font-rajdhani text-sm font-bold rounded-xl hover:bg-neonCyan/20 transition-all'
              >
                Przeglądaj sklep
              </Link>
            </div>
          ) : (
            <div className='space-y-3'>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-xl'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='font-orbitron font-bold text-sm text-white truncate'>
                      Zamówienie #{order.id?.slice(0, 8)}...
                    </p>
                    <p className='font-rajdhani text-xs text-gray-500'>
                      {new Date(order.createdAt).toLocaleString("pl-PL")} •{" "}
                      {order.items.length} prod.
                    </p>
                  </div>
                  <div className='flex items-center gap-3 shrink-0'>
                    <span className='font-orbitron font-bold text-sm text-white'>
                      {order.total.toFixed(2)} PLN
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-rajdhani font-bold ${statusColors[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  ArrowLeft,
  Loader2,
  Gamepad2,
  Package,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getUserOrders, type OrderDoc } from "@/lib/firebase-firestore"

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [loading, setLoading] = useState(true)

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
        .finally(() => setLoading(false))
    }
  }, [user])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white">
        <Loader2 className="w-10 h-10 animate-spin text-neonCyan" />
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: "bg-neonOrange/20 text-neonOrange border-neonOrange/30",
    processing: "bg-neonCyan/20 text-neonCyan border-neonCyan/30",
    completed: "bg-xboxGreen/20 text-xboxGreen border-xboxGreen/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  const statusLabels: Record<string, string> = {
    pending: "Oczekujące",
    processing: "W realizacji",
    completed: "Zakończone",
    cancelled: "Anulowane",
  }

  return (
    <div className="min-h-screen flex flex-col bg-cyberDark text-white select-none relative">
      <div className="absolute top-24 left-1/4 w-125 h-125 rounded-full bg-neonCyan/5 blur-[120px] pointer-events-none" />

      <main className="grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-neonCyan/15 border border-neonCyan/40 shadow-[0_0_15px_rgba(0,255,255,0.3)] flex items-center justify-center">
              <Package className="w-6 h-6 text-neonCyan" />
            </div>
            <div>
              <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl tracking-widest text-white">
                MOJE <span className="text-gradient-cyan-blue">ZAMÓWIENIA</span>
              </h1>
              <p className="font-rajdhani text-gray-400 font-semibold tracking-wider text-sm">
                Historia Twoich zakupów w Xbox 360 Classics
              </p>
            </div>
          </div>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-neonCyan bg-white/5 hover:bg-neonCyan/10 text-gray-300 hover:text-white font-rajdhani text-sm font-bold tracking-wider transition-all self-start"
          >
            <ArrowLeft className="w-4 h-4 text-neonCyan" />
            Kontynuuj zakupy
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-neonCyan" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-md bg-black/40 border border-white/10 rounded-3xl p-12 sm:p-16 text-center shadow-xl space-y-6 max-w-xl mx-auto"
          >
            <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="font-orbitron font-extrabold text-xl text-white tracking-wider uppercase">
              Brak zamówień
            </h3>
            <p className="font-rajdhani text-gray-400 font-semibold max-w-md mx-auto">
              Nie złożyłeś jeszcze żadnych zamówień. Odwiedź nasz katalog i wybierz
              swoje ulubione klasyki!
            </p>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-neonCyan to-neonBlue text-black font-rajdhani text-base font-bold tracking-wider rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Gamepad2 className="w-5 h-5 text-black" />
              Przeglądaj Katalog
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-white/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-orbitron font-bold text-sm text-white">
                      Zamówienie #{order.id?.slice(0, 12)}...
                    </p>
                    <p className="font-rajdhani text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString("pl-PL")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-orbitron font-bold text-lg text-neonCyan">
                      {order.total.toFixed(2)} PLN
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-xs font-rajdhani font-bold ${statusColors[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {order.items.map((item, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-xs font-rajdhani"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-neonCyan shrink-0" />
                      <span className="text-gray-300 font-semibold truncate">
                        {item.title}
                      </span>
                      <span className="text-gray-500">×{item.quantity}</span>
                      <span className="text-white font-bold ml-auto">
                        {item.finalPrice.toFixed(2)} PLN
                      </span>
                    </div>
                  ))}
                </div>

                {order.promoCode && (
                  <p className="font-rajdhani text-xs text-xboxGreen font-bold">
                    Kod rabatowy: {order.promoCode}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

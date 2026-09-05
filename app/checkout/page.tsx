"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CreditCard,
  Lock,
  CheckCircle2,
  Gamepad2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  User,
} from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useAuth } from "@/context/AuthContext"
import { createOrder } from "@/lib/firebase-firestore"

export default function CheckoutPage() {
  const { user, profile } = useAuth()
  const { items, total, removeAllFromCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [error, setError] = useState("")

  // Form state
  const [name, setName] = useState(profile?.displayName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")

  const cartTotal = total()
  const rawSubtotal = items.reduce(
    (acc, item) => acc + item.price * (item.quantity ?? 1),
    0,
  )
  const totalSavings = rawSubtotal - cartTotal

  if (items.length === 0 && !success) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white px-4'>
        <div className='w-20 h-20 rounded-3xl bg-neonCyan/10 border border-neonCyan/30 flex items-center justify-center mx-auto mb-6'>
          <Gamepad2 className='w-10 h-10 text-neonCyan' />
        </div>
        <h1 className='font-orbitron font-extrabold text-2xl text-white tracking-widest mb-2'>
          KOSZYK JEST PUSTY
        </h1>
        <p className='font-rajdhani text-gray-400 font-semibold mb-6'>
          Dodaj gry do koszyka, aby przejść do realizacji zamówienia.
        </p>
        <Link
          href='/store'
          className='flex items-center gap-2 px-6 py-3 bg-neonCyan/10 border border-neonCyan/30 text-neonCyan font-rajdhani text-sm font-bold tracking-wider rounded-xl hover:bg-neonCyan/20 transition-all'
        >
          <ArrowLeft className='w-4 h-4' /> Przeglądaj sklep
        </Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white px-4'>
        <div className='w-20 h-20 rounded-3xl bg-neonOrange/10 border border-neonOrange/30 flex items-center justify-center mx-auto mb-6'>
          <AlertCircle className='w-10 h-10 text-neonOrange' />
        </div>
        <h1 className='font-orbitron font-extrabold text-2xl text-white tracking-widest mb-2'>
          WYMAGANE LOGOWANIE
        </h1>
        <p className='font-rajdhani text-gray-400 font-semibold mb-6'>
          Zaloguj się, aby sfinalizować zamówienie.
        </p>
        <Link
          href='/login'
          className='flex items-center gap-2 px-6 py-3 bg-neonCyan/10 border border-neonCyan/30 text-neonCyan font-rajdhani text-sm font-bold tracking-wider rounded-xl hover:bg-neonCyan/20 transition-all'
        >
          Zaloguj się
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const orderItems = items.map((item) => {
        const unitPrice = item.price
        const finalPrice =
          item.discount > 0
            ? item.price * (1 - item.discount / 100)
            : item.price
        return {
          productId: item.id,
          title: item.title,
          image: item.image,
          quantity: item.quantity ?? 1,
          unitPrice,
          finalPrice: finalPrice * (item.quantity ?? 1),
        }
      })

      const newOrderId = await createOrder({
        userId: user!.uid,
        items: orderItems,
        subtotal: rawSubtotal,
        promoDiscount: 0,
        total: cartTotal,
        promoCode: null,
        status: "pending",
      })

      setOrderId(newOrderId)
      setSuccess(true)
      removeAllFromCart()
    } catch {
      setError("Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie.")
    } finally {
      setLoading(false)
    }
  }

  // Success view
  if (success) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white px-4'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='text-center space-y-6 max-w-md'
        >
          <div className='w-20 h-20 rounded-full bg-xboxGreen/20 border-2 border-xboxGreen flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,124,16,0.5)]'>
            <CheckCircle2 className='w-10 h-10 text-xboxGreen' />
          </div>
          <h1 className='font-orbitron font-extrabold text-3xl tracking-widest text-gradient-xbox'>
            ZAMÓWIENIE PRZYJĘTE!
          </h1>
          <p className='font-rajdhani text-gray-400 font-semibold text-lg'>
            Dziękujemy za zakupy w Xbox 360 Classics! Twoje zamówienie zostało
            zapisane i oczekuje na realizację.
          </p>
          <div className='backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4'>
            <p className='font-rajdhani text-xs text-gray-500 uppercase tracking-wider mb-1'>
              Numer zamówienia
            </p>
            <p className='font-orbitron font-bold text-lg text-neonCyan'>
              #{orderId.slice(0, 12)}...
            </p>
          </div>
          <Link
            href='/'
            className='inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-xboxGreen to-xboxGreen-light text-black font-rajdhani text-base font-bold tracking-wider rounded-2xl shadow-[0_0_20px_rgba(16,124,16,0.4)] hover:shadow-[0_0_30px_rgba(16,124,16,0.6)] hover:scale-105 active:scale-95 transition-all duration-300'
          >
            Wróć na stronę główną
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col bg-cyberDark text-white select-none relative'>
      <div className='absolute top-24 left-1/4 w-125 h-125 rounded-full bg-neonCyan/5 blur-[120px] pointer-events-none' />

      <main className='grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='w-12 h-12 rounded-2xl bg-neonCyan/15 border border-neonCyan/40 shadow-[0_0_15px_rgba(0,255,255,0.3)] flex items-center justify-center'>
            <CreditCard className='w-6 h-6 text-neonCyan' />
          </div>
          <div>
            <h1 className='font-orbitron font-extrabold text-2xl sm:text-3xl tracking-widest text-white'>
              REALIZACJA{" "}
              <span className='text-gradient-cyan-blue'>ZAMÓWIENIA</span>
            </h1>
            <p className='font-rajdhani text-gray-400 font-semibold tracking-wider text-sm'>
              Sfinalizuj zakup swoich klasyków Xbox 360
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-rajdhani text-sm font-semibold mb-6'
          >
            <AlertCircle className='w-5 h-5 shrink-0' />
            <span>{error}</span>
          </motion.div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>
          {/* Payment Form */}
          <form onSubmit={handleSubmit} className='lg:col-span-3 space-y-6'>
            <div className='backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6'>
              <div>
                <h3 className='font-orbitron font-bold text-lg tracking-wider text-neonCyan flex items-center gap-2'>
                  <Lock className='w-5 h-5' />
                  DANE PŁATNOŚCI
                </h3>
                <div className='h-0.5 bg-linear-to-r from-neonCyan via-neonBlue to-transparent mt-3 shadow-[0_0_8px_#00ffff]' />
              </div>

              {/* Name */}
              <div className='space-y-2'>
                <label className='block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase'>
                  Imię i nazwisko
                </label>
                <div className='relative'>
                  <User className='w-4 h-4 text-gray-500 absolute left-3.5 top-3.5' />
                  <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-base placeholder-gray-600 focus:outline-none transition-colors'
                  />
                </div>
              </div>

              {/* Email */}
              <div className='space-y-2'>
                <label className='block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase'>
                  E-mail (do wysyłki cyfrowej)
                </label>
                <div className='relative'>
                  <Mail className='w-4 h-4 text-gray-500 absolute left-3.5 top-3.5' />
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-base placeholder-gray-600 focus:outline-none transition-colors'
                  />
                </div>
              </div>

              {/* Card Number */}
              <div className='space-y-2'>
                <label className='block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase'>
                  Numer karty
                </label>
                <div className='relative'>
                  <CreditCard className='w-4 h-4 text-gray-500 absolute left-3.5 top-3.5' />
                  <input
                    type='text'
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder='•••• •••• •••• ••••'
                    required
                    maxLength={19}
                    className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-base placeholder-gray-600 focus:outline-none transition-colors'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                {/* Expiry */}
                <div className='space-y-2'>
                  <label className='block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase'>
                    Ważność
                  </label>
                  <input
                    type='text'
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder='MM/RR'
                    required
                    maxLength={5}
                    className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-base placeholder-gray-600 focus:outline-none transition-colors'
                  />
                </div>

                {/* CVV */}
                <div className='space-y-2'>
                  <label className='block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase'>
                    CVV
                  </label>
                  <input
                    type='text'
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder='•••'
                    required
                    maxLength={4}
                    className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-base placeholder-gray-600 focus:outline-none transition-colors'
                  />
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full py-4 bg-linear-to-r from-neonCyan to-neonBlue text-black font-rajdhani text-sm font-bold tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Lock className='w-4 h-4' />
                )}
                <span>
                  {loading
                    ? "Przetwarzanie..."
                    : `Zapłać ${cartTotal.toFixed(2)} PLN`}
                </span>
              </button>

              <p className='text-center font-rajdhani text-[11px] text-gray-500'>
                <Lock className='w-3 h-3 inline mr-1' />
                Twoje dane płatności są szyfrowane i bezpieczne. To wersja
                demonstracyjna.
              </p>
            </div>
          </form>

          {/* Order Summary */}
          <div className='lg:col-span-2'>
            <div className='backdrop-blur-md bg-[#101015]/90 border border-white/10 rounded-3xl p-6 space-y-4 sticky top-24'>
              <h3 className='font-orbitron font-bold text-lg tracking-wider text-neonCyan'>
                PODSUMOWANIE
              </h3>
              <div className='h-0.5 bg-linear-to-r from-neonCyan to-neonBlue shadow-[0_0_8px_#00ffff]' />

              <div className='space-y-3 max-h-64 overflow-y-auto custom-scrollbar'>
                {items.map((item) => {
                  const finalPrice =
                    item.discount > 0
                      ? item.price * (1 - item.discount / 100)
                      : item.price
                  const qty = item.quantity ?? 1
                  return (
                    <div
                      key={item.id}
                      className='flex items-center gap-3 text-xs font-rajdhani'
                    >
                      <div className='w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0'>
                        <Gamepad2 className='w-4 h-4 text-neonCyan' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-white font-semibold truncate'>
                          {item.title}
                        </p>
                        <p className='text-gray-500'>×{qty}</p>
                      </div>
                      <span className='text-white font-orbitron font-bold shrink-0'>
                        {(finalPrice * qty).toFixed(2)} PLN
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className='border-t border-white/10 pt-3 space-y-2 font-rajdhani text-sm'>
                <div className='flex justify-between text-gray-400'>
                  <span>Wartość gier:</span>
                  <span className='text-white font-orbitron'>
                    {rawSubtotal.toFixed(2)} PLN
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div className='flex justify-between text-neonPink'>
                    <span>Oszczędzasz:</span>
                    <span className='font-bold'>
                      -{totalSavings.toFixed(2)} PLN
                    </span>
                  </div>
                )}
                <div className='flex justify-between text-gray-400'>
                  <span>Dostawa:</span>
                  <span className='text-xboxGreen font-bold'>GRATIS</span>
                </div>
                <div className='border-t border-white/10 pt-3 flex justify-between items-end'>
                  <span className='text-white font-bold text-base'>
                    DO ZAPŁATY
                  </span>
                  <span className='font-orbitron font-black text-2xl text-neonCyan text-glow-cyan'>
                    {cartTotal.toFixed(2)} PLN
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

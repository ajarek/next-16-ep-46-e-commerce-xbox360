"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Gamepad2,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  Tag,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useCartStore } from "@/store/cartStore"
import { useMounted } from "@/hooks/useMounted"

export default function CartPage() {
  const router = useRouter()
  const mounted = useMounted()
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({})
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState("")

  // Zustand Cart Store
  const {
    items,
    increment,
    decrement,
    removeItemFromCart,
    removeAllFromCart,
    total,
  } = useCartStore()

  // Calculation summaries
  const rawSubtotal = items.reduce(
    (acc, item) => acc + item.price * (item.quantity ?? 1),
    0,
  )
  const cartTotal = total()
  const totalSavings = rawSubtotal - cartTotal
  const totalItemsCount = items.reduce(
    (acc, item) => acc + (item.quantity ?? 1),
    0,
  )

  // Promo code calculation (e.g. XBOX360 gives additional 10% off)
  const promoDiscount = promoApplied ? cartTotal * 0.1 : 0
  const finalPayable = Math.max(0, cartTotal - promoDiscount)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      promoCode.trim().toUpperCase() === "XBOX360" ||
      promoCode.trim().toUpperCase() === "RETRO"
    ) {
      setPromoApplied(true)
      setPromoError("")
    } else {
      setPromoError("Nieprawidłowy kod promocyjny (spróbuj: XBOX360)")
    }
  }

  if (!mounted) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white'>
        <div className='w-12 h-12 rounded-full border-4 border-t-neonCyan border-white/10 animate-spin shadow-[0_0_15px_#00ffff]' />
        <span className='font-orbitron text-sm tracking-widest text-neonCyan mt-4 animate-pulse'>
          ŁADOWANIE KOSZYKA...
        </span>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col bg-cyberDark text-white select-none relative'>
      {/* Decorative ambient gradients */}
      <div className='absolute top-24 left-1/4 w-125 h-125 rounded-full bg-neonCyan/5 blur-[120px] pointer-events-none' />
      <div className='absolute bottom-24 right-1/4 w-125 h-125 rounded-full bg-neonBlue/5 blur-[120px] pointer-events-none' />

      <main className='grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full'>
        {/* Header Navigation & Title */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-2xl bg-xboxGreen/15 border border-xboxGreen/40 shadow-[0_0_15px_rgba(16,124,16,0.3)] flex items-center justify-center'>
              <ShoppingCart className='w-6 h-6 text-xboxGreen' />
            </div>
            <div>
              <h1 className='font-orbitron font-extrabold text-2xl sm:text-3xl tracking-widest text-white'>
                TWÓJ <span className='text-gradient'>KOSZYK</span>
              </h1>
              <p className='font-rajdhani text-gray-400 font-semibold tracking-wider text-sm'>
                Zarządzaj swoimi grami i sfinalizuj zamówienie cyfrowe
              </p>
            </div>
          </div>

          <Link
            href='/store'
            className='inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-neonCyan bg-white/5 hover:bg-neonCyan/10 text-gray-300 hover:text-white font-rajdhani text-sm font-bold tracking-wider transition-all self-start sm:self-auto'
          >
            <ArrowLeft className='w-4 h-4 text-neonCyan' />
            <span>Kontynuuj zakupy</span>
          </Link>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='backdrop-blur-md bg-black/40 border border-white/10 rounded-3xl p-12 sm:p-16 text-center shadow-xl space-y-6 max-w-2xl mx-auto my-12'
          >
            <div className='w-20 h-20 rounded-3xl bg-neonCyan/10 border border-neonCyan/30 flex items-center justify-center mx-auto text-neonCyan shadow-[0_0_25px_rgba(0,255,255,0.2)]'>
              <ShoppingBag className='w-10 h-10 animate-pulse' />
            </div>
            <div className='space-y-2'>
              <h3 className='font-orbitron font-extrabold text-2xl text-white tracking-wider uppercase'>
                Twój koszyk jest pusty
              </h3>
              <p className='font-rajdhani text-gray-400 max-w-md mx-auto font-medium text-base'>
                Nie dodałeś jeszcze żadnych klasyków do koszyka. Odwiedź nasz
                cyfrowy katalog i wybierz legendarne tytuły!
              </p>
            </div>
            <Link
              href='/store'
              className='inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-neonCyan to-neonBlue text-black font-rajdhani text-base font-bold tracking-wider uppercase rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300'
            >
              <Gamepad2 className='w-5 h-5 text-black' />
              <span>Przeglądaj Katalog Gier</span>
              <ArrowRight className='w-4 h-4 text-black' />
            </Link>
          </motion.div>
        ) : (
          /* Cart Content Layout */
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
            {/* Cart Items List (2/3 width) */}
            <div className='lg:col-span-2 space-y-4'>
              {/* Header Action Bar */}
              <div className='flex items-center justify-between px-2 text-sm font-rajdhani text-gray-400'>
                <span>
                  Liczba pozycji:{" "}
                  <strong className='text-white'>{items.length}</strong>{" "}
                  (łącznie {totalItemsCount} szt.)
                </span>
                <button
                  onClick={removeAllFromCart}
                  className='flex items-center gap-1.5 text-xs text-gray-400 hover:text-neonPink transition-colors font-bold uppercase tracking-wider'
                >
                  <Trash2 className='w-3.5 h-3.5' />
                  <span>Wyczyść cały koszyk</span>
                </button>
              </div>

              {/* Items List */}
              <AnimatePresence mode='popLayout'>
                {items.map((item) => {
                  const unitPrice = item.price
                  const itemDiscount = item.discount || 0
                  const finalUnitPrice =
                    itemDiscount > 0
                      ? unitPrice * (1 - itemDiscount / 100)
                      : unitPrice
                  const quantity = item.quantity ?? 1
                  const itemTotalPrice = finalUnitPrice * quantity

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      key={item.id}
                      className='group relative flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 backdrop-blur-md bg-[#111116]/90 border border-white/10 hover:border-neonCyan/50 rounded-2xl shadow-lg transition-all'
                    >
                      {/* Xbox Spine Accent */}
                      <div className='absolute left-0 top-3 bottom-3 w-1 bg-xboxGreen rounded-r group-hover:bg-neonCyan transition-colors' />

                      {/* Image Preview */}
                      <div className='relative w-full sm:w-28 aspect-video sm:aspect-square rounded-xl overflow-hidden shrink-0 bg-black/60 border border-white/10'>
                        <Image
                          src={
                            failedImages[item.id]
                              ? `https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80&text=${encodeURIComponent(item.title)}`
                              : item.image
                          }
                          alt={item.title}
                          fill
                          sizes='(max-width: 640px) 100vw, 120px'
                          className='object-cover'
                          onError={() => {
                            setFailedImages((prev) => ({
                              ...prev,
                              [item.id]: true,
                            }))
                          }}
                        />
                        {itemDiscount > 0 && (
                          <div className='absolute top-2 left-2 z-10 px-2 py-0.5 bg-neonPink text-black font-orbitron text-[10px] font-black rounded shadow-[0_0_8px_#ff69b4]'>
                            -{itemDiscount}%
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className='grow text-center sm:text-left space-y-1 w-full sm:w-auto'>
                        <div className='flex items-center justify-center sm:justify-start gap-2'>
                          <span className='text-[11px] font-rajdhani font-bold text-neonCyan uppercase tracking-widest'>
                            Xbox 360 Classic
                          </span>
                          {item.stock === 1 && (
                            <span className='text-[10px] px-1.5 py-0.2 bg-red-600/80 text-white rounded font-bold'>
                              Ostatnia sztuka
                            </span>
                          )}
                        </div>

                        <h3 className='font-orbitron font-bold text-base sm:text-lg text-white group-hover:text-neonCyan transition-colors line-clamp-1'>
                          {item.title}
                        </h3>

                        <p className='font-rajdhani text-xs text-gray-400 font-medium line-clamp-1'>
                          {item.description}
                        </p>

                        <div className='flex items-center justify-center sm:justify-start gap-2 pt-1'>
                          {itemDiscount > 0 ? (
                            <>
                              <span className='font-orbitron font-bold text-sm text-neonPink'>
                                {finalUnitPrice.toFixed(2)} PLN
                              </span>
                              <span className='font-rajdhani text-xs text-gray-500 line-through'>
                                {unitPrice.toFixed(2)} PLN / szt.
                              </span>
                            </>
                          ) : (
                            <span className='font-orbitron font-bold text-sm text-gray-300'>
                              {unitPrice.toFixed(2)} PLN / szt.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper, Total, and Delete Button */}
                      <div className='flex flex-row sm:flex-col items-center justify-between sm:justify-end gap-4 sm:gap-2 w-full sm:w-auto self-stretch sm:self-auto border-t border-white/5 sm:border-0 pt-3 sm:pt-0 shrink-0'>
                        {/* Stepper */}
                        <div className='flex items-center gap-1 bg-black/60 border border-white/15 rounded-xl p-1 shrink-0 shadow-inner'>
                          <button
                            onClick={() => decrement(item.id)}
                            className='p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-neonPink active:scale-90 transition-all'
                            title='Zmniejsz ilość'
                          >
                            <Minus className='w-3.5 h-3.5' />
                          </button>

                          <span className='font-orbitron font-extrabold text-sm px-2.5 select-none text-white w-7 text-center'>
                            {quantity}
                          </span>

                          <button
                            onClick={() => increment(item.id)}
                            className='p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-neonCyan active:scale-90 transition-all'
                            title='Zwiększ ilość'
                          >
                            <Plus className='w-3.5 h-3.5' />
                          </button>
                        </div>

                        {/* Price for Item */}
                        <div className='text-right flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0 select-none'>
                          <span className='text-[10px] text-gray-500 font-rajdhani font-bold tracking-wider hidden sm:block'>
                            WARTOŚĆ:
                          </span>
                          <span className='font-orbitron font-black text-base text-white text-glow-cyan'>
                            {itemTotalPrice.toFixed(2)}{" "}
                            <span className='text-xs font-semibold text-gray-400'>
                              PLN
                            </span>
                          </span>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => removeItemFromCart(item.id)}
                          className='p-2 border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-xl transition-all flex items-center justify-center gap-1.5'
                          title='Usuń z koszyka'
                        >
                          <Trash2 className='w-4 h-4' />
                          <span className='sm:hidden font-rajdhani text-xs font-bold uppercase'>
                            Usuń
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Trust Features below list */}
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4'>
                <div className='p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3'>
                  <Zap className='w-5 h-5 text-neonCyan shrink-0' />
                  <div className='text-xs font-rajdhani'>
                    <p className='font-bold text-white uppercase'>
                      Wysyłka Cyfrowa
                    </p>
                    <p className='text-gray-400'>
                      Błyskawicznie na Twój e-mail
                    </p>
                  </div>
                </div>
                <div className='p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3'>
                  <ShieldCheck className='w-5 h-5 text-xboxGreen shrink-0' />
                  <div className='text-xs font-rajdhani'>
                    <p className='font-bold text-white uppercase'>
                      100% Oryginał
                    </p>
                    <p className='text-gray-400'>Zweryfikowane licencje</p>
                  </div>
                </div>
                <div className='p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3'>
                  <Sparkles className='w-5 h-5 text-amber-400 shrink-0' />
                  <div className='text-xs font-rajdhani'>
                    <p className='font-bold text-white uppercase'>
                      Wsparcie Gracza
                    </p>
                    <p className='text-gray-400'>Pomoc 7 dni w tygodniu</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Card (1/3 width) */}
            <div className='backdrop-blur-md bg-[#101015]/90 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] sticky top-24'>
              <div>
                <h3 className='font-orbitron font-bold text-lg tracking-wider text-neonCyan uppercase flex items-center gap-2'>
                  <Tag className='w-5 h-5' />
                  PODSUMOWANIE
                </h3>
                <div className='h-0.5 bg-linear-to-r from-neonCyan via-neonBlue to-transparent mt-3 shadow-[0_0_8px_#00ffff]' />
              </div>

              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className='space-y-2'>
                <label className='block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase'>
                  Kod rabatowy (np. XBOX360)
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder='Wpisz kod...'
                    className='w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan text-white font-rajdhani text-sm uppercase placeholder-gray-600 focus:outline-none'
                  />
                  <button
                    type='submit'
                    className='px-4 py-2.5 bg-white/10 hover:bg-neonCyan hover:text-black text-white font-rajdhani text-xs font-bold tracking-wider uppercase rounded-xl transition-all shrink-0'
                  >
                    Użyj
                  </button>
                </div>
                {promoApplied && (
                  <p className='text-xs font-rajdhani font-semibold text-xboxGreen flex items-center gap-1'>
                    <CheckCircle2 className='w-3.5 h-3.5' /> Zastosowano
                    dodatkowy rabat -10%!
                  </p>
                )}
                {promoError && (
                  <p className='text-xs font-rajdhani font-semibold text-red-400'>
                    {promoError}
                  </p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className='space-y-3 font-rajdhani font-semibold text-sm border-t border-white/10 pt-4'>
                <div className='flex justify-between text-gray-400'>
                  <span>Wartość gier:</span>
                  <span className='text-white font-orbitron'>
                    {rawSubtotal.toFixed(2)} PLN
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className='flex justify-between text-neonPink'>
                    <span>Oszczędzasz z promocjami:</span>
                    <span className='font-orbitron font-bold'>
                      -{totalSavings.toFixed(2)} PLN
                    </span>
                  </div>
                )}

                {promoApplied && (
                  <div className='flex justify-between text-xboxGreen'>
                    <span>Kupon XBOX360 (-10%):</span>
                    <span className='font-orbitron font-bold'>
                      -{promoDiscount.toFixed(2)} PLN
                    </span>
                  </div>
                )}

                <div className='flex justify-between text-gray-400'>
                  <span>Koszt dostawy:</span>
                  <span className='text-xboxGreen font-orbitron font-bold uppercase'>
                    0.00 PLN (GRATIS)
                  </span>
                </div>

                <div className='border-t border-white/10 pt-4 flex justify-between items-end'>
                  <div className='space-y-0.5'>
                    <span className='text-gray-300 font-bold text-base block'>
                      DO ZAPŁATY
                    </span>
                    <span className='text-xs text-gray-500 font-normal'>
                      Zawiera podatek VAT
                    </span>
                  </div>
                  <div className='text-right'>
                    <span className='font-orbitron font-black text-2xl sm:text-3xl text-white text-glow-cyan'>
                      {finalPayable.toFixed(2)}{" "}
                      <span className='text-sm font-bold text-gray-300'>
                        PLN
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  alert(
                    `Dziękujemy! Twoje zamówienie (${totalItemsCount} szt.) na kwotę ${finalPayable.toFixed(2)} PLN zostało przyjęte!`,
                  )
                  removeAllFromCart()
                  router.push("/store")
                }}
                className='w-full flex items-center justify-center gap-2 py-4 px-6 bg-linear-to-r from-neonCyan to-neonBlue hover:from-neonCyan hover:to-neonCyan text-black font-rajdhani text-lg font-bold tracking-wider uppercase rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group'
              >
                <span>Przejdź do Płatności</span>
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </button>

              <div className='text-center'>
                <p className='text-[11px] font-rajdhani font-semibold text-gray-500 tracking-wider'>
                  Bezpieczne szyfrowanie 256-bit SSL &bull; Natychmiastowa
                  realizacja
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

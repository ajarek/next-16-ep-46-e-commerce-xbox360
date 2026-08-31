"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Clock,
  Percent,
  ShoppingCart,
  Tag,
  Flame,
  Sparkles,
  Trophy,
  Star,
  Eye,
  X,
  Check,
  Copy,
  PackageCheck,
  Zap,
  ShieldCheck,
  ArrowUpDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import rawGames from "@/lib/games.json"
import { Product } from "@/types/game-types"
import { useCartStore } from "@/store/cartStore"
import { useMounted } from "@/hooks/useMounted"

type DealFilterTab = "all" | "huge-discount" | "under-30" | "last-copies"

function calculateTimeLeft() {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(23, 59, 59, 999)

  const difference = midnight.getTime() - now.getTime()

  if (difference <= 0) {
    return { hours: 23, minutes: 59, seconds: 59 }
  }

  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((difference / 1000 / 60) % 60)
  const seconds = Math.floor((difference / 1000) % 60)

  return { hours, minutes, seconds }
}

export default function DealsPage() {
  const mounted = useMounted()
  const { addItemToCart, items: cartItems } = useCartStore()

  // Deals raw dataset (games where discount > 0)
  const allDeals: Product[] = useMemo(() => {
    const games = rawGames as Product[]
    return games.filter((g) => (g.discount || 0) > 0)
  }, [])

  // UI States
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({})
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<DealFilterTab>("all")
  const [sortBy, setSortBy] = useState<string>("discount-desc")
  const [copiedCoupon, setCopiedCoupon] = useState(false)

  // Achievement Toast State
  const [achievementNotification, setAchievementNotification] = useState<{
    show: boolean
    title: string
    description: string
  }>({ show: false, title: "", description: "" })

  // 24h Countdown timer to midnight tonight
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const isUnderOneHour = timeLeft.hours === 0
  const formatTime = (num: number) => num.toString().padStart(2, "0")

  // Copy coupon handler
  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("XBOX360")
    setCopiedCoupon(true)
    setTimeout(() => setCopiedCoupon(false), 2500)
  }

  // Handle Add To Cart with Xbox Achievement Toast
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    addItemToCart(product)

    setAchievementNotification({
      show: true,
      title: "PROMOCJA ZŁAPANA! (+100G)",
      description: `Dodano do koszyka: ${product.title}`,
    })

    setTimeout(() => {
      setAchievementNotification((prev) => ({ ...prev, show: false }))
    }, 3500)
  }

  // Cart Helper
  const getCartQuantity = (productId: number) => {
    const found = cartItems.find((item) => item.id === productId)
    return found ? found.quantity ?? 1 : 0
  }

  const totalCartCount = cartItems.reduce((acc, i) => acc + (i.quantity ?? 1), 0)

  // Filtered & Sorted Deals
  const filteredDeals = useMemo(() => {
    return allDeals.filter((product) => {
      const finalPrice = product.price * (1 - product.discount / 100)

      if (activeTab === "huge-discount") return product.discount >= 25
      if (activeTab === "under-30") return finalPrice <= 30
      if (activeTab === "last-copies") return product.stock === 1
      return true
    })
  }, [allDeals, activeTab])

  const sortedDeals = useMemo(() => {
    return [...filteredDeals].sort((a, b) => {
      const finalPriceA = a.price * (1 - a.discount / 100)
      const finalPriceB = b.price * (1 - b.discount / 100)

      switch (sortBy) {
        case "discount-desc":
          return b.discount - a.discount
        case "price-asc":
          return finalPriceA - finalPriceB
        case "price-desc":
          return finalPriceB - finalPriceA
        case "reviews-desc":
          return (b.reviewCount || 0) - (a.reviewCount || 0)
        default:
          return b.discount - a.discount
      }
    })
  }, [filteredDeals, sortBy])

  if (!mounted) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white'>
        <div className='w-12 h-12 rounded-full border-4 border-t-neonPink border-white/10 animate-spin shadow-[0_0_20px_#ff69b4]' />
        <span className='font-orbitron text-sm tracking-widest text-neonPink mt-4 animate-pulse'>
          ŁADOWANIE OFERT SPECJALNYCH...
        </span>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col bg-cyberDark text-white select-none relative overflow-x-hidden'>
      {/* Decorative Blur Backgrounds */}
      <div className='absolute top-24 right-1/4 w-125 h-125 rounded-full bg-neonPink/5 blur-[140px] pointer-events-none' />
      <div className='absolute top-1/2 left-1/4 w-125 h-125 rounded-full bg-neonOrange/5 blur-[140px] pointer-events-none' />
      <div className='absolute bottom-24 right-10 w-96 h-96 rounded-full bg-neonCyan/5 blur-[120px] pointer-events-none' />

      {/* Xbox 360 Guide / Achievement Notification */}
      <AnimatePresence>
        {achievementNotification.show && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className='fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none'
          >
            <div className='flex items-center gap-4 bg-black/90 border-2 border-neonPink rounded-2xl px-6 py-3.5 shadow-[0_0_30px_rgba(255,105,180,0.6)] backdrop-blur-xl'>
              <div className='w-12 h-12 rounded-full bg-neonPink/20 border border-neonPink flex items-center justify-center shrink-0 shadow-[0_0_15px_#ff69b4]'>
                <Trophy className='w-6 h-6 text-neonPink animate-bounce' />
              </div>
              <div className='text-left'>
                <div className='flex items-center gap-2'>
                  <span className='w-2 h-2 rounded-full bg-neonPink animate-ping' />
                  <p className='font-orbitron font-bold text-xs sm:text-sm tracking-wider text-neonPink'>
                    {achievementNotification.title}
                  </p>
                </div>
                <p className='font-rajdhani font-semibold text-base sm:text-lg text-white'>
                  {achievementNotification.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className='grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full'>
        {/* Header Navigation & Banner */}
        <div className='text-center mb-10 space-y-3'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neonPink/30 bg-neonPink/5 text-neonPink font-rajdhani text-xs sm:text-sm font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(255,105,180,0.15)]'
          >
            <Flame className='w-4 h-4 animate-pulse' />
            <span>LIMITOWANY CYKL PROMOCJI XBOX 360</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className='font-orbitron font-extrabold text-3xl sm:text-5xl tracking-widest text-glow-pink'
          >
            STREFA <span className='text-gradient-orange-pink'>DEALS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='font-rajdhani text-gray-400 max-w-2xl mx-auto font-medium text-base sm:text-lg'
          >
            Odkryj legendarne hity retro w specjalnych, obniżonych cenach. Oferty zmieniają się wraz z cyklem czasowym!
          </motion.p>
        </div>

        {/* Dynamic Countdown & Extra Promo Coupon Bar */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 items-stretch'>
          {/* 24h Countdown Timer Box (2/3 width on desktop) */}
          <div
            className={`lg:col-span-2 backdrop-blur-md bg-[#101015]/90 border rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-500 ${
              isUnderOneHour
                ? "border-neonPink shadow-[0_0_30px_rgba(255,105,180,0.3)] bg-neonPink/5"
                : "border-white/10 hover:border-neonPink/40"
            }`}
          >
            <div className='flex items-center justify-between gap-4 mb-4'>
              <div className='flex items-center gap-2 text-gray-300 font-rajdhani text-sm font-bold tracking-widest uppercase'>
                <Clock className={`w-5 h-5 ${isUnderOneHour ? "text-neonPink animate-spin" : "text-neonOrange"}`} />
                <span>OFERTA ZEGAROWA KOŃCZY SIĘ ZA:</span>
              </div>
              <span className='px-2.5 py-1 bg-white/5 border border-white/10 rounded-full font-rajdhani text-xs font-semibold text-gray-400'>
                Cykl 24h
              </span>
            </div>

            {/* Countdown Display Blocks */}
            <div className='flex items-center justify-center sm:justify-start gap-3 sm:gap-6 font-orbitron py-2'>
              {/* Hours */}
              <div className='flex flex-col items-center bg-black/60 border border-white/10 rounded-2xl px-4 py-3 min-w-20 sm:min-w-24'>
                <span className={`text-2xl sm:text-4xl font-black ${isUnderOneHour ? "text-neonPink text-glow-pink" : "text-white"}`}>
                  {formatTime(timeLeft.hours)}
                </span>
                <span className='font-rajdhani text-[11px] font-bold text-gray-400 tracking-wider mt-1'>
                  GODZIN
                </span>
              </div>
              <span className='text-gray-600 font-bold text-2xl'>:</span>

              {/* Minutes */}
              <div className='flex flex-col items-center bg-black/60 border border-white/10 rounded-2xl px-4 py-3 min-w-20 sm:min-w-24'>
                <span className={`text-2xl sm:text-4xl font-black ${isUnderOneHour ? "text-neonPink text-glow-pink" : "text-white"}`}>
                  {formatTime(timeLeft.minutes)}
                </span>
                <span className='font-rajdhani text-[11px] font-bold text-gray-400 tracking-wider mt-1'>
                  MINUT
                </span>
              </div>
              <span className='text-gray-600 font-bold text-2xl'>:</span>

              {/* Seconds */}
              <div className='flex flex-col items-center bg-black/60 border border-white/10 rounded-2xl px-4 py-3 min-w-20 sm:min-w-24'>
                <span className='text-2xl sm:text-4xl font-black text-neonOrange text-glow-orange'>
                  {formatTime(timeLeft.seconds)}
                </span>
                <span className='font-rajdhani text-[11px] font-bold text-gray-400 tracking-wider mt-1'>
                  SEKUND
                </span>
              </div>
            </div>

            {/* Subtext info */}
            <div className='mt-4 flex items-center gap-2 text-xs font-rajdhani text-gray-400'>
              <Zap className='w-4 h-4 text-neonOrange shrink-0' />
              <span>Ceny powrócą do regularnych po upływie odliczania. Zamówienia cyfrowe realizowane są natychmiastowo.</span>
            </div>
          </div>

          {/* Coupon Code Banner (1/3 width) */}
          <div className='backdrop-blur-md bg-linear-to-br from-neonPink/10 via-[#101015] to-[#101015] border border-neonPink/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)]'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Tag className='w-4 h-4 text-neonPink' />
                <span className='font-rajdhani text-xs font-bold text-neonPink tracking-widest uppercase'>
                  KOD RABATOWY W KOSZYKU
                </span>
              </div>
              <h3 className='font-orbitron font-extrabold text-xl text-white'>
                DODATKOWE <span className='text-neonPink'>-10%</span>
              </h3>
              <p className='font-rajdhani text-xs text-gray-400'>
                Wpisz ten kod w podsumowaniu koszyka, aby naliczyć kolejny rabat do całego zamówienia!
              </p>
            </div>

            <div className='pt-4'>
              <div className='flex items-center justify-between bg-black/80 border border-neonPink/40 rounded-2xl p-2.5'>
                <span className='font-orbitron font-black text-lg tracking-widest text-white px-3'>
                  XBOX360
                </span>
                <button
                  onClick={handleCopyCoupon}
                  className='flex items-center gap-1.5 px-3.5 py-2 bg-neonPink hover:bg-white text-black font-rajdhani text-xs font-bold uppercase rounded-xl transition-all active:scale-95 shadow-[0_0_10px_rgba(255,105,180,0.3)]'
                >
                  {copiedCoupon ? (
                    <>
                      <Check className='w-3.5 h-3.5' />
                      <span>Skopiowano!</span>
                    </>
                  ) : (
                    <>
                      <Copy className='w-3.5 h-3.5' />
                      <span>Kopiuj</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Sort Toolbar */}
        <div className='flex flex-col md:flex-row items-center justify-between gap-4 mb-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4'>
          {/* Filter Pills */}
          <div className='flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar'>
            {[
              { id: "all", label: "Wszystkie Okazje", icon: Flame, count: allDeals.length },
              { id: "huge-discount", label: "Rabat ≥ 25%", icon: Percent, count: allDeals.filter((p) => p.discount >= 25).length },
              { id: "under-30", label: "Do 30 PLN", icon: Tag, count: allDeals.filter((p) => p.price * (1 - p.discount / 100) <= 30).length },
              { id: "last-copies", label: "Ostatnie Sztuki", icon: PackageCheck, count: allDeals.filter((p) => p.stock === 1).length },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DealFilterTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-rajdhani text-xs sm:text-sm font-bold tracking-wider whitespace-nowrap transition-all duration-300 border ${
                    isActive
                      ? "bg-neonPink/20 border-neonPink text-neonPink shadow-[0_0_12px_rgba(255,105,180,0.3)] scale-105"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-neonPink" : "text-gray-400"}`} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-neonPink/30 text-white" : "bg-white/5 text-gray-500"}`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Sort Dropdown */}
          <div className='flex items-center gap-3 w-full md:w-auto justify-end'>
            <div className='relative min-w-45 w-full sm:w-auto'>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='w-full appearance-none pl-9 pr-8 py-2 bg-black/60 border border-white/10 rounded-xl focus:border-neonPink text-white font-rajdhani text-xs sm:text-sm font-bold tracking-wider focus:outline-none transition-colors cursor-pointer'
              >
                <option value='discount-desc'>Największy rabat %</option>
                <option value='price-asc'>Cena: od najniższej</option>
                <option value='price-desc'>Cena: od najwyższej</option>
                <option value='reviews-desc'>Najpopularniejsze</option>
              </select>
              <ArrowUpDown className='w-4 h-4 text-gray-500 absolute left-3 top-2.5 pointer-events-none' />
            </div>
          </div>
        </div>

        {/* Deals Cards Grid */}
        {sortedDeals.length === 0 ? (
          <div className='backdrop-blur-md bg-black/40 border border-white/10 rounded-3xl p-16 text-center shadow-lg space-y-6 max-w-xl mx-auto'>
            <div className='w-16 h-16 rounded-2xl bg-neonPink/10 border border-neonPink/30 flex items-center justify-center mx-auto text-neonPink'>
              <Tag className='w-8 h-8' />
            </div>
            <h3 className='font-orbitron font-bold text-xl text-white tracking-widest uppercase'>
              Brak ofert dla wybranego filtra
            </h3>
            <p className='font-rajdhani text-gray-400 font-semibold'>
              Nie znaleźliśmy promocji spełniających to kryterium. Sprawdź wszystkie okazje w strefie Deals.
            </p>
            <button
              onClick={() => setActiveTab("all")}
              className='px-6 py-3 bg-linear-to-r from-neonPink to-neonOrange text-black font-rajdhani text-sm font-bold tracking-wider rounded-xl shadow-lg hover:scale-105 transition-all'
            >
              Pokaż wszystkie promocje
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            <AnimatePresence mode='popLayout'>
              {sortedDeals.map((product) => {
                const finalPrice = product.price * (1 - product.discount / 100)
                const savings = product.price - finalPrice
                const cartQty = getCartQuantity(product.id)

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={product.id}
                    className='group relative backdrop-blur-md bg-[#101014]/85 border border-white/10 hover:border-neonPink/70 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,105,180,0.25)] transition-all duration-300 flex flex-col h-full'
                  >
                    {/* Top Spine Accent */}
                    <div className='h-1.5 w-full bg-linear-to-r from-neonPink via-neonOrange to-neonPink group-hover:shadow-[0_0_10px_#ff69b4] transition-all' />

                    {/* Top Left Badges */}
                    <div className='absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none'>
                      <span className='px-2.5 py-1 bg-neonPink text-black font-orbitron text-xs font-black rounded-lg shadow-[0_0_10px_#ff69b4] flex items-center gap-1 uppercase'>
                        <Percent className='w-3 h-3' />
                        -{product.discount}%
                      </span>
                      {product.featured && (
                        <span className='px-2 py-0.5 bg-xboxGreen text-white font-orbitron text-[10px] font-bold rounded-lg shadow-[0_0_8px_#107c10] flex items-center gap-1 uppercase'>
                          <Sparkles className='w-3 h-3 text-yellow-300' />
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Top Right Stock Badge */}
                    <div className='absolute top-4 right-4 z-20 pointer-events-none'>
                      {product.stock === 1 ? (
                        <span className='px-2 py-0.5 bg-red-600/90 border border-red-400 text-white font-rajdhani text-[11px] font-bold rounded-md uppercase tracking-wider animate-pulse'>
                          Ostatnia sztuka!
                        </span>
                      ) : (
                        <span className='px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/15 text-gray-300 font-rajdhani text-[11px] font-semibold rounded-md'>
                          Stan: {product.stock} szt.
                        </span>
                      )}
                    </div>

                    {/* Game Cover Image */}
                    <div
                      onClick={() => setSelectedProductForModal(product)}
                      className='relative aspect-3/4 w-full overflow-hidden bg-black/60 cursor-pointer'
                    >
                      <Image
                        src={
                          failedImages[product.id]
                            ? `https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80&text=${encodeURIComponent(product.title)}`
                            : product.image
                        }
                        alt={product.title}
                        fill
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        className='object-cover transform group-hover:scale-105 transition-transform duration-500'
                        onError={() => {
                          setFailedImages((prev) => ({
                            ...prev,
                            [product.id]: true,
                          }))
                        }}
                      />
                      <div className='absolute inset-0 bg-linear-to-t from-[#101014] via-transparent to-transparent opacity-90' />

                      {/* Quick View overlay */}
                      <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                        <span className='px-4 py-2 rounded-xl bg-neonPink/20 border border-neonPink text-neonPink font-rajdhani text-sm font-bold tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,105,180,0.4)]'>
                          <Eye className='w-4 h-4' /> Szybki podgląd
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className='p-5 flex flex-col grow justify-between'>
                      <div>
                        {/* Rating & Series header */}
                        <div className='flex items-center justify-between text-xs font-rajdhani text-gray-400 mb-1.5'>
                          <span className='text-neonPink font-bold tracking-widest uppercase'>
                            Promocja Dnia
                          </span>
                          <div className='flex items-center gap-1 text-amber-400 font-semibold'>
                            <Star className='w-3.5 h-3.5 fill-amber-400' />
                            <span>{product.reviewCount > 0 ? `4.9 (${product.reviewCount})` : "Klasyk"}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => setSelectedProductForModal(product)}
                          className='font-orbitron font-bold text-lg text-white group-hover:text-neonPink transition-colors line-clamp-1 cursor-pointer mb-2'
                          title={product.title}
                        >
                          {product.title}
                        </h3>

                        {/* Description */}
                        <p className='font-rajdhani text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed mb-3'>
                          {product.description}
                        </p>

                        {/* Savings pill */}
                        <div className='mb-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neonPink/10 border border-neonPink/30 text-neonPink font-rajdhani text-xs font-bold'>
                          <span>Oszczędzasz: {savings.toFixed(2)} PLN</span>
                        </div>
                      </div>

                      {/* Pricing & Cart Action */}
                      <div className='pt-3 border-t border-white/10 flex items-center justify-between mt-auto'>
                        <div className='flex flex-col'>
                          <span className='text-xs text-gray-500 line-through leading-none'>
                            {product.price.toFixed(2)} PLN
                          </span>
                          <div className='font-orbitron font-extrabold text-xl text-neonPink text-glow-pink'>
                            {finalPrice.toFixed(2)}{" "}
                            <span className='text-xs font-bold text-gray-300'>PLN</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className={`flex items-center justify-center gap-2 py-2.5 px-4 font-rajdhani text-sm font-bold tracking-wider uppercase rounded-xl transition-all duration-300 active:scale-95 border ${
                            cartQty > 0
                              ? "bg-xboxGreen/20 border-xboxGreen text-xboxGreen hover:bg-xboxGreen hover:text-white shadow-[0_0_12px_rgba(16,124,16,0.4)]"
                              : "bg-neonPink/10 border-neonPink/40 text-neonPink hover:bg-neonPink hover:text-black shadow-[0_0_12px_rgba(255,105,180,0.2)]"
                          }`}
                        >
                          <ShoppingCart className='w-4 h-4' />
                          <span>{cartQty > 0 ? `W koszyku (${cartQty})` : "Kup Teraz"}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Benefits bar at bottom */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 pt-8 border-t border-white/10'>
          <div className='p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5'>
            <Zap className='w-6 h-6 text-neonOrange shrink-0' />
            <div className='text-xs font-rajdhani'>
              <p className='font-bold text-white uppercase text-sm'>Wysyłka Cyfrowa 0 PLN</p>
              <p className='text-gray-400'>Klucz lub dostęp bezpośrednio po zakupie</p>
            </div>
          </div>
          <div className='p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5'>
            <ShieldCheck className='w-6 h-6 text-xboxGreen shrink-0' />
            <div className='text-xs font-rajdhani'>
              <p className='font-bold text-white uppercase text-sm'>Oryginalne Gry Xbox 360</p>
              <p className='text-gray-400'>100% sprawdzona kompatybilność</p>
            </div>
          </div>
          <div className='p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5'>
            <Sparkles className='w-6 h-6 text-neonPink shrink-0' />
            <div className='text-xs font-rajdhani'>
              <p className='font-bold text-white uppercase text-sm'>Limitowane Ceny</p>
              <p className='text-gray-400'>Nowa rotacja rabatów każdego dnia</p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Sticky Cart Bar */}
      <AnimatePresence>
        {totalCartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className='fixed bottom-6 left-1/2 -translate-x-1/2 z-40'
          >
            <Link
              href='/cart'
              className='flex items-center gap-4 px-6 py-3.5 bg-[#0e0e12]/95 border-2 border-neonPink rounded-full shadow-[0_0_30px_rgba(255,105,180,0.4)] backdrop-blur-xl hover:scale-105 transition-transform group'
            >
              <div className='relative'>
                <ShoppingCart className='w-5 h-5 text-neonPink' />
                <span className='absolute -top-2 -right-2 w-5 h-5 rounded-full bg-neonPink text-black font-orbitron text-xs font-bold flex items-center justify-center'>
                  {totalCartCount}
                </span>
              </div>
              <div className='font-rajdhani font-bold text-sm tracking-wider text-white'>
                Twój Koszyk:{" "}
                <span className='text-neonPink'>
                  {useCartStore.getState().total().toFixed(2)} PLN
                </span>
              </div>
              <span className='px-3 py-1 bg-neonPink text-black font-rajdhani font-extrabold text-xs tracking-widest uppercase rounded-full group-hover:bg-white transition-colors'>
                Przejdź do kasy &rarr;
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick View Game Modal */}
      <AnimatePresence>
        {selectedProductForModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForModal(null)}
              className='absolute inset-0 bg-black/85 backdrop-blur-md'
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className='relative w-full max-w-2xl bg-[#121218] border border-neonPink/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(255,105,180,0.2)] overflow-hidden z-10'
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProductForModal(null)}
                className='absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-neonPink text-white hover:text-black transition-colors'
              >
                <X className='w-5 h-5' />
              </button>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 items-center'>
                {/* Modal Cover Image */}
                <div className='relative aspect-3/4 rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-black'>
                  <Image
                    src={
                      failedImages[selectedProductForModal.id]
                        ? `https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80&text=${encodeURIComponent(selectedProductForModal.title)}`
                        : selectedProductForModal.image
                    }
                    alt={selectedProductForModal.title}
                    fill
                    className='object-cover'
                  />
                  {selectedProductForModal.discount > 0 && (
                    <div className='absolute top-3 left-3 px-3 py-1 bg-neonPink text-black font-orbitron text-xs font-black rounded-lg shadow-[0_0_10px_#ff69b4]'>
                      -{selectedProductForModal.discount}% RABATU
                    </div>
                  )}
                </div>

                {/* Modal Content */}
                <div className='space-y-4'>
                  <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neonPink/20 text-neonPink border border-neonPink font-rajdhani text-xs font-bold tracking-widest uppercase'>
                    <Flame className='w-3.5 h-3.5' /> Oferta Specjalna
                  </div>

                  <h2 className='font-orbitron font-extrabold text-2xl text-white text-glow-pink'>
                    {selectedProductForModal.title}
                  </h2>

                  <p className='font-rajdhani text-sm text-gray-300 font-medium leading-relaxed max-h-40 overflow-y-auto custom-scrollbar'>
                    {selectedProductForModal.description}
                  </p>

                  <div className='space-y-1.5 py-3 border-y border-white/10 text-xs font-rajdhani font-semibold text-gray-400'>
                    <div className='flex justify-between'>
                      <span>Dostępny stan magazynowy:</span>
                      <span className='text-white font-bold'>{selectedProductForModal.stock} szt.</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Ocena społeczności:</span>
                      <span className='text-amber-400 font-bold'>★ 4.9 ({selectedProductForModal.reviewCount} ocen)</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Certyfikacja nośnika:</span>
                      <span className='text-xboxGreen font-bold'>Oryginał Xbox 360</span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-2'>
                    <div>
                      <span className='text-xs text-gray-500 line-through'>
                        {selectedProductForModal.price.toFixed(2)} PLN
                      </span>
                      <div className='font-orbitron font-extrabold text-2xl text-neonPink text-glow-pink'>
                        {(selectedProductForModal.price * (1 - selectedProductForModal.discount / 100)).toFixed(2)} PLN
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleAddToCart(selectedProductForModal)
                        setSelectedProductForModal(null)
                      }}
                      className='px-6 py-3 bg-linear-to-r from-neonPink to-neonOrange hover:from-neonPink hover:to-neonPink text-black font-rajdhani text-sm font-bold tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(255,105,180,0.4)] transition-all flex items-center gap-2'
                    >
                      <ShoppingCart className='w-4 h-4' />
                      <span>Kup Teraz</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

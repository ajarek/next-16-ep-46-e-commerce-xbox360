"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  ShoppingCart,
  Percent,
  Sparkles,
  Star,
  Eye,
  X,
  Check,
  Trophy,
  Flame,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { getAllProducts, type ProductDoc } from "@/lib/firebase-firestore"
import { useCartStore } from "@/store/cartStore"
import { useMounted } from "@/hooks/useMounted"

const FeaturedDeals = () => {
  const mounted = useMounted()
  const { addItemToCart, items: cartItems } = useCartStore()

  // Products from Firestore
  const [allProducts, setAllProducts] = useState<ProductDoc[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    getAllProducts()
      .then(setAllProducts)
      .catch((err) => console.error("Error loading products:", err))
      .finally(() => setLoadingProducts(false))
  }, [])

  // Pick top 3 discounted deals sorted by highest discount
  const deals = useMemo(() => {
    return allProducts
      .filter((game) => (game.discount || 0) > 0)
      .sort((a, b) => (b.discount || 0) - (a.discount || 0))
      .slice(0, 3)
  }, [allProducts])

  // UI States
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const [selectedProductForModal, setSelectedProductForModal] =
    useState<ProductDoc | null>(null)
  const [achievementNotification, setAchievementNotification] = useState<{
    show: boolean
    title: string
    description: string
  }>({ show: false, title: "", description: "" })

  // Handle Add To Cart with Xbox 360 Achievement Toast
  const handleAddToCart = (product: ProductDoc, e?: React.MouseEvent) => {
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
  const getCartQuantity = (productId: string) => {
    const found = cartItems.find((item) => item.id === productId)
    return found ? (found.quantity ?? 1) : 0
  }

  return (
    <section className='relative z-10 w-full py-20 bg-cyberDark border-t border-white/5 px-4 sm:px-6 lg:px-8 select-none overflow-hidden'>
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

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6'>
          <div>
            <div className='inline-flex items-center gap-2 text-neonPink text-glow-pink font-rajdhani text-sm font-bold tracking-widest uppercase mb-2 px-3 py-1 rounded-full bg-neonPink/10 border border-neonPink/20'>
              <Flame className='w-4 h-4 animate-pulse' />
              <span>Gorące Oferty Dnia</span>
            </div>
            <h2 className='font-orbitron font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-wider text-white'>
              NAJLEPSZE{" "}
              <span className='text-neonPink text-glow-pink'>OKAZJE</span>
            </h2>
            <p className='font-rajdhani text-gray-400 font-medium text-base sm:text-lg mt-2 max-w-xl'>
              Skorzystaj z limitowanych rabatów na klasyczne tytuły konsoli Xbox
              360 przed zakończeniem cyklu promocji.
            </p>
          </div>
          <Link
            href='/deals'
            className='flex items-center gap-2 font-rajdhani text-base sm:text-lg font-bold tracking-wider text-neonPink hover:text-white px-5 py-2.5 rounded-xl border border-neonPink/30 hover:border-neonPink bg-neonPink/5 hover:bg-neonPink/15 transition-all duration-300 group shadow-[0_0_15px_rgba(255,105,180,0.15)] hover:shadow-[0_0_20px_rgba(255,105,180,0.3)]'
          >
            <span>Zobacz wszystkie zniżki</span>
            <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
          </Link>
        </div>

        {/* Deals Grid */}
        {!mounted || loadingProducts ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='h-120 rounded-2xl bg-white/5 border border-white/10 animate-pulse'
              />
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {deals.map((product, idx) => {
              const finalPrice = product.price * (1 - product.discount / 100)
              const savings = product.price - finalPrice
              const cartQty = getCartQuantity(product.id)

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className='group relative backdrop-blur-md bg-[#101014]/85 border border-white/10 hover:border-neonPink/70 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,105,180,0.25)] transition-all duration-300 flex flex-col h-full'
                >
                  {/* Top Spine Accent */}
                  <div className='h-1.5 w-full bg-linear-to-r from-neonPink via-neonOrange to-neonPink group-hover:shadow-[0_0_10px_#ff69b4] transition-all' />

                  {/* Top Left Badges */}
                  <div className='absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none'>
                    <span className='px-2.5 py-1 bg-neonPink text-black font-orbitron text-xs font-black rounded-lg shadow-[0_0_10px_#ff69b4] flex items-center gap-1 uppercase'>
                      <Percent className='w-3 h-3' />-{product.discount}%
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

                  {/* Game Cover Image Area */}
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
                  <div className='p-6 flex flex-col grow justify-between'>
                    <div>
                      {/* Rating & Tag */}
                      <div className='flex items-center justify-between text-xs font-rajdhani text-gray-400 mb-2'>
                        <span className='text-neonPink font-bold tracking-widest uppercase'>
                          Xbox 360 Deals
                        </span>
                        <div className='flex items-center gap-1 text-amber-400 font-semibold'>
                          <Star className='w-3.5 h-3.5 fill-amber-400' />
                          <span>
                            {product.reviewCount > 0
                              ? `4.9 (${product.reviewCount})`
                              : "Klasyk"}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => setSelectedProductForModal(product)}
                        className='font-orbitron font-bold text-xl text-white group-hover:text-neonPink transition-colors line-clamp-1 cursor-pointer mb-2'
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
                    <div className='pt-4 border-t border-white/10 flex items-end justify-between mt-auto'>
                      <div className='flex flex-col'>
                        <span className='text-xs text-gray-500 line-through leading-none mb-1'>
                          {product.price.toFixed(2)} PLN
                        </span>
                        <span className='font-orbitron font-extrabold text-2xl text-white text-glow-pink'>
                          {finalPrice.toFixed(2)}{" "}
                          <span className='text-xs font-bold text-gray-300'>
                            PLN
                          </span>
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`flex items-center justify-center gap-2 py-2.5 px-4 font-rajdhani text-sm font-bold tracking-wider uppercase rounded-xl transition-all duration-300 active:scale-95 border ${
                          cartQty > 0
                            ? "bg-xboxGreen/20 border-xboxGreen text-xboxGreen hover:bg-xboxGreen hover:text-white shadow-[0_0_12px_rgba(16,124,16,0.4)]"
                            : "bg-neonPink/10 border-neonPink/40 text-neonPink hover:bg-neonPink hover:text-black shadow-[0_0_12px_rgba(255,105,180,0.2)] hover:shadow-[0_0_18px_rgba(255,105,180,0.5)]"
                        }`}
                      >
                        {cartQty > 0 ? (
                          <>
                            <Check className='w-4 h-4' />
                            <span>W koszyku ({cartQty})</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className='w-4 h-4' />
                            <span>Kup</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

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
                      <span className='text-white font-bold'>
                        {selectedProductForModal.stock} szt.
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Ocena społeczności:</span>
                      <span className='text-amber-400 font-bold'>
                        ★ 4.9 ({selectedProductForModal.reviewCount} ocen)
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Certyfikacja nośnika:</span>
                      <span className='text-xboxGreen font-bold'>
                        Oryginał Xbox 360
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-2'>
                    <div>
                      <span className='text-xs text-gray-500 line-through'>
                        {selectedProductForModal.price.toFixed(2)} PLN
                      </span>
                      <div className='font-orbitron font-extrabold text-2xl text-neonPink text-glow-pink'>
                        {(
                          selectedProductForModal.price *
                          (1 - selectedProductForModal.discount / 100)
                        ).toFixed(2)}{" "}
                        PLN
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
    </section>
  )
}

export default FeaturedDeals

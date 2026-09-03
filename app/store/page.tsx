"use client"

import React, {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useMemo,
} from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  SlidersHorizontal,
  Gamepad2,
  ShoppingCart,
  Percent,
  ChevronDown,
  ArrowUpDown,
  X,
  Sparkles,
  Star,
  PackageCheck,
  Flame,
  Check,
  Eye,
  Trophy,
  Tag,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { getAllProducts, type ProductDoc } from "@/lib/firebase-firestore"
import { useCartStore } from "@/store/cartStore"

// Preset filter tags
type FilterTab = "all" | "deals" | "featured" | "low-stock" | "budget"

function StoreContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Zustand Cart Store
  const { addItemToCart, items: cartItems } = useCartStore()

  // Core Data from Firestore
  const [products, setProducts] = useState<ProductDoc[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch((err) => console.error("Error loading products:", err))
      .finally(() => setLoadingProducts(false))
  }, [])

  // UI States
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const [selectedProductForModal, setSelectedProductForModal] =
    useState<ProductDoc | null>(null)
  const [achievementNotification, setAchievementNotification] = useState<{
    show: boolean
    title: string
    description: string
  }>({ show: false, title: "", description: "" })

  // Filter & Sort State (initialized from URL if present)
  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [activeTab, setActiveTab] = useState<FilterTab>(
    (searchParams.get("tab") as FilterTab) || "all",
  )
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    const priceParam = searchParams.get("price")
    return priceParam ? Number(priceParam) : 70
  })
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort") || "newest",
  )
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Update URL parameters
  const updateUrlParams = useCallback(
    (q: string, tab: FilterTab, price: number, sort: string) => {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (tab !== "all") params.set("tab", tab)
      if (price !== 70) params.set("price", price.toString())
      if (sort !== "newest") params.set("sort", sort)

      const query = params.toString()
      router.replace(`/store${query ? `?${query}` : ""}`, { scroll: false })
    },
    [router],
  )

  useEffect(() => {
    updateUrlParams(search, activeTab, maxPrice, sortBy)
  }, [search, activeTab, maxPrice, sortBy, updateUrlParams])

  // Handle Add To Cart with Xbox Achievement Toast
  const handleAddToCart = (product: ProductDoc, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    addItemToCart(product)

    // Trigger Xbox 360 Achievement notification
    setAchievementNotification({
      show: true,
      title: "OSIĄGNIĘCIE ODBLOKOWANE! (+100G)",
      description: `Dodano do koszyka: ${product.title}`,
    })

    setTimeout(() => {
      setAchievementNotification((prev) => ({ ...prev, show: false }))
    }, 3800)
  }

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("")
    setActiveTab("all")
    setMaxPrice(70)
    setSortBy("newest")
  }

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search matching title or description
      const matchesSearch =
        search.trim() === "" ||
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(search.toLowerCase()))

      // Tab preset filter
      let matchesTab = true
      if (activeTab === "deals") matchesTab = product.discount > 0
      else if (activeTab === "featured") matchesTab = product.featured
      else if (activeTab === "low-stock") matchesTab = product.stock === 1
      else if (activeTab === "budget") {
        const finalP =
          product.discount > 0
            ? product.price * (1 - product.discount / 100)
            : product.price
        matchesTab = finalP <= 35
      }

      // Price filter (based on discounted final price)
      const currentPrice =
        product.discount > 0
          ? product.price * (1 - product.discount / 100)
          : product.price
      const matchesPrice = currentPrice <= maxPrice

      return matchesSearch && matchesTab && matchesPrice
    })
  }, [products, search, activeTab, maxPrice])

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const getFinalPrice = (p: ProductDoc) =>
        p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price

      switch (sortBy) {
        case "price-asc":
          return getFinalPrice(a) - getFinalPrice(b)
        case "price-desc":
          return getFinalPrice(b) - getFinalPrice(a)
        case "discount-desc":
          return (b.discount || 0) - (a.discount || 0)
        case "reviews-desc":
          return (b.reviewCount || 0) - (a.reviewCount || 0)
        case "alpha-asc":
          return a.title.localeCompare(b.title)
        case "alpha-desc":
          return b.title.localeCompare(a.title)
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }, [filteredProducts, sortBy])

  // Helper to check cart quantity for a game
  const getCartQuantity = (productId: string) => {
    const found = cartItems.find((item) => item.id === productId)
    return found ? (found.quantity ?? 1) : 0
  }

  const totalCartCount = cartItems.reduce(
    (acc, i) => acc + (i.quantity ?? 1),
    0,
  )

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 select-none'>
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
            <div className='flex items-center gap-4 bg-black/90 border-2 border-xboxGreen rounded-2xl px-6 py-3.5 shadow-[0_0_30px_rgba(16,124,16,0.6)] backdrop-blur-xl'>
              <div className='w-12 h-12 rounded-full bg-xboxGreen/20 border border-xboxGreen flex items-center justify-center shrink-0 shadow-[0_0_15px_#107c10]'>
                <Trophy className='w-6 h-6 text-xboxGreen animate-bounce' />
              </div>
              <div className='text-left'>
                <div className='flex items-center gap-2'>
                  <span className='w-2 h-2 rounded-full bg-xboxGreen animate-ping' />
                  <p className='font-orbitron font-bold text-xs sm:text-sm tracking-wider text-xboxGreen'>
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

      {/* Header Banner */}
      <div className='text-center mb-10 space-y-3'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neonCyan/30 bg-neonCyan/5 text-neonCyan font-rajdhani text-xs sm:text-sm font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,255,255,0.15)]'
        >
          <Gamepad2 className='w-4 h-4 text-neonCyan' />
          <span>ORYGINALNA KOLEKCJA GIER XBOX 360</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className='font-orbitron font-extrabold text-3xl sm:text-5xl tracking-widest text-gradient'
        >
          KATALOG <span className='text-white'>KLASYKÓW</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='font-rajdhani text-gray-400 max-w-2xl mx-auto font-medium text-base sm:text-lg'
        >
          Wybierz swoje ulubione wydania, skorzystaj z limitowanych promocji i
          rozszerz swoją kolekcję retro.
        </motion.p>
      </div>

      {/* Quick Filter Tabs */}
      <div className='flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar'>
        {[
          {
            id: "all",
            label: "Wszystkie Gry",
            icon: Sparkles,
            count: products.length,
          },
          {
            id: "deals",
            label: "Promocje %",
            icon: Percent,
            count: products.filter((p) => p.discount > 0).length,
          },
          {
            id: "featured",
            label: "Wyróżnione",
            icon: Flame,
            count: products.filter((p) => p.featured).length,
          },
          {
            id: "low-stock",
            label: "Ostatnie Sztuki",
            icon: PackageCheck,
            count: products.filter((p) => p.stock === 1).length,
          },
          {
            id: "budget",
            label: "Do 35 PLN",
            icon: Tag,
            count: products.filter(
              (p) =>
                (p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price) <=
                35,
            ).length,
          },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-rajdhani text-sm font-bold tracking-wider whitespace-nowrap transition-all duration-300 border ${
                isActive
                  ? "bg-neonCyan/15 border-neonCyan text-neonCyan shadow-[0_0_15px_rgba(0,255,255,0.3)] scale-105"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/10"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-neonCyan" : "text-gray-400"}`}
              />
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-neonCyan/20 text-white" : "bg-white/5 text-gray-500"}`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Layout: Sidebar & Products Grid */}
      <div className='flex flex-col lg:flex-row gap-8 items-start'>
        {/* Sidebar Filters (Desktop) */}
        <aside className='hidden lg:block w-80 shrink-0 backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-6 space-y-6 sticky top-24 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'>
          <div>
            <h3 className='font-orbitron font-bold text-lg tracking-wider text-neonCyan flex items-center gap-2'>
              <SlidersHorizontal className='w-5 h-5' />
              FILTRUJ KATALOG
            </h3>
            <div className='h-0.5 bg-linear-to-r from-neonCyan via-neonBlue to-transparent mt-3 shadow-[0_0_8px_#00ffff]' />
          </div>

          {/* Search Box */}
          <div className='space-y-2'>
            <label className='block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase'>
              Szukaj Tytułu
            </label>
            <div className='relative'>
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='np. GTA, Assassin, Halo...'
                className='w-full pl-10 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-base tracking-wider placeholder-gray-600 focus:outline-none transition-colors'
              />
              <Search className='w-4 h-4 text-gray-500 absolute left-3 top-3.5' />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className='absolute right-3 top-3 text-gray-400 hover:text-white'
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className='space-y-4 pt-2 border-t border-white/10'>
            <div className='flex justify-between items-center font-rajdhani font-bold text-sm tracking-wider'>
              <span className='text-gray-400'>MAKS. CENA</span>
              <span className='text-neonCyan font-orbitron text-base text-glow-cyan'>
                {maxPrice} PLN
              </span>
            </div>
            <input
              type='range'
              min='15'
              max='70'
              step='5'
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className='w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neonCyan'
            />
            <div className='flex justify-between text-xs font-rajdhani font-semibold text-gray-500'>
              <span>od 15 PLN</span>
              <span>do 70 PLN</span>
            </div>
          </div>

          {/* Quick Stats in Sidebar */}
          <div className='p-4 rounded-xl bg-white/5 border border-white/10 space-y-2'>
            <div className='flex justify-between text-xs font-rajdhani font-bold text-gray-400'>
              <span>Dostępne gry:</span>
              <span className='text-white font-orbitron'>
                {products.length} szt.
              </span>
            </div>
            <div className='flex justify-between text-xs font-rajdhani font-bold text-gray-400'>
              <span>W promocji:</span>
              <span className='text-neonPink font-orbitron'>
                {products.filter((p) => p.discount > 0).length} szt.
              </span>
            </div>
            <div className='flex justify-between text-xs font-rajdhani font-bold text-gray-400'>
              <span>Gwarancja sprawności:</span>
              <span className='text-xboxGreen font-semibold flex items-center gap-1'>
                <ShieldCheck className='w-3.5 h-3.5' /> 100% testowane
              </span>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetFilters}
            className='w-full py-3 border border-white/10 hover:border-neonPink bg-white/5 hover:bg-neonPink/10 text-white font-rajdhani text-sm font-bold tracking-widest uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(255,105,180,0.2)]'
          >
            <RefreshCw className='w-4 h-4 text-neonPink' />
            <span>Resetuj Filtry</span>
          </button>
        </aside>

        {/* Content Area */}
        <div className='grow w-full space-y-6'>
          {/* Top Sort & Count Bar */}
          <div className='flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 w-full'>
            <div className='flex items-center gap-3'>
              <span className='font-rajdhani text-base font-semibold tracking-wider text-gray-400'>
                Znaleziono:{" "}
                <strong className='text-neonCyan font-bold'>
                  {sortedProducts.length}
                </strong>{" "}
                gier
              </span>
              {(search || activeTab !== "all" || maxPrice !== 70) && (
                <button
                  onClick={handleResetFilters}
                  className='text-xs text-neonPink hover:underline font-rajdhani font-bold flex items-center gap-1'
                >
                  <X className='w-3 h-3' /> Wyczyść filtry
                </button>
              )}
            </div>

            <div className='flex items-center gap-3 w-full sm:w-auto'>
              {/* Mobile filter toggle trigger */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className='lg:hidden flex items-center justify-center gap-2 py-2.5 px-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-rajdhani text-sm font-bold tracking-wider transition-all'
              >
                <SlidersHorizontal className='w-4 h-4 text-neonCyan' />
                <span>Filtry</span>
              </button>

              {/* Sort selector */}
              <div className='relative grow sm:grow-0 min-w-45'>
                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500'>
                  <ChevronDown className='w-4 h-4' />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className='w-full appearance-none pl-9 pr-8 py-2.5 bg-black/50 border border-white/10 rounded-xl focus:border-neonCyan focus:ring-1 focus:ring-neonCyan text-white font-rajdhani text-sm font-bold tracking-wider focus:outline-none transition-colors cursor-pointer'
                >
                  <option value='newest'>Najnowsze w sklepie</option>
                  <option value='price-asc'>Cena: od najniższej</option>
                  <option value='price-desc'>Cena: od najwyższej</option>
                  <option value='discount-desc'>Największy rabat %</option>
                  <option value='reviews-desc'>Najpopularniejsze</option>
                  <option value='alpha-asc'>Nazwa: A do Z</option>
                  <option value='alpha-desc'>Nazwa: Z do A</option>
                </select>
                <ArrowUpDown className='w-4 h-4 text-gray-500 absolute left-3 top-3.5' />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingProducts ? (
            <div className='flex flex-col items-center justify-center py-20'>
              <Loader2 className='w-10 h-10 animate-spin text-neonCyan' />
              <span className='font-orbitron text-sm tracking-widest text-neonCyan mt-4 animate-pulse'>
                ŁADOWANIE KATALOGU...
              </span>
            </div>
          ) : sortedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-12 text-center shadow-lg space-y-6'
            >
              <div className='w-16 h-16 rounded-2xl bg-neonPink/10 border border-neonPink/30 shadow-[0_0_20px_#ff69b4] flex items-center justify-center mx-auto'>
                <Gamepad2 className='w-8 h-8 text-neonPink animate-pulse' />
              </div>
              <h3 className='font-orbitron font-bold text-xl sm:text-2xl text-white tracking-widest uppercase'>
                Brak gier spełniających kryteria
              </h3>
              <p className='font-rajdhani text-gray-400 font-semibold tracking-wider max-w-md mx-auto'>
                Nie znaleźliśmy tytułów dla bieżących filtrów. Zwiększ zakres
                cenowy lub wyczyść wyszukiwanie.
              </p>
              <button
                onClick={handleResetFilters}
                className='px-6 py-3 bg-linear-to-r from-neonCyan to-neonBlue text-black font-rajdhani text-sm font-bold tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300'
              >
                Pokaż pełną ofertę
              </button>
            </motion.div>
          ) : (
            /* Products Grid */
            <motion.div
              layout
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            >
              <AnimatePresence mode='popLayout'>
                {sortedProducts.map((product) => {
                  const finalPrice =
                    product.discount > 0
                      ? product.price * (1 - product.discount / 100)
                      : product.price

                  const cartQty = getCartQuantity(product.id)

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      key={product.id}
                      className='group relative backdrop-blur-md bg-[#101014]/80 border border-white/10 hover:border-neonCyan/70 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(0,255,255,0.2)] transition-all duration-300 flex flex-col h-full'
                    >
                      {/* Xbox 360 Top Header Bar Accent */}
                      <div className='h-1.5 w-full bg-linear-to-r from-xboxGreen via-neonCyan to-xboxGreen group-hover:shadow-[0_0_10px_#00ffff] transition-all' />

                      {/* Badges Section */}
                      <div className='absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none'>
                        {product.discount > 0 && (
                          <span className='px-2.5 py-1 bg-neonPink text-black font-orbitron text-xs font-black rounded-lg shadow-[0_0_10px_#ff69b4] flex items-center gap-1 uppercase'>
                            <Percent className='w-3 h-3' />-{product.discount}%
                          </span>
                        )}
                        {product.featured && (
                          <span className='px-2.5 py-1 bg-xboxGreen text-white font-orbitron text-[10px] font-bold rounded-lg shadow-[0_0_10px_#107c10] flex items-center gap-1 uppercase'>
                            <Sparkles className='w-3 h-3 text-yellow-300' />
                            Klasyk
                          </span>
                        )}
                      </div>

                      {/* Stock indicator badge on top-right */}
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

                      {/* Image Area with Quick View Trigger */}
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

                        {/* Hover Overlay 'Podgląd' */}
                        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                          <span className='px-4 py-2 rounded-xl bg-neonCyan/20 border border-neonCyan text-neonCyan font-rajdhani text-sm font-bold tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,255,0.4)]'>
                            <Eye className='w-4 h-4' /> Szybki podgląd
                          </span>
                        </div>
                      </div>

                      {/* Game Info Details */}
                      <div className='p-5 flex flex-col grow justify-between'>
                        <div>
                          {/* Rating / Review Count */}
                          <div className='flex items-center justify-between text-xs font-rajdhani text-gray-400 mb-1.5'>
                            <span className='text-neonCyan font-bold tracking-widest uppercase'>
                              Xbox 360 Edition
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
                            className='font-orbitron font-bold text-lg text-white group-hover:text-neonCyan transition-colors line-clamp-1 cursor-pointer mb-2'
                            title={product.title}
                          >
                            {product.title}
                          </h3>

                          {/* Description snippet */}
                          <p className='font-rajdhani text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed mb-4'>
                            {product.description}
                          </p>
                        </div>

                        {/* Pricing & Cart Action */}
                        <div className='pt-3 border-t border-white/10 flex items-center justify-between mt-auto'>
                          <div className='flex flex-col'>
                            {product.discount > 0 ? (
                              <>
                                <span className='text-xs text-gray-500 line-through leading-none'>
                                  {product.price.toFixed(2)} PLN
                                </span>
                                <div className='font-orbitron font-extrabold text-xl text-neonPink text-glow-pink'>
                                  {finalPrice.toFixed(2)}{" "}
                                  <span className='text-xs font-bold text-gray-300'>
                                    PLN
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className='font-orbitron font-extrabold text-xl text-white text-glow-cyan'>
                                {product.price.toFixed(2)}{" "}
                                <span className='text-xs font-bold text-gray-300'>
                                  PLN
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Add to cart Button */}
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`flex items-center justify-center gap-2 py-2.5 px-4 font-rajdhani text-sm font-bold tracking-wider uppercase rounded-xl transition-all duration-300 active:scale-95 border ${
                              cartQty > 0
                                ? "bg-xboxGreen/20 border-xboxGreen text-xboxGreen hover:bg-xboxGreen hover:text-white shadow-[0_0_12px_rgba(16,124,16,0.4)]"
                                : product.discount > 0
                                  ? "bg-neonPink/10 border-neonPink/40 text-neonPink hover:bg-neonPink hover:text-black shadow-[0_0_12px_rgba(255,105,180,0.2)]"
                                  : "bg-white/5 border-white/20 text-white hover:bg-neonCyan hover:border-neonCyan hover:text-black hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]"
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
                                <span>Do koszyka</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Bottom Quick Cart Preview (Visible if cart has items) */}
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
              className='flex items-center gap-4 px-6 py-3.5 bg-[#0e0e12]/95 border-2 border-neonCyan rounded-full shadow-[0_0_30px_rgba(0,255,255,0.4)] backdrop-blur-xl hover:scale-105 transition-transform group'
            >
              <div className='relative'>
                <ShoppingCart className='w-5 h-5 text-neonCyan' />
                <span className='absolute -top-2 -right-2 w-5 h-5 rounded-full bg-neonPink text-black font-orbitron text-xs font-bold flex items-center justify-center'>
                  {totalCartCount}
                </span>
              </div>
              <div className='font-rajdhani font-bold text-sm tracking-wider text-white'>
                Twój Koszyk:{" "}
                <span className='text-neonCyan'>
                  {useCartStore.getState().total().toFixed(2)} PLN
                </span>
              </div>
              <span className='px-3 py-1 bg-neonCyan text-black font-rajdhani font-extrabold text-xs tracking-widest uppercase rounded-full group-hover:bg-white transition-colors'>
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
              className='relative w-full max-w-2xl bg-[#121218] border border-neonCyan/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,255,255,0.2)] overflow-hidden z-10'
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
                  <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-xboxGreen/20 text-xboxGreen border border-xboxGreen font-rajdhani text-xs font-bold tracking-widest uppercase'>
                    <Gamepad2 className='w-3.5 h-3.5' /> Xbox 360 Classic
                  </div>

                  <h2 className='font-orbitron font-extrabold text-2xl text-white text-glow-cyan'>
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
                      <span>Opinie graczy:</span>
                      <span className='text-amber-400 font-bold'>
                        ★ 4.9 ({selectedProductForModal.reviewCount} ocen)
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Stan nośnika:</span>
                      <span className='text-xboxGreen font-bold'>
                        Oryginalna płyta / Certyfikowana
                      </span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className='flex items-center justify-between pt-2'>
                    <div>
                      {selectedProductForModal.discount > 0 ? (
                        <>
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
                        </>
                      ) : (
                        <div className='font-orbitron font-extrabold text-2xl text-white text-glow-cyan'>
                          {selectedProductForModal.price.toFixed(2)} PLN
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        handleAddToCart(selectedProductForModal)
                        setSelectedProductForModal(null)
                      }}
                      className='px-6 py-3 bg-linear-to-r from-neonCyan to-neonBlue hover:from-neonCyan hover:to-neonCyan text-black font-rajdhani text-sm font-bold tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all flex items-center gap-2'
                    >
                      <ShoppingCart className='w-4 h-4' />
                      <span>Dodaj do koszyka</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Filter */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className='fixed inset-0 z-50 lg:hidden'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className='absolute inset-0 bg-black/80 backdrop-blur-sm'
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className='absolute inset-y-0 right-0 w-full max-w-sm bg-[#0e0e14] border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto'
            >
              <div className='space-y-6'>
                <div className='flex justify-between items-center'>
                  <h3 className='font-orbitron font-bold text-lg tracking-wider text-neonCyan flex items-center gap-2'>
                    <SlidersHorizontal className='w-5 h-5' />
                    FILTRY KATALOGU
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className='p-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:text-neonPink'
                  >
                    <X className='w-5 h-5' />
                  </button>
                </div>
                <div className='h-0.5 bg-linear-to-r from-neonCyan to-neonBlue shadow-[0_0_8px_#00ffff]' />

                {/* Search */}
                <div className='space-y-2'>
                  <label className='block font-rajdhani font-bold text-xs text-gray-400 tracking-wider'>
                    SZUKAJ GRY
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder='Wpisz szukaną frazę...'
                      className='w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-neonCyan text-white font-rajdhani placeholder-gray-600 focus:outline-none'
                    />
                    <Search className='w-4 h-4 text-gray-500 absolute left-3 top-3.5' />
                  </div>
                </div>

                {/* Price range slider */}
                <div className='space-y-3'>
                  <div className='flex justify-between items-center font-rajdhani font-bold text-xs tracking-wider'>
                    <span className='text-gray-400'>MAKS. CENA</span>
                    <span className='text-neonCyan font-orbitron'>
                      {maxPrice} PLN
                    </span>
                  </div>
                  <input
                    type='range'
                    min='15'
                    max='70'
                    step='5'
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className='w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neonCyan'
                  />
                </div>
              </div>

              {/* Action Buttons in drawer */}
              <div className='pt-8 space-y-3'>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className='w-full py-3 bg-linear-to-r from-neonCyan to-neonBlue text-black font-rajdhani text-sm font-bold tracking-widest uppercase rounded-xl shadow-lg'
                >
                  Pokaż ({sortedProducts.length}) Gier
                </button>
                <button
                  onClick={() => {
                    handleResetFilters()
                    setShowMobileFilters(false)
                  }}
                  className='w-full py-3 border border-white/10 text-white font-rajdhani text-sm font-bold tracking-widest uppercase rounded-xl bg-white/5'
                >
                  Resetuj Filtry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function StorePage() {
  return (
    <div className='min-h-screen flex flex-col bg-cyberDark'>
      <main className='grow relative'>
        {/* Glow Background Decorations */}
        <div className='absolute top-20 left-1/4 w-125 h-125 rounded-full bg-neonCyan/5 blur-[140px] pointer-events-none' />
        <div className='absolute bottom-20 right-1/4 w-125 h-125 rounded-full bg-neonBlue/5 blur-[140px] pointer-events-none' />

        <Suspense
          fallback={
            <div className='min-h-[70vh] flex flex-col items-center justify-center gap-4'>
              <div className='w-12 h-12 rounded-full border-4 border-t-neonCyan border-white/10 animate-spin shadow-[0_0_20px_#00ffff]' />
              <span className='font-orbitron text-sm tracking-widest text-neonCyan animate-pulse'>
                ŁADOWANIE KATALOGU GIER...
              </span>
            </div>
          }
        >
          <StoreContent />
        </Suspense>
      </main>
    </div>
  )
}

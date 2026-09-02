"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ShieldCheck,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Loader2,
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Crown,
  Gamepad2,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import {
  getAllOrders,
  updateOrderStatus,
  getAllProducts,
  type OrderDoc,
  type ProductDoc,
} from "@/lib/firebase-firestore"

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, isAdmin, loading: authLoading } = useAuth()

  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [products, setProducts] = useState<ProductDoc[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState<"stats" | "orders" | "products" | "users">("stats")
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [user, isAdmin, authLoading, router])

  // Load data
  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  const loadData = async () => {
    setLoadingData(true)
    try {
      const [ordersData, productsData] = await Promise.all([
        getAllOrders(),
        getAllProducts(),
      ])
      setOrders(ordersData)
      setProducts(productsData)
    } catch (err) {
      console.error("Error loading admin data:", err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: OrderDoc["status"]) => {
    setUpdatingOrder(orderId)
    try {
      await updateOrderStatus(orderId, status)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      )
    } catch (err) {
      console.error("Error updating order:", err)
    } finally {
      setUpdatingOrder(null)
    }
  }

  // Stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const completedOrders = orders.filter((o) => o.status === "completed").length
  const totalProducts = products.length
  const lowStockProducts = products.filter((p) => p.stock <= 2).length

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white">
        <Loader2 className="w-10 h-10 animate-spin text-neonCyan" />
        <span className="font-orbitron text-sm tracking-widest text-neonCyan mt-4 animate-pulse">
          WERYFIKOWANIE UPRAWNIEŃ...
        </span>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cyberDark text-white px-4">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="font-orbitron font-extrabold text-2xl text-white tracking-widest mb-2">
          BRAK DOSTĘPU
        </h1>
        <p className="font-rajdhani text-gray-400 font-semibold mb-6">
          Nie masz uprawnień administratora do tego panelu.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-neonCyan/10 border border-neonCyan/30 text-neonCyan font-rajdhani text-sm font-bold tracking-wider rounded-xl hover:bg-neonCyan/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Wróć na stronę główną
        </Link>
      </div>
    )
  }

  const stats = [
    {
      label: "Przychód łączny",
      value: `${totalRevenue.toFixed(2)} PLN`,
      icon: TrendingUp,
      color: "text-xboxGreen",
      bg: "bg-xboxGreen/10 border-xboxGreen/20",
    },
    {
      label: "Zamówienia (oczekujące)",
      value: pendingOrders,
      icon: Clock,
      color: "text-neonOrange",
      bg: "bg-neonOrange/10 border-neonOrange/20",
    },
    {
      label: "Zamówienia (zakończone)",
      value: completedOrders,
      icon: CheckCircle2,
      color: "text-xboxGreen",
      bg: "bg-xboxGreen/10 border-xboxGreen/20",
    },
    {
      label: "Produkty w katalogu",
      value: totalProducts,
      icon: Package,
      color: "text-neonCyan",
      bg: "bg-neonCyan/10 border-neonCyan/20",
    },
  ]

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
    <div className="min-h-screen flex flex-col bg-cyberDark text-white select-none relative overflow-hidden">
      <div className="absolute top-24 left-1/4 w-125 h-125 rounded-full bg-xboxGreen/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-24 right-1/4 w-125 h-125 rounded-full bg-neonCyan/5 blur-[140px] pointer-events-none" />

      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-xboxGreen/15 border border-xboxGreen/40 shadow-[0_0_15px_rgba(16,124,16,0.3)] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-xboxGreen" />
            </div>
            <div>
              <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl tracking-widest text-white">
                PANEL <span className="text-gradient-xbox">ADMINISTRATORA</span>
              </h1>
              <p className="font-rajdhani text-gray-400 font-semibold tracking-wider text-sm">
                Zarządzaj sklepem, zamówieniami i użytkownikami
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loadingData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-neonCyan bg-white/5 hover:bg-neonCyan/10 text-gray-300 hover:text-white font-rajdhani text-sm font-bold tracking-wider transition-all self-start"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
            Odśwież dane
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
          {[
            { id: "stats", label: "Przegląd", icon: TrendingUp },
            { id: "orders", label: "Zamówienia", icon: ShoppingCart },
            { id: "products", label: "Produkty", icon: Package },
            { id: "users", label: "Użytkownicy", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-rajdhani text-sm font-bold tracking-wider whitespace-nowrap transition-all duration-300 border ${
                  isActive
                    ? "bg-xboxGreen/15 border-xboxGreen text-xboxGreen shadow-[0_0_12px_rgba(16,124,16,0.2)]"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-xboxGreen" : ""}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-xboxGreen" />
            <span className="font-orbitron text-sm tracking-widest text-xboxGreen mt-4 animate-pulse">
              ŁADOWANIE DANYCH...
            </span>
          </div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === "stats" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`backdrop-blur-md bg-[#101014]/90 border rounded-2xl p-5 space-y-3 ${stat.bg}`}
                      >
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                        <p className="font-rajdhani text-xs font-bold text-gray-400 tracking-wider uppercase">
                          {stat.label}
                        </p>
                        <p className={`font-orbitron font-extrabold text-2xl ${stat.color}`}>
                          {stat.value}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Recent Orders Quick View */}
                <div className="backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
                  <h3 className="font-orbitron font-bold text-lg tracking-wider text-xboxGreen flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    OSTATNIE ZAMÓWIENIA
                  </h3>
                  <div className="h-0.5 bg-linear-to-r from-xboxGreen via-neonCyan to-transparent shadow-[0_0_8px_#00ffff]" />

                  {orders.length === 0 ? (
                    <p className="font-rajdhani text-gray-400 font-semibold text-center py-8">
                      Brak zamówień w systemie.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-rajdhani text-sm font-bold text-white truncate">
                              Zamówienie #{order.id?.slice(0, 8)}...
                            </p>
                            <p className="font-rajdhani text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString("pl-PL")} •{" "}
                              {order.items.length} prod.
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-orbitron font-bold text-sm text-white">
                              {order.total.toFixed(2)} PLN
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg border text-xs font-rajdhani font-bold ${statusColors[order.status]}`}>
                              {statusLabels[order.status]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {orders.length === 0 ? (
                  <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-3xl p-16 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="font-rajdhani text-gray-400 font-semibold">
                      Brak zamówień w systemie.
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-2xl p-5 space-y-3 hover:border-white/20 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-orbitron font-bold text-sm text-white">
                            Zamówienie #{order.id?.slice(0, 8)}...
                          </p>
                          <p className="font-rajdhani text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString("pl-PL")} • ID: {order.userId.slice(0, 12)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-orbitron font-bold text-lg text-xboxGreen">
                            {order.total.toFixed(2)} PLN
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(
                                order.id!,
                                e.target.value as OrderDoc["status"],
                              )
                            }
                            disabled={updatingOrder === order.id}
                            className="appearance-none bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 font-rajdhani text-xs font-bold text-white focus:outline-none focus:border-xboxGreen cursor-pointer"
                          >
                            <option value="pending">Oczekujące</option>
                            <option value="processing">W realizacji</option>
                            <option value="completed">Zakończone</option>
                            <option value="cancelled">Anulowane</option>
                          </select>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-xs font-rajdhani"
                          >
                            <Gamepad2 className="w-3.5 h-3.5 text-neonCyan shrink-0" />
                            <span className="text-gray-300 font-semibold truncate">
                              {item.title}
                            </span>
                            <span className="text-gray-500">×{item.quantity}</span>
                            <span className="text-white font-bold ml-auto">
                              {item.finalPrice.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.promoCode && (
                        <p className="font-rajdhani text-xs text-xboxGreen font-bold">
                          Kod rabatowy: {order.promoCode} (-{order.promoDiscount.toFixed(2)} PLN)
                        </p>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {products.length === 0 ? (
                  <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-3xl p-16 text-center">
                    <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="font-rajdhani text-gray-400 font-semibold">
                      Brak produktów w Firestore. Uruchom seed, aby dodać dane.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-2xl p-4 space-y-3 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-orbitron font-bold text-sm text-white truncate">
                              {product.title}
                            </h4>
                            <p className="font-rajdhani text-xs text-gray-500 truncate">
                              {product.description}
                            </p>
                          </div>
                          {product.featured && (
                            <span className="px-2 py-0.5 bg-xboxGreen/20 border border-xboxGreen/40 rounded text-[10px] font-orbitron font-bold text-xboxGreen shrink-0 ml-2">
                              TOP
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs font-rajdhani">
                          <span className="font-orbitron font-bold text-white">
                            {product.price.toFixed(2)} PLN
                          </span>
                          {product.discount > 0 && (
                            <span className="text-neonPink font-bold">-{product.discount}%</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-rajdhani text-gray-400">
                          <span>Stan: <strong className={product.stock <= 2 ? "text-red-400" : "text-white"}>{product.stock} szt.</strong></span>
                          <span>Oceny: {product.reviewCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Users Tab (placeholder) */}
            {activeTab === "users" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-3xl p-8 text-center space-y-4"
              >
                <Crown className="w-12 h-12 text-xboxGreen mx-auto" />
                <h3 className="font-orbitron font-bold text-xl text-white tracking-wider">
                  ZARZĄDZANIE UŻYTKOWNIKAMI
                </h3>
                <p className="font-rajdhani text-gray-400 font-semibold max-w-md mx-auto">
                  Lista użytkowników jest dostępna w konsoli Firebase. W przyszłej
                  wersji dodamy pełny panel CRUD do zarządzania kontami i rolami.
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-2 text-sm font-rajdhani text-gray-400">
                  <AlertCircle className="w-4 h-4 text-neonOrange" />
                  Funkcja w przygotowaniu — użyj Firebase Console do zarządzania rolami.
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

"use client"

import React, { useCallback, useEffect, useState, type FormEvent } from "react"
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
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Crown,
  Gamepad2,
  Trash2,
  UserMinus,
  Plus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Pencil,
  X,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllUsers,
  deleteUserProfile,
  type OrderDoc,
  type ProductDoc,
  type UserProfile,
} from "@/lib/firebase-firestore"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [products, setProducts] = useState<ProductDoc[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState<"stats" | "orders" | "products" | "users">("stats")
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [savingProduct, setSavingProduct] = useState<string | null>(null)
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})
  const [editFormData, setEditFormData] = useState<{
    title: string
    description: string
    price: string
    image: string
    stock: string
    featured: boolean
    discount: string
    category: string
  }>({
    title: "",
    description: "",
    price: "",
    image: "",
    stock: "",
    featured: false,
    discount: "",
    category: "xbox360",
  })
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [submittingProduct, setSubmittingProduct] = useState(false)
  const [productFormErrors, setProductFormErrors] = useState<Record<string, string>>({})
  const [addImageFailed, setAddImageFailed] = useState(false)
  const [editImageFailed, setEditImageFailed] = useState(false)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserProfile | null>(null)
  const [newProduct, setNewProduct] = useState<{
    title: string
    description: string
    price: string
    image: string
    stock: string
    featured: boolean
    discount: string
    category: string
  }>({
    title: "",
    description: "",
    price: "",
    image: "",
    stock: "",
    featured: false,
    discount: "",
    category: "xbox360",
  })

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [user, isAdmin, authLoading, router])

  const loadData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [ordersData, productsData, usersData] = await Promise.all([
        getAllOrders(),
        getAllProducts(),
        getAllUsers(),
      ])
      setOrders(ordersData)
      setProducts(productsData)
      setUsers(usersData)
    } catch (err: unknown) {
      console.error("Error loading admin data:", err)
    } finally {
      setLoadingData(false)
    }
  }, [])

  // Load data
  useEffect(() => {
    if (!isAdmin) return
    let isMounted = true

    async function fetchData() {
      try {
        const [ordersData, productsData, usersData] = await Promise.all([
          getAllOrders(),
          getAllProducts(),
          getAllUsers(),
        ])
        if (isMounted) {
          setOrders(ordersData)
          setProducts(productsData)
          setUsers(usersData)
        }
      } catch (err: unknown) {
        console.error("Error loading admin data:", err)
      } finally {
        if (isMounted) {
          setLoadingData(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [isAdmin])

  const handleUpdateOrderStatus = async (orderId: string, status: OrderDoc["status"]) => {
    setUpdatingOrder(orderId)
    try {
      await updateOrderStatus(orderId, status)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      )
    } catch (err: unknown) {
      console.error("Error updating order:", err)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Na pewno chcesz usunąć to zamówienie?")) return
    setDeletingOrder(orderId)
    try {
      await deleteOrder(orderId)
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
    } catch (err: unknown) {
      console.error("Error deleting order:", err)
    } finally {
      setDeletingOrder(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!confirmDeleteUser) return
    setDeletingUser(confirmDeleteUser.uid)
    try {
      await deleteUserProfile(confirmDeleteUser.uid)
      setUsers((prev) => prev.filter((u) => u.uid !== confirmDeleteUser.uid))
    } catch (err: unknown) {
      console.error("Error deleting user:", err)
    } finally {
      setDeletingUser(null)
      setConfirmDeleteUser(null)
    }
  }

  const validateProductForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!newProduct.title.trim()) errors.title = "Nazwa produktu jest wymagana"
    else if (newProduct.title.trim().length < 3) errors.title = "Nazwa musi mieć co najmniej 3 znaki"

    if (!newProduct.description.trim()) errors.description = "Opis jest wymagany"
    else if (newProduct.description.trim().length < 10) errors.description = "Opis musi mieć co najmniej 10 znaków"

    const price = parseFloat(newProduct.price)
    if (!newProduct.price.trim()) errors.price = "Cena jest wymagana"
    else if (isNaN(price) || price <= 0) errors.price = "Cena musi być liczbą większą od 0"
    else if (price > 99999) errors.price = "Cena nie może przekraczać 99 999 PLN"

    if (!newProduct.image.trim()) errors.image = "URL obrazu jest wymagany"
    else if (!/^https?:\/\/.+/.test(newProduct.image.trim())) errors.image = "Podaj prawidłowy URL (https://...)"

    const stock = parseInt(newProduct.stock, 10)
    if (!newProduct.stock.trim()) errors.stock = "Stan magazynowy jest wymagany"
    else if (isNaN(stock) || stock < 0) errors.stock = "Stan musi być liczbą nieujemną"
    else if (stock > 99999) errors.stock = "Stan nie może przekraczać 99 999"

    const discount = parseInt(newProduct.discount, 10)
    if (newProduct.discount.trim() && (isNaN(discount) || discount < 0 || discount > 100)) {
      errors.discount = "Rabat musi być w zakresie 0-100%"
    }

    if (!newProduct.category.trim()) errors.category = "Kategoria jest wymagana"

    setProductFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateProductForm()) return

    setSubmittingProduct(true)
    try {
      const price = parseFloat(newProduct.price)
      const discount = newProduct.discount.trim() ? parseInt(newProduct.discount, 10) : 0
      const stock = parseInt(newProduct.stock, 10)

      const productData = {
        id: "",
        title: newProduct.title.trim(),
        description: newProduct.description.trim(),
        price,
        image: newProduct.image.trim(),
        stock,
        featured: newProduct.featured,
        discount,
        reviewCount: 0,
        category: newProduct.category.trim(),
      }

      const newId = await createProduct(productData)

      setProducts((prev) => [{ ...productData, id: newId, createdAt: new Date().toISOString() }, ...prev])
      setNewProduct({
        title: "",
        description: "",
        price: "",
        image: "",
        stock: "",
        featured: false,
        discount: "",
        category: "xbox360",
      })
      setProductFormErrors({})
      setShowAddProduct(false)
    } catch (err: unknown) {
      console.error("Error adding product:", err)
      setProductFormErrors({ submit: "Wystąpił błąd podczas dodawania produktu. Spróbuj ponownie." })
    } finally {
      setSubmittingProduct(false)
    }
  }

  const handleStartEdit = (product: ProductDoc) => {
    setEditingProductId(product.id)
    setEditImageFailed(false)
    setEditFormData({
      title: product.title,
      description: product.description,
      price: String(product.price),
      image: product.image,
      stock: String(product.stock),
      featured: product.featured,
      discount: product.discount > 0 ? String(product.discount) : "",
      category: product.category,
    })
    setEditFormErrors({})
  }

  const handleCancelEdit = () => {
    setEditingProductId(null)
    setEditFormErrors({})
  }

  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!editFormData.title.trim()) errors.title = "Nazwa jest wymagana"
    else if (editFormData.title.trim().length < 3) errors.title = "Min. 3 znaki"

    if (!editFormData.description.trim()) errors.description = "Opis jest wymagany"
    else if (editFormData.description.trim().length < 10) errors.description = "Min. 10 znaków"

    const price = parseFloat(editFormData.price)
    if (!editFormData.price.trim()) errors.price = "Cena jest wymagana"
    else if (isNaN(price) || price <= 0) errors.price = "Cena > 0"
    else if (price > 99999) errors.price = "Max 99 999"

    if (!editFormData.image.trim()) errors.image = "URL jest wymagany"
    else if (!/^https?:\/\/.+/.test(editFormData.image.trim())) errors.image = "Prawidłowy URL"

    const stock = parseInt(editFormData.stock, 10)
    if (!editFormData.stock.trim()) errors.stock = "Wymagane"
    else if (isNaN(stock) || stock < 0) errors.stock = "≥ 0"
    else if (stock > 99999) errors.stock = "Max 99 999"

    const discount = parseInt(editFormData.discount, 10)
    if (editFormData.discount.trim() && (isNaN(discount) || discount < 0 || discount > 100)) {
      errors.discount = "0-100%"
    }

    setEditFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveEdit = async (productId: string) => {
    if (!validateEditForm()) return

    setSavingProduct(productId)
    try {
      const price = parseFloat(editFormData.price)
      const discount = editFormData.discount.trim() ? parseInt(editFormData.discount, 10) : 0
      const stock = parseInt(editFormData.stock, 10)

      const updated: Partial<ProductDoc> = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        price,
        image: editFormData.image.trim(),
        stock,
        featured: editFormData.featured,
        discount,
        category: editFormData.category.trim(),
      }

      await updateProduct(productId, updated)

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updated } : p)),
      )
      setEditingProductId(null)
      setEditFormErrors({})
    } catch (err: unknown) {
      console.error("Error updating product:", err)
      setEditFormErrors({ submit: "Błąd zapisu. Spróbuj ponownie." })
    } finally {
      setSavingProduct(null)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Na pewno chcesz usunąć ten produkt?")) return
    setDeletingProduct(productId)
    try {
      await deleteProduct(productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (err: unknown) {
      console.error("Error deleting product:", err)
    } finally {
      setDeletingProduct(null)
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

  const statusColors: Record<OrderDoc["status"], string> = {
    pending: "bg-neonOrange/20 text-neonOrange border-neonOrange/30",
    processing: "bg-neonCyan/20 text-neonCyan border-neonCyan/30",
    completed: "bg-xboxGreen/20 text-xboxGreen border-xboxGreen/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  const statusLabels: Record<OrderDoc["status"], string> = {
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
                          <button
                            onClick={() => handleDeleteOrder(order.id!)}
                            disabled={deletingOrder === order.id}
                            className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Usuń zamówienie"
                          >
                            {deletingOrder === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
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
                className="space-y-6"
              >
                {/* Add Product Toggle */}
                <button
                  onClick={() => {
                    setShowAddProduct(!showAddProduct)
                    setProductFormErrors({})
                    setAddImageFailed(false)
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 backdrop-blur-md bg-[#101014]/90 border border-xboxGreen/30 rounded-2xl hover:border-xboxGreen/60 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-xboxGreen/15 border border-xboxGreen/40 flex items-center justify-center shadow-[0_0_12px_rgba(16,124,16,0.2)]">
                      <Plus className="w-5 h-5 text-xboxGreen" />
                    </div>
                    <div className="text-left">
                      <p className="font-orbitron font-bold text-sm text-white tracking-wider">
                        DODAJ NOWY PRODUKT
                      </p>
                      <p className="font-rajdhani text-xs text-gray-500 font-semibold">
                        Uzupełnij dane i dodaj grę do katalogu sklepu
                      </p>
                    </div>
                  </div>
                  {showAddProduct ? (
                    <ChevronUp className="w-5 h-5 text-xboxGreen group-hover:scale-110 transition-transform" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-xboxGreen group-hover:scale-110 transition-all" />
                  )}
                </button>

                {/* Add Product Form */}
                {showAddProduct && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddProduct}
                    className="backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden"
                  >
                    {/* Form Header */}
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-xboxGreen" />
                        <h3 className="font-orbitron font-bold text-lg tracking-wider text-xboxGreen">
                          NOWY PRODUKT
                        </h3>
                      </div>
                      <div className="h-0.5 bg-linear-to-r from-xboxGreen via-neonCyan to-transparent mt-3 shadow-[0_0_8px_#00ffff]" />
                    </div>

                    {productFormErrors.submit && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-rajdhani text-sm font-semibold">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{productFormErrors.submit}</span>
                      </div>
                    )}

                    {/* Row 1: Title + Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                          Nazwa produktu <span className="text-neonPink">*</span>
                        </label>
                        <input
                          type="text"
                          value={newProduct.title}
                          onChange={(e) => setNewProduct((p) => ({ ...p, title: e.target.value }))}
                          placeholder="np. Halo 3"
                          className={`w-full px-4 py-3 bg-white/5 border rounded-xl font-rajdhani text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                            productFormErrors.title
                              ? "border-red-500/50 focus:border-red-400"
                              : "border-white/10 focus:border-xboxGreen"
                          }`}
                        />
                        {productFormErrors.title && (
                          <p className="font-rajdhani text-xs text-red-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {productFormErrors.title}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                          Kategoria <span className="text-neonPink">*</span>
                        </label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                          className={`w-full px-4 py-3 bg-white/5 border rounded-xl font-rajdhani text-sm text-white focus:outline-none transition-colors cursor-pointer appearance-none ${
                            productFormErrors.category
                              ? "border-red-500/50 focus:border-red-400"
                              : "border-white/10 focus:border-xboxGreen"
                          }`}
                        >
                          <option value="xbox360">Xbox 360</option>
                          <option value="xboxone">Xbox One</option>
                          <option value="xboxseries">Xbox Series X|S</option>
                          <option value="accessories">Akcesoria</option>
                        </select>
                        {productFormErrors.category && (
                          <p className="font-rajdhani text-xs text-red-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {productFormErrors.category}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Description */}
                    <div className="space-y-2">
                      <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                        Opis produktu <span className="text-neonPink">*</span>
                      </label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Szczegółowy opis gry..."
                        rows={3}
                        className={`w-full px-4 py-3 bg-white/5 border rounded-xl font-rajdhani text-sm text-white placeholder-gray-600 focus:outline-none transition-colors resize-none ${
                          productFormErrors.description
                            ? "border-red-500/50 focus:border-red-400"
                            : "border-white/10 focus:border-xboxGreen"
                        }`}
                      />
                      {productFormErrors.description && (
                        <p className="font-rajdhani text-xs text-red-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {productFormErrors.description}
                        </p>
                      )}
                    </div>

                    {/* Row 3: Image URL */}
                    <div className="space-y-2">
                      <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                        URL obrazu <span className="text-neonPink">*</span>
                      </label>
                      <input
                        type="url"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct((p) => ({ ...p, image: e.target.value }))}
                        placeholder="https://images.example.com/game-cover.jpg"
                        className={`w-full px-4 py-3 bg-white/5 border rounded-xl font-rajdhani text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                          productFormErrors.image
                            ? "border-red-500/50 focus:border-red-400"
                            : "border-white/10 focus:border-xboxGreen"
                        }`}
                      />
                      {productFormErrors.image && (
                        <p className="font-rajdhani text-xs text-red-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {productFormErrors.image}
                        </p>
                      )}

                      {/* Add Product Image Preview */}
                      {newProduct.image.trim() && /^https?:\/\/.+/.test(newProduct.image.trim()) && (
                        <div className="relative mt-2 w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={addImageFailed ? `https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80&text=${encodeURIComponent(newProduct.title || "Podgląd")}` : newProduct.image.trim()}
                            alt="Podgląd produktu"
                            className="w-full h-full object-cover"
                            onError={() => setAddImageFailed(true)}
                            onLoad={() => setAddImageFailed(false)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <span className="absolute bottom-2 left-2 font-rajdhani text-[10px] font-bold text-gray-300 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                            PODGLĄD OKŁADKI
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Row 4: Price, Stock, Discount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                          Cena (PLN) <span className="text-neonPink">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                          placeholder="49.99"
                          className={`w-full px-4 py-3 bg-white/5 border rounded-xl font-rajdhani text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                            productFormErrors.price
                              ? "border-red-500/50 focus:border-red-400"
                              : "border-white/10 focus:border-xboxGreen"
                          }`}
                        />
                        {productFormErrors.price && (
                          <p className="font-rajdhani text-xs text-red-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {productFormErrors.price}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                          Stan magazynowy <span className="text-neonPink">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))}
                          placeholder="10"
                          className={`w-full px-4 py-3 bg-white/5 border rounded-xl font-rajdhani text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                            productFormErrors.stock
                              ? "border-red-500/50 focus:border-red-400"
                              : "border-white/10 focus:border-xboxGreen"
                          }`}
                        />
                        {productFormErrors.stock && (
                          <p className="font-rajdhani text-xs text-red-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {productFormErrors.stock}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block font-rajdhani font-bold text-xs text-gray-400 tracking-wider uppercase">
                          Rabat (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newProduct.discount}
                          onChange={(e) => setNewProduct((p) => ({ ...p, discount: e.target.value }))}
                          placeholder="0"
                          className={`w-full px-4 py-3 bg-white/5 border rounded-xl font-rajdhani text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                            productFormErrors.discount
                              ? "border-red-500/50 focus:border-red-400"
                              : "border-white/10 focus:border-xboxGreen"
                          }`}
                        />
                        {productFormErrors.discount && (
                          <p className="font-rajdhani text-xs text-red-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {productFormErrors.discount}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 5: Featured toggle + Preview */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setNewProduct((p) => ({ ...p, featured: !p.featured }))}
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                            newProduct.featured
                              ? "bg-xboxGreen shadow-[0_0_12px_rgba(16,124,16,0.4)]"
                              : "bg-white/10 border border-white/20"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                              newProduct.featured ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                        <div>
                          <p className="font-rajdhani font-bold text-sm text-white">
                            Wyróżniony produkt
                          </p>
                          <p className="font-rajdhani text-xs text-gray-500">
                            Wyświetlany na stronie głównej w sekcji "Klasyki"
                          </p>
                        </div>
                      </div>

                      {/* Price Preview */}
                      {newProduct.price && parseFloat(newProduct.price) > 0 && (
                        <div className="flex items-center gap-3">
                          {newProduct.discount && parseInt(newProduct.discount, 10) > 0 && (
                            <span className="font-rajdhani text-xs text-gray-500 line-through">
                              {parseFloat(newProduct.price).toFixed(2)} PLN
                            </span>
                          )}
                          <span className="font-orbitron font-bold text-lg text-neonCyan">
                            {(
                              parseFloat(newProduct.price) *
                              (1 - (parseInt(newProduct.discount, 10) || 0) / 100)
                            ).toFixed(2)} PLN
                          </span>
                          {newProduct.discount && parseInt(newProduct.discount, 10) > 0 && (
                            <span className="px-2 py-0.5 bg-neonPink/20 border border-neonPink/40 rounded text-[10px] font-orbitron font-bold text-neonPink">
                              -{newProduct.discount}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProduct(false)
                          setProductFormErrors({})
                        }}
                        className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-rajdhani text-sm font-bold tracking-wider transition-all"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        disabled={submittingProduct}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-xboxGreen to-xboxGreen-light text-black font-rajdhani text-sm font-bold tracking-wider shadow-[0_0_15px_rgba(16,124,16,0.3)] hover:shadow-[0_0_25px_rgba(16,124,16,0.5)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {submittingProduct ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Dodawanie...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Dodaj produkt
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
                {products.length === 0 ? (
                  <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-3xl p-16 text-center">
                    <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="font-rajdhani text-gray-400 font-semibold">
                      Brak produktów w Firestore. Uruchom seed, aby dodać dane.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => {
                      const isEditing = editingProductId === product.id

                      // ── Inline Edit Mode ──
                      if (isEditing) {
                        return (
                          <div
                            key={product.id}
                            className="backdrop-blur-md bg-[#101014]/90 border border-xboxGreen/40 rounded-2xl p-4 space-y-3 shadow-[0_0_20px_rgba(16,124,16,0.1)]"
                          >
                            {/* Edit Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Pencil className="w-4 h-4 text-xboxGreen" />
                                <span className="font-orbitron font-bold text-xs text-xboxGreen tracking-wider">
                                  EDYCJA PRODUKTU
                                </span>
                              </div>
                              <button
                                onClick={handleCancelEdit}
                                disabled={savingProduct === product.id}
                                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                title="Anuluj edycję"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="h-0.5 bg-linear-to-r from-xboxGreen via-neonCyan to-transparent shadow-[0_0_6px_#00ffff]" />

                            {editFormErrors.submit && (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-rajdhani text-xs font-semibold">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{editFormErrors.submit}</span>
                              </div>
                            )}

                            {/* Title */}
                            <div className="space-y-1">
                              <label className="font-rajdhani font-bold text-[10px] text-gray-400 tracking-wider uppercase">
                                Nazwa <span className="text-neonPink">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.title}
                                onChange={(e) => setEditFormData((p) => ({ ...p, title: e.target.value }))}
                                className={`w-full px-3 py-2 bg-white/5 border rounded-lg font-rajdhani text-xs text-white focus:outline-none transition-colors ${
                                  editFormErrors.title ? "border-red-500/50" : "border-white/10 focus:border-xboxGreen"
                                }`}
                              />
                              {editFormErrors.title && (
                                <p className="font-rajdhani text-[10px] text-red-400 font-semibold">{editFormErrors.title}</p>
                              )}
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                              <label className="font-rajdhani font-bold text-[10px] text-gray-400 tracking-wider uppercase">
                                Opis <span className="text-neonPink">*</span>
                              </label>
                              <textarea
                                value={editFormData.description}
                                onChange={(e) => setEditFormData((p) => ({ ...p, description: e.target.value }))}
                                rows={2}
                                className={`w-full px-3 py-2 bg-white/5 border rounded-lg font-rajdhani text-xs text-white focus:outline-none transition-colors resize-none ${
                                  editFormErrors.description ? "border-red-500/50" : "border-white/10 focus:border-xboxGreen"
                                }`}
                              />
                              {editFormErrors.description && (
                                <p className="font-rajdhani text-[10px] text-red-400 font-semibold">{editFormErrors.description}</p>
                              )}
                            </div>

                            {/* Image URL */}
                            <div className="space-y-1">
                              <label className="font-rajdhani font-bold text-[10px] text-gray-400 tracking-wider uppercase">
                                URL obrazu <span className="text-neonPink">*</span>
                              </label>
                              <input
                                type="url"
                                value={editFormData.image}
                                onChange={(e) => setEditFormData((p) => ({ ...p, image: e.target.value }))}
                                className={`w-full px-3 py-2 bg-white/5 border rounded-lg font-rajdhani text-xs text-white focus:outline-none transition-colors ${
                                  editFormErrors.image ? "border-red-500/50" : "border-white/10 focus:border-xboxGreen"
                                }`}
                              />                            {editFormErrors.image && (
                              <p className="font-rajdhani text-[10px] text-red-400 font-semibold">{editFormErrors.image}</p>
                            )}

                            {/* Edit Product Image Preview */}
                            {editFormData.image.trim() && /^https?:\/\/.+/.test(editFormData.image.trim()) && (
                              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/40">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={editImageFailed ? `https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80&text=${encodeURIComponent(editFormData.title || "Podgląd")}` : editFormData.image.trim()}
                                  alt="Podgląd produktu"
                                  className="w-full h-full object-cover"
                                  onError={() => setEditImageFailed(true)}
                                  onLoad={() => setEditImageFailed(false)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                <span className="absolute bottom-1.5 left-2 font-rajdhani text-[9px] font-bold text-gray-300 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                  PODGLĄD
                                </span>
                              </div>
                            )}
                          </div>

                            {/* Price / Stock / Discount */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <label className="font-rajdhani font-bold text-[10px] text-gray-400 tracking-wider uppercase">
                                  Cena <span className="text-neonPink">*</span>
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editFormData.price}
                                  onChange={(e) => setEditFormData((p) => ({ ...p, price: e.target.value }))}
                                  className={`w-full px-2.5 py-2 bg-white/5 border rounded-lg font-rajdhani text-xs text-white focus:outline-none transition-colors ${
                                    editFormErrors.price ? "border-red-500/50" : "border-white/10 focus:border-xboxGreen"
                                  }`}
                                />
                                {editFormErrors.price && (
                                  <p className="font-rajdhani text-[10px] text-red-400 font-semibold">{editFormErrors.price}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <label className="font-rajdhani font-bold text-[10px] text-gray-400 tracking-wider uppercase">
                                  Stan <span className="text-neonPink">*</span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={editFormData.stock}
                                  onChange={(e) => setEditFormData((p) => ({ ...p, stock: e.target.value }))}
                                  className={`w-full px-2.5 py-2 bg-white/5 border rounded-lg font-rajdhani text-xs text-white focus:outline-none transition-colors ${
                                    editFormErrors.stock ? "border-red-500/50" : "border-white/10 focus:border-xboxGreen"
                                  }`}
                                />
                                {editFormErrors.stock && (
                                  <p className="font-rajdhani text-[10px] text-red-400 font-semibold">{editFormErrors.stock}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <label className="font-rajdhani font-bold text-[10px] text-gray-400 tracking-wider uppercase">
                                  Rabat %
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={editFormData.discount}
                                  onChange={(e) => setEditFormData((p) => ({ ...p, discount: e.target.value }))}
                                  className={`w-full px-2.5 py-2 bg-white/5 border rounded-lg font-rajdhani text-xs text-white focus:outline-none transition-colors ${
                                    editFormErrors.discount ? "border-red-500/50" : "border-white/10 focus:border-xboxGreen"
                                  }`}
                                />
                                {editFormErrors.discount && (
                                  <p className="font-rajdhani text-[10px] text-red-400 font-semibold">{editFormErrors.discount}</p>
                                )}
                              </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-1">
                              <label className="font-rajdhani font-bold text-[10px] text-gray-400 tracking-wider uppercase">
                                Kategoria
                              </label>
                              <select
                                value={editFormData.category}
                                onChange={(e) => setEditFormData((p) => ({ ...p, category: e.target.value }))}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg font-rajdhani text-xs text-white focus:outline-none focus:border-xboxGreen cursor-pointer transition-colors"
                              >
                                <option value="xbox360">Xbox 360</option>
                                <option value="xboxone">Xbox One</option>
                                <option value="xboxseries">Xbox Series X|S</option>
                                <option value="accessories">Akcesoria</option>
                              </select>
                            </div>

                            {/* Featured Toggle */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditFormData((p) => ({ ...p, featured: !p.featured }))}
                                className={`relative w-9 h-5 rounded-full transition-all duration-300 ${
                                  editFormData.featured
                                    ? "bg-xboxGreen shadow-[0_0_8px_rgba(16,124,16,0.4)]"
                                    : "bg-white/10 border border-white/20"
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                                    editFormData.featured ? "translate-x-4.5" : "translate-x-0.5"
                                  }`}
                                />
                              </button>
                              <span className="font-rajdhani text-xs text-gray-400 font-semibold">
                                Wyróżniony
                              </span>
                            </div>

                            {/* Price Preview */}
                            {editFormData.price && parseFloat(editFormData.price) > 0 && (
                              <div className="flex items-center gap-2 text-xs font-rajdhani">
                                {editFormData.discount && parseInt(editFormData.discount, 10) > 0 && (
                                  <span className="text-gray-500 line-through">
                                    {parseFloat(editFormData.price).toFixed(2)} PLN
                                  </span>
                                )}
                                <span className="font-orbitron font-bold text-neonCyan">
                                  {(
                                    parseFloat(editFormData.price) *
                                    (1 - (parseInt(editFormData.discount, 10) || 0) / 100)
                                  ).toFixed(2)} PLN
                                </span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={handleCancelEdit}
                                disabled={savingProduct === product.id}
                                className="flex-1 py-2 rounded-lg border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-rajdhani text-xs font-bold tracking-wider transition-all"
                              >
                                Anuluj
                              </button>
                              <button
                                onClick={() => handleSaveEdit(product.id)}
                                disabled={savingProduct === product.id}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-xboxGreen/20 border border-xboxGreen text-xboxGreen hover:bg-xboxGreen hover:text-black font-rajdhani text-xs font-bold tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_8px_rgba(16,124,16,0.2)]"
                              >
                                {savingProduct === product.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                Zapisz
                              </button>
                            </div>
                          </div>
                        )
                      }

                      // ── Display Mode ──
                      return (
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

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStartEdit(product)}
                              disabled={editingProductId !== null || deletingProduct === product.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-neonCyan/30 bg-neonCyan/10 text-neonCyan hover:bg-neonCyan/20 hover:text-neonCyan transition-all disabled:opacity-50 disabled:cursor-not-allowed font-rajdhani text-xs font-bold"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edytuj
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deletingProduct === product.id || editingProductId !== null}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-rajdhani text-xs font-bold"
                            >
                              {deletingProduct === product.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Usuń
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {users.length === 0 ? (
                  <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-3xl p-16 text-center">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="font-rajdhani text-gray-400 font-semibold">
                      Brak użytkowników w systemie.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-rajdhani text-sm text-gray-400 font-semibold">
                        Łącznie: <span className="text-white font-bold">{users.length}</span> użytkowników
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.map((u) => (
                        <div
                          key={u.uid}
                          className="backdrop-blur-md bg-[#101014]/90 border border-white/10 rounded-2xl p-5 space-y-3 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-xboxGreen/15 border border-xboxGreen/40 flex items-center justify-center">
                                <Users className="w-5 h-5 text-xboxGreen" />
                              </div>
                              <div>
                                <p className="font-orbitron font-bold text-sm text-white">
                                  {u.displayName || "Gracz"}
                                </p>
                                <p className="font-rajdhani text-xs text-gray-500 truncate max-w-[160px]">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                            {u.role === "admin" && (
                              <span className="px-2 py-0.5 bg-xboxGreen/20 border border-xboxGreen/40 rounded text-[10px] font-orbitron font-bold text-xboxGreen">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="h-0.5 bg-white/5" />
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="font-orbitron font-bold text-sm text-neonCyan">
                                {u.ordersCount}
                              </p>
                              <p className="font-rajdhani text-[10px] text-gray-500 font-bold uppercase">
                                Zamówienia
                              </p>
                            </div>
                            <div>
                              <p className="font-orbitron font-bold text-sm text-xboxGreen">
                                {u.totalSpent.toFixed(2)}
                              </p>
                              <p className="font-rajdhani text-[10px] text-gray-500 font-bold uppercase">
                                Wydano PLN
                              </p>
                            </div>
                            <div>
                              <p className="font-orbitron font-bold text-sm text-neonPink">
                                {u.wishlist.length}
                              </p>
                              <p className="font-rajdhani text-[10px] text-gray-500 font-bold uppercase">
                                Wishlist
                              </p>
                            </div>
                          </div>
                          <p className="font-rajdhani text-[10px] text-gray-600">
                            Konto od: {new Date(u.createdAt).toLocaleDateString("pl-PL")}
                          </p>
                          {/* Delete Button */}
                          <button
                            onClick={() => setConfirmDeleteUser(u)}
                            disabled={deletingUser === u.uid || u.role === "admin"}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-rajdhani text-xs font-bold"
                            title={u.role === "admin" ? "Nie można usunąć administratora" : "Usuń użytkownika"}
                          >
                            {deletingUser === u.uid ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserMinus className="w-3.5 h-3.5" />
                            )}
                            Usuń
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Delete User Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !deletingUser && setConfirmDeleteUser(null)}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm bg-[#101014] border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-sm text-white tracking-wider">
                  USUŃ UŻYTKOWNIKA
                </h3>
                <p className="font-rajdhani text-xs text-gray-500 font-semibold">
                  Tej operacji nie można cofnąć
                </p>
              </div>
            </div>
            <div className="h-px bg-white/10" />
            <p className="font-rajdhani text-sm text-gray-300 font-semibold">
              Na pewno chcesz usunąć użytkownika
              <span className="text-white font-bold"> {confirmDeleteUser.displayName || "Gracz"}</span>
              <span className="text-gray-500"> ({confirmDeleteUser.email})</span>?
            </p>
            <p className="font-rajdhani text-xs text-red-400/80 font-semibold">
              Usunięcie dokumentu profilu z Firebase — konto auth pozostanie.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setConfirmDeleteUser(null)}
                disabled={deletingUser === confirmDeleteUser.uid}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-rajdhani text-sm font-bold tracking-wider transition-all disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deletingUser === confirmDeleteUser.uid}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-rajdhani text-sm font-bold tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(239,68,68,0.2)]"
              >
                {deletingUser === confirmDeleteUser.uid ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Usuwanie...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Usuń
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

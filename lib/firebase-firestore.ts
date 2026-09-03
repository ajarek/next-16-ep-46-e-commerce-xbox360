import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
import { getFirebaseDB } from "@/lib/firebase"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  role: "user" | "admin"
  createdAt: string
  updatedAt: string
  ordersCount: number
  totalSpent: number
  wishlist: number[] // product ids
}

export interface ProductDoc {
  id: string
  title: string
  description: string
  price: number
  image: string
  stock: number
  featured: boolean
  discount: number
  reviewCount: number
  category: string
  createdAt: string
}

export interface OrderItem {
  productId: string
  title: string
  image: string
  quantity: number
  unitPrice: number
  finalPrice: number
}

export interface OrderDoc {
  id?: string
  userId: string
  items: OrderItem[]
  subtotal: number
  promoDiscount: number
  total: number
  promoCode: string | null
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: string
}

export interface ReviewDoc {
  id?: string
  productId: number
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Lazy collection refs
// ─────────────────────────────────────────────────────────────────────────────

function usersCol() { return collection(getFirebaseDB(), "users") }
function productsCol() { return collection(getFirebaseDB(), "products") }
function ordersCol() { return collection(getFirebaseDB(), "orders") }
function reviewsCol() { return collection(getFirebaseDB(), "reviews") }

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "createdAt" | "updatedAt" | "ordersCount" | "totalSpent" | "wishlist">,
) {
  const now = new Date().toISOString()
  const profile: UserProfile = {
    ...data,
    role: data.role || "user",
    createdAt: now,
    updatedAt: now,
    ordersCount: 0,
    totalSpent: 0,
    wishlist: [],
  }
  await setDoc(doc(usersCol(), uid), profile)
  return profile
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(usersCol(), uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>,
) {
  await updateDoc(doc(usersCol(), uid), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function toggleWishlist(uid: string, productId: number) {
  const profile = await getUserProfile(uid)
  if (!profile) return
  const wishlist = profile.wishlist.includes(productId)
    ? profile.wishlist.filter((id) => id !== productId)
    : [...profile.wishlist, productId]
  await updateDoc(doc(usersCol(), uid), { wishlist, updatedAt: new Date().toISOString() })
}

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

export async function createProduct(data: Omit<ProductDoc, "createdAt">) {
  const now = new Date().toISOString()
  const ref = await addDoc(productsCol(), { ...data, createdAt: now })
  return ref.id
}

export async function getProduct(productId: string): Promise<ProductDoc | null> {
  const snap = await getDoc(doc(productsCol(), productId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as ProductDoc
}

export async function getAllProducts(): Promise<ProductDoc[]> {
  const snap = await getDocs(productsCol())
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductDoc))
}

export async function getProductsByCategory(category: string): Promise<ProductDoc[]> {
  const q = query(productsCol(), where("category", "==", category))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductDoc))
}

export async function updateProduct(productId: string, data: Partial<ProductDoc>) {
  await updateDoc(doc(productsCol(), productId), data)
}

export async function deleteProduct(productId: string) {
  await deleteDoc(doc(productsCol(), productId))
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────────────────

export async function createOrder(data: Omit<OrderDoc, "createdAt" | "id">) {
  const now = new Date().toISOString()
  const ref = await addDoc(ordersCol(), { ...data, createdAt: now })

  // Update user profile stats
  const userSnap = await getDoc(doc(usersCol(), data.userId))
  if (userSnap.exists()) {
    const userData = userSnap.data() as UserProfile
    await updateDoc(doc(usersCol(), data.userId), {
      ordersCount: userData.ordersCount + 1,
      totalSpent: userData.totalSpent + data.total,
      updatedAt: new Date().toISOString(),
    })
  }

  return ref.id
}

export async function getOrder(orderId: string): Promise<OrderDoc | null> {
  const snap = await getDoc(doc(ordersCol(), orderId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as OrderDoc
}

export async function getUserOrders(userId: string): Promise<OrderDoc[]> {
  const q = query(ordersCol(), where("userId", "==", userId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as OrderDoc))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getAllOrders(): Promise<OrderDoc[]> {
  const snap = await getDocs(ordersCol())
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as OrderDoc))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderDoc["status"],
) {
  await updateDoc(doc(ordersCol(), orderId), { status })
}

export async function deleteOrder(orderId: string) {
  await deleteDoc(doc(ordersCol(), orderId))
}

// ─────────────────────────────────────────────────────────────────────────────
// Reviews
// ─────────────────────────────────────────────────────────────────────────────

export async function addReview(data: Omit<ReviewDoc, "createdAt" | "id">) {
  const now = new Date().toISOString()
  const ref = await addDoc(reviewsCol(), { ...data, createdAt: now })

  // Increment product reviewCount
  const productSnap = await getDoc(doc(productsCol(), String(data.productId)))
  if (productSnap.exists()) {
    const productData = productSnap.data() as ProductDoc
    await updateDoc(doc(productsCol(), String(data.productId)), {
      reviewCount: (productData.reviewCount || 0) + 1,
    })
  }

  return ref.id
}

export async function getProductReviews(productId: number): Promise<ReviewDoc[]> {
  const q = query(reviewsCol(), where("productId", "==", productId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as ReviewDoc))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

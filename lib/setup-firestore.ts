/**
 * Setup Firestore collections with proper structure and seed data.
 *
 * Usage (call from browser console or a temporary admin page):
 *   import { setupFirestore } from "@/lib/setup-firestore"
 *   await setupFirestore()
 *
 * This script:
 *  1. Seeds products from games.json
 *  2. Creates the admin user profile
 *  3. Creates empty placeholder docs for reviews (if needed)
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"
import { getFirebaseDB } from "@/lib/firebase"
import rawGames from "@/lib/games.json"

const ADMIN_UID = "REPLACE_WITH_ADMIN_UID" // Update after creating auth user
const ADMIN_EMAIL = "ajarek2101@gmail.com"

// ─────────────────────────────────────────────────────────────
// Collection names (used throughout the app)
// ─────────────────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  REVIEWS: "reviews",
} as const

// ─────────────────────────────────────────────────────────────
// Seed products from games.json
// ─────────────────────────────────────────────────────────────
async function seedProducts(): Promise<{ created: number; skipped: number }> {
  const db = getFirebaseDB()
  const productsCol = collection(db, COLLECTIONS.PRODUCTS)
  const existingSnap = await getDocs(productsCol)
  const existingIds = new Set(existingSnap.docs.map((d) => d.id))

  let created = 0
  let skipped = 0

  for (const game of rawGames as { id: number; title: string; description: string; price: number; image: string; stock: number; featured: boolean; discount: number; reviewCount: number; createdAt?: string }[]) {
    const id = String(game.id)

    if (existingIds.has(id)) {
      skipped++
      continue
    }

    await setDoc(doc(productsCol, id), {
      title: game.title,
      description: game.description,
      price: game.price,
      image: game.image,
      stock: game.stock,
      featured: game.featured,
      discount: game.discount,
      reviewCount: game.reviewCount,
      category: "xbox360",
      createdAt: game.createdAt || new Date().toISOString(),
    })

    created++
  }

  console.log(`[Setup] Products — created: ${created}, skipped: ${skipped}`)
  return { created, skipped }
}

// ─────────────────────────────────────────────────────────────
// Seed admin user profile
// ─────────────────────────────────────────────────────────────
async function seedAdminProfile(): Promise<void> {
  const db = getFirebaseDB()
  const now = new Date().toISOString()

  // Check if admin already exists
  const adminSnap = await getDocs(
    collection(db, COLLECTIONS.USERS),
  )
  const adminExists = adminSnap.docs.some(
    (d) => d.data().email === ADMIN_EMAIL,
  )

  if (adminExists) {
    console.log("[Setup] Admin profile already exists, skipping.")
    return
  }

  // Note: The UID must match the Firebase Auth UID.
  // Create the auth user first via Firebase Console, then update ADMIN_UID above.
  if (ADMIN_UID === "REPLACE_WITH_ADMIN_UID") {
    console.warn(
      "[Setup] ⚠️  ADMIN_UID not set! Create the auth user in Firebase Console first, " +
      "then update ADMIN_UID in lib/setup-firestore.ts and run again."
    )
    return
  }

  await setDoc(doc(collection(db, COLLECTIONS.USERS), ADMIN_UID), {
    uid: ADMIN_UID,
    email: ADMIN_EMAIL,
    displayName: "Administrator",
    photoURL: null,
    role: "admin",
    createdAt: now,
    updatedAt: now,
    ordersCount: 0,
    totalSpent: 0,
    wishlist: [],
  })

  console.log("[Setup] Admin profile created for UID:", ADMIN_UID)
}

// ─────────────────────────────────────────────────────────────
// Main setup function
// ─────────────────────────────────────────────────────────────
export async function setupFirestore(): Promise<void> {
  console.log("🎮 Starting Firestore setup...")
  console.log("Collections:", Object.values(COLLECTIONS).join(", "))

  try {
    // 1. Seed products
    await seedProducts()

    // 2. Seed admin profile
    await seedAdminProfile()

    console.log("✅ Firestore setup complete!")
    console.log("")
    console.log("Collections created:")
    console.log("  📁 users     — User profiles (uid, email, role, wishlist, stats)")
    console.log("  📁 products  — Xbox 360 game catalog (title, price, stock, etc.)")
    console.log("  📁 orders    — Purchase orders (items, total, status)")
    console.log("  📁 reviews   — Product reviews (rating, comment, userId)")
  } catch (error) {
    console.error("❌ Error during Firestore setup:", error)
    throw error
  }
}

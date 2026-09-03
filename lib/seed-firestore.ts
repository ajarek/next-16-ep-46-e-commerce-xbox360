/**
 * Seed Firestore with products from the local games.json file.
 *
 * Usage (call from browser console or a temporary admin page):
 *   import { seedProducts } from "@/lib/seed-firestore"
 *   await seedProducts()
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

const ADMIN_EMAIL = "ajarek2101@gmail.com"

export async function seedProducts(): Promise<{
  created: number
  skipped: number
}> {
  const db = getFirebaseDB()
  const productsCol = collection(db, "products")
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

  console.log(
    `[Seed] Done — created: ${created}, skipped (existing): ${skipped}`,
  )
  return { created, skipped }
}

/**
 * Create the admin user profile in Firestore.
 * The actual Firebase Auth user must be created separately (e.g. via Firebase Console).
 *
 * To create the auth user, go to:
 *   Firebase Console → Authentication → Users → Add user
 *   Email: admin@xbox360classics.pl
 *   Password: Admin123!
 *
 * Then run this function to set the Firestore profile with admin role.
 */
export async function seedAdminProfile(uid: string): Promise<void> {
  const db = getFirebaseDB()
  const now = new Date().toISOString()
  await setDoc(doc(collection(db, "users"), uid), {
    uid,
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
  console.log("[Seed] Admin profile created for uid:", uid)
}

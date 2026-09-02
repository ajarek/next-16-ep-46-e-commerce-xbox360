import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  type User,
} from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"

const googleProvider = new GoogleAuthProvider()

// ---------------------------------------------------------------------------
// Email / Password
// ---------------------------------------------------------------------------

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
) {
  const auth = getFirebaseAuth()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return credential.user
}

export async function signInWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth()
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

// ---------------------------------------------------------------------------
// Google
// ---------------------------------------------------------------------------

export async function signInWithGoogle() {
  const auth = getFirebaseAuth()
  const credential = await signInWithPopup(auth, googleProvider)
  return credential.user
}

// ---------------------------------------------------------------------------
// Sign Out
// ---------------------------------------------------------------------------

export async function logOut() {
  const auth = getFirebaseAuth()
  await signOut(auth)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getUserUid(user: User | null): string {
  return user?.uid ?? ""
}

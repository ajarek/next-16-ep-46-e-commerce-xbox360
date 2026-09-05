import {
  initializeApp,
  getApps,
  getApp as getFirebaseApp,
  type FirebaseApp,
} from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

// Firebase config – substitute with your project's values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Lazy initialization – avoids errors during SSR/build when env vars are missing
let _app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null
let _storage: FirebaseStorage | null = null

function getOrCreateApp(): FirebaseApp {
  if (!_app) {
    _app =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getFirebaseApp()
  }
  return _app
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getOrCreateApp())
  return _auth
}

export function getFirebaseDB(): Firestore {
  if (!_db) _db = getFirestore(getOrCreateApp())
  return _db
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(getOrCreateApp())
  return _storage
}

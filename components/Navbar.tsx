"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  ShoppingCart,
  User,
  Menu,
  X,
  Gamepad2,
  LogOut,
  ShieldCheck,
  ChevronDown,
  UserCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useCartStore } from "@/store/cartStore"
import { useMounted } from "@/hooks/useMounted"
import { useAuth } from "@/context/AuthContext"
import { logOut } from "@/lib/firebase-auth"
import Image from "next/image"

const Navbar: React.FC = () => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const mounted = useMounted()

  const { user, profile, isAdmin, loading } = useAuth()

  const items = useCartStore((state) => state.items)
  const cartCount = items.reduce((acc, i) => acc + (i.quantity ?? 1), 0)

  const navLinks = [
    { href: "/", label: "Główna" },
    { href: "/store", label: "Sklep" },
    { href: "/deals", label: "Promocje" },
    { href: "/about", label: "O nas" },
  ]

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSignOut = async () => {
    await logOut()
    setProfileOpen(false)
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    const name = profile?.displayName || user?.email || "U"
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className='w-full sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0af0] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'>
      <div className='w-full flex items-center justify-between h-20 px-4 sm:px-6'>
        {/* Logo */}
        <div className='shrink-0 flex items-center'>
          <Link href='/' className='flex items-center gap-2 group'>
            <div className='w-10 h-10 rounded-full bg-xboxGreen shadow-[0_0_15px_#107c10] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300'>
              <Gamepad2 className='w-6 h-6 text-white' />
            </div>
            <span className='font-orbitron font-bold text-base sm:text-xl tracking-widest text-gradient ml-2 whitespace-nowrap'>
              XBOX 360 CLASSICS
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className='hidden md:flex items-center gap-4'>
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-rajdhani text-lg font-semibold tracking-wider transition-colors duration-300 px-3 py-2 ${
                  isActive ? "text-primary" : "text-white hover:text-gray-400"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId='navUnderline'
                    className='absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary to-blue-800 shadow-[0_0_8px_#00ffff]'
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right Buttons (Cart & Auth) - Desktop */}
        <div className='hidden md:flex items-center space-x-4'>
          {/* Cart Icon */}
          <Link
            href='/cart'
            className='relative p-2.5 rounded-xl border border-white/10 hover:border-neonCyan bg-white/5 hover:bg-neonCyan/5 transition-all duration-300 group'
          >
            <ShoppingCart className='w-5 h-5 text-gray-300 group-hover:text-neonCyan transition-colors' />
            {mounted && cartCount > 0 && (
              <span className='absolute -top-2 -right-2 px-1.5 min-w-5 h-5 rounded-full bg-neonPink text-black font-orbitron text-[11px] font-extrabold flex items-center justify-center shadow-[0_0_10px_#ff69b4] animate-pulse'>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth States - Desktop */}
          {!loading && user ? (
            /* Logged-in: Avatar dropdown */
            <div className='relative' ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className='flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:border-neonCyan bg-white/5 hover:bg-neonCyan/5 transition-all duration-300'
              >
                {/* Avatar */}
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "Avatar"}
                    className='w-8 h-8 rounded-full object-cover border border-white/20'
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-xboxGreen/30 border border-xboxGreen flex items-center justify-center text-xboxGreen font-orbitron text-xs font-bold'>
                    {getInitials()}
                  </div>
                )}
                <div className='hidden lg:flex flex-col items-start'>
                  <span className='font-rajdhani text-sm font-bold text-white leading-tight truncate max-w-24'>
                    {profile?.displayName || "Gracz"}
                  </span>
                  {isAdmin && (
                    <span className='flex items-center gap-1 text-[10px] font-orbitron font-bold text-xboxGreen leading-tight'>
                      <ShieldCheck className='w-3 h-3' />
                      ADMIN
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className='absolute right-0 top-full mt-2 w-56 backdrop-blur-md bg-cyberPanel border border-white/10 rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)]'
                  >
                    {/* User info header */}
                    <div className='px-3 py-2.5 border-b border-white/10 mb-1'>
                      <p className='font-rajdhani text-sm font-bold text-white truncate'>
                        {profile?.displayName || "Gracz"}
                      </p>
                      <p className='font-rajdhani text-xs text-gray-500 truncate'>
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className='inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-xboxGreen/20 border border-xboxGreen/40 rounded-full text-[10px] font-orbitron font-bold text-xboxGreen'>
                          <ShieldCheck className='w-3 h-3' />
                          Panel Administratora
                        </span>
                      )}
                    </div>

                    <Link
                      href='/profile'
                      onClick={() => setProfileOpen(false)}
                      className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-rajdhani text-sm font-semibold transition-colors'
                    >
                      <UserCircle className='w-4 h-4' />
                      <span>Mój profil</span>
                    </Link>

                    <Link
                      href='/orders'
                      onClick={() => setProfileOpen(false)}
                      className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-rajdhani text-sm font-semibold transition-colors'
                    >
                      <ShoppingCart className='w-4 h-4' />
                      <span>Moje zamówienia</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href='/admin'
                        onClick={() => setProfileOpen(false)}
                        className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xboxGreen hover:bg-xboxGreen/10 font-rajdhani text-sm font-semibold transition-colors'
                      >
                        <ShieldCheck className='w-4 h-4' />
                        <span>Panel Admina</span>
                      </Link>
                    )}

                    <div className='border-t border-white/10 my-1' />

                    <button
                      onClick={handleSignOut}
                      className='w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 font-rajdhani text-sm font-semibold transition-colors'
                    >
                      <LogOut className='w-4 h-4' />
                      <span>Wyloguj się</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Not logged in (or still loading) */
            <Link
              href='/login'
              className='flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 hover:border-neonCyan bg-linear-to-r from-white/5 to-white/10 hover:from-neonCyan/20 hover:to-neonBlue/20 font-rajdhani text-base font-semibold tracking-wider hover:text-neonCyan text-white shadow-[0_0_15px_rgba(0,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-300'
            >
              <User className='w-4 h-4' />
              <span>Zaloguj się</span>
            </Link>
          )}
        </div>

        {/* Mobile Buttons (Cart + Menu Toggle) */}
        <div className='flex md:hidden items-center space-x-2.5'>
          {/* Mobile Cart */}
          <Link
            href='/cart'
            className='relative w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 flex items-center justify-center text-gray-300 transition-colors'
          >
            <ShoppingCart className='w-5 h-5' />
            {mounted && cartCount > 0 && (
              <span className='absolute -top-1.5 -right-1.5 px-1 min-w-4 h-4 rounded-full bg-neonPink text-black font-orbitron text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_#ff69b4]'>
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type='button'
            aria-label={mobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors'
          >
            {mobileMenuOpen ? (
              <X className='w-5 h-5' />
            ) : (
              <Menu className='w-5 h-5' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className='md:hidden overflow-hidden bg-[#0a0a0afc]'
          >
            <div className='px-4 pt-1 pb-6 space-y-1.5'>
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-sans text-base transition-colors ${
                      isActive
                        ? "bg-[#032328] text-cyan-400 font-bold border-l-4 border-cyan-400 shadow-[inset_0_0_15px_rgba(0,255,255,0.06)] drop-shadow-[0_0_8px_rgba(0,255,255,0.35)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5 font-medium border-l-4 border-transparent"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}

              <div className='pt-2 pb-1'>
                <div className='border-t border-zinc-800/80' />
              </div>

              {/* Mobile Auth Section */}
              {!loading && user ? (
                <>
                  {/* User info */}
                  <div className='px-4 py-3 flex items-center gap-3'>
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt=''
                        className='w-10 h-10 rounded-full object-cover border border-white/20'
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className='w-10 h-10 rounded-full bg-xboxGreen/30 border border-xboxGreen flex items-center justify-center text-xboxGreen font-orbitron text-sm font-bold'>
                        {getInitials()}
                      </div>
                    )}
                    <div>
                      <p className='font-rajdhani text-sm font-bold text-white'>
                        {profile?.displayName || "Gracz"}
                      </p>
                      {isAdmin && (
                        <span className='flex items-center gap-1 text-[10px] font-orbitron font-bold text-xboxGreen'>
                          <ShieldCheck className='w-3 h-3' /> ADMIN
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href='/profile'
                    onClick={() => setMobileMenuOpen(false)}
                    className='flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white font-medium text-base transition-colors'
                  >
                    <UserCircle className='w-4 h-4' />
                    Mój profil
                  </Link>

                  <Link
                    href='/orders'
                    onClick={() => setMobileMenuOpen(false)}
                    className='flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white font-medium text-base transition-colors'
                  >
                    <ShoppingCart className='w-4 h-4' />
                    Moje zamówienia
                  </Link>

                  {isAdmin && (
                    <Link
                      href='/admin'
                      onClick={() => setMobileMenuOpen(false)}
                      className='flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-xboxGreen/40 bg-xboxGreen/10 text-xboxGreen font-medium text-base transition-colors'
                    >
                      <ShieldCheck className='w-4 h-4' />
                      Panel Admina
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className='w-full py-3 px-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 font-medium text-base transition-colors flex items-center justify-center gap-2'
                  >
                    <LogOut className='w-4 h-4' />
                    Wyloguj się
                  </button>
                </>
              ) : (
                <Link
                  href='/login'
                  onClick={() => setMobileMenuOpen(false)}
                  className='flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl border border-cyan-500/40 bg-[#021324] hover:bg-[#042038] text-cyan-400 font-medium text-base shadow-[0_0_15px_rgba(0,255,255,0.06)] hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all duration-200'
                >
                  <User className='w-4 h-4 text-cyan-400 shrink-0' />
                  <span>Zaloguj się</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar

"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Menu,
  X,
  Gamepad2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useCartStore } from "@/store/cartStore"
import { useMounted } from "@/hooks/useMounted"

const Navbar: React.FC = () => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mounted = useMounted()

  const items = useCartStore((state) => state.items)
  const cartCount = items.reduce((acc, i) => acc + (i.quantity ?? 1), 0)

  const navLinks = [
    { href: "/", label: "Główna" },
    { href: "/store", label: "Sklep" },
    { href: "/deals", label: "Promocje" },
    { href: "/about", label: "O nas" },
  ]

  return (
    <nav className='w-full flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0af0] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)] px-4'>
      <div className='w-full flex items-center justify-between h-20'>
        {/* Logo */}
        <div className='shrink-0 flex items-center'>
          <Link href='/' className='flex items-center gap-2 group'>
            <div className='w-10 h-10 rounded-full bg-xboxGreen shadow-[0_0_15px_#107c10] flex items-center justify-center transition-transform group-hover:scale-110 duration-300'>
              <Gamepad2 className='w-6 h-6 text-white' />
            </div>
            <span className='font-orbitron font-bold text-lg sm:text-xl tracking-widest text-gradient ml-2'>
              XBOX 360{" "}
              <span className='text-white group-hover:text-neonCyan transition-colors duration-300'>
                CLASSICS
              </span>
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

        {/* Right Buttons (Cart & Auth) */}
        <div className='hidden md:flex items-center space-x-6'>
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

          {/* Auth States */}

          <div className='flex items-center space-x-4'>
            <Link
              href='/orders'
              className='flex items-center gap-1.5 p-2 px-4 rounded-xl border border-white/10 hover:border-neonPink bg-white/5 hover:bg-neonPink/5 text-gray-300 hover:text-white font-rajdhani text-base font-semibold tracking-wider transition-all duration-300'
            >
              <Package className='w-4 h-4 text-neonPink' />
              <span>Zamówienia</span>
            </Link>
          </div>

          <Link
            href='/login'
            className='flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 hover:border-neonCyan bg-linear-to-r from-white/5 to-white/10 hover:from-neonCyan/20 hover:to-neonBlue/20 font-rajdhani text-base font-semibold tracking-wider hover:text-neonCyan text-white shadow-[0_0_15px_rgba(0,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-300'
          >
            <User className='w-4 h-4' />
            <span>Zaloguj się</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className='flex md:hidden items-center space-x-4'>
          {/* Mobile Cart */}
          <Link
            href='/cart'
            className='relative p-2 rounded-lg border border-white/10 bg-white/5'
          >
            <ShoppingCart className='w-5 h-5 text-gray-300' />
            {mounted && cartCount > 0 && (
              <span className='absolute -top-2 -right-2 px-1 min-w-4 h-4 rounded-full bg-neonPink text-black font-orbitron text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_#ff69b4]'>
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='p-2 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white'
          >
            {mobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
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
            className='md:hidden border-t border-white/10 bg-[#0a0a0af5]'
          >
            <div className='px-2 pt-2 pb-6 space-y-2 sm:px-3'>
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-3 rounded-lg font-rajdhani text-lg font-semibold tracking-wider transition-colors ${
                      isActive
                        ? "bg-neonCyan/10 text-neonCyan text-glow-cyan border-l-4 border-neonCyan"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}

              <div className='pt-4 mt-4 border-t border-white/10 px-3'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center'>
                      <User className='w-5 h-5 text-neonCyan' />
                    </div>
                    <div>
                      <div className='font-rajdhani text-base font-bold text-white leading-tight'>
                        Gracz
                      </div>
                      <div className='text-xs text-gray-500'>EMAIL</div>
                    </div>
                  </div>

                  <Link
                    href='/orders'
                    onClick={() => setMobileMenuOpen(false)}
                    className='flex items-center gap-2 w-full py-3 px-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-rajdhani font-semibold tracking-wider hover:text-white'
                  >
                    <Package className='w-5 h-5 text-neonPink' />
                    <span>Zamówienia</span>
                  </Link>

                  <button className='flex items-center gap-2 w-full py-3 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-rajdhani font-semibold tracking-wider'>
                    <LogOut className='w-5 h-5' />
                    <span>Wyloguj się</span>
                  </button>
                </div>

                <Link
                  href='/login'
                  onClick={() => setMobileMenuOpen(false)}
                  className='flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-linear-to-r from-neonCyan/20 to-neonBlue/20 border border-neonCyan/40 text-neonCyan font-rajdhani font-bold tracking-wider'
                >
                  <User className='w-5 h-5' />
                  <span>Zaloguj się</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar

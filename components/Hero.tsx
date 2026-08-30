"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Sparkles, Tag, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const Hero = () => {
  const [heroVideoFailed, setHeroVideoFailed] = useState(false)
  return (
    <section className='w-full relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-4 sm:px-6 lg:px-8'>
      {/* Background Spline Iframe - 3D scene */}
      <div className='absolute inset-0 z-0 pointer-events-none'>
        {!heroVideoFailed ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload='auto'
            crossOrigin='anonymous'
            poster='/hero.png'
            aria-hidden='true'
            onError={() => setHeroVideoFailed(true)}
            className='w-full h-full object-cover opacity-90 absolute inset-0 z-0'
            src='/video/hero-video.mp4'
          />
        ) : (
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.18),transparent_35%),linear-gradient(180deg,#020204,#0a0a0a)]' />
        )}
      </div>

      {/* Shadow Overlay */}
      <div className='absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-black/40 to-transparent z-1 pointer-events-none' />

      {/* Content Container */}
      <div className='relative z-10 max-w-7xl mx-auto text-center space-y-8 select-none'>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neonCyan/30 bg-neonCyan/5 shadow-[0_0_15px_rgba(0,255,255,0.1)] text-neonCyan font-rajdhani text-sm font-bold tracking-widest uppercase'
        >
          <Sparkles className='w-4 h-4 text-cyan-500' />
          <span className='text-gradient'>Złota Generacja Powraca</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className='font-orbitron font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-wider leading-none text-gradient'
        >
          KULTOWE GRY NA <br />
          <span className='text-gradient'>XBOX 360</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className='font-rajdhani text-lg sm:text-2xl text-gray-300 max-w-3xl mx-auto font-semibold tracking-wider leading-relaxed'
        >
          Odkryj na nowo niesamowite emocje. Oryginalne hity, legendarne edycje
          i epickie kampanie z generacji konsoli, która zdefiniowała nowoczesny
          gaming.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className='flex flex-col sm:flex-row items-center justify-center gap-6 pt-4'
        >
          <Link
            href='/store'
            className='flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-linear-to-r from-neonCyan to-neonBlue text-black font-rajdhani text-lg font-bold tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 group'
          >
            <span className='text-black'>Wejdź do Sklepu</span>
            <ArrowRight className='w-5 h-5 text-black group-hover:translate-x-1 transition-transform' />
          </Link>

          <Link
            href='/deals'
            className='flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 border border-white/10 hover:border-neonPink bg-white/5 hover:bg-neonPink/10 text-white font-rajdhani text-lg font-bold tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(255,105,180,0.3)] transition-all duration-300 group'
          >
            <Tag className='w-5 h-5 text-neonPink group-hover:rotate-12 transition-transform' />
            <span>Zobacz Promocje</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero

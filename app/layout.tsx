import type { Metadata } from "next"
import { Geist, Geist_Mono, Roboto, Orbitron, Rajdhani } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/context/AuthContext"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
})

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Xbox 360 Classics | Retro Gaming Store",
  description: "Legendarny sklep z grami na konsolę Xbox 360. Przeżyj na nowo złotą erę gamingu.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang='pl'
      data-scroll-behavior='smooth'
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        roboto.variable,
        orbitron.variable,
        rajdhani.variable,
      )}
    >
      <body className='min-h-full flex flex-col bg-[#0a0a0a] text-white selection:bg-neonCyan selection:text-black'>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}

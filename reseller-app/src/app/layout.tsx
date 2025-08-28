import type { Metadata } from "next"
import { Rajdhani, Orbitron } from "next/font/google"
import "./globals.css"

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
})

export const metadata: Metadata = {
  title: "ResellerPro - Advanced Inventory Management",
  description: "Futuristic reselling business management platform with comprehensive inventory tracking, sales analytics, and profit optimization.",
  keywords: ["reselling", "inventory", "sales", "profit", "business", "management"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${orbitron.variable}`}>
      <body className={rajdhani.className}>
        {children}
      </body>
    </html>
  )
}

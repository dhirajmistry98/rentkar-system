import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../app/styles/globals.css'
import { cn } from '../lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rentkar Admin Dashboard',
  description: 'Booking & Partner Verification System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        {children}
      </body>
    </html>
  )
}
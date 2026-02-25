import React from "react"
import type { Metadata } from 'next'
import { Silkscreen } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const silkscreen = Silkscreen({ 
  weight: ['400', '700'],
  subsets: ["latin"] 
});

export const metadata: Metadata = {
  title: 'Assembly Line Factory',
  description: 'Visualize your business as a manufacturing line',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

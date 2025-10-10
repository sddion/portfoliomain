import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Sanju - Full-Stack Developer & Security Engineer",
  description:
    "Self-taught full-stack developer specializing in web, mobile, embedded systems, and security. Portfolio showcasing live projects and technical expertise.",
  keywords: [
    "full-stack developer",
    "React",
    "Node.js",
    "TypeScript",
    "embedded systems",
    "security",
    "Arduino",
    "ESP8266",
  ],
  authors: [{ name: "Sanju", url: "https://github.com/sddion" }],
  creator: "Sanju (sddion / dedsec)",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Sanju - Full-Stack Developer & Security Engineer",
    description: "Self-taught developer with expertise across web, mobile, embedded systems, and security",
    siteName: "Sanju Portfolio",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider>
          <Suspense fallback={null}>
            {children}
            <Analytics />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}

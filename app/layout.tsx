import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WindowProvider } from "@/components/os/WindowManager"
import { SnowfallEffect } from '@/components/ui/snowfall-effect';


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
    "ESP32",
    "ESP8266",
  ],
  authors: [{ name: "Sanju", url: "https://github.com/sddion" }],
  creator: "Sanju (sddion / 0xdedsec)",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Sanju - Full-Stack Developer & Security Engineer",
    description:
      "Self-taught developer with expertise across web, mobile, embedded systems, and security.",
    siteName: "Sanju Portfolio",
    url: "https://sddion.vercel.app/",
    images: [
      {
        url: "https://i.ibb.co/Zzs386fk/Screenshot-2025-10-11-at-18-07-49-Sanju-Full-Stack-Developer-Security-Engineer.png",
        width: 1200,
        height: 630,
        alt: "Sanju Portfolio Preview",
      },
    ],
  },
  verification: {
    google: "_AtTHdx6rjxEyjz6FDZ9EXnb0nH9HPoKVB6ZcHSUjTQ",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased bg-neutral-950 text-neutral-50`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="ocean"
          themes={["dark", "ubuntu", "ocean", "dracula"]}
          enableSystem={false}
          disableTransitionOnChange
        >
          <WindowProvider>
            <SnowfallEffect snowflakeCount={150} color="#2ae704c5" />
            {children}
          </WindowProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

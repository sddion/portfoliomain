import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WindowProvider } from "@/components/os/WindowManager"
import { SnowfallEffect } from '@/components/ui/snowfall-effect';


export const metadata: Metadata = {
  title: "SanjuOS - Free Advanced ESP32 Web Flasher & Security Portfolio",
  description:
    "The ultimate free advanced ESPTool-JS web interface. Flash, erase, and monitor ESP32/ESP8266 devices directly in your browser using Web Serial. SanjuOS also showcases full-stack and security engineering expertise.",
  keywords: [
    "Free Advanced ESPTool",
    "ESP32 Web Flasher",
    "Web Serial API",
    "ESPLoader JS",
    "Cloud ESP Flasher",
    "Arduino Browser Flasher",
    "SanjuOS",
    "0xd3ds3c portfolio",
    "Full-Stack Developer",
    "Security Engineer Portfolio",
    "IoT Development Tools",
    "ESP8266 Flasher Web",
  ],
  authors: [{ name: "Sanju (sddion)", url: "https://github.com/sddion" }],
  creator: "Sanju (sddion / 0xd3ds3c)",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "SanjuOS - Advanced ESP32 Web Flasher & IoT Portfolio",
    description:
      "Flash ESP32 and ESP8266 firmware directly from your browser. Free, advanced, and secure browser-based ESPTool implementation.",
    siteName: "SanjuOS Portfolio",
    url: "https://sddion.vercel.app/",
    images: [
      {
        url: "https://i.ibb.co/Zzs386fk/Screenshot-2025-10-11-at-18-07-49-Sanju-Full-Stack-Developer-Security-Engineer.png",
        width: 1200,
        height: 630,
        alt: "SanjuOS - Advanced ESP Flasher Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SanjuOS | Free Advanced ESP32 Web Flasher",
    description: "Cloud-based flashing tool for ESP32/ESP8266. No installation required. Fast, free, and advanced.",
    images: ["https://i.ibb.co/Zzs386fk/Screenshot-2025-10-11-at-18-07-49-Sanju-Full-Stack-Developer-Security-Engineer.png"],
    creator: "@0xd3ds3c",
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

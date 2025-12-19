import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import "./globals.css"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"
import { WindowProvider } from "@/components/os/WindowManager"
import { SnowfallEffect } from '@/components/ui/snowfall-effect';
import { NotificationProvider } from "@/hooks/useNotifications"


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
  other: {
    "google-adsense-account": "ca-pub-5565716152868775",
    "revisit-after": "7 days",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5565716152868775"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
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
          <NotificationProvider>
            <WindowProvider>
              <SnowfallEffect snowflakeCount={150} color="#2ae704c5" />
              {children}
            </WindowProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html >
  )
}

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
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "sddionOS - Free ESP32 Web Flasher & Image to Byte Array Converter | Developer Tools",
  description:
    "Free online tools for embedded developers: ESP32/ESP8266 web flasher using Web Serial API, image to C/C++ byte array converter for Arduino displays (supports animations, dithering, RGB565). Full-stack developer and security engineer portfolio.",
  keywords: [
    // ESP32 Tools
    "ESP32 web flasher",
    "ESP8266 web flasher",
    "ESPTool JS online",
    "Web Serial API flasher",
    "browser ESP flasher",
    "Arduino web flasher",
    "online firmware flasher",
    // Image Converter
    "image to byte array converter",
    "image to C array online",
    "bitmap to hex array",
    "Arduino image converter",
    "OLED display image converter",
    "SSD1306 image converter",
    "RGB565 image converter",
    "image to PROGMEM",
    "sprite to byte array",
    "animation frames to C array",
    // Portfolio
    "sddionOS",
    "0xd3ds3c portfolio",
    "Sanju developer",
    "full-stack developer India",
    "security engineer portfolio",
    "IoT developer",
    "embedded systems developer",
  ],
  authors: [{ name: "Sanju (sddion)", url: "https://github.com/sddion" }],
  creator: "Sanju (sddion / 0xd3ds3c)",
  publisher: "sddionOS",
  applicationName: "sddionOS",
  category: "Developer Tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "sddionOS - Free ESP32 Web Flasher & Image to Byte Converter",
    description:
      "Free browser-based tools: Flash ESP32/ESP8266 firmware via Web Serial, convert images to C/C++ byte arrays for Arduino displays. Supports animations, dithering, and multiple color modes.",
    siteName: "sddionOS Developer Tools",
    url: "https://sddion.vercel.app/",
    images: [
      {
        url: "https://i.postimg.cc/SKc3q4mY/preview.png",
        width: 1200,
        height: 630,
        alt: "sddionOS - ESP32 Web Flasher and Developer Tools Preview",
      },
      {
        url: "https://postimg.cc/DWyBdtJ7",
        width: 1200,
        height: 630,
        alt: "sddionOS - ESP32 Web Flasher and Developer Tools Preview (Fallback)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "sddionOS | Free ESP32 Flasher & Image to Byte Array Converter",
    description: "Free online tools: Flash ESP32/ESP8266 from browser, convert images to Arduino byte arrays. No installation required.",
    images: ["https://i.postimg.cc/SKc3q4mY/preview.png"],
    creator: "@0xd3ds3c",
  },
  verification: {
    google: "_AtTHdx6rjxEyjz6FDZ9EXnb0nH9HPoKVB6ZcHSUjTQ",
  },
  alternates: {
    canonical: "https://sddion.vercel.app/",
  },
  other: {
    "google-adsense-account": "ca-pub-5565716152868775",
    "revisit-after": "3 days",
  },
}

// JSON-LD Structured Data for AI and Search Engines
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    // Organization
    {
      "@type": "Organization",
      "@id": "https://sddion.vercel.app/#organization",
      "name": "sddionOS",
      "url": "https://sddion.vercel.app/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sddion.vercel.app/icons/icon-512x512.png"
      },
      "sameAs": [
        "https://github.com/sddion",
        "https://twitter.com/0xd3ds3c"
      ]
    },
    // Person (Developer)
    {
      "@type": "Person",
      "@id": "https://sddion.vercel.app/#person",
      "name": "Sanju",
      "alternateName": ["sddion", "0xd3ds3c"],
      "url": "https://sddion.vercel.app/",
      "jobTitle": "Full-Stack Developer & Security Engineer",
      "knowsAbout": [
        "ESP32 Development",
        "IoT Security",
        "Web Development",
        "Embedded Systems",
        "React",
        "TypeScript",
        "Arduino"
      ],
      "sameAs": [
        "https://github.com/sddion",
        "https://twitter.com/0xd3ds3c"
      ]
    },
    // WebSite
    {
      "@type": "WebSite",
      "@id": "https://sddion.vercel.app/#website",
      "url": "https://sddion.vercel.app/",
      "name": "sddionOS Developer Tools",
      "description": "Free online tools for embedded developers and IoT enthusiasts",
      "publisher": {
        "@id": "https://sddion.vercel.app/#organization"
      }
    },
    // ESP32 Flasher Software Application
    {
      "@type": "SoftwareApplication",
      "@id": "https://sddion.vercel.app/#esp-flasher",
      "name": "ESP32 Web Flasher",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Free browser-based ESP32 and ESP8266 firmware flasher using Web Serial API. Flash, erase, and monitor devices directly in your browser without any installation.",
      "featureList": [
        "No installation required",
        "Flash ESP32 and ESP8266",
        "Web Serial API support",
        "Serial monitor",
        "Firmware erasing"
      ],
      "author": {
        "@id": "https://sddion.vercel.app/#person"
      }
    },
    // Img2Bytes Software Application
    {
      "@type": "SoftwareApplication",
      "@id": "https://sddion.vercel.app/#img2bytes",
      "name": "Image to Byte Array Converter",
      "alternateName": "Img2Bytes",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Free online tool to convert images (PNG, JPG, BMP, GIF) to C/C++ byte arrays for Arduino and embedded displays. Supports multiple images for animations, dithering algorithms (Floyd-Steinberg, Atkinson, Bayer), and color modes (Monochrome, Grayscale, RGB565, RGB888).",
      "featureList": [
        "Multi-image upload for animations",
        "Floyd-Steinberg dithering",
        "Atkinson dithering",
        "Bayer ordered dithering",
        "Monochrome 1-bit output",
        "RGB565 16-bit output",
        "RGB888 24-bit output",
        "PROGMEM support",
        "SSD1306 vertical byte orientation",
        "Canvas size presets",
        "100% client-side processing"
      ],
      "author": {
        "@id": "https://sddion.vercel.app/#person"
      }
    },
    // FAQ for AI Search
    {
      "@type": "FAQPage",
      "@id": "https://sddion.vercel.app/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I flash ESP32 from a web browser?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Use sddionOS ESP32 Web Flasher at sddion.vercel.app. It works directly in Chrome or Edge browsers using Web Serial API. Connect your ESP32 via USB, open the flasher, select your firmware file, and click flash. No installation or drivers required."
          }
        },
        {
          "@type": "Question",
          "name": "How do I convert an image to a byte array for Arduino?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Use the Img2Bytes converter at sddion.vercel.app. Upload your image (PNG, JPG, BMP, or GIF), select the target display size (e.g., 128x64 for SSD1306), choose monochrome or color mode, and copy the generated C/C++ array. The tool supports dithering for better image quality on 1-bit displays."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best dithering algorithm for OLED displays?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Floyd-Steinberg dithering provides the best quality for most images on OLED displays like SSD1306. For smaller images or icons, Bayer (ordered) dithering may look cleaner. The Img2Bytes tool at sddion.vercel.app lets you preview all dithering options in real-time."
          }
        },
        {
          "@type": "Question",
          "name": "How do I create an animation for Arduino display?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Upload multiple images to the Img2Bytes converter at sddion.vercel.app. The tool will generate separate byte arrays for each frame and create a const array of pointers to all frames. Use this array in your Arduino code to cycle through frames for animation."
          }
        },
        {
          "@type": "Question",
          "name": "What is RGB565 format and when should I use it?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "RGB565 is a 16-bit color format (5 bits red, 6 bits green, 5 bits blue) commonly used in TFT displays like ST7735 and ILI9341. Use RGB565 when your display supports color but you want to save memory compared to 24-bit RGB888. The Img2Bytes converter can output both formats."
          }
        }
      ]
    }
  ]
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

        {/* JSON-LD Structured Data for AI and Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

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
        suppressHydrationWarning
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
              <Analytics />
              <SpeedInsights />
              <SnowfallEffect snowflakeCount={150} color="#2ae704c5" />
              {children}
            </WindowProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html >
  )
}

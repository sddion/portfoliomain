"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Service = {
  icon: string
  title: string
  description: string
  priceInr: number
}

const services: Service[] = [
  {
    icon: "laptop",
    title: "Web Design",
    description: "Visually sharp, accessible, responsive design tailored to your brand.",
    priceInr: 15000,
  },
  {
    icon: "code",
    title: "Web Development",
    description: "Full-stack builds with clean API boundaries and production hardening.",
    priceInr: 30000,
  },
  {
    icon: "android",
    title: "App Design",
    description: "Sleek UX/UI for iOS/Android with design systems and motion.",
    priceInr: 18000,
  },
  {
    icon: "apple",
    title: "App Development",
    description: "React Native apps with CI/CD, OTA updates, and telemetry.",
    priceInr: 45000,
  },
]

export function ServicesSection() {
  const [usdPerInr, setUsdPerInr] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    // exchangerate.host is free and reliable
    fetch("https://api.exchangerate.host/latest?base=INR&symbols=USD")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        const rate = data?.rates?.USD
        if (typeof rate === "number") setUsdPerInr(rate)
      })
      .catch(() => {
        // fallback approximate rate if API is unavailable
        setUsdPerInr(0.012)
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-3 mb-10">
          <p className="text-accent font-mono">What I do?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Epic Services That Won&apos;t Crash and Burn (Probably)
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((s, idx) => {
            const usd = usdPerInr ? Math.round(s.priceInr * usdPerInr) : null
            return (
              <div
                key={s.title}
                className={cn(
                  "rounded-xl border border-border bg-card text-card-foreground p-6",
                  "transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg",
                  "animate-in fade-in-50 slide-in-from-bottom-4",
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-md bg-accent/15 text-accent grid place-items-center font-mono">
                    {s.icon.toUpperCase().slice(0, 2)}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    <p className="text-muted-foreground">{s.description}</p>
                    <div className="pt-2 text-sm">
                      <span className="font-mono">₹{s.priceInr.toLocaleString("en-IN")}</span>{" "}
                      <span className="text-muted-foreground">INR</span>
                      {" • "}
                      <span className="font-mono">
                        {usd !== null ? `$${usd.toLocaleString("en-US")}` : "Fetching USD..."}
                      </span>{" "}
                      <span className="text-muted-foreground">USD</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

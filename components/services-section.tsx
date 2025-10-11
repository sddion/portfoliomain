"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useMounted } from "@/hooks/use-mounted"
import {
  Palette,
  Code2,
  CircuitBoard,
  Cpu,
  LucideIcon
} from "lucide-react"

type Service = {
  Icon: LucideIcon
  title: string
  description: string
  priceInr: number
}

const services: Service[] = [
  {
    Icon: Palette,
    title: "Web Design",
    description: "Visually sharp, accessible, responsive design tailored to your brand.",
    priceInr: 200, // Per hour rate
  },
  {
    Icon: Code2,
    title: "Web Development",
    description: "Full-stack builds with clean API boundaries and production hardening.",
    priceInr: 400, // Per hour rate
  },
  {
    Icon: CircuitBoard,
    title: "Hardware Design",
    description: "Custom PCB design with KiCAD, ESP32/ESP8266 integration, and IoT solutions.",
    priceInr: 200, // Per hour rate
  },
  {
    Icon: Cpu,
    title: "IoT Development",
    description: "ESP32/ESP8266 firmware, sensor integration, and home automation solutions.",
    priceInr: 220, // Per hour rate
  },
]

export function ServicesSection() {
  const mounted = useMounted()
  const [usdPerInr, setUsdPerInr] = useState(0.012)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError('')

    // Function to fetch rates with amount
    const fetchRate = async (amount: number) => {
      try {
        const res = await fetch(`/api/fx?base=INR&symbol=USD&amount=${amount}`)
        if (!res.ok) throw new Error('Failed to fetch rate')
        const data = await res.json()
        if (!alive) return

        // Use the actual rate from the API
        if (typeof data?.rate === "number") {
          setUsdPerInr(data.rate)
          setError('')
        } else {
          throw new Error('Invalid rate received')
        }
      } catch (error) {
        console.error('Error fetching rate:', error)
        setError('Could not fetch current rates')
        setUsdPerInr(0.012) // Fallback rate
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    // Initial fetch with 1 INR
    fetchRate(1)

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
                  `animation-delay-${(idx + 1) * 100}`
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-md bg-accent/15 text-accent grid place-items-center">
                    {mounted && <s.Icon className="h-6 w-6" />}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    <p className="text-muted-foreground">{s.description}</p>
                    <div className="pt-2 text-sm">
                      <span className="font-mono">₹{s.priceInr.toLocaleString("en-IN")}</span>{" "}
                      <span className="text-muted-foreground">INR/hr</span>
                      {" • "}
                      <span className="font-mono">
                        {isLoading ? (
                          "Loading..."
                        ) : error ? (
                          <span className="text-destructive" title={error}>~${usd?.toLocaleString("en-US") ?? "?"}/hr</span>
                        ) : (
                          `$${usd?.toLocaleString("en-US")}/hr`
                        )}
                      </span>
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

import { NextRequest, NextResponse } from "next/server"
import { getOrCache } from "@/lib/Redis"

// FX Handler
export async function GET(request: Request) {
  try {
    if (!process.env.API_KEY) {
        return NextResponse.json({ error: "API_KEY not configured" }, { status: 503 })
    }
    const { searchParams } = new URL(request.url)
    const base = searchParams.get("base") || "INR"
    const to = searchParams.get("symbol") || "USD"
    const amount = searchParams.get("amount") || "1"

    const cacheKey = `fx:${base}:${to}:${amount}`
    const data = await getOrCache(cacheKey, async () => {
      const url = `https://anyapi.io/api/v1/exchange/convert?apiKey=${process.env.API_KEY}&base=${encodeURIComponent(
        base
      )}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`

      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
        cache: "no-store"
      })

      if (!res.ok) {
        console.error("FX API error:", res.status, res.statusText)
        throw new Error("rate_fetch_failed")
      }

      return res.json()
    }, 43200) // 12 hours
    
    return NextResponse.json({
      base,
      symbol: to,
      rate: data.rate,
      converted: data.converted,
      lastUpdate: data.lastUpdate
    })
  } catch (error) {
    console.error("Error in FX API route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

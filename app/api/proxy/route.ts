import { NextRequest, NextResponse } from "next/server"
import { getOrCache } from "@/lib/Redis"

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url")
    if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    try {
        const text = await getOrCache(`proxy:${url}`, async () => {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
            return response.text()
        }, 3600) // 1 hour

        return new NextResponse(text, {
            status: 200,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to fetch URL" }, { status: 500 })
    }
}

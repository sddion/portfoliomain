import { NextRequest, NextResponse } from "next/server"
import { getOrCache } from "@/lib/Redis"

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url")
    if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    try {
        // Cache binary as base64 string
        const base64Data = await getOrCache(`firmware:${url}`, async () => {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
            
            const arrayBuffer = await response.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            return buffer.toString('base64')
        }, 86400) // 24 hours

        const buffer = Buffer.from(base64Data, 'base64')
        
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "Access-Control-Allow-Origin": "*",
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to fetch firmware" }, { status: 500 })
    }
}

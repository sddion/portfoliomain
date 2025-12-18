import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url")
    if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
        
        const buffer = await response.arrayBuffer()
        
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

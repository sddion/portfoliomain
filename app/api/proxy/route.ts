import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url")
    if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    try {
        const response = await fetch(url)
        const text = await response.text()
        return new NextResponse(text, {
            status: response.status,
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "text/plain",
            }
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch URL" }, { status: 500 })
    }
}

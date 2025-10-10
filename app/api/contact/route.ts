import { type NextRequest, NextResponse } from "next/server"

// Server-side validation schema
interface ContactFormData {
  name: string
  email: string
  message: string
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 1000) // Limit length and trim whitespace
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()

    // Server-side validation
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const name = sanitizeInput(body.name)
    const email = sanitizeInput(body.email)
    const message = sanitizeInput(body.message)

    if (name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 })
    }

    // Here you would typically:
    // 1. Send email via service like SendGrid, Resend, or Nodemailer
    // 2. Store in database
    // 3. Send to notification service

    // For now, we'll just log and return success
    console.log("[v0] Contact form submission:", { name, email, message })

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your message! I will get back to you soon.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 })
  }
}

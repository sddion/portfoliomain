"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface FormState {
  name: string
  email: string
  message: string
}

interface FormStatus {
  type: "idle" | "loading" | "success" | "error"
  message?: string
}

export function ContactSection() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  })
  const [status, setStatus] = useState<FormStatus>({ type: "idle" })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus({ type: "loading" })

    try {
      // Client-side fetch to server API route - proper separation of concerns
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      setStatus({
        type: "success",
        message: data.message,
      })
      setFormData({ name: "", email: "", message: "" })
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong",
      })
    }
  }

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 text-center">Get In Touch</h2>
        <p className="text-muted mb-12 text-center leading-relaxed">
          Have a project in mind or want to collaborate? Feel free to reach out!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={status.type === "loading"}
              className="bg-card border-border"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={status.type === "loading"}
              className="bg-card border-border"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message
            </label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              disabled={status.type === "loading"}
              className="bg-card border-border min-h-[150px]"
              placeholder="Your message..."
            />
          </div>

          {status.message && (
            <div
              className={`p-4 rounded-lg ${
                status.type === "success"
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
            >
              {status.message}
            </div>
          )}

          <Button type="submit" disabled={status.type === "loading"} className="w-full bg-primary hover:bg-primary/90">
            {status.type === "loading" ? "Sending..." : "Send Message"}
          </Button>
        </form>

        <div className="mt-12 flex justify-center gap-6">
          <a
            href="https://github.com/sddion"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://gitlab.com/dedsec"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-primary transition-colors"
          >
            GitLab
          </a>
          <a
            href="https://linkedin.com/in/sanju-kumar-sddion"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-primary transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}

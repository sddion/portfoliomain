"use client"

import { Button } from "@/components/ui/button"
import { Github, Gitlab, Mail, ArrowDown, Music } from "lucide-react"
import Link from "next/link"
import { useMounted } from "@/hooks/use-mounted"

export function HeroSection() {
  const mounted = useMounted()

  if (!mounted) {
    return null
  }
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="container mx-auto max-w-5xl">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <p className="text-accent font-mono text-sm sm:text-base">Hi, my name is</p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground">Sanju</h1>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-muted-foreground">
              Full-Stack Developer & Security Engineer
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Fullstack dev, automation junkie, CLI wizard, and professional code wrangler. If it can be automated,
              I&apos;ll automate it. If it can&apos;t, I&apos;ll still try.
            </p>
          </div>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            I write code, break code, fix code, and sometimes make code dance to music. Fluent in Bash, PowerShell,
            JavaScript, TypeScript, Python, and sarcasm. I build web apps, CLI tools, PowerShell scripts, music players,
            secure comms, e-commerce—and memes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="#projects">View My Work</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#contact">Get In Touch</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a
                href="https://ragava.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                {mounted && <Music className="h-4 w-4" />} Try My Music Player
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-8">
            <a
              href="https://github.com/sddion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
              aria-label="GitHub"
            >
              {mounted && <Github className="h-6 w-6" />}
            </a>
            <a
              href="https://gitlab.com/0xdedsec"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
              aria-label="GitLab"
            >
              {mounted && <Gitlab className="h-6 w-6" />}
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-accent transition-colors" aria-label="Email">
              {mounted && <Mail className="h-6 w-6" />}
            </a>
          </div>

          <div className="pt-12">
            <Link
              href="#about"
              className="inline-flex items-center justify-center text-muted-foreground hover:text-accent transition-colors animate-bounce"
              aria-label="Scroll to about section"
            >
              {mounted && <ArrowDown className="h-6 w-6" />}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

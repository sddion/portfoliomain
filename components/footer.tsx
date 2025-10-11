"use client"

import { Github, Gitlab, Linkedin, Twitter } from "lucide-react"
import { Button } from "./ui/button"
import { useMounted } from "@/hooks/use-mounted"

export function Footer() {
  const mounted = useMounted()
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex justify-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="https://github.com/sddion" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              {mounted && <Github className="h-5 w-5" />}
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://gitlab.com/0xdedsec" target="_blank" rel="noopener noreferrer" aria-label="GitLab">
              {mounted && <Gitlab className="h-5 w-5" />}
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://linkedin.com/in/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              {mounted && <Linkedin className="h-5 w-5" />}
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              {mounted && <Twitter className="h-5 w-5" />}
            </a>
          </Button>
        </div>
        <div className="text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} • Built with Next.js & TypeScript</p>
          <p className="mt-2">Self-taught developer passionate about web, mobile, embedded systems, and security.</p>
        </div>
      </div>
    </footer>
  )
}

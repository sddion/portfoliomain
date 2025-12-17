"use client"

import React, { useState, useEffect, useRef } from "react"
import { useWindowManager } from "@/components/os/WindowManager"

export function TerminalApp() {
    const [history, setHistory] = useState<string[]>([
        "Welcome to SanjuOS v2.0.4",
        "Type 'help' for a list of commands.",
    ])
    const [input, setInput] = useState("")
    const endRef = useRef<HTMLDivElement>(null)
    const { openWindow } = useWindowManager()

    const commands: Record<string, (args: string[]) => void> = {
        help: () => {
            addToHistory("Available commands: help, clear, whoami, projects, github, date")
        },
        clear: () => {
            setHistory([])
        },
        whoami: () => {
            addToHistory("guest@sanju-portfolio")
        },
        date: () => {
            addToHistory(new Date().toString())
        },
        github: () => {
            addToHistory("Opening GitHub...")
            window.open("https://github.com/sddion", "_blank")
        },
        projects: () => {
            addToHistory("Listing projects...")
            // TODO: List projects textually or open project window
            addToHistory("- Bagley (AI Assistant)")
            addToHistory("- Portfolio (This website)")
        },
        curl: async (args) => {
            const url = args[0]
            if (!url) {
                addToHistory("Usage: curl <url>")
                return
            }
            addToHistory(`Fetching ${url}...`)
            try {
                const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`)
                if (!res.ok) throw new Error(res.statusText)
                const text = await res.text()
                addToHistory(text.substring(0, 500) + (text.length > 500 ? "\n... (truncated)" : ""))
            } catch (err) {
                addToHistory(`Error: ${err}`)
            }
        },
        sudo: () => {
            addToHistory("Permission denied: You are not in the sudoers file. This incident will be reported.")
        }
    }

    const addToHistory = (text: string) => {
        setHistory((prev) => [...prev, text])
    }

    const handleCommand = (cmd: string) => {
        const [command, ...args] = cmd.trim().split(" ")
        if (!command) return

        addToHistory(`guest@sanju-portfolio:~$ ${cmd}`)

        if (commands[command]) {
            commands[command](args)
        } else {
            addToHistory(`Command not found: ${command}`)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleCommand(input)
        setInput("")
    }

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [history])

    return (
        <div
            className="h-full bg-[#0c0c0c] text-green-500 font-mono p-4 text-sm overflow-auto"
            onClick={() => document.getElementById("terminal-input")?.focus()}
        >
            {history.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap mb-1">{line}</div>
            ))}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <span className="text-blue-400">guest@sanju-portfolio:~$</span>
                <input
                    id="terminal-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-green-500"
                    autoFocus
                    autoComplete="off"
                />
            </form>
            <div ref={endRef} />
        </div>
    )
}

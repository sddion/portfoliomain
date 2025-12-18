"use client"

import React, { useState, useEffect, useRef } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { Folder } from "lucide-react"

export function TerminalApp() {
    const [history, setHistory] = useState<string[]>([
        "Welcome to SanjuOS v2.0.4",
        "Type 'help' for a list of commands.",
    ])
    const [input, setInput] = useState("")
    const endRef = useRef<HTMLDivElement>(null)
    const { openWindow } = useWindowManager()
    const portRef = useRef<any>(null)
    const esploaderRef = useRef<any>(null)

    const commands: Record<string, (args: string[]) => void> = {
        help: () => {
            addToHistory("Available commands: help, curl, clear, whoami, projects, github, date, esp")
        },
        esp: async (args) => {
            const subCommand = args[0]
            if (!subCommand || subCommand === "help") {
                addToHistory("ESP Tool commands:")
                addToHistory("  esp connect     - Connect to ESP32 device")
                addToHistory("  esp disconnect  - Disconnect device")
                addToHistory("  esp info         - Get chip information")
                addToHistory("  esp flash <url> [addr] - Flash firmware from URL")
                addToHistory("  esp erase       - Erase flash")
                return
            }

            try {
                if (subCommand === "connect") {
                    if (portRef.current) {
                        addToHistory("Already connected. Use 'esp disconnect' first.")
                        return
                    }
                    addToHistory("Requesting serial port...")
                    const port = await (navigator as any).serial.requestPort()
                    await port.open({ baudRate: 115200 })
                    portRef.current = port

                    const { Transport, ESPLoader } = await import("esptool-js")
                    const transport = new Transport(port, true)
                    const loader = new ESPLoader({
                        transport,
                        baudrate: 115200,
                        romBaudrate: 115200,
                        terminal: {
                            clean: () => { },
                            writeLine: (data: string) => addToHistory(data),
                            write: (data: string) => addToHistory(data),
                        },
                    })
                    esploaderRef.current = loader
                    const chip = await loader.main()
                    addToHistory(`\nSUCCESS: Connected to ${chip}`)
                } else if (subCommand === "info") {
                    if (!esploaderRef.current) throw new Error("Not connected. Run 'esp connect' first.")
                    addToHistory(`Chip: ${esploaderRef.current.chip || "Unknown"}`)
                } else if (subCommand === "flash") {
                    const url = args[1]
                    const addr = args[2] || "0x1000"
                    if (!url) throw new Error("Usage: esp flash <url> [address]")
                    if (!esploaderRef.current) throw new Error("Not connected")

                    addToHistory(`Downloading firmware from proxy...`)
                    const res = await fetch(`/api/esp/firmware?url=${encodeURIComponent(url)}`)
                    if (!res.ok) throw new Error("Failed to download firmware")
                    const buffer = await res.arrayBuffer()

                    addToHistory(`Flashing to ${addr}...`)
                    const loader = esploaderRef.current
                    await loader.writeFlash({
                        fileArray: [{
                            data: new Uint8Array(buffer),
                            address: parseInt(addr, 16)
                        }],
                        flashSize: "keep",
                        flashMode: "keep",
                        flashFreq: "keep",
                        eraseAll: false,
                        compress: true,
                        reportProgress: (fileIndex: number, written: number, total: number) => {
                            if (written % 10240 === 0 || written === total) {
                                addToHistory(`Progress: ${Math.round((written / total) * 100)}%`)
                            }
                        }
                    })
                    addToHistory("Flash Complete!")
                    await loader.hardReset()
                    addToHistory("Hard resetting...")
                } else if (subCommand === "erase") {
                    if (!esploaderRef.current) throw new Error("Not connected")
                    addToHistory("Erasing flash...")
                    await esploaderRef.current.eraseFlash()
                    addToHistory("Erase successful!")
                } else if (subCommand === "disconnect") {
                    if (portRef.current) {
                        await portRef.current.close()
                        portRef.current = null
                        esploaderRef.current = null
                        addToHistory("Disconnected.")
                    } else {
                        addToHistory("Not connected.")
                    }
                }
            } catch (err: any) {
                addToHistory(`ERROR: ${err.message}`)
            }
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
            addToHistory("Opening Projects window...")
            openWindow("projects", "Projects", <ProjectsApp />, <Folder className="text-yellow-400" size={32} />)
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

        addToHistory(`guest@portfolio:~$ ${cmd}`)

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
            className="h-full bg-[var(--terminal-bg)] text-[var(--primary)] font-mono p-4 text-sm overflow-auto"
            onClick={() => document.getElementById("terminal-input")?.focus()}
        >
            {history.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap mb-1">{line}</div>
            ))}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <span className="text-[var(--accent)]">guest@sanju-portfolio:~$</span>
                <input
                    id="terminal-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-[var(--primary)]"
                    autoFocus
                    autoComplete="off"
                />
            </form>
            <div ref={endRef} />
        </div>
    )
}

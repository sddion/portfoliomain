"use client"

import React, { useState, useEffect, useRef } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { Folder, Globe } from "lucide-react"

export function TerminalApp() {
    const [history, setHistory] = useState<string[]>([
        "Type 'help' for a list of commands.",
    ])
    const [input, setInput] = useState("")
    const endRef = useRef<HTMLDivElement>(null)
    const { openWindow } = useWindowManager()
    const portRef = useRef<any>(null)
    const esploaderRef = useRef<any>(null)

    const commands: Record<string, (args: string[]) => void> = {
        help: () => {
            addToHistory("Available commands: help, img2bytes, esp, curl, clear, whoami, date")
        },
        img2bytes: async (args) => {
            const subCommand = args[0]
            if (!subCommand || subCommand === "help") {
                addToHistory("Img2Bytes - Image to Byte Array Converter")
                addToHistory("")
                addToHistory("Usage:")
                addToHistory("  img2bytes convert <url> [options]  - Convert image to bytes")
                addToHistory("  img2bytes presets                   - List canvas presets")
                addToHistory("  img2bytes help                      - Show this help")
                addToHistory("")
                addToHistory("Options:")
                addToHistory("  --width <n>    Canvas width (default: 128)")
                addToHistory("  --height <n>   Canvas height (default: 64)")
                addToHistory("  --color <mode> mono|grayscale|rgb565|rgb888 (default: mono)")
                addToHistory("  --dither <d>   none|floydSteinberg|atkinson|bayer")
                addToHistory("  --format <f>   hex|decimal|binary (default: hex)")
                addToHistory("  --name <var>   Variable name (default: image)")
                addToHistory("  --invert       Invert colors")
                addToHistory("  --save         Download output as .h file")
                addToHistory("")
                addToHistory("Example:")
                addToHistory("  img2bytes convert https://example.com/logo.png --width 128 --height 64 --save")
                return
            }

            if (subCommand === "presets") {
                addToHistory("Canvas Presets:")
                addToHistory("  128×64   SSD1306 OLED")
                addToHistory("  128×32   SSD1306 Mini")
                addToHistory("  96×64    SSD1331 Color OLED")
                addToHistory("  160×128  ST7735 TFT")
                addToHistory("  240×240  ST7789 Square")
                addToHistory("  320×240  ILI9341 TFT")
                addToHistory("  480×320  ILI9488 Large TFT")
                return
            }

            if (subCommand === "convert") {
                const url = args[1]
                if (!url) {
                    addToHistory("ERROR: No URL provided")
                    addToHistory("Usage: img2bytes convert <url> [options]")
                    return
                }

                // Parse options
                const parseOption = (flag: string, defaultVal: string): string => {
                    const idx = args.indexOf(flag)
                    return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal
                }

                const width = parseInt(parseOption("--width", "128"))
                const height = parseInt(parseOption("--height", "64"))
                const colorMode = parseOption("--color", "mono") as "mono" | "grayscale" | "rgb565" | "rgb888"
                const dithering = parseOption("--dither", "none") as "none" | "floydSteinberg" | "atkinson" | "bayer"
                const format = parseOption("--format", "hex") as "hex" | "decimal" | "binary"
                const invert = args.includes("--invert")

                try {
                    addToHistory(`Fetching image from URL...`)

                    // Fetch image through proxy to avoid CORS
                    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`
                    const res = await fetch(proxyUrl)
                    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`)

                    const blob = await res.blob()
                    const img = new Image()

                    await new Promise<void>((resolve, reject) => {
                        img.onload = () => resolve()
                        img.onerror = () => reject(new Error("Failed to load image"))
                        img.src = URL.createObjectURL(blob)
                    })

                    addToHistory(`Image loaded: ${img.width}×${img.height}`)
                    addToHistory(`Processing: ${width}×${height}, ${colorMode}, dither=${dithering}`)

                    // Import and use ImageProcessor
                    const { ProcessImage, GenerateCode, DownloadFile } = await import("@/lib/ImageProcessor")

                    const variableName = parseOption("--name", "image")
                    const shouldSave = args.includes("--save")

                    const result = ProcessImage(img, {
                        canvasWidth: width,
                        canvasHeight: height,
                        backgroundColor: "black",
                        scaling: "fit",
                        centerH: true,
                        centerV: true,
                        threshold: 128,
                        invert,
                        dithering,
                        rotation: 0,
                        flipH: false,
                        colorMode,
                        drawMode: "vertical"
                    })

                    const code = GenerateCode(result, {
                        format,
                        variableName,
                        progmem: true,
                        bytesPerLine: 16,
                        includeSize: true
                    })

                    addToHistory("")
                    addToHistory("=== OUTPUT ===")
                    // Split code into lines for display
                    code.split("\n").forEach(line => addToHistory(line))
                    addToHistory("")
                    addToHistory(`Total bytes: ${result.totalBytes}`)

                    // Download if --save flag is present
                    if (shouldSave) {
                        DownloadFile(code, `${variableName}.h`)
                        addToHistory(`Saved to ${variableName}.h`)
                    } else {
                        addToHistory("Tip: Add --save to download as .h file")
                    }

                    URL.revokeObjectURL(img.src)
                } catch (err: any) {
                    addToHistory(`ERROR: ${err.message}`)
                }
                return
            }

            addToHistory(`Unknown subcommand: ${subCommand}`)
            addToHistory("Run 'img2bytes help' for usage")
        },
        esp: async (args) => {
            const subCommand = args[0]
            if (!subCommand || subCommand === "help") {
                addToHistory("ESP Tool commands:")
                addToHistory("  esp connect     - Connect to ESP32 device")
                addToHistory("  esp disconnect  - Disconnect device")
                addToHistory("  esp info        - Get chip information")
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
            className="h-full w-full overflow-hidden bg-[var(--terminal-bg)]"
            onClick={() => document.getElementById("terminal-input")?.focus()}
        >
            <div className="h-full flex flex-col font-mono text-sm md:text-base p-4 overflow-auto">
                <div className="flex-1">
                    {history.map((line, i) => (
                        <div key={i} className="whitespace-pre-wrap mb-1 text-[12px] md:text-sm leading-tight text-green-500">{line}</div>
                    ))}
                    <form onSubmit={handleSubmit} className="flex gap-2 text-[12px] md:text-sm">
                        <span className="text-[var(--accent)] shrink-0">guest@portfolio:~$</span>
                        <input
                            id="terminal-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-[var(--primary)] min-w-0"
                            autoFocus
                            autoComplete="off"
                        />
                    </form>
                    <div ref={endRef} />
                </div>
            </div>
        </div>
    )
}

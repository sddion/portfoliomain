"use client"

import React, { useState, useRef } from "react"
import { Upload, Usb, AlertCircle, CheckCircle, Trash2, Play, X } from "lucide-react"

export function ESP32FlasherApp() {
    const [connected, setConnected] = useState(false)
    const [connecting, setConnecting] = useState(false)
    const [flashing, setFlashing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [chipInfo, setChipInfo] = useState("")
    const [logs, setLogs] = useState<string[]>([])
    const [error, setError] = useState("")
    const [files, setFiles] = useState<Array<{ file: File; address: string }>>([])
    const [baudRate, setBaudRate] = useState(115200)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const portRef = useRef<any>(null)
    const esploaderRef = useRef<any>(null)

    const supported = typeof window !== "undefined" && "serial" in navigator

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-50))
    }

    const handleConnect = async () => {
        if (!supported) {
            setError("Web Serial API not supported. Use Chrome or Edge browser.")
            return
        }

        setConnecting(true)
        setError("")
        addLog("Requesting serial port...")

        try {
            // Request port
            const port = await (navigator as any).serial.requestPort()
            await port.open({ baudRate: baudRate })
            portRef.current = port

            addLog("Port opened successfully")
            addLog("Connecting to ESP32...")

            // Import esptool-js dynamically
            const { Transport, ESPLoader } = await import("esptool-js")

            // Create transport and loader
            const transport = new Transport(port, true)
            const loader = new ESPLoader({
                transport,
                baudrate: baudRate,
                romBaudrate: baudRate,
                terminal: {
                    clean: () => setLogs([]),
                    writeLine: (data: string) => addLog(data),
                    write: (data: string) => addLog(data),
                },
            })

            esploaderRef.current = loader

            // Connect and detect chip
            const chip = await loader.main()
            setChipInfo(`${chip} detected`)
            addLog(`Connected to ${chip}!`)

            setConnected(true)
        } catch (err: any) {
            setError(err.message || "Failed to connect. Make sure ESP32 is in bootloader mode.")
            addLog(`Error: ${err.message}`)
        } finally {
            setConnecting(false)
        }
    }

    const handleDisconnect = async () => {
        if (portRef.current) {
            try {
                await portRef.current.close()
                portRef.current = null
                esploaderRef.current = null
                setConnected(false)
                setChipInfo("")
                addLog("Disconnected")
            } catch (err: any) {
                addLog(`Disconnect error: ${err.message}`)
            }
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        const newFiles = selectedFiles.map(file => ({
            file,
            address: "0x10000" // Default firmware address
        }))
        setFiles(prev => [...prev, ...newFiles])
        addLog(`Added ${selectedFiles.length} file(s)`)
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const updateAddress = (index: number, address: string) => {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, address } : f))
    }

    const handleFlash = async () => {
        if (files.length === 0) {
            setError("Please select at least one .bin file")
            return
        }

        setFlashing(true)
        setError("")
        setProgress(0)
        addLog("Starting flash operation...")

        try {
            const loader = esploaderRef.current
            if (!loader) throw new Error("Not connected")

            // Prepare file array for flashing
            const fileArray = await Promise.all(
                files.map(async ({ file, address }) => {
                    const arrayBuffer = await file.arrayBuffer()
                    return {
                        data: new Uint8Array(arrayBuffer),
                        address: parseInt(address, 16)
                    }
                })
            )

            addLog(`Flashing ${files.length} file(s)...`)

            // Flash files
            await loader.writeFlash({
                fileArray,
                flashSize: "keep",
                flashMode: "keep",
                flashFreq: "keep",
                eraseAll: false,
                compress: true,
                reportProgress: (fileIndex: number, written: number, total: number) => {
                    const percent = Math.round((written / total) * 100)
                    setProgress(percent)
                }
            })

            addLog("Flash complete!")
            addLog("Hard resetting via RTS pin...")
            await loader.hardReset()
            setProgress(100)
        } catch (err: any) {
            setError(err.message || "Flash failed")
            addLog(`Flash error: ${err.message}`)
        } finally {
            setFlashing(false)
        }
    }

    const handleErase = async () => {
        if (!window.confirm("This will erase all flash memory. Continue?")) {
            return
        }

        setFlashing(true)
        setError("")
        addLog("Erasing flash...")

        try {
            const loader = esploaderRef.current
            if (!loader) throw new Error("Not connected")

            await loader.eraseFlash()
            addLog("Flash erased successfully!")
        } catch (err: any) {
            setError(err.message || "Erase failed")
            addLog(`Erase error: ${err.message}`)
        } finally {
            setFlashing(false)
        }
    }

    return (
        <div className="h-full bg-[var(--background)] text-[var(--foreground)] font-mono overflow-auto flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 select-none">
            {/* Main Cyber Container */}
            <div className="relative w-full max-w-2xl bg-[var(--os-surface)] border-2 border-[var(--primary)]/40 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,107,0,0.1)] flex flex-col my-4 sm:my-0">

                {/* Decorative Cyber Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--primary)] rounded-tl-sm z-10" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--primary)] rounded-tr-sm z-10" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--primary)] rounded-bl-sm z-10" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--primary)] rounded-br-sm z-10" />

                {/* Header Section */}
                <div className="relative pt-6 pb-4 px-8 flex flex-col items-center">
                    <div className="flex items-center gap-6 w-full justify-center">
                        {/* Left Wings */}
                        <div className="hidden md:flex flex-col gap-1 items-end opacity-80">
                            <div className="w-12 h-0.5 bg-[var(--accent)]" />
                            <div className="w-8 h-0.5 bg-[var(--accent)]" />
                            <div className="w-4 h-0.5 bg-[var(--accent)]" />
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black tracking-[0.2em] text-[var(--foreground)] uppercase">
                            ESP32 <span className="text-[var(--primary)]">Flasher</span> Tool
                        </h1>

                        {/* Right Wings */}
                        <div className="hidden md:flex flex-col gap-1 items-start opacity-80">
                            <div className="w-12 h-0.5 bg-[var(--accent)]" />
                            <div className="w-8 h-0.5 bg-[var(--accent)]" />
                            <div className="w-4 h-0.5 bg-[var(--accent)]" />
                        </div>
                    </div>
                    <div className="mt-2 text-[10px] text-[var(--accent)]/60 tracking-widest uppercase">System Interface v2.0.4</div>
                </div>

                {/* Browser Support Warning */}
                {!supported && (
                    <div className="mx-4 mb-4 bg-red-900/20 border border-red-500/50 p-3 flex items-center gap-3 text-red-400 text-xs">
                        <AlertCircle size={16} />
                        <span>Web Serial API not supported. Use Chrome or Edge.</span>
                    </div>
                )}

                <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">

                    {/* File Drop/Selection Area */}
                    <div
                        className={`relative border-2 ${files.length > 0 ? 'border-[var(--primary)]/60' : 'border-[var(--primary)]/30'} border-dashed rounded-md bg-black/20 p-8 flex flex-col items-center transition-all duration-300 group hover:border-[var(--primary)]`}
                        onClick={() => !flashing && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".bin"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <div className="w-16 h-16 mb-4 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
                            <Upload size={48} strokeWidth={1.5} />
                        </div>
                        <p className="text-[var(--primary)] text-sm font-bold tracking-widest uppercase mb-4">
                            {files.length > 0 ? `${files.length} Files Selected` : 'Drop Firmware Binary Here'}
                        </p>
                        <button
                            className="px-6 py-2 border border-[var(--accent)] text-[var(--accent)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--accent)]/10 transition-colors"
                        >
                            Browse Files
                        </button>
                    </div>

                    {/* Progress and Connection Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 px-1">
                            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--accent)]">
                                <div className="flex items-center gap-2">
                                    {progress === 100 && !flashing && <CheckCircle size={10} className="text-green-500 animate-pulse" />}
                                    {flashing ? `Flashing: ${progress}%` : progress === 100 ? 'Flash Success' : error ? 'System Error' : 'System Ready'}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                                {!connected && (
                                    <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded border border-[var(--accent)]/20">
                                        <span className="text-[8px] text-[var(--accent)]/60 uppercase">Baud:</span>
                                        <select
                                            value={baudRate}
                                            onChange={(e) => setBaudRate(Number(e.target.value))}
                                            className="bg-transparent text-[var(--accent)] text-[10px] outline-none cursor-pointer hover:border-[var(--accent)] flex-1"
                                        >
                                            <option className="bg-[var(--os-surface)]" value={9600}>9600</option>
                                            <option className="bg-[var(--os-surface)]" value={115200}>115200</option>
                                            <option className="bg-[var(--os-surface)]" value={921600}>921600</option>
                                        </select>
                                    </div>
                                )}
                                <button
                                    onClick={connected ? handleDisconnect : handleConnect}
                                    disabled={connecting || flashing}
                                    className={`flex items-center justify-center gap-2 px-6 py-3 sm:py-1.5 border ${connected ? 'border-[var(--destructive)] text-[var(--destructive)] uppercase' : 'border-[var(--accent)] text-[var(--accent)] uppercase'} text-[10px] font-black tracking-widest hover:bg-white/5 transition-all rounded-sm`}
                                >
                                    <Usb size={14} />
                                    {connecting ? 'Connecting...' : connected ? 'Disconnect' : 'Connect Device'}
                                </button>
                            </div>
                        </div>

                        {/* Segmented Progress Bar */}
                        <div className="h-8 w-full bg-black/20 border border-[var(--accent)]/20 rounded-sm p-1 flex gap-0.5 overflow-hidden">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 h-full rounded-sm transition-all duration-300 ${(i / 40) * 100 < progress
                                        ? 'bg-[var(--accent)] shadow-[0_0_10px_rgba(0,163,255,0.6)]'
                                        : 'bg-[var(--foreground)]/10'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Flash Files List - Scrollable */}
                    {files.length > 0 && connected && (
                        <div className="bg-black/20 border border-[var(--primary)]/20 rounded p-4 space-y-2 max-h-40 overflow-auto custom-scrollbar">
                            {files.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 text-[10px] border-b border-white/5 pb-2">
                                    <div className="flex-1 truncate opacity-70">{item.file.name}</div>
                                    <input
                                        type="text"
                                        value={item.address}
                                        onChange={(e) => updateAddress(index, e.target.value)}
                                        className="bg-transparent border-b border-[var(--primary)]/40 text-[var(--primary)] w-20 outline-none text-center"
                                    />
                                    <button onClick={() => removeFile(index)} className="text-[var(--destructive)] hover:scale-110"><X size={12} /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Console Output */}
                    <div className="relative">
                        <div className="absolute top-0 right-4 px-2 bg-[var(--os-surface)] text-[8px] text-[var(--primary)] uppercase tracking-widest -translate-y-1/2">Terminal.vlogs</div>
                        <div className="bg-black/40 border border-[var(--primary)]/40 rounded-sm p-4 h-32 overflow-y-auto font-mono text-[9px] text-[var(--primary)]/80 leading-relaxed custom-scrollbar shadow-inner">
                            {logs.length === 0 ? (
                                <span className="opacity-30 italic">Initialize connection to view logs...</span>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-2 mb-1">
                                        <span className="opacity-40">{log.match(/\[(.*?)\]/)?.[1] || ''}</span>
                                        <span>{log.replace(/\[.*?\]/, '')}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {connected && (
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button
                                onClick={handleFlash}
                                disabled={flashing || files.length === 0}
                                className={`flex-1 h-16 sm:h-12 bg-transparent border-2 border-[var(--primary)] text-[var(--primary)] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs shadow-[0_0_15px_rgba(255,107,0,0.2)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all disabled:opacity-30 disabled:border-zinc-700 disabled:text-zinc-700 disabled:shadow-none flex items-center justify-center gap-3`}
                            >
                                <Play size={20} fill="currentColor" className="sm:size-4" />
                                {flashing ? 'Flashing Sequence Active' : 'Begin Flash Cycle'}
                            </button>
                            <button
                                onClick={handleErase}
                                disabled={flashing}
                                className="h-16 sm:h-12 sm:w-12 border border-[var(--destructive)]/40 flex items-center justify-center text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors uppercase text-[10px] font-bold tracking-widest gap-2 sm:gap-0"
                                title="Erase All Flash"
                            >
                                <Trash2 size={18} />
                                <span className="sm:hidden">Erase All</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-6 py-3 bg-black/20 border-t border-white/5 flex justify-between items-center text-[8px] uppercase tracking-widest text-[var(--muted-foreground)]">
                    <div>Hardware: {chipInfo || 'None'}</div>
                    <div className="flex gap-4">
                        <span>CPU: ESP32-S3</span>
                        <span>Interface: USB-SERIAL</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--primary);
                    opacity: 0.3;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    opacity: 0.6;
                }
            `}</style>
        </div>
    )
}

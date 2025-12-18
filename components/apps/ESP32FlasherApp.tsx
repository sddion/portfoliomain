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
        <div className="h-full bg-[#0D0D0D] text-white font-mono overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 select-none">
            {/* Main Cyber Container */}
            <div className="relative w-full max-w-2xl bg-[#151515] border-2 border-[#FF6B00]/40 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,107,0,0.1)] flex flex-col">

                {/* Decorative Cyber Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FF6B00] rounded-tl-sm z-10" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#FF6B00] rounded-tr-sm z-10" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#FF6B00] rounded-bl-sm z-10" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FF6B00] rounded-br-sm z-10" />

                {/* Header Section */}
                <div className="relative pt-6 pb-4 px-8 flex flex-col items-center">
                    <div className="flex items-center gap-6 w-full justify-center">
                        {/* Left Wings */}
                        <div className="hidden sm:flex flex-col gap-1 items-end opacity-80">
                            <div className="w-12 h-0.5 bg-[#00A3FF]" />
                            <div className="w-8 h-0.5 bg-[#00A3FF]" />
                            <div className="w-4 h-0.5 bg-[#00A3FF]" />
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black tracking-[0.2em] text-[#E0E0E0] uppercase">
                            ESP32 <span className="text-[#FF6B00]">Flasher</span> Tool
                        </h1>

                        {/* Right Wings */}
                        <div className="hidden sm:flex flex-col gap-1 items-start opacity-80">
                            <div className="w-12 h-0.5 bg-[#00A3FF]" />
                            <div className="w-8 h-0.5 bg-[#00A3FF]" />
                            <div className="w-4 h-0.5 bg-[#00A3FF]" />
                        </div>
                    </div>
                    <div className="mt-2 text-[10px] text-[#00A3FF]/60 tracking-widest uppercase">System Interface v2.0.4</div>
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
                        className={`relative border-2 ${files.length > 0 ? 'border-[#FF6B00]/60' : 'border-[#FF6B00]/30'} border-dashed rounded-md bg-[#111111] p-8 flex flex-col items-center transition-all duration-300 group hover:border-[#FF6B00]`}
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
                        <div className="w-16 h-16 mb-4 flex items-center justify-center text-[#FF6B00] group-hover:scale-110 transition-transform">
                            <Upload size={48} strokeWidth={1.5} />
                        </div>
                        <p className="text-[#FF6B00] text-sm font-bold tracking-widest uppercase mb-4">
                            {files.length > 0 ? `${files.length} Files Selected` : 'Drop Firmware Binary Here'}
                        </p>
                        <button
                            className="px-6 py-2 border border-[#00A3FF] text-[#00A3FF] text-xs font-bold uppercase tracking-widest hover:bg-[#00A3FF]/10 transition-colors"
                        >
                            Browse Files
                        </button>
                    </div>

                    {/* Progress and Connection Section */}
                    <div className="space-y-4">
                        <div className="flex items-end justify-between px-1">
                            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#00A3FF]">
                                <div className="flex items-center gap-2">
                                    {progress === 100 && !flashing && <CheckCircle size={10} className="text-green-500 animate-pulse" />}
                                    {flashing ? `Flashing: ${progress}%` : progress === 100 ? 'Flash Success' : error ? 'System Error' : 'System Ready'}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {!connected && (
                                    <select
                                        value={baudRate}
                                        onChange={(e) => setBaudRate(Number(e.target.value))}
                                        className="bg-transparent border-b border-[#00A3FF]/30 text-[#00A3FF] text-[10px] outline-none cursor-pointer hover:border-[#00A3FF]"
                                    >
                                        <option className="bg-[#151515]" value={9600}>9600</option>
                                        <option className="bg-[#151515]" value={115200}>115200</option>
                                        <option className="bg-[#151515]" value={921600}>921600</option>
                                    </select>
                                )}
                                <button
                                    onClick={connected ? handleDisconnect : handleConnect}
                                    disabled={connecting || flashing}
                                    className={`flex items-center gap-2 px-4 py-1.5 border ${connected ? 'border-red-500 text-red-500 uppercase' : 'border-[#00A3FF] text-[#00A3FF] uppercase'} text-[10px] font-bold tracking-widest hover:bg-white/5 transition-all`}
                                >
                                    <Usb size={12} />
                                    {connecting ? 'Connecting...' : connected ? 'Disconnect' : 'Connect Device'}
                                </button>
                            </div>
                        </div>

                        {/* Segmented Progress Bar */}
                        <div className="h-8 w-full bg-[#111111]/80 border border-[#00A3FF]/20 rounded-sm p-1 flex gap-0.5 overflow-hidden">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 h-full rounded-sm transition-all duration-300 ${(i / 40) * 100 < progress
                                        ? 'bg-[#00A3FF] shadow-[0_0_10px_rgba(0,163,255,0.6)]'
                                        : 'bg-[#222222]/40'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Flash Files List - Scrollable */}
                    {files.length > 0 && connected && (
                        <div className="bg-[#0A0A0A] border border-[#FF6B00]/20 rounded p-4 space-y-2 max-h-40 overflow-auto custom-scrollbar">
                            {files.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 text-[10px] border-b border-white/5 pb-2">
                                    <div className="flex-1 truncate opacity-70">{item.file.name}</div>
                                    <input
                                        type="text"
                                        value={item.address}
                                        onChange={(e) => updateAddress(index, e.target.value)}
                                        className="bg-transparent border-b border-[#FF6B00]/40 text-[#FF6B00] w-20 outline-none text-center"
                                    />
                                    <button onClick={() => removeFile(index)} className="text-red-500 hover:scale-110"><X size={12} /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Console Output */}
                    <div className="relative">
                        <div className="absolute top-0 right-4 px-2 bg-[#151515] text-[8px] text-[#FF6B00] uppercase tracking-widest -translate-y-1/2">Terminal.vlogs</div>
                        <div className="bg-[#0A0A0A] border border-[#FF6B00]/40 rounded-sm p-4 h-32 overflow-y-auto font-mono text-[9px] text-[#FF6B00]/80 leading-relaxed custom-scrollbar shadow-inner">
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
                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={handleFlash}
                                disabled={flashing || files.length === 0}
                                className={`flex-1 h-12 bg-transparent border-2 border-[#FF6B00] text-[#FF6B00] font-black uppercase tracking-[0.3em] text-xs shadow-[0_0_15px_rgba(255,107,0,0.2)] hover:bg-[#FF6B00] hover:text-black transition-all disabled:opacity-30 disabled:border-zinc-700 disabled:text-zinc-700 disabled:shadow-none flex items-center justify-center gap-3`}
                            >
                                <Play size={16} fill="currentColor" />
                                {flashing ? 'Flashing Sequence Active' : 'Begin Flash Cycle'}
                            </button>
                            <button
                                onClick={handleErase}
                                disabled={flashing}
                                className="w-12 h-12 border border-red-900/40 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Erase All Flash"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-6 py-3 bg-[#111111] border-t border-white/5 flex justify-between items-center text-[8px] uppercase tracking-widest text-zinc-600">
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
                    background: #FF6B0044;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #FF6B0088;
                }
            `}</style>
        </div>
    )
}

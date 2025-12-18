"use client"

import React, { useState, useRef } from "react"
import { Zap, Upload, Cpu, AlertCircle, CheckCircle, Trash2, Play, X } from "lucide-react"

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
        <div className="h-full bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-900/20 text-white font-mono overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 sm:p-6 flex items-center gap-4 shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap className="text-white" size={32} />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">ESP32 Flasher</h1>
                    <p className="text-xs sm:text-sm text-orange-100">Web-based firmware uploader</p>
                </div>
            </div>

            {/* Browser Support Warning */}
            {!supported && (
                <div className="bg-red-900/50 border-l-4 border-red-500 p-4 m-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={20} />
                        <p className="text-sm">
                            <strong>Not Supported:</strong> This tool requires Web Serial API. Please use Google Chrome or Microsoft Edge.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4">
                {/* Connection Section */}
                <div className="bg-zinc-800/50 backdrop-blur rounded-xl p-4 border border-zinc-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Cpu size={18} className="text-orange-400" />
                            <h3 className="font-bold">Connection</h3>
                        </div>
                        {connected && (
                            <span className="text-xs px-2 py-1 bg-green-600 rounded-full flex items-center gap-1">
                                <CheckCircle size={12} /> Connected
                            </span>
                        )}
                    </div>

                    {chipInfo && (
                        <p className="text-sm text-green-400 mb-3">📡 {chipInfo}</p>
                    )}

                    {/* Baud Rate Selector */}
                    <div className="mb-3">
                        <label className="text-xs text-zinc-400 block mb-1">Baud Rate</label>
                        <select
                            value={baudRate}
                            onChange={(e) => setBaudRate(Number(e.target.value))}
                            disabled={connected || connecting}
                            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-sm disabled:opacity-50"
                        >
                            <option value={9600}>9600</option>
                            <option value={57600}>57600</option>
                            <option value={115200}>115200 (Default)</option>
                            <option value={230400}>230400</option>
                            <option value={460800}>460800</option>
                            <option value={921600}>921600 (Fast)</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        {!connected ? (
                            <button
                                onClick={handleConnect}
                                disabled={connecting || !supported}
                                className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Zap size={16} />
                                {connecting ? "Connecting..." : "Connect ESP32"}
                            </button>
                        ) : (
                            <button
                                onClick={handleDisconnect}
                                disabled={flashing}
                                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                </div>

                {/* File Upload Section */}
                {connected && (
                    <div className="bg-zinc-800/50 backdrop-blur rounded-xl p-4 border border-zinc-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Upload size={18} className="text-blue-400" />
                            <h3 className="font-bold">Firmware Files</h3>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".bin"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={flashing}
                            className="w-full border-2 border-dashed border-zinc-600 hover:border-orange-500 rounded-lg p-4 mb-3 transition-colors"
                        >
                            <Upload size={24} className="mx-auto mb-2 text-zinc-400" />
                            <p className="text-sm text-zinc-400">Click to select .bin files</p>
                        </button>

                        {files.length > 0 && (
                            <div className="space-y-2">
                                {files.map((item, index) => (
                                    <div key={index} className="bg-zinc-900/50 rounded-lg p-3 flex items-center gap-2">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium truncate">{item.file.name}</p>
                                            <p className="text-xs text-zinc-500">{(item.file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                        <input
                                            type="text"
                                            value={item.address}
                                            onChange={(e) => updateAddress(index, e.target.value)}
                                            disabled={flashing}
                                            className="w-24 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs"
                                            placeholder="0x10000"
                                        />
                                        <button
                                            onClick={() => removeFile(index)}
                                            disabled={flashing}
                                            className="p-1 hover:bg-red-600 rounded"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Flash Actions */}
                {connected && files.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleFlash}
                            disabled={flashing}
                            className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Play size={18} />
                            {flashing ? `Flashing... ${progress}%` : "Flash Firmware"}
                        </button>
                        <button
                            onClick={handleErase}
                            disabled={flashing}
                            className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Erase
                        </button>
                    </div>
                )}

                {/* Progress Bar */}
                {flashing && progress > 0 && (
                    <div className="bg-zinc-800/50 backdrop-blur rounded-xl p-4 border border-zinc-700">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200">{error}</p>
                    </div>
                )}

                {/* Console Logs */}
                <div className="bg-black/40 backdrop-blur rounded-xl p-4 border border-zinc-800">
                    <h3 className="font-bold text-sm mb-2 text-zinc-400">Console Output</h3>
                    <div className="h-40 overflow-y-auto scrollbar-hide space-y-1 font-mono text-xs">
                        {logs.length === 0 ? (
                            <p className="text-zinc-600 italic">Waiting for connection...</p>
                        ) : (
                            logs.map((log, i) => (
                                <p key={i} className="text-green-400">{log}</p>
                            ))
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <AlertCircle size={16} className="text-blue-400" />
                        <span>Bootloader Mode Instructions</span>
                    </h3>
                    <ul className="text-xs space-y-1 text-zinc-300">
                        <li>• Connect ESP32 via USB cable</li>
                        <li>• Click "Connect ESP32" and select the COM port</li>
                        <li>• If connection fails: Hold BOOT button → Press RST → Release BOOT</li>
                        <li>• Upload .bin files with correct flash addresses</li>
                        <li>• Common addresses: 0x0 (bootloader), 0x8000 (partitions), 0x10000 (firmware)</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

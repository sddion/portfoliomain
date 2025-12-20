"use client"

import React, { useState, useEffect, useRef } from "react"
import { Cpu, Terminal, Power, Trash2, Send, Activity, Settings, Wifi } from "lucide-react"

export function IoTControlApp() {
    const [connected, setConnected] = useState(false)
    const [port, setPort] = useState<any>(null)
    const [logs, setLogs] = useState<{ type: 'in' | 'out', text: string, time: string }[]>([])
    const [input, setInput] = useState("")
    const [baudRate, setBaudRate] = useState(115200)
    const [chartData, setChartData] = useState<number[]>([])
    const logEndRef = useRef<HTMLDivElement>(null)
    const readerRef = useRef<ReadableStreamDefaultReader | null>(null)

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const addLog = (text: string, type: 'in' | 'out' = 'in') => {
        setLogs(prev => [...prev.slice(-100), {
            text,
            type,
            time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }])

        // Simple plot logic: look for numbers in brackets like [25.5] or T:25.5
        const match = text.match(/[-+]?\d*\.\d+|\d+/)
        if (match) {
            setChartData(prev => [...prev.slice(-30), parseFloat(match[0])])
        }
    }

    const connect = async () => {
        try {
            const selectedPort = await (navigator as any).serial.requestPort()
            await selectedPort.open({ baudRate })
            setPort(selectedPort)
            setConnected(true)
            addLog(`SYSTEM: Connected to port at ${baudRate} baud`, 'out')

            const reader = selectedPort.readable.getReader()
            readerRef.current = reader
            try {
                while (true) {
                    const { value, done } = await reader.read()
                    if (done) break
                    const text = new TextDecoder().decode(value)
                    addLog(text)
                }
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    addLog(`ERROR: ${err}`, 'out')
                }
            } finally {
                reader.releaseLock()
                readerRef.current = null
            }
        } catch (err) {
            addLog(`SYSTEM: Connection failed - ${err}`, 'out')
        }
    }

    const disconnect = async () => {
        if (port) {
            try {
                if (readerRef.current) {
                    await readerRef.current.cancel()
                }
                await port.close()
                setPort(null)
                setConnected(false)
                addLog("SYSTEM: Disconnected", 'out')
            } catch (err) {
                addLog(`SYSTEM: Disconnect failed - ${err}`, 'out')
                // Force state reset even if port close fails
                setPort(null)
                setConnected(false)
            }
        }
    }

    const sendData = async () => {
        if (!port || !input) return
        const writer = port.writable.getWriter()
        const data = new TextEncoder().encode(input + '\n')
        await writer.write(data)
        writer.releaseLock()
        addLog(input, 'out')
        setInput("")
    }

    return (
        <div className="h-full bg-[#0a0a0c] text-slate-300 flex flex-col font-mono">
            {/* Header */}
            <div className="p-4 bg-slate-900/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${connected ? 'bg-green-500/10 text-green-500 animate-pulse' : 'bg-slate-500/10 text-slate-500'}`}>
                        <Cpu size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-tighter">IoT Control & Monitor</h2>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Serial Communication Protocol</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <Settings size={16} />
                    </button>
                    <select
                        value={baudRate}
                        onChange={(e) => setBaudRate(parseInt(e.target.value))}
                        className="bg-black border border-white/10 rounded px-2 py-1 text-[10px] text-slate-400 outline-none hover:border-blue-500/50 transition-colors"
                        disabled={connected}
                    >
                        <option value={9600}>9600 BAUD</option>
                        <option value={115200}>115200 BAUD</option>
                        <option value={921600}>921600 BAUD</option>
                    </select>
                    <button
                        onClick={connected ? disconnect : connect}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${connected
                            ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                            }`}
                    >
                        <Power size={14} />
                        {connected ? 'Drop' : 'Link'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {/* Live Data Visualizer */}
                <div className="h-32 border-b border-white/5 bg-black/60 p-4 relative overflow-hidden shrink-0">
                    <div className="absolute top-2 left-4 text-[8px] font-black text-blue-500/50 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={10} /> Real-time Data Plot
                    </div>
                    <div className="h-full w-full flex items-end gap-1 opacity-80">
                        {chartData.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-700 italic uppercase">Waiting for telemetry data...</div>}
                        {chartData.map((val, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-blue-500/50 to-cyan-400/50 rounded-t-sm transition-all duration-300"
                                style={{ height: `${Math.min(100, Math.max(5, (val / 100) * 80))}%` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Terminal Area */}
                <div className="flex-1 overflow-y-auto bg-black/40 p-4 font-mono space-y-1">
                    {logs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                            <Terminal size={48} />
                            <p className="text-[10px] font-black tracking-widest uppercase text-center max-w-[200px]">
                                Establish a Serial link to begin receiving system logs
                            </p>
                        </div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className={`flex gap-3 text-[11px] break-all leading-relaxed ${log.type === 'out' ? 'text-blue-400' : 'text-slate-300'}`}>
                            <span className="opacity-30 shrink-0 select-none">[{log.time}]</span>
                            <span className="opacity-50 shrink-0 select-none font-black">{log.type === 'out' ? '>>' : '<<'}</span>
                            <span className={log.type === 'out' ? 'font-black italic' : ''}>{log.text}</span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900/60 border-t border-white/5 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendData()}
                    placeholder={connected ? "Send message to device..." : "Status: Offline"}
                    disabled={!connected}
                    className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-700"
                />
                <button
                    onClick={sendData}
                    disabled={!connected || !input}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-20 rounded-lg transition-colors"
                >
                    <Send size={18} />
                </button>
                <button
                    onClick={() => setLogs([])}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                    title="Clear Logs"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Status Footer */}
            <div className="px-4 py-2 bg-slate-950 border-t border-white/5 flex items-center justify-between text-[8px] font-bold text-slate-600 tracking-widest uppercase">
                <div className="flex items-center gap-2">
                    <Wifi size={10} className={connected ? 'text-blue-500' : 'text-slate-700'} />
                    {connected ? 'Channel: COM-B-115200' : 'Channel: Idle'}
                </div>
                <div className="flex items-center gap-4">
                    <span>Rx: {logs.filter(l => l.type === 'in').length} pkts</span>
                    <span>Tx: {logs.filter(l => l.type === 'out').length} pkts</span>
                </div>
            </div>
        </div>
    )
}

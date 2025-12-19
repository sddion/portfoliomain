"use client"

import React, { useState, useEffect, useRef } from "react"
import { useWindowManager } from "@/components/os/WindowManager"

export function TaskMonitor() {
    const { windows } = useWindowManager()
    const [metrics, setMetrics] = useState({
        fps: 60,
        memoryUsed: 0,
        memoryTotal: 0,
        cpuLoad: 0,
        uptime: 0,
    })
    const fpsRef = useRef(0)
    const lastTick = useRef(performance.now())
    const startTime = useRef(Date.now())

    useEffect(() => {
        let frameId: number
        let lastCpuTick = performance.now()

        const tick = () => {
            const now = performance.now()

            // FPS Calculation
            fpsRef.current++
            if (now - lastTick.current >= 1000) {
                const mem = (performance as any).memory

                // CPU Load Estimation (measuring event loop delay)
                const expected = 1000 / 60
                const actual = (now - lastCpuTick) / 60
                const load = Math.min(100, Math.max(0, ((actual - expected) / expected) * 100))

                setMetrics({
                    fps: fpsRef.current,
                    memoryUsed: mem ? Math.round(mem.usedJSHeapSize / 1048576) : 0,
                    memoryTotal: mem ? Math.round(mem.jsHeapLimit / 1048576) : 0,
                    cpuLoad: Math.round(load),
                    uptime: Math.floor((Date.now() - startTime.current) / 1000),
                })
                fpsRef.current = 0
                lastTick.current = now
            }
            lastCpuTick = now
            frameId = requestAnimationFrame(tick)
        }

        tick()
        return () => cancelAnimationFrame(frameId)
    }, [])

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600)
        const m = Math.floor((s % 3600) / 60)
        const sec = s % 60
        return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    const Meter = ({ label, value, max, colorClass, secondaryColor }: { label: string, value: number, max: number, colorClass: string, secondaryColor: string }) => {
        const percent = Math.min(100, (value / max) * 100)
        const barChars = 20
        const filledChars = Math.round((percent / 100) * barChars)

        return (
            <div className="flex gap-2 text-[11px] leading-tight font-mono">
                <span className="w-4 text-white font-bold">{label}</span>
                <span className="text-white">[</span>
                <div className="flex">
                    <span className={colorClass}>{"|".repeat(filledChars)}</span>
                    <span className={secondaryColor}>{" ".repeat(barChars - filledChars)}</span>
                </div>
                <span className="text-white">]</span>
                <span className="text-white ml-1 font-bold">{Math.round(percent)}%</span>
            </div>
        )
    }

    return (
        <div className="h-full bg-black text-[#00ff00] p-4 font-mono text-[11px] flex flex-col overflow-hidden leading-tight selection:bg-[#00ff00] selection:text-black">
            {/* HTOP Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-x-12 mb-4 border-b border-zinc-900 pb-4">
                <div className="space-y-0.5">
                    <Meter label="0" value={metrics.cpuLoad} max={100} colorClass="text-blue-500" secondaryColor="text-zinc-800" />
                    <Meter label="1" value={metrics.cpuLoad * 0.8} max={100} colorClass="text-emerald-500" secondaryColor="text-zinc-800" />
                </div>
                <div className="space-y-0.5">
                    <div className="flex gap-2 text-white">
                        <span className="w-16">Mem    :</span>
                        <span className="text-emerald-500 font-bold">{metrics.memoryUsed}M</span> / {metrics.memoryTotal}M
                    </div>
                    <div className="flex gap-2 text-white">
                        <span className="w-16">Tasks  :</span>
                        <span>{windows.length}, 1 running</span>
                    </div>
                    <div className="hidden md:flex gap-2 text-white">
                        <span className="w-16">Load   :</span>
                        <span className="text-emerald-500">{(metrics.cpuLoad / 100).toFixed(2)} 0.05 0.01</span>
                    </div>
                    <div className="flex gap-2 text-white">
                        <span className="w-16">Uptime :</span>
                        <span>{formatTime(metrics.uptime)}</span>
                    </div>
                </div>
            </div>

            {/* Performance Stats Overlay - Fixed height to prevent layout shifts */}
            <div className="mb-4 text-white flex flex-wrap gap-x-12 gap-y-2 font-bold min-h-[20px]">
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-zinc-500">FPS:</span>
                    <span className={metrics.fps < 30 ? "text-red-500" : "text-emerald-400"}>{metrics.fps}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-zinc-500">ENGINE:</span>
                    <span className="text-cyan-400 underline decoration-dotted">V8</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <span className="text-zinc-500">MODE:</span>
                    <span className="text-yellow-400">JIT_OPTIMIZED</span>
                </div>
            </div>

            {/* Process List */}
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar border border-zinc-900 rounded-sm">
                <table className="w-full text-left border-collapse min-w-[300px]">
                    <thead className="sticky top-0 bg-[#00ff00] text-black font-bold z-10">
                        <tr>
                            <th className="px-1 py-0.5">PID</th>
                            <th className="px-1 py-0.5 hidden sm:table-cell">USER</th>
                            <th className="px-1 py-0.5 text-right">CPU%</th>
                            <th className="px-1 py-0.5 text-right">MEM%</th>
                            <th className="px-1 py-0.5 hidden md:table-cell">TIME+</th>
                            <th className="px-1 py-0.5">Command</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        <tr className="bg-zinc-900/40">
                            <td className="px-1">1</td>
                            <td className="px-1 text-emerald-500 italic hidden sm:table-cell">root</td>
                            <td className="px-1 text-right italic">0.0</td>
                            <td className="px-1 text-right italic">0.1</td>
                            <td className="px-1 hidden md:table-cell">0:00.01</td>
                            <td className="px-1 text-cyan-400">/sbin/init</td>
                        </tr>
                        {windows.map((win, i) => (
                            <tr key={win.id} className={i % 2 === 0 ? "bg-black hover:bg-zinc-800" : "bg-zinc-900/20 hover:bg-zinc-800"}>
                                <td className="px-1 text-zinc-500">{1000 + i}</td>
                                <td className="px-1 text-emerald-500 hidden sm:table-cell">dedsec</td>
                                <td className="px-1 text-right font-bold">{(Math.random() * 2).toFixed(1)}</td>
                                <td className="px-1 text-right font-bold">{(Math.random() * 5).toFixed(1)}</td>
                                <td className="px-1 hidden md:table-cell">0:00.{(Math.random() * 99).toFixed(0)}</td>
                                <td className="px-1">
                                    <span className="text-yellow-500">app://</span>
                                    <span className="text-white font-bold">{win.title.toLowerCase().replace(/\s+/g, '-')}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Shortcuts */}
            <div className="mt-3 flex gap-0.5 text-[10px] uppercase font-bold overflow-x-auto no-scrollbar shrink-0">
                {[
                    { key: 'F1', label: 'Help' },
                    { key: 'F2', label: 'Setup' },
                    { key: 'F3', label: 'Search' },
                    { key: 'F4', label: 'Filter' },
                    { key: 'F5', label: 'Tree' },
                    { key: 'F6', label: 'SortBy' },
                    { key: 'F7', label: 'Nice-' },
                    { key: 'F8', label: 'Nice+' },
                    { key: 'F9', label: 'Kill' },
                    { key: 'F10', label: 'Quit' },
                ].map((f) => (
                    <div key={f.key} className="flex shrink-0">
                        <span className="bg-white text-black px-1 leading-none flex items-center">{f.key}</span>
                        <span className="bg-zinc-800 text-zinc-400 px-1 leading-none flex items-center pr-2">{f.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

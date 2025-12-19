"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Activity, Cpu, HardDrive, Network, Zap, PieChart, List, RefreshCcw } from "lucide-react"
import { motion } from "framer-motion"

export function ResourceMonitorApp() {
    const [cpuUsage, setCpuUsage] = useState<number[]>([])
    const [ramUsage, setRamUsage] = useState<number[]>([])
    const [netUsage, setNetUsage] = useState<number[]>([])
    const [battery, setBattery] = useState<{ level: number, charging: boolean }>({ level: 100, charging: false })
    const [activeTab, setActiveTab] = useState<'overview' | 'processes'>('overview')

    // Real-time simulated data
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuUsage(prev => [...prev.slice(-20), Math.floor(Math.random() * 40) + 10])
            setRamUsage(prev => [...prev.slice(-20), Math.floor(Math.random() * 20) + 60])
            setNetUsage(prev => [...prev.slice(-20), Math.floor(Math.random() * 100)])
        }, 1500)

        // Battery API
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((bat: any) => {
                const update = () => setBattery({ level: bat.level * 100, charging: bat.charging })
                bat.addEventListener('levelchange', update)
                bat.addEventListener('chargingchange', update)
                update()
            })
        }

        return () => clearInterval(interval)
    }, [])

    const processes = useMemo(() => [
        { id: 1024, name: "SanjuOS Kernel", cpu: 0.2, ram: "42MB", user: "system" },
        { id: 2048, name: "WindowServer", cpu: 4.5, ram: "128MB", user: "dedsec" },
        { id: 3072, name: "ESP-Flasher-Daemon", cpu: 1.2, ram: "64MB", user: "dedsec" },
        { id: 4096, name: "Terminal-Session", cpu: 0.8, ram: "24MB", user: "dedsec" },
        { id: 5120, name: "Portfolio-Renderer", cpu: 8.4, ram: "256MB", user: "dedsec" },
        { id: 6144, name: "Webkit-Process", cpu: 2.1, ram: "512MB", user: "dedsec" },
    ].sort((a, b) => b.cpu - a.cpu), [])

    const renderChart = (data: number[], color: string) => {
        if (!data.length) return null
        const points = data.map((val, i) => `${i * 10},${100 - val}`).join(' ')
        return (
            <svg viewBox="0 0 200 100" className="w-full h-16 transform scale-x-[-1]">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
            </svg>
        )
    }

    return (
        <div className="h-full bg-black text-slate-300 flex flex-col font-mono">
            {/* Header */}
            <div className="p-4 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity className="text-emerald-500" size={20} />
                    <span className="text-sm font-black uppercase tracking-widest italic">System Resource Monitor</span>
                </div>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-3 py-1 rounded text-[10px] uppercase font-bold transition-all ${activeTab === 'overview' ? 'bg-emerald-500/20 text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Performance
                    </button>
                    <button
                        onClick={() => setActiveTab('processes')}
                        className={`px-3 py-1 rounded text-[10px] uppercase font-bold transition-all ${activeTab === 'processes' ? 'bg-emerald-500/20 text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Processes
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {activeTab === 'overview' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* CPU Card */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-4 hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Cpu size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">CPU Efficiency</span>
                                </div>
                                <span className="text-sm font-black">{cpuUsage[cpuUsage.length - 1] || 0}%</span>
                            </div>
                            <div className="h-16 flex items-end opacity-50">
                                {renderChart(cpuUsage, "#10b981")}
                            </div>
                        </div>

                        {/* RAM Card */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-4 hover:border-blue-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <PieChart size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Memory Commit</span>
                                </div>
                                <span className="text-sm font-black">{ramUsage[ramUsage.length - 1] || 0}%</span>
                            </div>
                            <div className="h-16 flex items-end opacity-50">
                                {renderChart(ramUsage, "#3b82f6")}
                            </div>
                        </div>

                        {/* Network Card */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-4 hover:border-orange-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-orange-400">
                                    <Network size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Throughput</span>
                                </div>
                                <span className="text-[10px] uppercase text-slate-500">{netUsage[netUsage.length - 1]} Mbps Down</span>
                            </div>
                            <div className="h-16 flex items-end opacity-50">
                                {renderChart(netUsage, "#f97316")}
                            </div>
                        </div>

                        {/* Battery Card */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between text-yellow-400">
                                <div className="flex items-center gap-2">
                                    <Zap size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Power Intelligence</span>
                                </div>
                                <span className="text-[8px] uppercase tracking-tighter opacity-70">
                                    {battery.charging ? "[ Charging via USB-C ]" : "[ Discharging ]"}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-6 w-full bg-slate-800/50 rounded-md border border-white/5 relative overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${battery.level}%` }}
                                        className={`h-full ${battery.level < 20 ? 'bg-red-500/50' : 'bg-emerald-500/50'} backdrop-blur-sm`}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                                        {Math.floor(battery.level)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-[10px]">
                            <thead className="bg-white/5 text-slate-500 uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-4 py-2">Process</th>
                                    <th className="px-4 py-2">CPU</th>
                                    <th className="px-4 py-2">RAM</th>
                                    <th className="px-4 py-2">User</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {processes.map(proc => (
                                    <tr key={proc.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-3 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform"></div>
                                            {proc.name} <span className="text-[8px] opacity-30">({proc.id})</span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-emerald-500/80">{proc.cpu}%</td>
                                        <td className="px-4 py-3">{proc.ram}</td>
                                        <td className="px-4 py-3 opacity-50 uppercase tracking-tighter">{proc.user}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* System Info Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                        { label: 'Uptime', val: '2d 14h' },
                        { label: 'Threads', val: '128' },
                        { label: 'Latency', val: '12ms' },
                        { label: 'FS Type', val: 'EXT4' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col items-center">
                            <span className="text-[8px] text-slate-500 uppercase font-black">{stat.label}</span>
                            <span className="text-xs font-bold">{stat.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="px-4 py-2 bg-slate-900 border-t border-white/5 flex items-center justify-between text-[8px] font-black text-slate-500 tracking-widest">
                <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                    LOGS: RT_DAEMON_OK
                </span>
                <span>ARMv8-A64 | OPTIMIZED</span>
            </div>
        </div>
    )
}

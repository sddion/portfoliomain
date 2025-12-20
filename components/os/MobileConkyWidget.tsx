"use client"

import React from "react"
import { Bluetooth, Github, Activity, Smartphone } from "lucide-react"
import { format } from "date-fns"
import { BluetoothDeviceInfo } from "@/hooks/useBluetooth"
import { useWindowManager } from "@/components/os/WindowManager"

interface MobileConkyWidgetProps {
    bluetoothDevice?: BluetoothDeviceInfo | null
    githubStats?: {
        repos: number
        followers: number
    }
}

export function MobileConkyWidget({ bluetoothDevice, githubStats }: MobileConkyWidgetProps) {
    const { windows } = useWindowManager()
    const [time, setTime] = React.useState(new Date())
    const [memUsed, setMemUsed] = React.useState(0)

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)

        const updateMem = () => {
            const mem = (performance as any).memory
            if (mem) setMemUsed(Math.round(mem.usedJSHeapSize / 1048576))
        }
        updateMem()
        const memTimer = setInterval(updateMem, 5000)

        return () => {
            clearInterval(timer)
            clearInterval(memTimer)
        }
    }, [])

    return (
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/5 font-mono text-[10px] shadow-lg w-full">
            {/* Header - Very compact */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <span className="text-[var(--primary)] font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                    <Activity size={12} /> sddionOS Status
                </span>
                <span className="text-white/40">{format(time, "HH:mm:ss")}</span>
            </div>

            {/* System Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex justify-between">
                    <span className="text-white/40 uppercase text-[9px]">OS:</span>
                    <span className="text-[var(--primary)] font-bold">v2.0</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/40 uppercase text-[9px]">Kernel:</span>
                    <span className="text-white/80 font-bold">6.8.0</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/40 uppercase text-[9px]">CPU:</span>
                    <span className="text-green-400 font-bold">{Math.floor(Math.random() * 10 + 1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/40 uppercase text-[9px]">Processes:</span>
                    <span className="text-white/80 font-bold">{windows.length + 3}</span>
                </div>
            </div>

            {/* RAM Info - Compact row */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--primary)] transition-all duration-1000"
                            style={{ width: `${Math.min(100, (memUsed / 2048) * 100)}%` }}
                        />
                    </div>
                </div>
                <div className="flex gap-2 whitespace-nowrap">
                    <span className="text-white/40 uppercase text-[9px]">RAM</span>
                    <span className="text-[var(--primary)] font-bold">{memUsed}M</span>
                </div>
            </div>

            {/* GitHub Quick Stats - Optional Inline */}
            {githubStats && (
                <div className="mt-3 flex gap-4 pt-2 border-t border-white/5 opacity-70 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1">
                        <Github size={10} />
                        <span>Repos: {githubStats.repos}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Smartphone size={10} />
                        <span>Followers: {githubStats.followers}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

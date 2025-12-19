"use client"

import React from "react"
import { Wifi, Bluetooth, Github, Activity, Signal, Smartphone } from "lucide-react"
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
        <div className="bg-[var(--os-surface)] rounded-2xl p-4 border border-[var(--os-border)] font-mono text-xs shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--os-border)]">
                <span className="text-[var(--primary)] font-bold flex items-center gap-2">
                    <Activity size={14} /> SYSTEM MONITOR
                </span>
                <span className="text-[var(--muted-foreground)]">{format(time, "HH:mm:ss")}</span>
            </div>

            {/* RAM Info */}
            <div className="mb-3 px-1">
                <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-[var(--muted-foreground)] uppercase">Memory Usage</span>
                    <span className="text-[var(--primary)] font-bold">{memUsed}MB</span>
                </div>
                <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--primary)] transition-all duration-1000"
                        style={{ width: `${Math.min(100, (memUsed / 2048) * 100)}%` }}
                    />
                </div>
            </div>

            {/* Running Apps */}
            <div className="space-y-1.5 mb-4 px-1">
                <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-widest font-bold border-l-2 border-[var(--primary)] pl-2 mb-2">Running Tasks</div>
                {windows.length > 0 ? (
                    windows.slice(0, 3).map(win => (
                        <div key={win.id} className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                            <span className="truncate w-24 text-[10px]">{win.title}</span>
                            <span className="text-[var(--primary)] text-[10px] font-bold">
                                {Math.round((memUsed / (windows.length + 1)) + (Math.random() * 5))}M
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-[10px] text-[var(--muted-foreground)] py-2 italic bg-black/10 rounded-lg">No active apps</div>
                )}
            </div>

            {/* Network Info */}
            <div className="space-y-2 mb-3 bg-black/10 p-2 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                    <Wifi size={12} className="text-[var(--primary)]" />
                    <span className="text-[var(--muted-foreground)]">WiFi:</span>
                    <span className="text-[var(--foreground)] font-semibold truncate">SanjuOS-5G</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span className="text-[var(--muted-foreground)]">Signal</span>
                    <span className="text-[var(--primary)] text-opacity-80">Excellent</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span className="text-[var(--muted-foreground)]">IP</span>
                    <span className="text-[var(--foreground)] opacity-80 font-mono">192.168.1.42</span>
                </div>
            </div>

            {/* Bluetooth Info */}
            <div className="space-y-2 mb-3 pb-3 border-b border-[var(--os-border)]">
                <div className="flex items-center gap-2">
                    <Bluetooth size={12} className={bluetoothDevice?.connected ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} />
                    <span className="text-[var(--muted-foreground)]">Bluetooth:</span>
                    <span className={bluetoothDevice?.connected ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}>
                        {bluetoothDevice?.connected ? bluetoothDevice.name : "Disconnected"}
                    </span>
                </div>
            </div>

            {/* GitHub Stats */}
            {githubStats && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                        <Github size={12} className="text-[var(--foreground)]" />
                        <span>GitHub</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-black/30 rounded p-1.5 border border-[var(--os-border)]/50">
                            <div className="text-[var(--muted-foreground)]">Repos</div>
                            <div className="text-[var(--foreground)] font-bold">{githubStats.repos}</div>
                        </div>
                        <div className="bg-black/30 rounded p-1.5 border border-[var(--os-border)]/50">
                            <div className="text-[var(--muted-foreground)]">Followers</div>
                            <div className="text-[var(--foreground)] font-bold">{githubStats.followers}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

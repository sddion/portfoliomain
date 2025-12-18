"use client"

import React from "react"
import { Wifi, Bluetooth, Github, Activity, Signal } from "lucide-react"
import { format } from "date-fns"
import { BluetoothDeviceInfo } from "@/hooks/useBluetooth"

interface MobileConkyWidgetProps {
    bluetoothDevice?: BluetoothDeviceInfo | null
    githubStats?: {
        repos: number
        followers: number
    }
}

export function MobileConkyWidget({ bluetoothDevice, githubStats }: MobileConkyWidgetProps) {
    const [time, setTime] = React.useState(new Date())

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
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

            {/* Network Info */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                    <Wifi size={12} className="text-[var(--primary)]" />
                    <span className="text-[var(--muted-foreground)]">WiFi:</span>
                    <span className="text-[var(--foreground)] font-semibold">SanjuOS-5G</span>
                    <Signal size={10} className="text-[var(--primary)] ml-auto" />
                </div>
                <div className="flex justify-between text-[10px]">
                    <span className="text-[var(--muted-foreground)]">SSID</span>
                    <span className="text-[var(--foreground)] opacity-80">SanjuOS-5G</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span className="text-[var(--muted-foreground)]">Signal</span>
                    <span className="text-[var(--primary)] text-opacity-80">Excellent (-42 dBm)</span>
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

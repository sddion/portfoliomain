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
        <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl p-4 border border-zinc-800 font-mono text-xs">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                <span className="text-primary font-bold flex items-center gap-2">
                    <Activity size={14} /> SYSTEM MONITOR
                </span>
                <span className="text-zinc-400">{format(time, "HH:mm:ss")}</span>
            </div>

            {/* Network Info */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                    <Wifi size={12} className="text-blue-400" />
                    <span className="text-zinc-400">WiFi:</span>
                    <span className="text-white font-semibold">SanjuOS-5G</span>
                    <Signal size={10} className="text-green-400 ml-auto" />
                </div>
                <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">SSID</span>
                    <span className="text-zinc-300">SanjuOS-5G</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Signal</span>
                    <span className="text-green-400">Excellent (-42 dBm)</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">IP</span>
                    <span className="text-zinc-300 font-mono">192.168.1.42</span>
                </div>
            </div>

            {/* Bluetooth Info */}
            <div className="space-y-2 mb-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <Bluetooth size={12} className={bluetoothDevice?.connected ? "text-blue-400" : "text-zinc-600"} />
                    <span className="text-zinc-400">Bluetooth:</span>
                    <span className={bluetoothDevice?.connected ? "text-green-400" : "text-zinc-500"}>
                        {bluetoothDevice?.connected ? bluetoothDevice.name : "Disconnected"}
                    </span>
                </div>
            </div>

            {/* GitHub Stats */}
            {githubStats && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Github size={12} className="text-white" />
                        <span>GitHub</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-black/30 rounded p-1.5">
                            <div className="text-zinc-500">Repos</div>
                            <div className="text-white font-bold">{githubStats.repos}</div>
                        </div>
                        <div className="bg-black/30 rounded p-1.5">
                            <div className="text-zinc-500">Followers</div>
                            <div className="text-white font-bold">{githubStats.followers}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

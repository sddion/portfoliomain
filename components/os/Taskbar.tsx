"use client"

import React, { useState, useEffect } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { format } from "date-fns"
import { Battery, BatteryCharging, Wifi, WifiOff, Power, CloudSnow } from "lucide-react"

import { StartMenu } from "./StartMenu"
import { WiFiMenu } from "./WiFiMenu"

export function Taskbar() {
    const { windows, minimizeWindow, focusWindow, logout, toggleSnowfall, showSnowfall } = useWindowManager()
    const [startOpen, setStartOpen] = useState(false)
    const [wifiOpen, setWifiOpen] = useState(false)
    const [time, setTime] = useState(new Date())
    const [batteryLevel, setBatteryLevel] = useState(100)
    const [isCharging, setIsCharging] = useState(false)
    const [online, setOnline] = useState(true)


    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        // Battery Status
        if ('getBattery' in navigator) {
            // @ts-ignore
            navigator.getBattery().then((battery) => {
                const updateBattery = () => {
                    setBatteryLevel(Math.floor(battery.level * 100))
                    setIsCharging(battery.charging)
                }
                updateBattery()
                battery.addEventListener('levelchange', updateBattery)
                battery.addEventListener('chargingchange', updateBattery)
            })
        }

        // Network Status
        setOnline(navigator.onLine)
        window.addEventListener('online', () => setOnline(true))
        window.addEventListener('offline', () => setOnline(false))

        return () => {
            window.removeEventListener('online', () => setOnline(true))
            window.removeEventListener('offline', () => setOnline(false))
        }
    }, [])

    return (
        <div className="fixed bottom-0 left-0 right-0 h-10 bg-[var(--os-surface)] border-t border-[var(--os-border)] flex items-center justify-between px-2 z-[9999] backdrop-blur-sm">
            {/* Start Button / Menu */}
            <div className="relative flex items-center gap-2">
                <StartMenu isOpen={startOpen} onClose={() => setStartOpen(false)} />
                <button
                    onClick={() => setStartOpen(!startOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--os-surface-hover)] rounded font-bold transition-colors ${startOpen ? 'bg-[var(--os-surface-hover)] text-[var(--primary)]' : 'text-[var(--primary)]'}`}
                >
                    <div className="w-4 h-4 rounded-sm bg-[var(--primary)] relative flex items-center justify-center">
                        <span className="text-[var(--primary-foreground)] text-[10px] font-bold">_</span>
                    </div>
                    <span>Start</span>
                </button>
                <div className="w-[1px] h-6 bg-[var(--os-border)] mx-1" />

                {/* Open Windows */}
                <div className="flex items-center gap-1">
                    {windows.map((win) => (
                        <button
                            key={win.id}
                            onClick={() => win.isMinimized ? focusWindow(win.id) : minimizeWindow(win.id)}
                            className={`
                px-3 py-1 text-xs truncate max-w-[150px] rounded flex items-center gap-2 transition-all
                ${!win.isMinimized && 'bg-[var(--os-surface-hover)] border-b-2 border-[var(--primary)] text-[var(--foreground)]'}
                ${win.isMinimized && 'hover:bg-[var(--os-surface-hover)] text-[var(--muted-foreground)]'}
              `}
                        >
                            {win.icon && <span className="opacity-70">{win.icon}</span>}
                            {win.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* System Tray */}
            <div className="flex items-center gap-4 px-2 text-[var(--muted-foreground)] text-xs font-mono">
                <div className="flex items-center gap-3">
                    {/* Wifi */}
                    <div className="relative">
                        <WiFiMenu isOpen={wifiOpen} onClose={() => setWifiOpen(false)} />
                        <button
                            onClick={() => setWifiOpen(!wifiOpen)}
                            className={`flex items-center gap-1 hover:text-[var(--foreground)] transition-colors ${wifiOpen ? 'text-[var(--primary)]' : ''}`}
                            title={online ? "Connected" : "Offline"}
                        >
                            {online ? <Wifi size={14} /> : <WifiOff size={14} className="text-[var(--destructive)]" />}
                        </button>
                    </div>



                    {/* Battery */}
                    <div className="flex items-center gap-1" title={`${batteryLevel}% ${isCharging ? '(Charging)' : ''}`}>
                        {isCharging ? <BatteryCharging size={14} className="text-[var(--primary)]" /> : <Battery size={14} />}
                        <span className="hidden sm:inline">{batteryLevel}%</span>
                    </div>
                </div>

                <div className="w-[1px] h-6 bg-[var(--os-border)] mx-1" />

                {/* Snowfall Toggle */}
                <button
                    onClick={toggleSnowfall}
                    className={`hover:text-[var(--foreground)] transition-colors p-1 rounded hover:bg-white/5 ${showSnowfall ? 'text-blue-300' : ''}`}
                    title="Toggle Snow"
                >
                    <CloudSnow size={14} />
                </button>

                <div className="w-[1px] h-6 bg-[var(--os-border)] mx-1" />

                {/* Clock */}
                <span>{format(time, "HH:mm")}</span>

                {/* Shutdown / Logout */}
                <button
                    onClick={logout}
                    className="hover:text-[var(--destructive)] transition-colors p-1 rounded hover:bg-white/5"
                    title="Shutdown (Logout)"
                >
                    <Power size={14} />
                </button>
            </div>
        </div>
    )
}

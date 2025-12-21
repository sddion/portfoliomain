"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronLeft,
    Bluetooth,
    Wifi,
    Volume2,
    Sun,
    Battery,
    Info,
    Smartphone,
    Bell,
    Plus,
    Check,
    Monitor,
    Cpu,
    Droplet,
    Ghost
} from "lucide-react"
import { useBluetooth, BluetoothDeviceInfo } from "@/hooks/useBluetooth"
import { useNotifications } from "@/hooks/useNotifications"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useWindowManager } from "@/components/os/WindowManager"

interface MobileSettingsProps {
    isOpen: boolean
    onClose: () => void
}

export function MobileSettings({ isOpen, onClose }: MobileSettingsProps) {
    const [activeSection, setActiveSection] = useState<'main' | 'bluetooth' | 'display' | 'about'>('main')
    const { settings, updateSettings } = useWindowManager()
    const isBluetoothEnabled = settings?.bluetoothEnabled !== false
    const { device, error, requestDevice } = useBluetooth(isBluetoothEnabled)
    const [pairedDevices, setPairedDevices] = useState<BluetoothDeviceInfo[]>([])
    const { permission, requestPermission } = useNotifications()
    const { theme, setTheme } = useTheme()

    // Mock previously paired devices if native getDevices is not available or empty
    useEffect(() => {
        if (device) {
            setPairedDevices(prev => {
                if (prev.find(d => d.id === device.id)) return prev
                return [...prev, device]
            })
        }
    }, [device])

    const themeOptions = [
        { id: "dark", label: "Cyberpunk", color: "bg-[#00ff41]", icon: <Monitor size={20} /> },
        { id: "ubuntu", label: "Ubuntu", color: "bg-[#e95420]", icon: <Cpu size={20} /> },
        { id: "ocean", label: "Ocean", color: "bg-[#38bdf8]", icon: <Droplet size={20} /> },
        { id: "dracula", label: "Dracula", color: "bg-[#ff79c6]", icon: <Ghost size={20} /> },
    ]

    // Get current theme label
    const currentThemeLabel = themeOptions.find(t => t.id === theme)?.label || theme || "System"

    const sections = [
        {
            id: 'wifi',
            icon: <Wifi size={20} className="text-green-500" />,
            label: "Wi-Fi",
            value: "Connected",
            color: "bg-green-500/10"
        },
        {
            id: 'bluetooth',
            icon: <Bluetooth size={20} className="text-blue-500" />,
            label: "Bluetooth",
            value: isBluetoothEnabled ? (device?.connected ? "Connected" : "Disconnected") : "Off",
            color: "bg-blue-500/10"
        },
        {
            id: 'sound',
            icon: <Volume2 size={20} className="text-pink-500" />,
            label: "Sound",
            value: "100%",
            color: "bg-pink-500/10"
        },
        {
            id: 'battery',
            icon: <Battery size={20} className="text-yellow-500" />,
            label: "Battery",
            value: "Charging",
            color: "bg-yellow-500/10"
        },
        {
            id: 'display',
            icon: <Sun size={20} className="text-orange-500" />,
            label: "Display",
            value: currentThemeLabel,
            color: "bg-orange-500/10"
        },
        {
            id: 'notifications',
            icon: <Bell size={20} className="text-purple-500" />,
            label: "Notifications",
            value: permission === 'granted' ? "Enabled" : "Disabled",
            color: "bg-purple-500/10"
        },
        {
            id: 'about',
            icon: <Info size={20} className="text-zinc-500" />,
            label: "About Device",
            value: "sddionOS 1.0",
            color: "bg-zinc-500/10"
        }
    ]

    const renderBluetooth = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[var(--os-surface)] rounded-2xl border border-[var(--os-border)]">
                <div className="flex items-center gap-3">
                    <Bluetooth className={cn("transition-colors", isBluetoothEnabled ? "text-blue-500" : "text-zinc-500")} />
                    <div>
                        <p className="font-bold">Bluetooth</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            {isBluetoothEnabled ? "Visible to nearby devices" : "Currently disabled"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => updateSettings({ bluetoothEnabled: !isBluetoothEnabled })}
                    className={cn(
                        "w-12 h-6 rounded-full relative transition-colors duration-200",
                        isBluetoothEnabled ? "bg-blue-600" : "bg-zinc-700"
                    )}
                >
                    <motion.div
                        animate={{ x: isBluetoothEnabled ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                </button>
            </div>

            {isBluetoothEnabled && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Paired Devices</h3>
                        <div className="space-y-1">
                            {pairedDevices.length === 0 ? (
                                <p className="text-xs text-[var(--muted-foreground)] p-4 text-center">No paired devices found</p>
                            ) : (
                                pairedDevices.map(d => (
                                    <div key={d.id} className="flex items-center justify-between p-4 bg-[var(--os-surface)]/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Smartphone size={16} className="text-zinc-500" />
                                            <span className="text-sm">{d.name}</span>
                                        </div>
                                        {d.connected ? <Check size={16} className="text-blue-500" /> : <div className="w-4 h-4 border border-[var(--os-border)] rounded-full" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => requestDevice()}
                        className="w-full py-4 flex items-center justify-center gap-2 text-blue-500 font-bold text-sm bg-blue-500/5 rounded-2xl active:scale-95 transition-transform border border-blue-500/10"
                    >
                        <Plus size={18} />
                        Pair New Device
                    </button>
                </motion.div>
            )}

            {!isBluetoothEnabled && (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <Bluetooth size={48} className="mb-4 text-zinc-500" />
                    <p className="text-xs font-bold text-zinc-500">Bluetooth is turned off</p>
                </div>
            )}

            {error && <p className="text-xs text-red-500 p-2 text-center">{error}</p>}
        </div>
    )

    const renderDisplay = () => (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Branding & Theme</h3>
                <div className="grid grid-cols-2 gap-3">
                    {themeOptions.map(t => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTheme(t.id)
                                updateSettings({ theme: t.id })
                            }}
                            className={cn(
                                "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all active:scale-95",
                                theme === t.id
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-[var(--os-surface)] border-[var(--os-border)] text-zinc-400 hover:border-zinc-700"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-black",
                                t.color
                            )}>
                                {t.icon}
                            </div>
                            <span className="text-xs font-black">{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                <Info size={16} className="text-primary" />
                <p className="text-[10px] text-primary/80 leading-relaxed font-medium">Changes apply instantly across the system.</p>
            </div>
        </div>
    )

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[110] bg-[var(--background)] flex flex-col font-sans"
                >
                    {/* Header */}
                    <div className="p-6 flex items-center gap-4 border-b border-[var(--os-border)] bg-[var(--background)]/80 backdrop-blur-xl shrink-0">
                        <button
                            onClick={() => activeSection === 'main' ? onClose() : setActiveSection('main')}
                            className="p-2 -ml-2 rounded-full active:bg-[var(--os-surface-hover)] bg-[var(--os-surface)] border border-[var(--os-border)] shadow-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight">
                            {activeSection === 'main' ? 'Settings' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                        </h1>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {activeSection === 'main' ? (
                            <>
                                {/* User Profile Card */}
                                <div className="p-5 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[2rem] border border-white/5 flex items-center gap-4 shadow-xl">
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--os-surface)] flex items-center justify-center shadow-lg border border-white/10 overflow-hidden p-2">
                                        <img src="/icon-192.png" alt="sddionOS" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-black text-lg">Admin</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {sections.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => s.id === 'notifications' ? requestPermission() : setActiveSection(s.id as any)}
                                            className="group w-full p-4 flex items-center gap-4 bg-[var(--os-surface)]/20 hover:bg-[var(--os-surface)]/40 rounded-2xl transition-all active:scale-[0.98] border border-transparent hover:border-white/5"
                                        >
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${s.color}`}>
                                                {s.icon}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-bold">{s.label}</p>
                                                <p className="text-[10px] text-[var(--muted-foreground)] font-medium">{s.id === 'bluetooth' ? (isBluetoothEnabled ? s.value : 'Off') : s.value}</p>
                                            </div>
                                            <div className="text-[var(--muted-foreground)] opacity-20 transition-opacity group-hover:opacity-100">
                                                <ChevronLeft size={16} className="rotate-180" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : activeSection === 'bluetooth' ? (
                            renderBluetooth()
                        ) : activeSection === 'display' ? (
                            renderDisplay()
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <Smartphone size={48} className="mb-4 text-zinc-500" />
                                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500">Service Unavailable</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

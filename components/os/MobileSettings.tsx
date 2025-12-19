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
    Shield,
    Info,
    Smartphone,
    Moon,
    Bell,
    Plus,
    Check
} from "lucide-react"
import { useBluetooth, BluetoothDeviceInfo } from "@/hooks/useBluetooth"
import { useNotifications } from "@/hooks/useNotifications"

interface MobileSettingsProps {
    isOpen: boolean
    onClose: () => void
}

export function MobileSettings({ isOpen, onClose }: MobileSettingsProps) {
    const [activeSection, setActiveSection] = useState<'main' | 'bluetooth' | 'display' | 'about'>('main')
    const { device, connecting, error, requestDevice, supported: bluetoothSupported } = useBluetooth()
    const [pairedDevices, setPairedDevices] = useState<BluetoothDeviceInfo[]>([])
    const { permission, requestPermission } = useNotifications()

    // Mock previously paired devices if native getDevices is not available or empty
    useEffect(() => {
        if (device) {
            setPairedDevices(prev => {
                if (prev.find(d => d.id === device.id)) return prev
                return [...prev, device]
            })
        }
    }, [device])

    const sections = [
        {
            id: 'bluetooth',
            icon: <Bluetooth size={20} className="text-blue-500" />,
            label: "Bluetooth",
            value: device?.connected ? "Connected" : "Disconnected",
            color: "bg-blue-500/10"
        },
        {
            id: 'display',
            icon: <Sun size={20} className="text-orange-500" />,
            label: "Display",
            value: "Dark Mode",
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
            value: "SanjuOS 1.0",
            color: "bg-zinc-500/10"
        }
    ]

    const renderBluetooth = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[var(--os-surface)] rounded-2xl border border-[var(--os-border)]">
                <div className="flex items-center gap-3">
                    <Bluetooth className="text-blue-500" />
                    <div>
                        <p className="font-bold">Bluetooth</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Visible to nearby devices</p>
                    </div>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Paired Devices</h3>
                <div className="space-y-1">
                    {pairedDevices.length === 0 ? (
                        <p className="text-xs text-[var(--muted-foreground)] p-4 text-center">No paired devices found</p>
                    ) : (
                        pairedDevices.map(d => (
                            <div key={d.id} className="flex items-center justify-between p-4 bg-[var(--os-surface)]/50 rounded-xl">
                                <span className="text-sm">{d.name}</span>
                                {d.connected ? <Check size={16} className="text-blue-500" /> : <div className="w-4 h-4 border border-[var(--os-border)] rounded-full" />}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button
                onClick={() => requestDevice()}
                className="w-full py-4 flex items-center justify-center gap-2 text-blue-500 font-bold text-sm bg-blue-500/5 rounded-2xl active:scale-95 transition-transform"
            >
                <Plus size={18} />
                Pair New Device
            </button>

            {error && <p className="text-xs text-red-500 p-2 text-center">{error}</p>}
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
                    <div className="p-6 flex items-center gap-4 border-b border-[var(--os-border)]">
                        <button
                            onClick={() => activeSection === 'main' ? onClose() : setActiveSection('main')}
                            className="p-2 -ml-2 rounded-full active:bg-[var(--os-surface-hover)]"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold">
                            {activeSection === 'main' ? 'Settings' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                        </h1>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {activeSection === 'main' ? (
                            <>
                                {/* User Profile Card */}
                                <div className="p-4 bg-[var(--os-surface)] rounded-3xl border border-[var(--os-border)] flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">S</div>
                                    <div>
                                        <p className="font-bold">SanjuOS User</p>
                                        <p className="text-xs text-[var(--muted-foreground)]">sanju@dedsec.os</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {sections.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => s.id === 'notifications' ? requestPermission() : setActiveSection(s.id as any)}
                                            className="w-full p-4 flex items-center gap-4 bg-[var(--os-surface)]/40 hover:bg-[var(--os-surface)] rounded-2xl transition-colors active:scale-[0.98]"
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                                                {s.icon}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-bold">{s.label}</p>
                                                <p className="text-[10px] text-[var(--muted-foreground)]">{s.value}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : activeSection === 'bluetooth' ? (
                            renderBluetooth()
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <Smartphone size={48} className="mb-4" />
                                <p className="text-sm uppercase tracking-widest font-bold">Coming Soon</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Wifi, Bluetooth, Battery, Moon, Sun, Plane, Settings, Bell, X } from "lucide-react"
import { format } from "date-fns"

interface NotificationShadeProps {
    isOpen: boolean
    onClose: () => void
}

export function NotificationShade({ isOpen, onClose }: NotificationShadeProps) {
    const [time, setTime] = useState(new Date())
    const [brightness, setBrightness] = useState(80)

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const [toggles, setToggles] = useState([
        { icon: <Wifi size={20} />, label: "Wi-Fi", active: true },
        { icon: <Bluetooth size={20} />, label: "Bluetooth", active: true },
        { icon: <Battery size={20} />, label: "Battery Saver", active: false },
        { icon: <Moon size={20} />, label: "Do Not Disturb", active: false },
        { icon: <Plane size={20} />, label: "Airplane Mode", active: false },
        { icon: <Sun size={20} />, label: "Flashlight", active: false },
    ])

    const handleToggle = (index: number) => {
        setToggles(prev => prev.map((t, i) =>
            i === index ? { ...t, active: !t.active } : t
        ))
    }

    const notifications = [
        {
            id: 1,
            app: "System",
            title: "Update Available",
            desc: "Portfolio OS v2.0 is ready to install.",
            time: "Now",
            icon: <Settings size={16} />
        },
        {
            id: 2,
            app: "Messages",
            title: "New Message",
            desc: "Hey! Check out this new UI update.",
            time: "5m ago",
            icon: <Bell size={16} />
        },
        {
            id: 3,
            app: "GitHub",
            title: "CI/CD Pipeline",
            desc: "Build failed for commit 'fix: mobile ui'",
            time: "10m ago",
            icon: <X size={16} />
        }
    ]

    return (
        <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: isOpen ? 0 : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md text-white flex flex-col"
            drag="y"
            dragConstraints={{ top: -window.innerHeight, bottom: 0 }}
            onDragEnd={(_, info) => {
                if (info.offset.y < -50) {
                    onClose()
                }
            }}
        >
            {/* Header */}
            <div className="p-4 flex justify-between items-end border-b border-white/10 pb-6 bg-gradient-to-b from-zinc-900 to-transparent">
                <div className="flex flex-col">
                    <span className="text-4xl font-thin tracking-tighter">{format(time, "HH:mm")}</span>
                    <span className="text-sm text-zinc-400">{format(time, "EEEE, MMMM d")}</span>
                </div>
                <div className="flex gap-4 mb-1">
                    <Settings size={20} className="text-zinc-400" />
                </div>
            </div>

            {/* Quick Settings */}
            <div className="p-4 grid grid-cols-4 gap-4">
                {toggles.map((t, i) => (
                    <button
                        key={i}
                        className="flex flex-col items-center gap-2 group"
                        onClick={() => handleToggle(i)}
                    >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${t.active ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] scale-105' : 'bg-zinc-800 text-zinc-400'}`}>
                            {t.icon}
                        </div>
                        <span className="text-[10px] text-zinc-300 font-medium truncate w-full text-center">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Brightness Slider */}
            <div className="px-6 py-2">
                <div className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-full px-4">
                    <Sun size={16} className="text-zinc-400" />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                </div>
            </div>

            {/* Notifications */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 mt-2">
                <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Notifications</span>
                    <button className="text-xs text-blue-400">Clear all</button>
                </div>
                {notifications.map(n => (
                    <div key={n.id} className="bg-zinc-800/80 rounded-2xl p-4 flex gap-3 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300">
                            {n.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-medium text-zinc-400">{n.app}</span>
                                <span className="text-[10px] text-zinc-500">{n.time}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-zinc-200 mt-0.5">{n.title}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{n.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grab Handle */}
            <div className="w-full h-6 flex justify-center items-center cursor-grab active:cursor-grabbing pb-2" onClick={onClose}>
                <div className="w-12 h-1 bg-zinc-600 rounded-full" />
            </div>
        </motion.div>
    )
}

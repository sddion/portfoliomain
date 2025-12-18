"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wifi, Bluetooth, Battery, Moon, Sun, Plane, Settings, Bell, X, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { useNotifications } from "@/hooks/useNotifications"
import { useGitHubActivity } from "@/hooks/useGitHubActivity"
import { useBluetooth } from "@/hooks/useBluetooth"
import { MobileConkyWidget } from "@/components/os/MobileConkyWidget"

interface NotificationShadeProps {
    isOpen: boolean
    onClose: () => void
}

export function NotificationShade({ isOpen, onClose }: NotificationShadeProps) {
    const [time, setTime] = useState(new Date())
    const [brightness, setBrightness] = useState(80)
    const [githubStats, setGithubStats] = useState({ repos: 0, followers: 0 })

    // Hooks
    const { supported, permission, notifications, requestPermission, showNotification, clearNotifications } = useNotifications()
    const { commits, refetch } = useGitHubActivity("sddion", permission === "granted")
    const { supported: bluetoothSupported, device, connecting, error: bluetoothError, requestDevice } = useBluetooth()

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Fetch GitHub stats for Conky widget
    useEffect(() => {
        fetch("https://api.github.com/users/sddion")
            .then(res => res.json())
            .then(data => {
                setGithubStats({
                    repos: data.public_repos || 0,
                    followers: data.followers || 0
                })
            })
            .catch(console.error)
    }, [])

    // Show notification when new commits are detected
    useEffect(() => {
        if (commits.length > 0 && permission === "granted") {
            const latestCommit = commits[0]
            showNotification("New GitHub Commit", {
                body: `${latestCommit.author}: ${latestCommit.message}`,
                icon: "/DedSec_logo.webp",
                tag: `commit-${latestCommit.sha}`,
                data: { url: latestCommit.url }
            })
        }
    }, [commits, permission, showNotification])

    const [toggles, setToggles] = useState([
        { icon: <Wifi size={20} />, label: "Wi-Fi", active: true },
        { icon: <Bluetooth size={20} />, label: "Bluetooth", active: !!device?.connected },
        { icon: <Bell size={20} />, label: "Notifications", active: permission === "granted" },
        { icon: <Moon size={20} />, label: "Do Not Disturb", active: false },
    ])

    const handleToggle = async (index: number) => {
        const toggle = toggles[index]

        // Handle Bluetooth toggle
        if (toggle.label === "Bluetooth") {
            if (!device?.connected) {
                await requestDevice()
            }
            return
        }

        // Handle Notifications toggle
        if (toggle.label === "Notifications") {
            if (permission !== "granted") {
                await requestPermission()
            }
            return
        }

        // Regular toggles
        setToggles(prev => prev.map((t, i) =>
            i === index ? { ...t, active: !t.active } : t
        ))
    }

    // Sync Bluetooth and Notification states
    useEffect(() => {
        setToggles(prev => prev.map(t => {
            if (t.label === "Bluetooth") return { ...t, active: !!device?.connected }
            if (t.label === "Notifications") return { ...t, active: permission === "granted" }
            return t
        }))
    }, [device, permission])



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

            {/* Mobile Conky Widget */}
            <div className="p-4">
                <MobileConkyWidget
                    bluetoothDevice={device}
                    githubStats={githubStats}
                />
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

            {/* Bluetooth Status */}
            {bluetoothError && (
                <div className="px-4 pb-2">
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-2 flex items-center gap-2">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-[10px] text-red-300">{bluetoothError}</span>
                    </div>
                </div>
            )}
            {connecting && (
                <div className="px-4 pb-2">
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-2 text-center">
                        <span className="text-[10px] text-blue-300">Connecting to device...</span>
                    </div>
                </div>
            )}

            {/* Notification Permission Prompt */}
            {supported && permission === "default" && (
                <div className="px-4 pb-2">
                    <button
                        onClick={requestPermission}
                        className="w-full bg-green-600 hover:bg-green-500 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Bell size={16} />
                        Enable Notifications
                    </button>
                </div>
            )}

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
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        Notifications {notifications.length > 0 && `(${notifications.length})`}
                    </span>
                    {notifications.length > 0 && (
                        <button
                            onClick={clearNotifications}
                            className="text-xs text-blue-400 hover:text-blue-300"
                        >
                            Clear all
                        </button>
                    )}
                </div>
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell size={32} className="mx-auto text-zinc-700 mb-2" />
                        <p className="text-sm text-zinc-500">No notifications</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} className="bg-zinc-800/80 rounded-2xl p-4 flex gap-3 border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300">
                                <Bell size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-medium text-zinc-400">{n.title}</span>
                                    <span className="text-[10px] text-zinc-500">
                                        {format(n.timestamp, "HH:mm")}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{n.body}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Grab Handle */}
            <div className="w-full h-6 flex justify-center items-center cursor-grab active:cursor-grabbing pb-2" onClick={onClose}>
                <div className="w-12 h-1 bg-zinc-600 rounded-full" />
            </div>
        </motion.div>
    )
}

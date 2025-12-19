"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, Bluetooth, Battery, Moon, Sun, Plane, Settings, Bell, X, AlertCircle, Snowflake } from "lucide-react"
import { format } from "date-fns"
import { useNotifications } from "@/hooks/useNotifications"
import { useGitHubActivity } from "@/hooks/useGitHubActivity"
import { useBluetooth } from "@/hooks/useBluetooth"
import { useWindowManager } from "@/components/os/WindowManager"

import { MobileSettings } from "@/components/os/MobileSettings"

interface NotificationShadeProps {
    isOpen: boolean
    onClose: () => void
}

export function NotificationShade({ isOpen, onClose }: NotificationShadeProps) {
    const [time, setTime] = useState(new Date())
    const [githubStats, setGithubStats] = useState({ repos: 0, followers: 0 })
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    // Hooks
    const { supported, permission, notifications, requestPermission, showNotification, clearNotifications, removeNotification } = useNotifications()
    const { commits, refetch } = useGitHubActivity("sddion", permission === "granted")
    const { supported: bluetoothSupported, device, connecting, error: bluetoothError, requestDevice } = useBluetooth()
    const { showSnowfall, toggleSnowfall } = useWindowManager()

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
        { icon: <Snowflake size={20} />, label: "Snow", active: showSnowfall },
        { icon: <Moon size={20} />, label: "Do Not Disturb", active: false },
    ])

    const handleToggle = async (index: number) => {
        const toggle = toggles[index]

        // Handle Bluetooth toggle
        if (toggle.label === "Bluetooth") {
            if (!bluetoothSupported) {
                showNotification("Bluetooth", { body: "Bluetooth is not supported on this device" })
                return
            }
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

        // Handle Snow toggle
        if (toggle.label === "Snow") {
            toggleSnowfall()
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
            if (t.label === "Snow") return { ...t, active: showSnowfall }
            return t
        }))
    }, [device, permission, showSnowfall])

    // Sync Bluetooth errors to notification history
    useEffect(() => {
        if (bluetoothError) {
            showNotification("Bluetooth System", {
                body: bluetoothError,
                icon: "/DedSec_logo.webp"
            })
        }
    }, [bluetoothError, showNotification])

    // Periodically refetch GitHub activity when notifications are supported and enabled
    useEffect(() => {
        if (supported && permission === "granted") {
            const interval = setInterval(() => refetch(), 60000)
            return () => clearInterval(interval)
        }
    }, [supported, permission, refetch])

    return (
        <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: isOpen ? 0 : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[300] bg-[var(--background)]/90 backdrop-blur-md text-[var(--foreground)] flex flex-col"
            drag="y"
            dragConstraints={{ top: -window.innerHeight, bottom: 0 }}
            onDragEnd={(_, info) => {
                if (info.offset.y < -50) {
                    onClose()
                }
            }}
        >
            {/* Header */}
            <div className="p-4 flex justify-between items-end border-b border-[var(--os-border)] pb-6 bg-gradient-to-b from-black/20 to-transparent">
                <div className="flex flex-col">
                    <span className="text-4xl font-thin tracking-tighter">{format(time, "HH:mm")}</span>
                    <span className="text-sm text-[var(--muted-foreground)]">{format(time, "EEEE, MMMM d")}</span>
                </div>
                <div className="flex gap-4 mb-1">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 -mr-2 rounded-full active:bg-white/10"
                    >
                        <Settings size={22} className="text-[var(--muted-foreground)]" />
                    </button>
                </div>
            </div>

            <MobileSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />


            {/* Quick Settings */}
            <div className="p-4 grid grid-cols-4 gap-4">
                {toggles.map((t, i) => (
                    <button
                        key={i}
                        className="flex flex-col items-center gap-2 group"
                        onClick={() => handleToggle(i)}
                    >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${t.active ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)] scale-105' : 'bg-[var(--os-surface)] text-[var(--muted-foreground)]'}`}>
                            {t.icon}
                        </div>
                        <span className="text-[10px] text-[var(--muted-foreground)] font-medium truncate w-full text-center">{t.label}</span>
                    </button>
                ))}
            </div>

            {connecting && (
                <div className="px-4 pb-2">
                    <div className="bg-[var(--primary)]/20 border border-[var(--primary)]/30 rounded-lg p-2 text-center">
                        <span className="text-[10px] text-[var(--primary)]">Connecting to device...</span>
                    </div>
                </div>
            )}

            {/* GitHub Stats */}
            <div className="px-4 pb-2">
                <div className="bg-[var(--os-surface)] border border-[var(--os-border)] rounded-lg p-3 flex justify-around">
                    <div className="text-center">
                        <span className="text-lg font-bold text-[var(--foreground)]">{githubStats.repos}</span>
                        <p className="text-[10px] text-[var(--muted-foreground)]">Repos</p>
                    </div>
                    <div className="text-center">
                        <span className="text-lg font-bold text-[var(--foreground)]">{githubStats.followers}</span>
                        <p className="text-[10px] text-[var(--muted-foreground)]">Followers</p>
                    </div>
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
                            className="text-xs text-[var(--primary)] hover:opacity-80"
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
                    <AnimatePresence mode="popLayout">
                        {notifications.map(n => (
                            <motion.div
                                key={n.id}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.5}
                                onDragEnd={(_, info) => {
                                    if (Math.abs(info.offset.x) > 100) {
                                        removeNotification(n.id)
                                    }
                                }}
                                initial={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 200 }}
                                whileDrag={{ scale: 0.98, opacity: 0.8 }}
                                className="bg-[var(--os-surface)] rounded-2xl p-4 flex gap-3 border border-[var(--os-border)] cursor-grab active:cursor-grabbing"
                            >
                                <div className="w-8 h-8 rounded-full bg-[var(--os-surface-hover)] flex items-center justify-center text-[var(--muted-foreground)]">
                                    <Bell size={16} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-medium text-[var(--muted-foreground)]">{n.title}</span>
                                        <span className="text-[10px] text-[var(--muted-foreground)] opacity-60">
                                            {format(n.timestamp, "HH:mm")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--foreground)] opacity-80 mt-0.5 leading-relaxed">{n.body}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Grab Handle */}
            <div className="w-full h-6 flex justify-center items-center cursor-grab active:cursor-grabbing pb-2" onClick={onClose}>
                <div className="w-12 h-1 bg-[var(--os-surface-hover)] rounded-full" />
            </div>
        </motion.div>
    )
}

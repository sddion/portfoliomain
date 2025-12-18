"use client"

import React, { useState, useEffect } from "react"
import { Wifi, Lock, Loader2, Check, Signal, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WiFiMenuProps {
    isOpen: boolean
    onClose: () => void
}

// Add types for Network Information API (Standard-ish)
interface NetworkInformation {
    type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
    effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    addEventListener: (type: string, listener: EventListener) => void;
    removeEventListener: (type: string, listener: EventListener) => void;
}

const MOCK_NETWORKS = [
    { ssid: "FBI Surveillance Van #4", signal: 95, secure: true },
    { ssid: "Skynet Global Link", signal: 80, secure: true },
    { ssid: "Pretty Fly for a WiFi", signal: 70, secure: true },
    { ssid: "T-Virus Distribution Point", signal: 45, secure: false },
    { ssid: "Area51 Guest", signal: 30, secure: true },
]

export function WiFiMenu({ isOpen, onClose }: WiFiMenuProps) {
    const [networkInfo, setNetworkInfo] = useState<NetworkInformation | null>(null)
    const [scanning, setScanning] = useState(false)
    const [networks, setNetworks] = useState<any[]>([])
    const [connectedSsid, setConnectedSsid] = useState<string | null>(null)

    useEffect(() => {
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
            const nav = navigator as any;
            setNetworkInfo(nav.connection)

            const updateConnection = () => {
                setNetworkInfo(nav.connection)
            }

            nav.connection.addEventListener('change', updateConnection)
            return () => nav.connection.removeEventListener('change', updateConnection)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            setScanning(true)
            setNetworks([])

            // Simulate scan delay
            setTimeout(() => {
                setScanning(false)
                setNetworks(MOCK_NETWORKS)
            }, 1500)
        }
    }, [isOpen])

    const handleConnect = (ssid: string) => {
        if (ssid === connectedSsid) return

        // Simple visual toggle for now
        setConnectedSsid(ssid)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-12 right-2 w-80 bg-[var(--os-surface)] border border-[var(--os-border)] rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col font-mono"
                    >
                        <div className="p-3 bg-[var(--os-surface-hover)] border-b border-[var(--os-border)] font-bold text-sm flex justify-between items-center text-[var(--foreground)]">
                            <span>WiFi Networks</span>
                            {scanning ? (
                                <Loader2 size={14} className="animate-spin text-[var(--primary)]" />
                            ) : (
                                <button onClick={() => { setScanning(true); setNetworks([]); setTimeout(() => { setScanning(false); setNetworks(MOCK_NETWORKS); }, 1500) }} className="hover:text-[var(--primary)] transition-colors">
                                    <Loader2 size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 max-h-64 overflow-y-auto">
                            {/* Current Connection Info */}
                            {networkInfo && (
                                <div className="p-3 border-b border-[var(--os-border)] bg-[var(--primary)]/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-[var(--primary)] flex items-center gap-2">
                                            <Wifi size={14} /> Connected Interface
                                        </span>
                                        <span className="text-[10px] text-[var(--primary)] opacity-60">{networkInfo.effectiveType || '4g'}</span>
                                    </div>
                                    <div className="text-xs text-[var(--muted-foreground)] grid grid-cols-2 gap-2">
                                        <div>Speed: <span className="text-[var(--foreground)]">{networkInfo.downlink} Mbps</span></div>
                                        <div>Ping: <span className="text-[var(--foreground)]">{networkInfo.rtt} ms</span></div>
                                    </div>
                                </div>
                            )}

                            {/* Network List */}
                            <div className="py-2">
                                {scanning ? (
                                    <div className="p-4 text-center text-xs text-zinc-500 animate-pulse">
                                        Scanning for nearby networks...
                                    </div>
                                ) : (
                                    networks.map((net, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handleConnect(net.ssid)}
                                            className={`px-4 py-2 hover:bg-[var(--os-surface-hover)] cursor-pointer flex items-center justify-between transition-colors group ${connectedSsid === net.ssid ? 'bg-[var(--os-surface-hover)]' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Wifi size={16} className={`${net.signal > 70 ? 'text-[var(--primary)]' : net.signal > 40 ? 'text-yellow-500' : 'text-[var(--destructive)]'}`} />
                                                <div className="flex flex-col">
                                                    <span className={`text-sm ${connectedSsid === net.ssid ? 'text-[var(--primary)] font-bold' : 'text-[var(--muted-foreground)]'}`}>
                                                        {net.ssid}
                                                    </span>
                                                    <span className="text-[10px] text-[var(--muted-foreground)] opacity-50">
                                                        {net.secure ? 'WPA2-PSK' : 'Open'}
                                                    </span>
                                                </div>
                                            </div>
                                            {net.secure && <Lock size={12} className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />}
                                            {connectedSsid === net.ssid && <Check size={14} className="text-[var(--primary)]" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="p-2 border-t border-[var(--os-border)] bg-black/20 flex justify-between items-center text-xs text-[var(--muted-foreground)]">
                            <span>wlan0: up</span>
                            <span className="hover:text-[var(--foreground)] cursor-pointer transition-colors">Network Settings</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

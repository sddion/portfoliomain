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

export function WiFiMenu({ isOpen, onClose }: WiFiMenuProps) {
    const [networkInfo, setNetworkInfo] = useState<NetworkInformation | null>(null)
    const [scanning, setScanning] = useState(false)
    const [scanError, setScanError] = useState(false)

    // Fake neighbor networks to show "protected" view
    const [neighbors, setNeighbors] = useState([
        { ssid: "Hidden_Network", signal: 20 },
        { ssid: "Neighbors_WiFi", signal: 45 },
    ])

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
            setScanError(false)
            // Mock scan that "fails" to find SSIDs due to browser privacy
            setTimeout(() => {
                setScanning(false)
                setScanError(true)
            }, 2000)
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-12 right-2 w-72 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        <div className="p-3 bg-zinc-800 border-b border-zinc-700 font-bold text-sm flex justify-between items-center text-zinc-200">
                            <span>Network Connection</span>
                            {scanning && <Loader2 size={14} className="animate-spin text-green-500" />}
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Current Connection Info */}
                            <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2">
                                    <Signal size={12} /> Current Interface
                                </h3>
                                {networkInfo ? (
                                    <div className="space-y-1 text-sm font-mono text-zinc-300">
                                        <div className="flex justify-between">
                                            <span>Type:</span>
                                            <span className="text-green-400 font-bold">{networkInfo.type || 'unknown'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Effective Type:</span>
                                            <span className="text-blue-400">{networkInfo.effectiveType || 'unknown'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Downlink:</span>
                                            <span className="text-white">{networkInfo.downlink} Mbps</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>RTT:</span>
                                            <span className="text-white">{networkInfo.rtt} ms</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-zinc-500 italic text-xs">
                                        Network Information API not supported.
                                    </div>
                                )}
                            </div>

                            {/* Scan Error Message */}
                            {scanError && (
                                <div className="bg-red-900/20 p-2 rounded border border-red-900/50 flex items-start gap-2">
                                    <Info size={14} className="text-red-400 mt-0.5 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-red-400">Scan Permission Denied</span>
                                        <span className="text-[10px] text-zinc-400 leading-tight mt-1">
                                            Browser security policy prevents access to local WiFi BSSIDs/SSIDs.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Fake "Others" */}
                        <div className="border-t border-zinc-800 p-2 bg-zinc-950/30">
                            <span className="text-[10px] text-zinc-600 block px-2 mb-1 uppercase font-bold">Detected Signal Interference</span>
                            {neighbors.map((n, i) => (
                                <div key={i} className="flex justify-between px-2 py-1 text-zinc-600 text-xs text-opacity-50">
                                    <span>{n.ssid}</span>
                                    <span>-{n.signal}dBm</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-2 border-t border-zinc-700 bg-zinc-950 flex justify-between items-center text-xs text-zinc-500 font-mono">
                            <span>{networkInfo?.type === 'wifi' ? 'wlan0' : 'eth0'}</span>
                            <div className="flex items-center gap-2">
                                <span className={networkInfo ? "text-green-500" : "text-red-500"}>{networkInfo ? "ONLINE" : "OFFLINE"}</span>
                                <div className={`w-2 h-2 rounded-full ${networkInfo ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

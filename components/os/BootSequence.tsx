"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function BootSequence({ onComplete }: { onComplete: () => void }) {
    const [lines, setLines] = useState<string[]>([])

    const bootText = [
        "BIOS Date 01/01/24 15:23:00 Ver: 1.0.2",
        "CPU: AMD Ryzen 9 5950X 16-Core Processor",
        "Memory Test: 65536K OK",
        "Detecting Primary Master ... SanjuOS SSD",
        "Detecting Primary Slave ... None",
        "Booting from hard disk...",
        "Loading kernel modules...",
        "Mounting root filesystem...",
        "Starting system services...",
        "Initializing graphics interface...",
        "Welcome to SanjuOS v2.0.4",
    ]

    useEffect(() => {
        let delay = 0
        bootText.forEach((line, index) => {
            delay += Math.random() * 300 + 100
            setTimeout(() => {
                setLines((prev) => [...prev, line])
                if (index === bootText.length - 1) {
                    setTimeout(onComplete, 800)
                }
            }, delay)
        })
    }, [])

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col justify-start p-10 font-mono text-green-500 overflow-hidden">
            {lines.map((line, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-1"
                >
                    {`> ${line}`}
                </motion.div>
            ))}
            <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-3 h-5 bg-green-500 mt-1"
            />
        </div>
    )
}

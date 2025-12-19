"use client"

import React, { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function PWAInstall() {
    const [installPrompt, setInstallPrompt] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setInstallPrompt(e)
            // Show the install button/toast after a short delay
            setTimeout(() => setIsVisible(true), 5000)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!installPrompt) return

        setIsVisible(false)
        // Show the prompt
        installPrompt.prompt()
        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)
        // We've used the prompt, and can't use it again, throw it away
        setInstallPrompt(null)
    }

    return (
        <AnimatePresence>
            {isVisible && installPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 z-[300] bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl p-4 shadow-huge backdrop-blur-md flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                            <Download size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[var(--foreground)]">Install SanjuOS</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Add to home screen for personal experience</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-2 text-[var(--muted-foreground)] hover:bg-white/5 rounded-full"
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={handleInstallClick}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            Install
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

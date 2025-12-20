"use client"

import React, { useState, useEffect } from 'react'
import { Download, X, Share, Plus, Smartphone, Wifi, Rocket, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios' | 'android' | 'other'

function DetectPlatform(): Platform {
    if (typeof window === 'undefined') return 'other'
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) return 'ios'
    if (/android/.test(ua)) return 'android'
    return 'other'
}

export function PWAInstall() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [platform, setPlatform] = useState<Platform>('other')
    const [showIOSInstructions, setShowIOSInstructions] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Detect platform
        setPlatform(DetectPlatform())

        // Check if already installed as PWA
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true
        setIsStandalone(isInstalled)

        if (isInstalled) return

        // For Android/Chrome - listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setInstallPrompt(e as BeforeInstallPromptEvent)
            setTimeout(() => setIsVisible(true), 3000)
        }

        // For iOS - show after delay if not installed
        const detectedPlatform = DetectPlatform()
        if (detectedPlatform === 'ios') {
            const hasSeenPrompt = localStorage.getItem('pwa-prompt-seen')
            if (!hasSeenPrompt) {
                setTimeout(() => setIsVisible(true), 3000)
            }
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        if (platform === 'ios') {
            setShowIOSInstructions(true)
            return
        }

        if (!installPrompt) return

        setIsVisible(false)
        installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)
        setInstallPrompt(null)
    }

    const handleDismiss = () => {
        setIsVisible(false)
        setShowIOSInstructions(false)
        if (platform === 'ios') {
            localStorage.setItem('pwa-prompt-seen', 'true')
        }
    }

    // Don't show if already installed
    if (isStandalone) return null

    // Don't show on desktop
    if (platform === 'other' && !installPrompt) return null

    const features = [
        { icon: Wifi, text: 'Works offline' },
        { icon: Rocket, text: 'Blazing fast' },
        { icon: Smartphone, text: 'Native feel' },
    ]

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[400] flex items-end justify-center p-4 pb-8"
                    style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
                    onClick={handleDismiss}
                >
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm overflow-hidden rounded-3xl"
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 35, 45, 0.95), rgba(20, 25, 35, 0.98))',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                        >
                            <X size={18} className="text-white/70" />
                        </button>

                        {!showIOSInstructions ? (
                            <>
                                {/* Header with App Icon */}
                                <div className="relative pt-8 pb-6 px-6 text-center">
                                    {/* Glow Effect */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 rounded-full blur-3xl" />

                                    {/* App Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.1 }}
                                        className="relative mx-auto w-20 h-20 rounded-2xl overflow-hidden shadow-2xl mb-4"
                                        style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' }}
                                    >
                                        <Image
                                            src="/icons/icon-192.png"
                                            alt="SanjuOS"
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>

                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="text-xl font-bold text-white mb-1"
                                    >
                                        Install SanjuOS
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-white/60"
                                    >
                                        Get the full experience on your device
                                    </motion.p>
                                </div>

                                {/* Features */}
                                <div className="px-6 pb-4">
                                    <div className="flex justify-center gap-6">
                                        {features.map((feature, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.25 + index * 0.05 }}
                                                className="flex flex-col items-center gap-2"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                    <feature.icon size={18} className="text-primary" />
                                                </div>
                                                <span className="text-xs text-white/50">{feature.text}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Install Button */}
                                <div className="p-6 pt-2">
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        onClick={handleInstallClick}
                                        className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, var(--primary)))',
                                            boxShadow: '0 10px 30px -5px rgba(var(--primary-rgb, 59, 130, 246), 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                        }}
                                    >
                                        <Download size={20} />
                                        <span>Install App</span>
                                    </motion.button>

                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        onClick={handleDismiss}
                                        className="w-full mt-3 py-3 text-sm text-white/40 hover:text-white/60 transition-colors"
                                    >
                                        Maybe later
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            /* iOS Instructions */
                            <div className="p-6">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-center mb-6"
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <Share size={28} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">Install on iOS</h3>
                                    <p className="text-sm text-white/50">Follow these simple steps</p>
                                </motion.div>

                                <div className="space-y-4">
                                    {[
                                        { step: 1, icon: Share, text: 'Tap the Share button', subtext: 'At the bottom of Safari' },
                                        { step: 2, icon: Plus, text: 'Tap "Add to Home Screen"', subtext: 'Scroll down to find it' },
                                        { step: 3, icon: ChevronRight, text: 'Tap "Add"', subtext: 'In the top right corner' },
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.step}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + index * 0.1 }}
                                            className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {item.step}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{item.text}</p>
                                                <p className="text-xs text-white/40">{item.subtext}</p>
                                            </div>
                                            <item.icon size={20} className="text-white/30" />
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    onClick={handleDismiss}
                                    className="w-full mt-6 py-4 rounded-2xl font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors"
                                >
                                    Got it!
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

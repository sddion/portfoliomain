"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Briefcase, Code, Layers, Terminal, Heart } from "lucide-react"

interface RecruiterWelcomeProps {
    isRecruiter: boolean
    onComplete: () => void
}

export function RecruiterWelcome({ isRecruiter, onComplete }: RecruiterWelcomeProps) {
    const [show, setShow] = useState(false)
    const [hasShown, setHasShown] = useState(false)

    useEffect(() => {
        // Check if we've already shown welcome this session
        const shown = sessionStorage.getItem("recruiter-welcome-shown")
        if (isRecruiter && !shown && !hasShown) {
            setShow(true)
            setHasShown(true)
            sessionStorage.setItem("recruiter-welcome-shown", "true")
        }
    }, [isRecruiter, hasShown])

    const handleContinue = () => {
        setShow(false)
        setTimeout(onComplete, 500)
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black"
                >
                    {/* Animated gradient orbs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl"
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -50, 0],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            style={{ top: '20%', left: '10%' }}
                        />
                        <motion.div
                            className="absolute w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
                            animate={{
                                x: [0, -80, 0],
                                y: [0, 60, 0],
                                scale: [1, 1.3, 1],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            style={{ bottom: '20%', right: '15%' }}
                        />
                    </div>

                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white/30 rounded-full"
                                initial={{
                                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                                    y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20
                                }}
                                animate={{
                                    y: -20,
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 4 + Math.random() * 4,
                                    repeat: Infinity,
                                    delay: Math.random() * 3,
                                    ease: "linear"
                                }}
                            />
                        ))}
                    </div>

                    {/* Main content */}
                    <motion.div
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: -30, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="relative z-10 text-center max-w-2xl mx-4"
                    >
                        {/* Animated icon with ring */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="relative mx-auto mb-8 w-28 h-28"
                        >
                            {/* Animated ring */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-primary/50"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute inset-2 rounded-full border border-dashed border-white/20"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            />
                            {/* Glow */}
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                            {/* Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40">
                                    <Terminal size={32} className="text-white" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Welcome text with gradient */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent"
                        >
                            Welcome!
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg md:text-xl text-white/70 mb-8 max-w-md mx-auto"
                        >
                            Thanks for taking the time to explore my work. I built this portfolio to showcase what I can do.
                        </motion.p>

                        {/* Feature highlights with stagger animation */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap justify-center gap-3 mb-10"
                        >
                            {[
                                { icon: Code, label: "Live Projects", color: "text-blue-400" },
                                { icon: Briefcase, label: "Experience", color: "text-green-400" },
                                { icon: Layers, label: "Full-Stack", color: "text-purple-400" },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
                                >
                                    <item.icon size={16} className={item.color} />
                                    <span className="text-sm text-white/80">{item.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA Button with glow */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, type: "spring" }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleContinue}
                            className="group relative px-10 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold rounded-full text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Explore
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-white/20"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.5 }}
                            />
                        </motion.button>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="mt-8 text-xs text-white/30 flex items-center justify-center gap-1"
                        >
                            Built with <Heart size={12} className="text-red-400 fill-red-400" /> by Sanju
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}


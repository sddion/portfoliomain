"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight, Briefcase, Code, Rocket } from "lucide-react"

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
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl"
                >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-primary/30 rounded-full"
                                initial={{
                                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                                    y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50
                                }}
                                animate={{
                                    y: -50,
                                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 3,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
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
                        {/* Icon with glow */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="relative mx-auto mb-8 w-24 h-24"
                        >
                            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-2xl shadow-primary/50">
                                <Sparkles size={40} className="text-white" />
                            </div>
                        </motion.div>

                        {/* Welcome text */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-5xl font-bold text-white mb-4"
                        >
                            Hey there! 👋
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-white/80 mb-8"
                        >
                            Thanks for checking out my portfolio!
                        </motion.p>

                        {/* Feature highlights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap justify-center gap-4 mb-10"
                        >
                            <div className="flex items-center gap-2 bg-white/5 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                                <Code size={16} className="text-primary" />
                                <span className="text-sm text-white/70">Live Projects</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                                <Briefcase size={16} className="text-primary" />
                                <span className="text-sm text-white/70">Experience</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                                <Rocket size={16} className="text-primary" />
                                <span className="text-sm text-white/70">Full-Stack Skills</span>
                            </div>
                        </motion.div>

                        {/* CTA Button */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, type: "spring" }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleContinue}
                            className="group relative px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-shadow"
                        >
                            <span className="flex items-center gap-2">
                                Let's Go
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6 text-sm text-white/40"
                        >
                            Feel free to explore everything — it's all interactive!
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

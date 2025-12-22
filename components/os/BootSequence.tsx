"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function BootSequence({ onComplete }: { onComplete: () => void }) {
    const [currentFrame, setCurrentFrame] = useState(1)
    const [isMobile, setIsMobile] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    const watchDogsTotalFrames = 223
    const androidTotalFrames = 96 // 48 in part0, 48 in part1

    useEffect(() => {
        setIsMounted(true)
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()

        // Preload based on device
        const mobile = window.innerWidth < 768
        const framesToPreload = mobile
            ? ["/bootanimation/android/bootanimation/part0/10001.jpg", "/bootanimation/android/bootanimation/part0/10002.jpg"]
            : ["/bootanimation/1.png", "/bootanimation/2.png"]

        framesToPreload.forEach(src => {
            const img = new Image()
            img.src = src
        })
    }, [])

    useEffect(() => {
        if (!isMounted) return

        const intervalMs = isMobile ? 21 : 50 // ~48fps for mobile, 20fps for desktop
        const totalFrames = isMobile ? androidTotalFrames : watchDogsTotalFrames

        const interval = setInterval(() => {
            setCurrentFrame(prev => {
                if (prev >= totalFrames) {
                    clearInterval(interval)
                    setTimeout(onComplete, 500)
                    return prev
                }
                return prev + 1
            })
        }, intervalMs)

        return () => clearInterval(interval)
    }, [onComplete, isMobile, isMounted, watchDogsTotalFrames, androidTotalFrames])

    if (!isMounted) return <div className="fixed inset-0 bg-black z-[100]" />

    const getFrameSrc = () => {
        if (isMobile) {
            if (currentFrame <= 48) {
                const frameNum = 10000 + currentFrame
                return `/bootanimation/android/bootanimation/part0/${frameNum}.jpg`
            } else {
                const frameNum = 10000 + (currentFrame - 48)
                return `/bootanimation/android/bootanimation/part1/${frameNum}.jpg`
            }
        }
        return `/bootanimation/${currentFrame}.png`
    }

    return (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
                <motion.img
                    key={currentFrame}
                    src={getFrameSrc()}
                    alt="Booting..."
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1 }}
                    className={isMobile ? "h-full w-auto object-contain" : "w-full max-w-4xl h-auto object-contain"}
                    transition={{ duration: 0 }}
                />

                {/* Optional: Add a subtle overlay for consistency */}
                <div className="absolute inset-0 pointer-events-none bg-black/10" />
            </div>
        </div>
    )
}

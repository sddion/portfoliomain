"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function BootSequence({ onComplete }: { onComplete: () => void }) {
    const [currentFrame, setCurrentFrame] = useState(1)
    const totalFrames = 223 // Based on the number of frames available

    useEffect(() => {
        // Preload first few frames
        const preloadFrames = [1, 2, 3, 4, 5]
        preloadFrames.forEach(frame => {
            const img = new Image()
            img.src = `/bootanimation/${frame}.png`
        })
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame(prev => {
                if (prev >= totalFrames) {
                    clearInterval(interval)
                    setTimeout(onComplete, 500)
                    return prev
                }
                return prev + 1
            })
        }, 50) // Adjust speed as needed (50ms = 20fps)

        return () => clearInterval(interval)
    }, [onComplete, totalFrames])

    return (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden">
            <div className="relative w-full max-w-4xl aspect-video flex items-center justify-center">
                <motion.img
                    key={currentFrame}
                    src={`/bootanimation/${currentFrame}.png`}
                    alt="Booting..."
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-auto object-contain pointer-events-none select-none"
                    transition={{ duration: 0.03 }}
                />
            </div>
        </div>
    )
}

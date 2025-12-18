"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

const SNIPPETS = [
    "const [user, setUser] = useState(null);",
    "if (isValid) { return true; }",
    "import { useEffect } from 'react';",
    "console.log('System initialized');",
    "display: flex; justify-content: center;",
    "public static void main(String[] args) {",
    "<div className='container'>",
    "await fetch('/api/data');",
    "function recursive() { return recursive(); }",
    "chmod +x script.sh",
    "sudo apt-get update",
    "return new Promise((resolve) => resolve());",
    "position: absolute; top: 0; left: 0;",
    "while(true) { process(); }",
    "git commit -m 'Initial commit'",
    "npm run build",
    "const data = await res.json();",
    "interface User { id: string; name: string; }",
    "selector { color: #00ff00; }",
    "try { connect(); } catch(e) { log(e); }"
]

export function FloatingCode() {
    // Generate random items on client-side to avoid hydration mismatch
    const [items, setItems] = useState<{ id: number; text: string; x: number; y: number; delay: number; duration: number }[]>([])

    useEffect(() => {
        const newItems = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            text: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
            x: Math.random() * 90, // percent
            y: Math.random() * 90, // percent
            delay: Math.random() * 5,
            duration: 8 + Math.random() * 10
        }))
        setItems(newItems)
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    className="absolute text-green-500/20 font-mono text-xs sm:text-sm whitespace-nowrap"
                    initial={{ opacity: 0, x: `${item.x}vw`, y: `${item.y}vh` }}
                    animate={{
                        opacity: [0, 0.4, 0],
                        y: [`${item.y}vh`, `${item.y - 10}vh`] // Float up slightly
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        delay: item.delay,
                        ease: "linear"
                    }}
                >
                    {item.text}
                </motion.div>
            ))}
        </div>
    )
}

"use client"

import React, { useState } from "react"
import { Award, Terminal, Download, X, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function CreditsApp() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const wallpapers = [
        {
            name: "Ubuntu",
            prompt: "Ubuntu themed abstract wallpaper, desktop resolution 1920x1080. Orange and purple gradient, geometric shapes, canonical style, slick, modern, linux desktop background.",
            preview: "/wallpapers/ubuntu-desktop.png",
            color: "from-orange-500 to-purple-600"
        },
        {
            name: "Ocean",
            prompt: "Deep ocean blue aesthetic wallpaper, desktop resolution 1920x1080. Dark blue tones, underwater vibes, calm, minimal, slick, digital art.",
            preview: "/wallpapers/ocean-desktop.png",
            color: "from-blue-600 to-cyan-500"
        },
        {
            name: "Dracula",
            prompt: "Dracula theme wallpaper, desktop resolution 1920x1080. Dark grey background with pink, purple, and green neon accents. Vampire aesthetic but minimal and tech-oriented. Coding theme.",
            preview: "/wallpapers/dracula-desktop.png",
            color: "from-pink-500 to-purple-600"
        }
    ]

    const handleDownload = async (url: string, name: string) => {
        const link = document.createElement('a')
        link.href = url
        link.download = `${name.toLowerCase()}-wallpaper.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="h-full bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-white font-sans flex flex-col items-center p-6 overflow-y-auto">

            <div className="max-w-4xl w-full space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl shadow-purple-500/30 mb-2">
                        <Award className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Wallpaper Gallery
                    </h1>
                    <p className="text-zinc-400 max-w-xl mx-auto text-sm">
                        All wallpapers generated using <span className="text-white font-semibold">Gemini Pro</span> by Google DeepMind
                    </p>
                </div>

                {/* Wallpapers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wallpapers.map((wp) => (
                        <div key={wp.name} className="group relative bg-zinc-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-zinc-700/50 hover:border-zinc-600 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                            {/* Image */}
                            <div
                                className="relative h-40 overflow-hidden cursor-pointer"
                                onClick={() => setSelectedImage(wp.preview)}
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${wp.preview})` }}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-br ${wp.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                    <button className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors">
                                        <Eye className="text-white" size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white">{wp.name}</h3>
                                    <button
                                        onClick={() => handleDownload(wp.preview, wp.name)}
                                        className="p-2 bg-zinc-700/50 hover:bg-zinc-600 rounded-lg transition-colors group/btn"
                                        title="Download wallpaper"
                                    >
                                        <Download className="text-zinc-300 group-hover/btn:text-white" size={16} />
                                    </button>
                                </div>

                                {/* Prompt */}
                                <div className="bg-black/40 rounded-lg p-3 border border-zinc-800">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Terminal size={12} className="text-zinc-500" />
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Prompt</span>
                                    </div>
                                    <p className="font-mono text-[10px] leading-relaxed text-white">
                                        {wp.prompt}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-zinc-600 pt-4 border-t border-zinc-800/50">
                    <p>Portfolio OS v2.0 • 2025 • Powered by Gemini</p>
                </div>
            </div>

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-6xl max-h-[90vh] w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="text-white" size={24} />
                            </button>
                            <img
                                src={selectedImage}
                                alt="Wallpaper preview"
                                className="w-full h-full object-contain rounded-xl shadow-2xl"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

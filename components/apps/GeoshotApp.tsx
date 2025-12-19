"use client"

import React from "react"
import { motion } from "framer-motion"
import { Download, Globe, Github, Camera, MapPin, Shield, Layers, Code2, ExternalLink, Smartphone, Zap, Sparkles } from "lucide-react"
import { useWindowManager } from "@/components/os/WindowManager"
import { BrowserApp } from "@/components/apps/BrowserApp"
import { cn } from "@/lib/utils"

export function GeoshotApp() {
    const { openWindow } = useWindowManager()

    const openLink = (url: string) => {
        openWindow("browser", "Browser", <BrowserApp initialUrl={url} />, <Globe size={18} />)
        window.dispatchEvent(new CustomEvent("browser:open-url", { detail: { url } }))
    }

    return (
        <div className="h-full bg-[var(--background)] text-[var(--foreground)] overflow-hidden font-sans relative">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="h-full flex flex-col relative z-10">
                {/* Header / Hero Section */}
                <div className="p-8 sm:p-12 flex flex-col items-center text-center shrink-0 border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative group mb-6"
                    >
                        <div className="absolute inset-0 bg-primary/40 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="w-28 h-28 relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 p-1 bg-white/5 backdrop-blur-xl">
                            <img
                                src="https://raw.githubusercontent.com/sddion/geoshot/main/docs/assets/android-icon-48x48.png"
                                alt="Geoshot Icon"
                                className="w-full h-full object-cover rounded-xl"
                            />
                        </div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-black/50 border border-white/10 rounded-full flex items-center justify-center text-yellow-400 backdrop-blur-md"
                        >
                            <Sparkles size={14} />
                        </motion.div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl sm:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent"
                    >
                        GeoShot
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed font-medium"
                    >
                        Precision Documentation. Re-imagined for active mapping and Field operations.
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-4 mt-8"
                    >
                        <button
                            onClick={() => openLink("https://github.com/sddion/geoshot/releases/latest")}
                            className="group flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                        >
                            <Download size={20} className="group-hover:bounce" />
                            Get GeoShot
                        </button>
                        <button
                            onClick={() => openLink("https://github.com/sddion/geoshot")}
                            className="flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-4 rounded-2xl font-bold backdrop-blur-xl transition-all active:scale-95"
                        >
                            <Github size={20} /> View Source
                        </button>
                    </motion.div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-6 sm:p-10 space-y-12 custom-scrollbar">

                    {/* Features Grid */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl font-black tracking-tight">Key Features</h2>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={<MapPin className="text-blue-400" />}
                                title="Precise Data"
                                desc="Hyper-accurate GPS coordinates embedded in every frame."
                                delay={0.1}
                            />
                            <FeatureCard
                                icon={<Shield className="text-emerald-400" />}
                                title="Local-Only"
                                desc="Data never leaves your device. No cloud. No tracking."
                                delay={0.2}
                            />
                            <FeatureCard
                                icon={<Layers className="text-purple-400" />}
                                title="Native Core"
                                desc="High-performance C++ core for instant captures."
                                delay={0.3}
                            />
                            <FeatureCard
                                icon={<Zap className="text-yellow-400" />}
                                title="Pro Workflow"
                                desc="Streamlined UI designed for high-pressure field usage."
                                delay={0.4}
                            />
                            <FeatureCard
                                icon={<Smartphone className="text-orange-400" />}
                                title="Universal"
                                desc="Optimized for both high-end and legacy Android devices."
                                delay={0.5}
                            />
                            <FeatureCard
                                icon={<Code2 className="text-pink-400" />}
                                title="Open Source"
                                desc="Trusted by developers. Verified by the community."
                                delay={0.6}
                            />
                        </div>
                    </section>

                    {/* Pro Specs Section */}
                    <motion.section
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl backdrop-blur-2xl relative overflow-hidden group"
                    >
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-colors" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h3 className="text-2xl font-black mb-4">Enterprise Grade</h3>
                                <p className="text-[var(--muted-foreground)] leading-relaxed font-medium">
                                    GeoShot isn&apos;t just another camera app. It&apos;s a precision instrument built for heavy-duty field documentation, ensuring that every pixel captured is backed by verifiable location data.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    <Badge>V2.4.0</Badge>
                                    <Badge>React Native</Badge>
                                    <Badge>Open Source</Badge>
                                    <Badge>Field Ready</Badge>
                                </div>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-sm space-y-3">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-zinc-500">Platform</span>
                                    <span className="text-emerald-400">Android 7.0+</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-zinc-500">Privacy</span>
                                    <span className="text-emerald-400">Verified</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">License</span>
                                    <span className="text-emerald-400">MIT</span>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Download Hub */}
                    <section className="pb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl font-black tracking-tight">Downloads</h2>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        <div className="space-y-4">
                            <DownloadItem
                                arch="Universal APK"
                                label="Recommended for most modern devices (arm64)"
                                version="2.4.0"
                                onClick={() => openLink("https://github.com/sddion/geoshot/releases/latest")}
                            />
                            <DownloadItem
                                arch="Legacy Build"
                                label="Optimized for older hardware (v7a / x86)"
                                version="2.3.8"
                                onClick={() => openLink("https://github.com/sddion/geoshot/releases")}
                            />
                        </div>
                    </section>

                    <footer className="text-center py-12 border-t border-white/5">
                        <Camera size={24} className="mx-auto mb-4 text-white/20" />
                        <p className="text-[var(--muted-foreground)] text-sm font-medium italic opacity-60">Built for the explorers. Crafted for the professionals.</p>
                        <p className="text-zinc-600 text-[10px] mt-4 uppercase tracking-[0.2em] font-black">© 2025 GeoShot Hub • Sddion</p>
                    </footer>
                </div>
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
        >
            <div className="mb-4 bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
            <h4 className="font-black text-white text-lg mb-2">{title}</h4>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed font-medium">{desc}</p>
        </motion.div>
    )
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-wider text-primary">
            {children}
        </span>
    )
}

function DownloadItem({ arch, label, version, onClick }: { arch: string, label: string, version: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-primary/[0.02] rounded-3xl transition-all group group-active:scale-[0.99]"
        >
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Download size={24} />
                </div>
                <div className="text-left">
                    <div className="flex items-center gap-3">
                        <span className="font-black text-lg">{arch}</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold">V{version}</span>
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)] font-medium mt-1">{label}</div>
                </div>
            </div>
            <div className="p-3 rounded-full border border-white/10 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                <ExternalLink size={18} />
            </div>
        </button>
    )
}

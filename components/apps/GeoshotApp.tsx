"use client"

import React from "react"
import { Download, Globe, Github, Camera, MapPin, Shield, Layers, Zap } from "lucide-react"

export function GeoshotApp() {
    return (
        <div className="h-full flex flex-col bg-zinc-900 text-white overflow-hidden font-sans">
            {/* Header / Hero Section */}
            <div className="bg-gradient-to-br from-green-900 via-zinc-900 to-black p-8 flex flex-col items-center text-center border-b border-zinc-700 shrink-0">
                <div className="w-24 h-24 mb-4 rounded-xl overflow-hidden shadow-2xl border-2 border-green-500/30">
                    <img
                        src="https://raw.githubusercontent.com/sddion/geoshot/main/docs/assets/android-icon-48x48.png"
                        alt="Geoshot Icon"
                        className="w-full h-full object-cover"
                    />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">GeoShot</h1>
                <p className="text-lg text-zinc-300 max-w-md mx-auto line-clamp-2">
                    Advanced geolocation camera app for professionals and explorers.
                </p>
                <div className="flex gap-3 mt-6">
                    <a
                        href="https://github.com/sddion/geoshot/releases/latest"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-black px-6 py-2 rounded-full font-bold transition-transform active:scale-95"
                    >
                        <Download size={18} /> Download APK
                    </a>
                    <a
                        href="https://github.com/sddion/geoshot"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-4 py-2 rounded-full font-medium transition-colors"
                    >
                        <Github size={18} /> Source
                    </a>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto p-6 md:p-8 space-y-12">

                {/* Features Grid */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-400">
                        <Camera size={24} /> Key Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FeatureCard
                            icon={<MapPin className="text-blue-400" />}
                            title="Precise Geolocation"
                            desc="Embed GPS coordinates into every photo automatically."
                        />
                        <FeatureCard
                            icon={<Shield className="text-green-400" />}
                            title="Privacy First"
                            desc="Location data stays on your device. No tracking."
                        />
                        <FeatureCard
                            icon={<Layers className="text-purple-400" />}
                            title="Native Quality"
                            desc="Crystal clear images using native device APIs."
                        />
                        <FeatureCard
                            icon={<Zap className="text-yellow-400" />}
                            title="Open Source"
                            desc="100% transparent code. Free and Ad-Free forever."
                        />
                    </div>
                </section>

                {/* About Section */}
                <section className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
                    <h3 className="font-bold text-lg mb-2 text-zinc-200">About GeoShot</h3>
                    <p className="text-zinc-400 leading-relaxed text-sm">
                        GeoShot is designed for those who need to document location-specific visual data.
                        Whether you are a civil engineer, a traveler, or just someone who loves
                        data-rich photography, GeoShot provides the tools you need without the bloat.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge>Android</Badge>
                        <Badge>iOS</Badge>
                        <Badge>React Native</Badge>
                        <Badge>Open Source</Badge>
                    </div>
                </section>

                {/* Download Options */}
                <section>
                    <h3 className="font-bold text-lg mb-4 text-zinc-200">Downloads</h3>
                    <div className="bg-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-700 border border-zinc-700">
                        <DownloadRow
                            arch="arm64-v8a"
                            label="Modern Android Devices (64-bit)"
                            link="https://github.com/sddion/geoshot/releases/latest"
                        />
                        <DownloadRow
                            arch="armeabi-v7a"
                            label="Older Android Devices (32-bit)"
                            link="https://github.com/sddion/geoshot/releases/latest"
                        />
                    </div>
                </section>

                <footer className="text-center text-zinc-500 text-xs py-4">
                    <p>© 2025 GeoShot. Developed by sddion.</p>
                </footer>
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-black/20 p-4 rounded-lg flex gap-4 items-start border border-zinc-800/50 hover:border-zinc-700 transition-colors">
            <div className="mt-1 shrink-0">{icon}</div>
            <div>
                <h4 className="font-bold text-zinc-200 text-sm mb-1">{title}</h4>
                <p className="text-xs text-zinc-500 leading-snug">{desc}</p>
            </div>
        </div>
    )
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-400">
            {children}
        </span>
    )
}

function DownloadRow({ arch, label, link }: { arch: string, label: string, link: string }) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-zinc-700/50 transition-colors">
            <div>
                <div className="font-mono text-green-400 text-sm font-bold">{arch}</div>
                <div className="text-xs text-zinc-400">{label}</div>
            </div>
            <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 hover:text-white"
            >
                <Download size={20} />
            </a>
        </div>
    )
}

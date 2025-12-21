"use client"

import React, { useState } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { AppIcon } from "@/components/os/IconManager"
import { AppStoreDetails } from "@/components/apps/AppStoreDetails"
import { useAppReviews } from "@/hooks/use-reviews"

export function AppStoreApp() {
    const { allApps, installApp, uninstallApp, isAppInstalled, openWindow } = useWindowManager()
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<"discover" | "develop" | "social" | "system">("discover")
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null)

    if (selectedAppId) {
        return <AppStoreDetails appId={selectedAppId} onBack={() => setSelectedAppId(null)} />
    }

    const filteredApps = allApps.filter(app => {
        const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false

        if (activeTab === "discover") return true
        if (activeTab === "develop") return app.category === "Development"
        if (activeTab === "social") return app.category === "Social"
        if (activeTab === "system") return app.category === "System" || app.category === "Utility"

        return true
    }).filter(app => !app.hideInStore)

    // Dynamic Featured App (First featured app from the list, or the first app if none featured)
    const featuredApp = allApps.find(app => app.featured) || allApps[0]

    const FeaturedHero = () => {
        if (!featuredApp) return null

        return (
            <div
                className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8 group cursor-pointer border border-white/10 bg-zinc-900"
                onClick={() => setSelectedAppId(featuredApp.id)}
            >
                {/* Background Image - Subtle, no intense overlays */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 transition-transform duration-700 group-hover:scale-105 pointer-events-none" />

                {/* Gradient for text readability only */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end pointer-events-none">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold border border-[var(--primary)]/20 uppercase tracking-widest">
                                Featured
                            </span>
                            {isAppInstalled(featuredApp.id) && (
                                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 uppercase tracking-widest">
                                    Installed
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">{featuredApp.title}</h1>
                        <p className="text-zinc-300 text-sm md:text-base line-clamp-2">
                            {featuredApp.description}
                        </p>
                        <p className="text-zinc-500 text-xs mt-3">Click to view details</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row h-full bg-[#09090b] text-white font-sans animate-in fade-in duration-300">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 border-r border-white/5 bg-zinc-900/50 backdrop-blur-xl flex-col p-4 shrink-0">
                <div className="flex items-center gap-2 px-2 py-4 mb-4">
                    <AppIcon iconName="package" className="text-[var(--primary)]" size={24} />
                    <span className="font-bold text-lg tracking-tight">App Store</span>
                </div>

                <div className="space-y-1">
                    <SidebarItem icon={<AppIcon iconName="home" size={18} />} label="Discover" active={activeTab === "discover"} onClick={() => setActiveTab("discover")} />
                    <SidebarItem icon={<AppIcon iconName="pen-tool" size={18} />} label="Development" active={activeTab === "develop"} onClick={() => setActiveTab("develop")} />
                    <SidebarItem icon={<AppIcon iconName="user" size={18} />} label="Social" active={activeTab === "social"} onClick={() => setActiveTab("social")} />
                    <SidebarItem icon={<AppIcon iconName="layers" size={18} />} label="System" active={activeTab === "system"} onClick={() => setActiveTab("system")} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700/20 active:scrollbar-thumb-zinc-600/50">
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">

                    {/* Header / Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h2 className="text-2xl font-bold hidden md:block">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>

                        {/* Mobile Header Title */}
                        <div className="flex md:hidden items-center gap-2 mb-2">
                            <AppIcon iconName="package" className="text-[var(--primary)]" size={20} />
                            <span className="font-bold text-lg">App Store</span>
                        </div>

                        <div className="relative w-full md:w-72 group">
                            <AppIcon iconName="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search apps..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}

                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--primary)]/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    {activeTab === "discover" && !searchQuery && <FeaturedHero />}

                    {/* App Grid - Responsive with minmax */}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 md:gap-6">
                        {filteredApps.map(app => (
                            <AppCard
                                key={app.id}
                                app={app}
                                isInstalled={isAppInstalled(app.id)}
                                onInstall={() => installApp(app.id)}
                                onUninstall={() => uninstallApp(app.id)}
                                onOpen={() => openWindow(app.id, app.title, app.component, <AppIcon iconName={app.iconName} size={18} />, { width: app.width, height: app.height })}
                                onClick={() => setSelectedAppId(app.id)}
                            />
                        ))}
                    </div>

                    {filteredApps.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                            <AppIcon iconName="package" size={48} className="mb-4 opacity-20" />
                            <p>No apps found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden flex items-center justify-around border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl p-2 pb-4 fixed bottom-0 left-0 right-0 z-10 w-full md:w-auto md:relative md:bg-transparent md:border-none md:p-0">
                <MobileTab icon={<AppIcon iconName="home" size={20} />} label="Discover" active={activeTab === "discover"} onClick={() => setActiveTab("discover")} />
                <MobileTab icon={<AppIcon iconName="pen-tool" size={20} />} label="Dev" active={activeTab === "develop"} onClick={() => setActiveTab("develop")} />
                <MobileTab icon={<AppIcon iconName="user" size={20} />} label="Social" active={activeTab === "social"} onClick={() => setActiveTab("social")} />
                <MobileTab icon={<AppIcon iconName="layers" size={20} />} label="System" active={activeTab === "system"} onClick={() => setActiveTab("system")} />
            </div>
        </div>
    )
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                }`}
        >
            {icon}
            {label}
        </button>
    )
}

function MobileTab({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${active
                ? "text-[var(--primary)]"
                : "text-zinc-500 hover:text-zinc-300"
                }`}
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}

function AppCard({ app, isInstalled, onInstall, onUninstall, onOpen, onClick }: {
    app: any,
    isInstalled: boolean,
    onInstall: () => void,
    onUninstall: () => void,
    onOpen: () => void,
    onClick: () => void
}) {
    // Fetch real stats
    const { averageRating, loading } = useAppReviews(app.id)

    return (
        <div
            onClick={onClick}
            className="bg-zinc-900 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors group flex flex-col min-h-[200px] cursor-pointer hover:bg-zinc-800/50"
        >
            <div className="flex items-start justify-between mb-3 gap-2">
                <div className={`w-12 h-12 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${app.iconColor || 'text-zinc-400'}`}>
                    <AppIcon iconName={app.iconName} size={24} />
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    {app.isNew && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-[9px] font-bold border border-[var(--primary)]/20 uppercase tracking-wide">
                            New
                        </span>
                    )}
                    {!loading && averageRating > 0 && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-950 border border-white/5">
                            <AppIcon iconName="star" size={9} className="text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-medium text-zinc-300">
                                {averageRating}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="font-bold text-sm mb-1 truncate text-zinc-100">{app.title}</h3>
            <p className="text-[11px] text-zinc-500 line-clamp-2 mb-3 min-h-[32px]">
                {app.description}
            </p>

            <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-white/5">
                <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-semibold truncate">{app.category}</span>

                {isInstalled ? (
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onUninstall()
                            }}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                            title="Uninstall"
                        >
                            <span className="sr-only">Uninstall</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onOpen()
                            }}
                            className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition-colors"
                        >
                            Open
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onInstall()
                        }}
                        className="px-4 py-1 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] text-[11px] font-semibold transition-colors shadow-md shadow-[var(--primary)]/20 shrink-0"
                    >
                        Get
                    </button>
                )}
            </div>
        </div>
    )
}


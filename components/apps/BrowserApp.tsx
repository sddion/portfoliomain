"use client"

import React, { useState, useEffect, useRef } from "react"
import { Search, Globe, ChevronLeft, ChevronRight, RotateCcw, Home, ExternalLink, Github, Gitlab, Instagram, MessageCircle, Plus, X, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tab {
    id: string
    url: string
    title: string
    favicon?: string
    isHome?: boolean
}

export function BrowserApp({ initialUrl }: { initialUrl?: string }) {
    const [tabs, setTabs] = useState<Tab[]>([
        { id: "1", url: "about:home", title: "New Tab", isHome: true }
    ])
    const [activeTabId, setActiveTabId] = useState("1")
    const [urlInput, setUrlInput] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]

    // Focus address bar when active tab changes or is home
    useEffect(() => {
        if (activeTab.isHome) {
            inputRef.current?.focus()
        }
    }, [activeTabId, activeTab.isHome])

    // Handle initialUrl and incoming events
    useEffect(() => {
        const handleOpenUrl = (url: string) => {
            if (url && url !== "about:home") {
                const newId = Math.random().toString(36).substr(2, 9)
                const newTab: Tab = {
                    id: newId,
                    url: url,
                    title: "Loading..."
                }
                setTabs(prev => [...prev, newTab])
                setActiveTabId(newId)
                setUrlInput(url === "about:home" ? "" : url)
            }
        }

        if (initialUrl) {
            handleOpenUrl(initialUrl)
        }

        const onOpenUrlEvent = (e: any) => {
            if (e.detail?.url) {
                handleOpenUrl(e.detail.url)
            }
        }

        window.addEventListener("browser:open-url", onOpenUrlEvent)
        return () => window.removeEventListener("browser:open-url", onOpenUrlEvent)
    }, [initialUrl])

    const addTab = () => {
        const newId = Math.random().toString(36).substr(2, 9)
        const newTab: Tab = {
            id: newId,
            url: "about:home",
            title: "New Tab",
            isHome: true
        }
        setTabs(prev => [...prev, newTab])
        setActiveTabId(newId)
        setUrlInput("")
    }

    const closeTab = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (tabs.length === 1) {
            setTabs([{ id: "1", url: "about:home", title: "New Tab", isHome: true }])
            setActiveTabId("1")
            return
        }
        const newTabs = tabs.filter(t => t.id !== id)
        setTabs(newTabs)
        if (activeTabId === id) {
            setActiveTabId(newTabs[newTabs.length - 1].id)
        }
    }

    const navigate = (url: string) => {
        let targetUrl = url
        if (!url.startsWith("http") && !url.startsWith("about:")) {
            targetUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`
        }

        setTabs(prev => prev.map(t =>
            t.id === activeTabId ? { ...t, url: targetUrl, title: targetUrl, isHome: targetUrl === "about:home" } : t
        ))
        setUrlInput(targetUrl === "about:home" ? "" : targetUrl)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!urlInput) return
        navigate(urlInput)
    }

    // Attempt to detect if a site can be framed (this is just for UI hint, actual blocking is by browser)
    const isFrameable = (url: string) => {
        if (url.startsWith("about:")) return true
        const blocks = ["github.com", "gitlab.com", "instagram.com", "facebook.com", "twitter.com", "wa.me", "whatsapp.com"]
        return !blocks.some(domain => url.includes(domain))
    }

    return (
        <div className="h-full bg-[var(--background)] flex flex-col font-sans select-none overflow-hidden">
            {/* Tab Bar */}
            <div className="h-10 bg-[var(--os-surface)] border-b border-[var(--os-border)] flex items-end px-2 gap-1 overflow-x-auto no-scrollbar shrink-0">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        onClick={() => {
                            setActiveTabId(tab.id)
                            setUrlInput(tab.url === "about:home" ? "" : tab.url)
                        }}
                        className={cn(
                            "group flex items-center gap-2 px-3 py-1.5 min-w-[120px] max-w-[200px] rounded-t-lg text-xs font-medium cursor-pointer transition-all border-x border-t border-transparent",
                            activeTabId === tab.id
                                ? "bg-[var(--background)] border-[var(--os-border)] text-[var(--foreground)]"
                                : "text-[var(--muted-foreground)] hover:bg-white/5"
                        )}
                    >
                        <Globe size={12} className="shrink-0" />
                        <span className="truncate flex-1">{tab.isHome ? "Home" : tab.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        <button
                            onClick={(e) => closeTab(tab.id, e)}
                            className="p-0.5 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={10} />
                        </button>
                    </div>
                ))}
                <button
                    onClick={addTab}
                    className="p-2 mb-1 rounded-md text-[var(--muted-foreground)] hover:bg-white/10 transition-colors"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* Browser Toolbar */}
            <div className="h-12 bg-[var(--os-surface)] border-b border-[var(--os-border)] flex items-center gap-2 px-3 shrink-0">
                <div className="flex items-center gap-1 shrink-0">
                    <button className="p-1.5 hover:bg-white/10 rounded-md text-[var(--muted-foreground)] transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded-md text-[var(--muted-foreground)] transition-colors">
                        <ChevronRight size={18} />
                    </button>
                    <button onClick={() => navigate(activeTab.url)} className="p-1.5 hover:bg-white/10 rounded-md text-[var(--muted-foreground)] transition-colors">
                        <RotateCcw size={18} />
                    </button>
                    <button onClick={() => navigate("about:home")} className="p-1.5 hover:bg-white/10 rounded-md text-[var(--muted-foreground)] transition-colors">
                        <Home size={18} />
                    </button>
                </div>

                <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto flex items-center relative">
                    <div className="absolute left-3 text-[var(--muted-foreground)]">
                        <Globe size={14} />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Search or enter URL..."
                        className="w-full h-8 bg-black/40 border border-[var(--os-border)] rounded-full pl-9 pr-4 text-xs font-medium outline-none focus:border-primary/50 transition-colors text-[var(--foreground)]"
                    />
                    <button type="submit" className="absolute right-3 text-[var(--muted-foreground)] hover:text-primary transition-colors">
                        <Search size={14} />
                    </button>
                </form>

                <div className="w-24 shrink-0" />
            </div>

            {/* Browser Content */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab.isHome ? (
                    <div className="h-full overflow-auto bg-[var(--background)]">
                        <div className="max-w-4xl mx-auto pt-20 px-6 flex flex-col items-center">
                            <div className="mb-12 flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                                    <Globe size={40} />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] mt-2">Web Browser</h1>
                                <p className="text-[var(--muted-foreground)] text-sm font-medium">Fast, Secure, and Integrated</p>
                            </div>

                            <div className="w-full max-w-lg mb-16">
                                <form onSubmit={handleSearch} className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type="text"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        placeholder="Search the web..."
                                        className="w-full h-14 bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl pl-12 pr-4 text-sm font-medium outline-none focus:border-primary/50 focus:shadow-2xl focus:shadow-primary/5 transition-all text-[var(--foreground)]"
                                    />
                                </form>
                            </div>

                            <div className="w-full">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)]">Quick Links</h2>
                                    <div className="h-[1px] flex-1 translate-y-[1px] bg-[var(--os-border)] ml-4" />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: "GitHub", url: "https://github.com/sddion", icon: <Github size={24} className="text-white" />, color: "bg-zinc-800" },
                                        { label: "GitLab", url: "https://gitlab.com/0xd3ds3c", icon: <Gitlab size={24} className="text-orange-500" />, color: "bg-orange-500/10" },
                                        { label: "WhatsApp", url: "https://wa.me/918822972607", icon: <MessageCircle size={24} className="text-green-500" />, color: "bg-green-500/10" },
                                        { label: "Instagram", url: "https://instagram.com/wordswires", icon: <Instagram size={24} className="text-pink-500" />, color: "bg-pink-500/10" },
                                    ].map((link) => (
                                        <button
                                            key={link.label}
                                            onClick={() => navigate(link.url)}
                                            className="group flex flex-col items-center p-6 bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl hover:border-primary/30 hover:bg-[var(--os-surface-hover)] transition-all"
                                        >
                                            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xl", link.color)}>
                                                {link.icon}
                                            </div>
                                            <span className="text-xs font-bold text-[var(--foreground)]">{link.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        {!isFrameable(activeTab.url) && (
                            <div className="bg-red-500/10 border-b border-red-500/20 p-4 flex items-center justify-between gap-4 shrink-0">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="text-red-500" size={20} />
                                    <div>
                                        <p className="text-sm font-bold text-red-500">Embedding Restricted</p>
                                        <p className="text-xs text-[var(--muted-foreground)]">This site blocks internal viewing for security reasons.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.open(activeTab.url, "_blank")}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-red-500/20 hover:opacity-90 transition-opacity flex items-center gap-2"
                                >
                                    <ExternalLink size={14} />
                                    Open Externally
                                </button>
                            </div>
                        )}
                        <iframe
                            src={activeTab.url}
                            className="w-full h-full border-none bg-white"
                            title="Browser Content"
                            onLoad={(e) => {
                                // We can't actually read the title from external iframes due to CORS,
                                // but we can try to update UI state if it were internal.
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

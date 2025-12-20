"use client"

import React, { useState, useEffect, useRef } from "react"
import { Search, Globe, ChevronLeft, ChevronRight, RotateCcw, Home, ExternalLink, Github, Gitlab, Instagram, MessageCircle, Star, Plus, X, ShieldAlert, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { BlogLanding } from "./BlogLanding"
import { BlogPostViewer } from "./BlogPostViewer"

interface Tab {
    id: string
    url: string
    title: string
    favicon?: string
    isHome?: boolean
    history: string[]
    historyIndex: number
}

interface Bookmark {
    url: string
    title: string
    favicon?: string
}

interface HistoryItem {
    url: string
    title: string
    timestamp: number
}

export function BrowserApp({ initialUrl }: { initialUrl?: string }) {
    const [tabs, setTabs] = useState<Tab[]>([
        { id: "1", url: "about:home", title: "New Tab", isHome: true, history: ["about:home"], historyIndex: 0 }
    ])
    const [activeTabId, setActiveTabId] = useState("1")
    const [urlInput, setUrlInput] = useState("")
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [globalHistory, setGlobalHistory] = useState<HistoryItem[]>([])
    const [showHistoryMenu, setShowHistoryMenu] = useState(false)
    const [showBookmarksMenu, setShowBookmarksMenu] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Load persistent data
    useEffect(() => {
        const savedBookmarks = localStorage.getItem("sanjuos_bookmarks")
        const savedHistory = localStorage.getItem("sanjuos_history")
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks))
        if (savedHistory) setGlobalHistory(JSON.parse(savedHistory))
    }, [])

    // Sync persistent data
    useEffect(() => {
        localStorage.setItem("sanjuos_bookmarks", JSON.stringify(bookmarks))
    }, [bookmarks])

    useEffect(() => {
        localStorage.setItem("sanjuos_history", JSON.stringify(globalHistory))
    }, [globalHistory])

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

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
                    title: "Loading...",
                    history: [url],
                    historyIndex: 0
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

    const addTab = (url: string = "about:home") => {
        const newId = Math.random().toString(36).substr(2, 9)
        const isHome = url === "about:home"
        const newTab: Tab = {
            id: newId,
            url: url,
            title: isHome ? "New Tab" : url,
            isHome: isHome,
            history: [url],
            historyIndex: 0
        }
        setTabs(prev => [...prev, newTab])
        setActiveTabId(newId)
        setUrlInput(isHome ? "" : url)
    }

    const closeTab = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (tabs.length === 1) {
            setTabs([{ id: "1", url: "about:home", title: "New Tab", isHome: true, history: ["about:home"], historyIndex: 0 }])
            setActiveTabId("1")
            return
        }
        const newTabs = tabs.filter(t => t.id !== id)
        setTabs(newTabs)
        if (activeTabId === id) {
            setActiveTabId(newTabs[newTabs.length - 1].id)
        }
    }

    const navigate = (url: string, updateHistory: boolean = true) => {
        let targetUrl = url
        if (!url.startsWith("http") && !url.startsWith("about:")) {
            targetUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`
        }

        setTabs(prev => prev.map(t => {
            if (t.id === activeTabId) {
                const newHistory = updateHistory
                    ? [...t.history.slice(0, t.historyIndex + 1), targetUrl]
                    : t.history
                const newIndex = updateHistory ? newHistory.length - 1 : t.historyIndex

                return {
                    ...t,
                    url: targetUrl,
                    title: targetUrl,
                    isHome: targetUrl === "about:home",
                    history: newHistory,
                    historyIndex: newIndex
                }
            }
            return t
        }))

        // Add to global history
        if (targetUrl !== "about:home") {
            setGlobalHistory(prev => [
                { url: targetUrl, title: targetUrl, timestamp: Date.now() },
                ...prev.slice(0, 99) // Keep last 100
            ])
        }

        setUrlInput(targetUrl === "about:home" ? "" : targetUrl)
    }

    const goBack = () => {
        if (activeTab.historyIndex > 0) {
            const prevUrl = activeTab.history[activeTab.historyIndex - 1]
            setTabs(prev => prev.map(t =>
                t.id === activeTabId ? { ...t, url: prevUrl, historyIndex: t.historyIndex - 1, isHome: prevUrl === "about:home" } : t
            ))
            setUrlInput(prevUrl === "about:home" ? "" : prevUrl)
        }
    }

    const goForward = () => {
        if (activeTab.historyIndex < activeTab.history.length - 1) {
            const nextUrl = activeTab.history[activeTab.historyIndex + 1]
            setTabs(prev => prev.map(t =>
                t.id === activeTabId ? { ...t, url: nextUrl, historyIndex: t.historyIndex + 1, isHome: nextUrl === "about:home" } : t
            ))
            setUrlInput(nextUrl === "about:home" ? "" : nextUrl)
        }
    }

    const toggleBookmark = () => {
        if (activeTab.isHome) return
        const exists = bookmarks.find(b => b.url === activeTab.url)
        if (exists) {
            setBookmarks(prev => prev.filter(b => b.url !== activeTab.url))
        } else {
            setBookmarks(prev => [...prev, { url: activeTab.url, title: activeTab.title }])
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!urlInput) return
        navigate(urlInput)
    }

    // Attempt to detect if a site can be framed (this is just for UI hint, actual blocking is by browser)
    const isFrameable = (url: string) => {
        if (url.startsWith("about:") || url.startsWith("sanjuos:")) return true
        const blocks = ["github.com", "gitlab.com", "instagram.com", "facebook.com", "twitter.com", "wa.me", "whatsapp.com"]
        return !blocks.some(domain => url.includes(domain))
    }

    // Check if URL is internal SanjuOS route
    const isSanjuOSRoute = (url: string) => url.startsWith("sanjuos://")

    // Parse SanjuOS route
    const parseSanjuOSRoute = (url: string) => {
        const path = url.replace("sanjuos://", "")
        const parts = path.split("/")
        return { route: parts[0], param: parts[1] }
    }

    // Render internal SanjuOS content
    const renderSanjuOSContent = (url: string) => {
        const { route, param } = parseSanjuOSRoute(url)
        
        if (route === "blog" && param) {
            return <BlogPostViewer postId={param} onNavigate={navigate} />
        }
        if (route === "blog") {
            return <BlogLanding onNavigate={navigate} />
        }
        
        // Unknown route - show error
        return (
            <div className="h-full flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <Globe size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Page Not Found</h2>
                    <p className="text-[var(--muted-foreground)] mb-4">The page {url} doesn't exist.</p>
                    <button onClick={() => navigate("about:home")} className="px-6 py-2 bg-primary text-white rounded-lg font-bold">Go Home</button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full bg-[var(--background)] flex flex-col font-sans select-none overflow-hidden">
            {/* Tab Bar - Hidden on mobile */}
            {!isMobile && (
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
                        onClick={() => addTab()}
                        className="p-2 mb-1 rounded-md text-[var(--muted-foreground)] hover:bg-white/10 transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            )}

            {/* Browser Toolbar */}
            <div className={cn(
                "bg-[var(--os-surface)] border-b border-[var(--os-border)] flex items-center gap-2 shrink-0 relative",
                isMobile ? "h-16 px-4" : "h-12 px-3"
            )}>
                {!isMobile && (
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            disabled={activeTab.historyIndex === 0}
                            onClick={goBack}
                            className="p-1.5 hover:bg-white/10 rounded-md text-[var(--muted-foreground)] disabled:opacity-20 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            disabled={activeTab.historyIndex === activeTab.history.length - 1}
                            onClick={goForward}
                            className="p-1.5 hover:bg-white/10 rounded-md text-[var(--muted-foreground)] disabled:opacity-20 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button onClick={() => navigate(activeTab.url, false)} className="p-1.5 hover:bg-white/10 rounded-md text-[var(--muted-foreground)] transition-colors">
                            <RotateCcw size={18} />
                        </button>
                        <button onClick={() => navigate("about:home")} className="p-1.5 hover:bg-white/10 rounded-md text-[var(--muted-foreground)] transition-colors">
                            <Home size={18} />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSearch} className="flex-1 flex items-center relative">
                    <div className="absolute left-3 text-[var(--muted-foreground)]">
                        {isMobile ? <Globe size={16} className="text-primary/60" /> : <Globe size={14} />}
                    </div>
                    <input
                        ref={inputRef}
                        type="search"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={isMobile ? "Search repository..." : "Search or enter URL..."}
                        className={cn(
                            "w-full bg-black/40 border border-[var(--os-border)] outline-none focus:border-primary/50 transition-colors text-[var(--foreground)]",
                            isMobile ? "h-10 pl-10 pr-10 rounded-xl text-sm font-bold" : "h-8 pl-9 pr-10 rounded-full text-xs font-medium"
                        )}
                    />
                    <button
                        type="button"
                        onClick={toggleBookmark}
                        className={cn(
                            "absolute right-3 transition-colors",
                            bookmarks.some(b => b.url === activeTab.url) ? "text-yellow-500" : "text-[var(--muted-foreground)] hover:text-white"
                        )}
                    >
                        {bookmarks.some(b => b.url === activeTab.url) ? <Star size={16} className="fill-yellow-500" /> : <Star size={16} />}
                    </button>
                </form>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => {
                            setShowHistoryMenu(!showHistoryMenu)
                            setShowBookmarksMenu(false)
                        }}
                        className={cn("p-1.5 hover:bg-white/10 rounded-md transition-colors", showHistoryMenu ? "bg-white/10 text-primary" : "text-[var(--muted-foreground)]")}
                    >
                        <RotateCcw size={isMobile ? 22 : 18} />
                    </button>
                    {!isMobile && (
                        <button
                            onClick={() => {
                                setShowBookmarksMenu(!showBookmarksMenu)
                                setShowHistoryMenu(false)
                            }}
                            className={cn("p-1.5 hover:bg-white/10 rounded-md transition-colors", showBookmarksMenu ? "bg-white/10 text-primary" : "text-[var(--muted-foreground)]")}
                        >
                            <Star size={18} />
                        </button>
                    )}
                </div>

                {/* Overlays */}
                {showHistoryMenu && (
                    <div className="absolute top-full right-4 mt-2 w-72 bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl shadow-2xl z-[200] p-2 overflow-hidden flex flex-col max-h-[400px]">
                        <div className="p-2 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Local History</div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {globalHistory.length === 0 ? (
                                <div className="p-8 text-center text-xs text-white/20 italic">No history yet</div>
                            ) : (
                                globalHistory.map((h, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            navigate(h.url)
                                            setShowHistoryMenu(false)
                                        }}
                                        className="w-full text-left p-2 hover:bg-white/5 rounded-lg transition-colors group flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                            <Globe size={14} className="text-[var(--muted-foreground)]" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold truncate text-[var(--foreground)]">{h.url}</div>
                                            <div className="text-[9px] text-[var(--muted-foreground)]">{format(h.timestamp, "MMM d, HH:mm")}</div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {showBookmarksMenu && (
                    <div className="absolute top-full right-4 mt-2 w-72 bg-[var(--os-surface)] border border-[var(--os-border)] rounded-xl shadow-2xl z-[200] p-2 overflow-hidden flex flex-col max-h-[400px]">
                        <div className="p-2 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Bookmarks</div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {bookmarks.length === 0 ? (
                                <div className="p-8 text-center text-xs text-white/20 italic">No bookmarks yet</div>
                            ) : (
                                bookmarks.map((b, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            navigate(b.url)
                                            setShowBookmarksMenu(false)
                                        }}
                                        className="w-full text-left p-2 hover:bg-white/5 rounded-lg transition-colors group flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold truncate text-[var(--foreground)]">{b.title}</div>
                                            <div className="text-[9px] text-[var(--muted-foreground)] truncate">{b.url}</div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Bookmarks Bar */}
            {!isMobile && bookmarks.length > 0 && (
                <div className="h-8 bg-[var(--os-surface)] border-b border-[var(--os-border)] flex items-center px-4 gap-4 shrink-0 overflow-x-auto no-scrollbar">
                    {bookmarks.slice(0, 8).map((b, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(b.url)}
                            className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap"
                        >
                            <Globe size={12} className="text-primary/60" />
                            {b.title.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                        </button>
                    ))}
                </div>
            )}

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
                                        { label: "Blog", url: "sanjuos://blog", icon: <BookOpen size={24} className="text-primary" />, color: "bg-primary/10" },
                                        { label: "GitHub", url: "https://github.com/sddion", icon: <Github size={24} className="text-white" />, color: "bg-zinc-800" },
                                        { label: "GitLab", url: "https://gitlab.com/0xd3ds3c", icon: <Gitlab size={24} className="text-orange-500" />, color: "bg-orange-500/10" },
                                        { label: "WhatsApp", url: "https://wa.me/918822972607", icon: <MessageCircle size={24} className="text-green-500" />, color: "bg-green-500/10" },
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
                ) : isSanjuOSRoute(activeTab.url) ? (
                    <div className="h-full overflow-auto">
                        {renderSanjuOSContent(activeTab.url)}
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

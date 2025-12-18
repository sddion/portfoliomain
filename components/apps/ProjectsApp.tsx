"use client"

import React, { useState } from "react"
import { projects, categories } from "@/lib/projects-data"
import { Folder, FileCode, Search, Server, Cpu, Globe, Shield, Star, GitBranch } from "lucide-react"
import { GeoshotApp } from "@/components/apps/GeoshotApp"

export function ProjectsApp() {
    const [viewMode, setViewMode] = useState<'home' | 'list' | 'detail'>('home')
    const [activeCategory, setActiveCategory] = useState("all")
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(false)

    // Detect Mobile
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Handle Deep Linking / Back Navigation for Mobile
    React.useEffect(() => {
        if (!isMobile) return

        const handlePopState = (event: PopStateEvent) => {
            const state = event.state
            if (state?.projectId) {
                // In Detail View
                setSelectedProjectId(state.projectId)
                setViewMode('detail')
            } else if (state?.category) {
                // In List View
                setActiveCategory(state.category)
                setViewMode('list')
                setSelectedProjectId(null)
            } else {
                // Root
                setViewMode('home')
                setActiveCategory('all')
                setSelectedProjectId(null)
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [isMobile])

    const navigateToCategory = (catId: string) => {
        setActiveCategory(catId)
        if (isMobile) {
            setViewMode('list')
            window.history.pushState({ appId: 'projects', category: catId }, "", `#projects/${catId}`)
        }
    }

    const navigateToProject = (projId: string) => {
        setSelectedProjectId(projId)
        if (isMobile) {
            setViewMode('detail')
            window.history.pushState({ appId: 'projects', category: activeCategory, projectId: projId }, "", `#projects/${activeCategory}/${projId}`)
        }
    }

    const filteredProjects = activeCategory === "all"
        ? projects
        : projects.filter((p) => p.category === activeCategory)

    const selectedProject = projects.find(p => p.id === selectedProjectId)

    // --- MOBILE RENDERERS ---

    const renderMobileHome = () => (
        <div className="p-4 grid grid-cols-3 gap-4">
            <button
                onClick={() => navigateToCategory('all')}
                className="flex flex-col items-center gap-2 p-4 bg-[var(--os-surface)] rounded-xl border border-[var(--os-border)] active:scale-95 transition-transform"
            >
                <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-full flex items-center justify-center text-[var(--primary)]">
                    <Star size={24} />
                </div>
                <span className="text-xs text-[var(--foreground)] opacity-70 font-medium">All Files</span>
            </button>
            {categories.filter(c => c.id !== 'all').map(cat => (
                <button
                    key={cat.id}
                    onClick={() => navigateToCategory(cat.id)}
                    className="flex flex-col items-center gap-2 p-4 bg-[var(--os-surface)] rounded-xl border border-[var(--os-border)] active:scale-95 transition-transform"
                >
                    <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center text-[var(--muted-foreground)]">
                        <Folder size={24} fill="currentColor" className="text-yellow-500/80" />
                    </div>
                    <span className="text-xs text-[var(--foreground)] opacity-70 font-medium truncate w-full text-center">{cat.label}</span>
                </button>
            ))}
        </div>
    )

    const renderMobileList = () => (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-4 text-sm text-[var(--muted-foreground)]">
                <Folder size={16} />
                <span>/</span>
                <span className="text-[var(--foreground)] font-bold capitalize">{activeCategory}</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {filteredProjects.map(p => (
                    <button
                        key={p.id}
                        onClick={() => navigateToProject(p.id)}
                        className="flex items-center gap-4 p-3 bg-[var(--os-surface)] rounded-lg border border-[var(--os-border)] active:bg-[var(--os-surface-hover)] transition-colors text-left"
                    >
                        <div className="w-10 h-10 bg-black/20 rounded flex items-center justify-center text-[var(--muted-foreground)]">
                            {getIconForCategory(p.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-[var(--foreground)] truncate">{p.title}</h4>
                            <p className="text-xs text-[var(--muted-foreground)] truncate">{p.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )

    const renderMobileDetail = () => {
        if (!selectedProject) return null

        // Special render for Geoshot
        if (selectedProject.id === 'geoshot') {
            return (
                <div className="h-full bg-[var(--background)] border-l border-[var(--os-border)]">
                    <GeoshotApp />
                </div>
            )
        }

        return (
            <div className="p-6 overflow-y-auto h-full">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-[var(--os-surface)] rounded-2xl flex items-center justify-center text-[var(--muted-foreground)] shadow-xl mb-4">
                        {getIconForCategory(selectedProject.category)}
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)] text-center mb-1">{selectedProject.title}</h2>
                    <span className="px-3 py-1 bg-[var(--os-surface)] rounded-full text-xs text-[var(--muted-foreground)] capitalize">{selectedProject.category}</span>
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--os-surface)] p-4 rounded-xl border border-[var(--os-border)]">
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest mb-2">Description</h3>
                        <p className="text-sm text-[var(--foreground)] opacity-80 leading-relaxed">{selectedProject.description}</p>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest mb-3">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedProject.techStack.map(t => (
                                <span key={t} className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/50 px-3 py-1.5 rounded-md">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {selectedProject.githubUrl && (
                            <a href={selectedProject.githubUrl} target="_blank" className="flex items-center justify-center gap-2 bg-[var(--os-surface-hover)] text-[var(--foreground)] py-3 rounded-lg font-medium hover:opacity-80 transition-opacity">
                                <GitBranch size={18} /> Code
                            </a>
                        )}
                        {selectedProject.liveUrl && (
                            <a href={selectedProject.liveUrl} target="_blank" className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-lg font-medium hover:opacity-80 transition-opacity shadow-lg shadow-[var(--primary)]/20">
                                <Globe size={18} /> Demo
                            </a>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (isMobile) {
        return (
            <div className="h-full bg-black/40 flex flex-col font-sans backdrop-blur-sm">
                {/* Mobile Header (Breadcrumb-ish) */}
                {viewMode !== 'home' && (
                    <div className="h-14 border-b border-[var(--os-border)] flex items-center px-4 bg-[var(--os-surface)]">
                        {/* We rely on native back button, but visual cue is helpful or just current title */}
                        <span className="font-bold text-lg text-[var(--foreground)]">
                            {viewMode === 'list' ? 'Projects' : 'Details'}
                        </span>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {viewMode === 'home' && renderMobileHome()}
                    {viewMode === 'list' && renderMobileList()}
                    {viewMode === 'detail' && renderMobileDetail()}
                </div>
            </div>
        )
    }

    // --- DESKTOP RENDER ---
    return (
        <div className="flex h-full text-[var(--foreground)] font-sans">
            {/* Sidebar */}
            <div className="w-48 border-r border-[var(--os-border)] bg-[var(--os-surface)] flex flex-col pt-2">
                <div className="px-4 py-2 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Locations</div>
                <button
                    onClick={() => setActiveCategory("all")}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-white/10 ${activeCategory === 'all' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : ''}`}
                >
                    <Star size={14} className={activeCategory === 'all' ? "text-[var(--primary)]" : "text-yellow-500"} />
                    All Projects
                </button>
                {categories.filter(c => c.id !== 'all').map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-white/10 ${activeCategory === cat.id ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : ''}`}
                    >
                        <Folder size={14} className="text-[var(--primary)]" fill="currentColor" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-sm">
                {/* Toolbar */}
                <div className="h-10 border-b border-[var(--os-border)] bg-[var(--os-surface)] flex items-center px-4 gap-2">
                    <div className="flex items-center gap-1 opacity-50">
                        <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                        <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                    </div>
                    <div className="flex-1 bg-black/20 rounded px-2 py-0.5 text-xs text-[var(--muted-foreground)] flex items-center gap-2">
                        <Search size={12} />
                        <span>/home/guest/projects/{activeCategory}</span>
                    </div>
                </div>

                {/* Project Grid */}
                <div className="flex-1 overflow-auto p-4 flex flex-col md:flex-row gap-4">
                    {/* List */}
                    <div className="flex-1 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] grid-rows-[min-content] gap-4 content-start">
                        {filteredProjects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => setSelectedProjectId(project.id)}
                                className={`group flex flex-col items-center gap-2 p-2 rounded hover:bg-[var(--os-surface-hover)] transition-all ${selectedProjectId === project.id ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/50' : 'border border-transparent'}`}
                            >
                                <div className="w-12 h-12 bg-[var(--os-surface)] rounded flex items-center justify-center text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:scale-110 transition-all shadow-lg">
                                    {getIconForCategory(project.category)}
                                </div>
                                <span className="text-xs text-center line-clamp-2 w-full leading-tight font-medium">{project.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Details Pane (Preview) */}
                    {selectedProject && (
                        <>
                            {selectedProject.id === 'geoshot' ? (
                                <div className="flex-1 border-l border-[var(--os-border)] bg-[var(--os-surface)] overflow-hidden">
                                    <GeoshotApp />
                                </div>
                            ) : (
                                <div className="w-64 border-l border-[var(--os-border)] bg-[var(--os-surface)] p-4 overflow-y-auto">
                                    <div className="flex flex-col items-center mb-4">
                                        <div className="w-20 h-20 bg-[var(--os-surface-hover)] rounded-lg flex items-center justify-center text-4xl mb-2 text-[var(--muted-foreground)]">
                                            {getIconForCategory(selectedProject.category)}
                                        </div>
                                        <h2 className="text-lg font-bold text-center text-[var(--foreground)]">{selectedProject.title}</h2>
                                        <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest">{selectedProject.category}</span>
                                    </div>

                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <h3 className="font-bold text-[var(--muted-foreground)] text-xs mb-1 uppercase">About</h3>
                                            <p className="text-[var(--foreground)] opacity-80 leading-relaxed">{selectedProject.description}</p>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-[var(--muted-foreground)] text-xs mb-1 uppercase">Stack</h3>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedProject.techStack.map(t => (
                                                    <span key={t} className="text-[10px] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded text-[var(--primary)] border border-[var(--primary)]/30 font-bold">{t}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 pt-2">
                                            {selectedProject.githubUrl && (
                                                <a href={selectedProject.githubUrl} target="_blank" className="flex items-center gap-2 bg-[var(--os-surface-hover)] hover:opacity-80 px-3 py-2 rounded text-[var(--foreground)] transition-opacity">
                                                    <GitBranch size={14} /> Source Code
                                                </a>
                                            )}
                                            {selectedProject.liveUrl && (
                                                <a href={selectedProject.liveUrl} target="_blank" className="flex items-center gap-2 bg-[var(--primary)] hover:opacity-80 text-[var(--primary-foreground)] px-3 py-2 rounded transition-opacity">
                                                    <Globe size={14} /> Live Demo
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function getIconForCategory(category: string) {
    switch (category) {
        case 'web': return <Globe size={24} />;
        case 'mobile': return <Cpu size={24} />;
        case 'embedded': return <Server size={24} />;
        case 'security': return <Shield size={24} />;
        default: return <FileCode size={24} />;
    }
}

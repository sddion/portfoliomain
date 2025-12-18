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
                className="flex flex-col items-center gap-2 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 active:scale-95 transition-transform"
            >
                <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400">
                    <Star size={24} />
                </div>
                <span className="text-xs text-zinc-300 font-medium">All Files</span>
            </button>
            {categories.filter(c => c.id !== 'all').map(cat => (
                <button
                    key={cat.id}
                    onClick={() => navigateToCategory(cat.id)}
                    className="flex flex-col items-center gap-2 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 active:scale-95 transition-transform"
                >
                    <div className="w-12 h-12 bg-zinc-700/50 rounded-full flex items-center justify-center text-zinc-400">
                        <Folder size={24} fill="currentColor" className="text-yellow-500/80" />
                    </div>
                    <span className="text-xs text-zinc-300 font-medium truncate w-full text-center">{cat.label}</span>
                </button>
            ))}
        </div>
    )

    const renderMobileList = () => (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-4 text-sm text-zinc-500">
                <Folder size={16} />
                <span>/</span>
                <span className="text-zinc-300 font-bold capitalize">{activeCategory}</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {filteredProjects.map(p => (
                    <button
                        key={p.id}
                        onClick={() => navigateToProject(p.id)}
                        className="flex items-center gap-4 p-3 bg-zinc-800/80 rounded-lg border border-zinc-700/50 active:bg-zinc-700 transition-colors text-left"
                    >
                        <div className="w-10 h-10 bg-zinc-900 rounded flex items-center justify-center text-zinc-400">
                            {getIconForCategory(p.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-zinc-200 truncate">{p.title}</h4>
                            <p className="text-xs text-zinc-500 truncate">{p.description}</p>
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
                <div className="h-full bg-zinc-900 border-l border-zinc-700">
                    <GeoshotApp />
                </div>
            )
        }

        return (
            <div className="p-6 overflow-y-auto h-full">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 shadow-xl mb-4">
                        {getIconForCategory(selectedProject.category)}
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center mb-1">{selectedProject.title}</h2>
                    <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400 capitalize">{selectedProject.category}</span>
                </div>

                <div className="space-y-6">
                    <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/50">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Description</h3>
                        <p className="text-sm text-zinc-300 leading-relaxed">{selectedProject.description}</p>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedProject.techStack.map(t => (
                                <span key={t} className="text-xs bg-blue-900/20 text-blue-300 border border-blue-900/50 px-3 py-1.5 rounded-md">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {selectedProject.githubUrl && (
                            <a href={selectedProject.githubUrl} target="_blank" className="flex items-center justify-center gap-2 bg-zinc-800 text-white py-3 rounded-lg font-medium hover:bg-zinc-700 transition-colors">
                                <GitBranch size={18} /> Code
                            </a>
                        )}
                        {selectedProject.liveUrl && (
                            <a href={selectedProject.liveUrl} target="_blank" className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">
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
            <div className="h-full bg-black/80 flex flex-col font-sans">
                {/* Mobile Header (Breadcrumb-ish) */}
                {viewMode !== 'home' && (
                    <div className="h-14 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50">
                        {/* We rely on native back button, but visual cue is helpful or just current title */}
                        <span className="font-bold text-lg text-white">
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
        <div className="flex h-full text-zinc-300 font-sans">
            {/* Sidebar */}
            <div className="w-48 border-r border-zinc-700 bg-zinc-900/50 flex flex-col pt-2">
                <div className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Locations</div>
                <button
                    onClick={() => setActiveCategory("all")}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-white/10 ${activeCategory === 'all' ? 'bg-blue-600/20 text-blue-400' : ''}`}
                >
                    <Star size={14} className={activeCategory === 'all' ? "text-blue-400" : "text-yellow-500"} />
                    All Projects
                </button>
                {categories.filter(c => c.id !== 'all').map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-white/10 ${activeCategory === cat.id ? 'bg-blue-600/20 text-blue-400' : ''}`}
                    >
                        <Folder size={14} className="text-blue-400fill" fill="currentColor" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-black/60">
                {/* Toolbar */}
                <div className="h-10 border-b border-zinc-700 bg-zinc-800 flex items-center px-4 gap-2">
                    <div className="flex items-center gap-1 opacity-50">
                        <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                        <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                    </div>
                    <div className="flex-1 bg-zinc-900 rounded px-2 py-0.5 text-xs text-zinc-400 flex items-center gap-2">
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
                                className={`group flex flex-col items-center gap-2 p-2 rounded hover:bg-white/10 transition-colors ${selectedProjectId === project.id ? 'bg-blue-600/40 border border-blue-500/50' : 'border border-transparent'}`}
                            >
                                <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all shadow-lg">
                                    {getIconForCategory(project.category)}
                                </div>
                                <span className="text-xs text-center line-clamp-2 w-full leading-tight">{project.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Details Pane (Preview) */}
                    {selectedProject && (
                        <>
                            {selectedProject.id === 'geoshot' ? (
                                <div className="flex-1 border-l border-zinc-700 bg-zinc-900 overflow-hidden">
                                    <GeoshotApp />
                                </div>
                            ) : (
                                <div className="w-64 border-l border-zinc-700 bg-zinc-900/80 p-4 overflow-y-auto">
                                    <div className="flex flex-col items-center mb-4">
                                        <div className="w-20 h-20 bg-zinc-800 rounded-lg flex items-center justify-center text-4xl mb-2 text-zinc-400">
                                            {getIconForCategory(selectedProject.category)}
                                        </div>
                                        <h2 className="text-lg font-bold text-center text-white">{selectedProject.title}</h2>
                                        <span className="text-xs text-zinc-500 uppercase tracking-widest">{selectedProject.category}</span>
                                    </div>

                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <h3 className="font-bold text-zinc-400 text-xs mb-1 uppercase">About</h3>
                                            <p className="text-zinc-300 leading-relaxed">{selectedProject.description}</p>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-zinc-400 text-xs mb-1 uppercase">Stack</h3>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedProject.techStack.map(t => (
                                                    <span key={t} className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 border border-zinc-700">{t}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 pt-2">
                                            {selectedProject.githubUrl && (
                                                <a href={selectedProject.githubUrl} target="_blank" className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded text-zinc-200 transition-colors">
                                                    <GitBranch size={14} /> Source Code
                                                </a>
                                            )}
                                            {selectedProject.liveUrl && (
                                                <a href={selectedProject.liveUrl} target="_blank" className="flex items-center gap-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-900 px-3 py-2 rounded transition-colors">
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

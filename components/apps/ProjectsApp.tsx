"use client"

import React, { useState } from "react"
import { projects, categories } from "@/lib/projects-data"
import { Folder, FileCode, Search, Server, Cpu, Globe, Shield, Star, GitBranch } from "lucide-react"

export function ProjectsApp() {
    const [activeCategory, setActiveCategory] = useState("all")
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

    const filteredProjects = activeCategory === "all"
        ? projects
        : projects.filter((p) => p.category === activeCategory)

    const selectedProject = projects.find(p => p.id === selectedProjectId)

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

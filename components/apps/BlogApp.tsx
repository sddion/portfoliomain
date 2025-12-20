"use client"

import React, { useState } from "react"
import {
    Book,
    Calendar,
    User,
    Tag,
    ArrowLeft,
    Search,
    Info,
    AlertTriangle,
    CheckCircle2,
    Lightbulb,
    Terminal as TerminalIcon,
    ChevronRight,
    ArrowUpRight,
    Clock,
    Hash
} from "lucide-react"
import { blogPosts } from "@/data/blog"
import { AdUnit } from "@/components/os/AdUnit"
import { cn } from "@/lib/utils"

interface ContentBlock {
    type: 'markdown' | 'step' | 'note' | 'terminal' | 'prerequisites' | 'image'
    title?: string
    text?: string
    number?: number
    items?: string[]
    variant?: 'info' | 'warning' | 'tip' | 'danger'
    src?: string
    alt?: string
    code?: string
    language?: string
}

interface BlogPost {
    id: string
    title: string
    description: string
    author: string
    date: string
    category: string
    tags: string[]
    featuredImage: string
    content: string
    contentBlocks?: ContentBlock[]
}

export function BlogApp() {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    const POSTS_PER_PAGE = 6

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const posts: BlogPost[] = blogPosts as BlogPost[]
    const categories = Array.from(new Set(posts.map(p => p.category)))

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || post.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
    const paginatedPosts = filteredPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    )

    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedCategory])

    const renderPostContent = (post: BlogPost) => (
        <article className={cn(
            "max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700",
            isMobile ? 'pb-32' : 'pb-24'
        )}>
            {/* Post Header */}
            <header className="mb-16 text-center space-y-6">
                <div className="flex items-center justify-center gap-2 mb-4 animate-in zoom-in duration-500">
                    <span className="px-4 py-1.5 bg-teal-500 text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(45,212,191,0.3)]">
                        {post.category}
                    </span>
                </div>
                <h1 className={cn(
                    "font-black tracking-tighter leading-tight balance text-[var(--foreground)]",
                    isMobile ? 'text-4xl' : 'text-6xl'
                )}>
                    {post.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/30">
                    <span className="flex items-center gap-2 border-r border-white/10 pr-6">
                        <User size={14} className="text-teal-400" />
                        {post.author}
                    </span>
                    <span className="flex items-center gap-2 border-r border-white/10 pr-6">
                        <Calendar size={14} className="text-teal-400" />
                        {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock size={14} className="text-teal-400" />
                        8 MIN READ
                    </span>
                </div>
            </header>

            {/* Featured Image - Premium Presentation */}
            {post.featuredImage && (
                <div className="relative group mb-20 animate-in fade-in zoom-in duration-1000">
                    <div className="absolute inset-0 bg-teal-500/20 blur-[100px] opacity-20 -z-10 group-hover:opacity-40 transition-opacity" />
                    <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/10 shadow-2xl relative">
                        <div
                            className="h-full w-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                            style={{ backgroundImage: `url(${post.featuredImage})`, backgroundSize: '100% 100%' }}
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2.5rem]" />
                    </div>
                </div>
            )}

            {/* Post Body - Highly Structured Content Blocks */}
            <div className="space-y-16">
                {post.contentBlocks?.map((block, idx) => (
                    <div key={idx} className="relative group">
                        {renderBlockContent(block, isMobile)}
                    </div>
                ))}
            </div>

            {/* Tags Footer */}
            <div className="mt-24 pt-12 border-t border-white/5 flex flex-wrap gap-3">
                {post.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:border-teal-500/50 hover:text-teal-400 cursor-default transition-all">
                        <Hash size={12} />
                        {tag}
                    </span>
                ))}
            </div>
        </article>
    )

    const renderDesktop = () => (
        <div className="h-full flex flex-col bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden">
            {selectedPost ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-3xl shrink-0 z-50">
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="flex items-center gap-3 text-white/20 hover:text-teal-400 transition-all text-[10px] font-black tracking-widest uppercase group"
                        >
                            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                            Return to Intel
                        </button>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Sector 7 // Intelligence</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar-pro bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.05)_0%,_transparent_50%)]">
                        {renderPostContent(selectedPost)}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    {/* Professional Sidebar */}
                    <div className="w-80 border-r border-white/5 bg-[#080808] flex flex-col pt-12 shrink-0 z-40">
                        <div className="px-10 mb-12">
                            <h1 className="text-3xl font-black tracking-tighter mb-2">Intel<span className="text-teal-500">.</span></h1>
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Knowledge Base v2.4</p>
                        </div>

                        <div className="px-6 mb-12">
                            <h2 className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 pl-4">Category Index</h2>
                            <div className="space-y-1.5">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[10px] font-black tracking-widest transition-all uppercase group",
                                        !selectedCategory ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/30 hover:bg-white/[0.03] hover:text-white'
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <Book size={16} className={!selectedCategory ? 'text-black' : 'text-teal-500'} />
                                        All Systems
                                    </div>
                                    <ArrowUpRight size={14} className={cn("opacity-0 transition-all", !selectedCategory ? "opacity-100" : "group-hover:opacity-40")} />
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[10px] font-black tracking-widest transition-all uppercase group",
                                            selectedCategory === cat ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-white/30 hover:bg-white/[0.03] hover:text-white'
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Tag size={16} className={selectedCategory === cat ? 'text-black' : 'text-teal-500'} />
                                            {cat}
                                        </div>
                                        <ArrowUpRight size={14} className={cn("opacity-0 transition-all", selectedCategory === cat ? "opacity-100" : "group-hover:opacity-40")} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-10">
                            <h2 className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">Search Query</h2>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-teal-400 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="SCAN INTEL..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-[10px] font-black tracking-widest text-white placeholder-white/10 focus:outline-none focus:border-teal-500/50 focus:bg-white/[0.05] transition-all"
                                />
                            </div>
                        </div>

                        <div className="px-10 mt-auto pb-10">
                            <AdUnit slot="blog-sidebar" format="rectangle" className="opacity-40 hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Pro Post Grid */}
                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar-pro bg-[#050505]">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                            {paginatedPosts.map(post => (
                                <article
                                    key={post.id}
                                    onClick={() => setSelectedPost(post)}
                                    className="group bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-teal-500/30 hover:bg-[#0d0d0d] transition-all duration-500 cursor-pointer flex flex-col h-[520px] relative shadow-2xl"
                                >
                                    <div className="h-[240px] bg-black overflow-hidden shrink-0 relative">
                                        <div
                                            className="h-full w-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                            style={{ backgroundImage: `url(${post.featuredImage})`, backgroundSize: '100% 100%' }}
                                        />
                                        <div className="absolute top-6 left-6 flex gap-2">
                                            <span className="px-4 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[9px] font-black text-teal-400 uppercase tracking-widest shadow-2xl">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-10 flex flex-col flex-1 relative">
                                        <h3 className="text-2xl font-black text-white mb-4 leading-tight group-hover:text-teal-400 transition-colors line-clamp-2 tracking-tighter">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-white/40 leading-relaxed line-clamp-3 mb-10 flex-1 font-medium italic">
                                            "{post.description}"
                                        </p>
                                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-black text-black text-[10px]">
                                                    {post.author[0]}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">
                                                    {post.author}
                                                </span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:border-teal-500 group-hover:text-teal-400 transition-all">
                                                <ArrowUpRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pro Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-20">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-14 h-14 rounded-3xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-white/20 disabled:opacity-10 hover:border-teal-500/50 hover:text-teal-400 transition-all"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={cn(
                                                "w-14 h-14 rounded-3xl font-black text-[10px] transition-all border",
                                                currentPage === page ? 'bg-teal-500 border-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-[#0a0a0a] border-white/5 text-white/20 hover:border-white/20'
                                            )}
                                        >
                                            {String(page).padStart(2, '0')}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-14 h-14 rounded-3xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-white/20 disabled:opacity-10 hover:border-teal-500/50 hover:text-teal-400 transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )

    const renderMobile = () => (
        <div className="h-full bg-[#050505] text-[#e0e0e0] font-sans flex flex-col overflow-hidden relative">
            {selectedPost ? (
                <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                    <div className="h-16 flex items-center px-6 bg-black/80 backdrop-blur-2xl border-b border-white/5 shrink-0">
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 active:scale-95 transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="ml-5 flex-1 min-w-0">
                            <h2 className="text-xs font-black truncate text-white uppercase tracking-widest">{selectedPost.title}</h2>
                            <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.2em]">{selectedPost.category}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.05)_0%,_transparent_70%)]">
                        {renderPostContent(selectedPost)}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                    <div className="px-8 pt-10 pb-6 shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-4xl font-black tracking-tighter">Intel<span className="text-teal-500">.</span></h1>
                            <div className="w-12 h-12 rounded-[1.25rem] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-2xl">
                                <Book size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-8">Intelligence Unit 101</p>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-teal-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="SCANNING DATABASES..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-black tracking-[0.1em] text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/[0.05] transition-all"
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={cn(
                                        "shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                        !selectedCategory ? 'bg-teal-500 border-teal-500 text-black shadow-lg shadow-teal-500/30' : 'bg-white/5 border-white/10 text-white/30'
                                    )}
                                >
                                    ALL ASSETS
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                            selectedCategory === cat ? 'bg-teal-500 border-teal-500 text-black shadow-lg shadow-teal-500/30' : 'bg-white/5 border-white/10 text-white/30'
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-8 pt-4 no-scrollbar">
                        {paginatedPosts.map(post => (
                            <article
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                className="group bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden active:scale-[0.98] transition-all relative shadow-2xl"
                            >
                                <div className="aspect-[16/10] bg-black relative">
                                    <div
                                        className="h-full w-full bg-cover bg-center opacity-60 transition-transform duration-1000 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${post.featuredImage})`, backgroundSize: '100% 100%' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
                                    <div className="absolute top-6 left-6">
                                        <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-8 pb-10 -mt-10 relative">
                                    <h2 className="text-2xl font-black mb-4 leading-[1.1] text-white tracking-tighter group-hover:text-teal-400 transition-colors line-clamp-2">{post.title}</h2>
                                    <p className="text-white/40 text-xs line-clamp-2 leading-relaxed font-bold italic mb-6 opacity-80">"{post.description}"</p>
                                    <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-widest">
                                        <span className="flex items-center gap-2">
                                            <Calendar size={12} className="text-teal-500" />
                                            {new Date(post.date).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center gap-2 text-teal-400 border-b border-teal-400/30 pb-1">
                                            ACCESS INTEL <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {filteredPosts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                                <Search size={64} className="mb-6" />
                                <h3 className="text-lg font-black tracking-widest uppercase">No Results Found</h3>
                            </div>
                        )}

                        <div className="mt-8 border-t border-white/5 pt-8">
                            <AdUnit slot="blog-mobile" format="auto" className="opacity-20" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="h-full w-full overflow-hidden">
            {isMobile ? renderMobile() : renderDesktop()}

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar-pro::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-pro::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-pro::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar-pro::-webkit-scrollbar-thumb:hover { background: rgba(45,212,191,0.2); }
            `}</style>
        </div>
    )
}

function renderBlockContent(block: ContentBlock, isMobile: boolean) {
    switch (block.type) {
        case 'markdown':
            return (
                <div
                    className={cn(
                        "prose prose-invert max-w-none prose-p:mb-0 prose-p:text-white/70 prose-p:leading-[1.8] prose-p:text-lg",
                        isMobile ? 'prose-sm' : 'prose-lg'
                    )}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text || '') }}
                />
            )
        case 'step':
            return (
                <div className="group relative pl-16 py-10 pr-10 bg-white/[0.02] border border-white/5 rounded-[2rem] shadow-2xl transition-all duration-500 hover:border-teal-500/30 hover:bg-white/[0.04]">
                    <div className="absolute top-10 left-6 w-8 h-8 rounded-full bg-teal-500 text-black flex items-center justify-center font-black text-sm shadow-[0_0_20px_rgba(45,212,191,0.4)]">
                        {block.number}
                    </div>
                    {block.title && <h3 className="text-2xl font-black text-white mb-6 leading-tight tracking-tight">
                        {block.title}
                    </h3>}
                    <div
                        className={cn(
                            "prose prose-invert max-w-none prose-p:text-white/50 prose-p:leading-relaxed",
                            isMobile ? 'prose-sm' : 'prose-lg'
                        )}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text || '') }}
                    />
                </div>
            )
        case 'note':
            const variants = {
                info: { icon: <Info size={24} />, color: 'text-teal-400', bg: 'bg-teal-500/5', border: 'border-teal-500/10' },
                warning: { icon: <AlertTriangle size={24} />, color: 'text-orange-400', bg: 'bg-orange-400/5', border: 'border-orange-400/10' },
                tip: { icon: <Lightbulb size={24} />, color: 'text-green-400', bg: 'bg-green-400/5', border: 'border-green-400/10' },
                danger: { icon: <AlertTriangle size={24} />, color: 'text-red-400', bg: 'bg-red-400/5', border: 'border-red-400/10' }
            }
            const v = variants[block.variant || 'info']
            return (
                <div className={cn("p-10 rounded-[2rem] border flex gap-8 transition-all duration-500", v.border, v.bg)}>
                    <div className={cn("shrink-0 mt-1", v.color)}>{v.icon}</div>
                    <div className="flex-1">
                        {block.title && <h4 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4", v.color)}>{block.title}</h4>}
                        <div
                            className={cn(
                                "prose prose-invert max-w-none prose-p:text-white/70 prose-p:mb-0",
                                isMobile ? 'prose-sm' : 'prose-lg'
                            )}
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text || '') }}
                        />
                    </div>
                </div>
            )
        case 'terminal':
            return (
                <div className="border border-white/5 rounded-3xl overflow-hidden bg-black/60 shadow-3xl">
                    <div className="bg-[#0a0a0a] px-6 py-4 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-white/5"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-white/5"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-white/5"></div>
                            </div>
                            <span className="ml-4 text-[9px] text-white/20 font-black tracking-[0.3em] uppercase flex items-center gap-2">
                                <TerminalIcon size={12} className="text-teal-500" />
                                STUDIO_PRO_OS
                            </span>
                        </div>
                        {block.language && <span className="text-[9px] text-teal-500/50 font-black tracking-[0.2em] uppercase">{block.language}</span>}
                    </div>
                    <div className="p-8 font-mono text-teal-400/80 text-sm overflow-x-auto leading-relaxed">
                        <pre className="whitespace-pre-wrap"><code>{escapeHtml(block.code || '')}</code></pre>
                    </div>
                </div>
            )
        case 'prerequisites':
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {block.items?.map((item, i) => (
                        <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex items-center gap-5 group hover:border-teal-500/30 transition-all shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-teal-500/5 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <CheckCircle2 size={24} />
                            </div>
                            <span className="text-sm font-black text-white/60 tracking-tight group-hover:text-white transition-colors">{item}</span>
                        </div>
                    ))}
                </div>
            )
        case 'image':
            return (
                <div className="space-y-6">
                    <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl bg-black/40 p-4">
                        <img src={block.src} alt={block.alt} className="w-full h-auto rounded-[2rem] block" />
                    </div>
                    {block.alt && <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-[0.2em] italic">
                        {block.alt}
                    </p>}
                </div>
            )
        default:
            return null
    }
}

function renderMarkdown(markdown: string): string {
    let html = markdown
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
    })
    html = html.replace(/`([^`]+)`/g, '<code class="bg-white/5 px-2 py-0.5 rounded text-teal-400 font-mono text-sm">$1</code>')
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-2xl font-black text-white mt-12 mb-6">$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-3xl font-black text-white mt-16 mb-8">$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-4xl font-black text-white mt-20 mb-10">$1</h1>')
    html = html.replace(/^---$/gm, '<hr class="border-white/5 my-12" />')
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-teal-500 bg-teal-500/5 py-8 px-10 text-white/80 italic rounded-r-3xl my-10">$1</blockquote>')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-black text-white">$1</strong>')
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-teal-400 font-black hover:opacity-70 transition-opacity">$1</a>')
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-[2rem] my-12 border border-white/10" />')
    html = html.replace(/^- (.+)$/gm, '<li class="text-white/60 mb-3 ml-4">$1</li>')
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="my-8 space-y-2">$&</ul>')
    html = html.replace(/^(?!<[hup]|<div|```|<li|<\/[uo]l>|<pre>|<blockquote|<hr)(.+)$/gm, '<p class="text-white/60 leading-relaxed mb-8 text-lg">$1</p>')
    return html
}

function escapeHtml(text: string): string {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }
    return text.replace(/[&<>"']/g, m => map[m])
}

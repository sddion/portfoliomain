"use client"

import React, { useState } from "react"
import { Book, Calendar, User, Tag, ArrowLeft, Search, Info, AlertTriangle, CheckCircle2, Lightbulb, Terminal as TerminalIcon, Image as ImageIcon, ChevronRight } from "lucide-react"
import { blogPosts } from "@/data/blog"
import { AdUnit } from "@/components/os/AdUnit"

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

    // Detect Mobile
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const posts: BlogPost[] = blogPosts as BlogPost[]

    // Get unique categories
    const categories = Array.from(new Set(posts.map(p => p.category)))

    // Filter posts
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || post.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    // Pagination
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
    const paginatedPosts = filteredPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    )

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedCategory])

    const renderPostContent = (post: BlogPost) => (
        <article className={`max-w-4xl mx-auto px-4 py-8 ${isMobile ? 'pb-24' : ''}`}>
            {/* Featured Image */}
            {post.featuredImage && (
                <div className="aspect-video mb-12 rounded-2xl overflow-hidden bg-[var(--os-surface-hover)] shadow-2xl border border-[var(--os-border)]">
                    <div
                        className="h-full w-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${post.featuredImage})`, backgroundSize: '100% 100%' }}
                    />
                </div>
            )}

            {/* Post Header */}
            <header className="mb-8 border-b border-[var(--os-border)] pb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full text-[10px] font-bold uppercase tracking-wider">{post.category}</span>
                    {post.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-[var(--os-surface-hover)] border border-[var(--os-border)] rounded-full text-[10px] text-[var(--muted-foreground)] font-medium">{tag}</span>
                    ))}
                </div>
                <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black text-[var(--foreground)] mb-4 leading-tight`}>{post.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)] font-medium">
                    <span className="flex items-center gap-2">
                        <User size={14} className="text-[var(--primary)]" />
                        {post.author}
                    </span>
                    <span className="flex items-center gap-2">
                        <Calendar size={14} className="text-[var(--primary)]" />
                        {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </header>

            {/* Post Body */}
            {post.contentBlocks ? (
                <div className="space-y-12">
                    {post.contentBlocks.map((block, idx) => (
                        <div key={idx}>
                            {renderBlockContent(block, isMobile)}
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    className={`prose prose-invert ${isMobile ? 'prose-sm' : 'prose-lg'} max-w-none
                        prose-headings:text-[var(--foreground)] prose-headings:font-black tracking-tight
                        prose-headings:mt-12 prose-headings:mb-6
                        prose-p:text-[var(--foreground)]/80 prose-p:leading-relaxed prose-p:mb-8 prose-p:text-base
                        prose-a:text-[var(--primary)] prose-a:no-underline font-bold hover:prose-a:opacity-80
                        prose-code:text-orange-400 prose-code:bg-[var(--os-surface-hover)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-black/50 prose-pre:border prose-pre:border-[var(--os-border)] prose-pre:rounded-xl prose-pre:p-0 prose-pre:my-10 prose-pre:overflow-hidden
                        prose-blockquote:border-l-4 prose-blockquote:border-l-[var(--primary)] prose-blockquote:bg-[var(--primary)]/5 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:text-[var(--foreground)]/90 prose-blockquote:rounded-r-xl prose-blockquote:my-10 prose-blockquote:italic
                        prose-img:rounded-2xl prose-img:shadow-2xl prose-img:mx-auto prose-img:my-12 prose-img:border prose-img:border-white/10
                        prose-hr:border-[var(--os-border)] prose-hr:my-12
                        prose-ul:my-8 prose-li:my-3
                        prose-table:text-sm prose-table:border prose-table:border-[var(--os-border)] prose-table:my-10
                        [&_.terminal-header]:bg-[#1a1a1a] [&_.terminal-header]:px-4 [&_.terminal-header]:py-2 [&_.terminal-header]:flex [&_.terminal-header]:items-center [&_.terminal-header]:gap-2 [&_.terminal-header]:border-b [&_.terminal-header]:border-white/10
                        [&_.terminal-dot]:w-2.5 [&_.terminal-dot]:h-2.5 [&_.terminal-dot]:rounded-full
                        [&_.terminal-content]:p-6 [&_.terminal-content]:font-mono [&_.terminal-content]:text-green-400 [&_.terminal-content]:text-sm`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
                />
            )}
        </article>
    )

    const renderDesktop = () => (
        <div className="h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans overflow-hidden">
            {selectedPost ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="h-12 border-b border-[var(--os-border)] flex items-center px-4 bg-[var(--os-surface)] backdrop-blur-md shrink-0">
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm font-bold"
                        >
                            <ArrowLeft size={16} />
                            BACK TO ARCHIVE
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[var(--primary)]/10 via-transparent to-transparent">
                        {renderPostContent(selectedPost)}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Navigation */}
                    <div className="w-64 border-r border-[var(--os-border)] bg-[var(--os-surface)] flex flex-col pt-6 shrink-0">
                        <div className="px-6 mb-8">
                            <h2 className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-4">Repository</h2>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${!selectedCategory ? 'bg-[var(--primary)] shadow-[0_0_15px_rgba(37,99,235,0.3)] text-[var(--primary-foreground)]' : 'text-[var(--muted-foreground)] hover:bg-white/5'}`}
                                >
                                    <Book size={16} />
                                    ALL ASSETS
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-[var(--primary)] shadow-[0_0_15px_rgba(37,99,235,0.3)] text-[var(--primary-foreground)]' : 'text-[var(--muted-foreground)] hover:bg-white/5'}`}
                                    >
                                        <Tag size={16} />
                                        {cat.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-6">
                            <h2 className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-4">Filter</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search entries..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/20 border border-[var(--os-border)] rounded-lg pl-9 pr-4 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--primary)] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Sidebar Ad Unit */}
                        <div className="px-6 mt-auto pb-6">
                            <AdUnit slot="blog-sidebar" format="rectangle" className="w-full aspect-square" />
                        </div>
                    </div>

                    {/* Main Post Grid */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[var(--accent)]/10 via-transparent to-transparent">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedPosts.map(post => (
                                <article
                                    key={post.id}
                                    onClick={() => setSelectedPost(post)}
                                    className="group bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl overflow-hidden hover:border-[var(--primary)]/50 hover:bg-[var(--os-surface-hover)] transition-all cursor-pointer flex flex-col h-full"
                                >
                                    <div className="aspect-video bg-black/20 overflow-hidden shrink-0">
                                        <div
                                            className="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                            style={{ backgroundImage: `url(${post.featuredImage})`, backgroundSize: '100% 100%' }}
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-2">{post.category}</span>
                                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-3 mb-4 flex-1">{post.description}</p>
                                        <div className="flex items-center justify-between text-[10px] font-bold text-[var(--muted-foreground)] pt-4 border-t border-[var(--os-border)]">
                                            <span className="flex items-center gap-1.5 uppercase">
                                                <Calendar size={12} className="text-[var(--muted-foreground)]" />
                                                {new Date(post.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-[var(--muted-foreground)]">READ MORE →</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-[var(--os-border)]">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-[var(--os-surface)] border border-[var(--os-border)] text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--os-surface-hover)] transition-colors"
                                >
                                    ← Prev
                                </button>
                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === page ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--os-surface)] border border-[var(--os-border)] hover:bg-[var(--os-surface-hover)]'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-[var(--os-surface)] border border-[var(--os-border)] text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--os-surface-hover)] transition-colors"
                                >
                                    Next →
                                </button>
                            </div>
                        )}

                        {/* Showing count */}
                        {filteredPosts.length > 0 && (
                            <p className="text-center text-xs text-[var(--muted-foreground)] mt-4">
                                Showing {(currentPage - 1) * POSTS_PER_PAGE + 1}-{Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} posts
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )

    const renderMobile = () => (
        <div className="h-full bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[var(--primary)]/10 to-transparent pointer-events-none" />

            {selectedPost ? (
                <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                    {/* Compact Header for Post */}
                    <div className="h-14 flex items-center px-4 bg-black/40 backdrop-blur-xl border-b border-white/5 shrink-0">
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="p-2 rounded-full hover:bg-white/5 active:scale-95 transition-all text-[var(--muted-foreground)]"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="ml-4 truncate">
                            <h2 className="text-sm font-black truncate text-[var(--foreground)]">{selectedPost.title}</h2>
                            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">{selectedPost.category}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
                        {renderPostContent(selectedPost)}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                    {/* Modern Mobile Header - Condensed */}
                    <div className="px-6 pt-6 pb-4 shrink-0">
                        <div className="flex items-center justify-between mb-1">
                            <h1 className="text-2xl font-black tracking-tighter">Archive<span className="text-[var(--primary)]">.</span></h1>
                            <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                                <Book size={16} />
                            </div>
                        </div>
                        <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-3 opacity-60">Intel Repository</p>

                        {/* Search & Categories Bar - Condensed */}
                        <div className="space-y-2.5">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search repository..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/50 focus:bg-white/[0.05] transition-all placeholder:text-[var(--muted-foreground)]/30"
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${!selectedCategory ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' : 'bg-white/5 border-white/10 text-[var(--muted-foreground)] hover:bg-white/10'}`}
                                >
                                    ALL
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedCategory === cat ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' : 'bg-white/5 border-white/10 text-[var(--muted-foreground)] hover:bg-white/10'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Card List View */}
                    <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6 pt-2 custom-scrollbar">
                        {paginatedPosts.map(post => (
                            <article
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                className="group bg-[var(--os-surface)] border border-white/5 rounded-[2rem] overflow-hidden active:scale-[0.97] transition-all relative"
                            >
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                                        {post.category}
                                    </span>
                                </div>
                                <div className="aspect-[16/9] bg-black/20 relative">
                                    <div
                                        className="h-full w-full bg-cover bg-center bg-no-repeat opacity-80 transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url(${post.featuredImage})`, backgroundSize: '100% 100%' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                </div>
                                <div className="p-6 relative">
                                    <h2 className="text-xl font-black mb-3 leading-tight text-white group-hover:text-[var(--primary)] transition-colors line-clamp-2">{post.title}</h2>
                                    <p className="text-[var(--muted-foreground)] text-xs line-clamp-2 leading-relaxed font-medium mb-4 opacity-70">{post.description}</p>
                                    <div className="flex items-center justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-[var(--primary)]" />
                                            {new Date(post.date).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center gap-1 text-[var(--primary)]">
                                            View Intel <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 py-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-xl bg-[var(--os-surface)] border border-white/10 disabled:opacity-30"
                                >
                                    <ChevronRight size={18} className="rotate-180" />
                                </button>
                                <span className="text-sm font-bold text-[var(--muted-foreground)]">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-3 rounded-xl bg-[var(--os-surface)] border border-white/10 disabled:opacity-30"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}

                        {filteredPosts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-600">
                                    <Search size={32} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--foreground)]">No entries found</h3>
                                    <p className="text-xs text-[var(--muted-foreground)]">Adjust your encryption filters</p>
                                </div>
                            </div>
                        )}

                        {/* Mobile Ad Unit */}
                        <div className="mt-8">
                            <AdUnit slot="blog-mobile" format="auto" className="w-full min-h-[100px]" />
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
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--os-border);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--primary);
                }
            `}</style>
        </div>
    )
}

// Simple markdown-to-HTML converter
// Helper to render content blocks
function renderBlockContent(block: ContentBlock, isMobile: boolean) {
    switch (block.type) {
        case 'markdown':
            return (
                <div
                    className={`prose prose-invert ${isMobile ? 'prose-sm' : 'prose-lg'} max-w-none prose-p:mb-0`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text || '') }}
                />
            )
        case 'step':
            return (
                <div className="group relative pl-12 sm:pl-16 py-6 sm:py-8 pr-4 sm:pr-6 bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl shadow-xl hover:border-[var(--primary)]/30 transition-all overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-2 bg-[var(--primary)]/20 group-hover:bg-[var(--primary)] transition-colors" />
                    <div className="absolute top-6 sm:top-8 left-4 sm:left-6 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-black text-xs sm:text-sm shadow-lg">
                        {block.number}
                    </div>
                    {block.title && <h3 className="text-lg sm:text-2xl font-black text-[var(--foreground)] mb-3 sm:mb-4 pr-2 leading-tight">
                        {block.title}
                    </h3>}
                    <div
                        className={`prose prose-invert ${isMobile ? 'prose-sm' : 'prose-lg'} max-w-none prose-p:text-[var(--foreground)]/70`}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text || '') }}
                    />
                </div>
            )
        case 'note':
            const variants = {
                info: { icon: <Info size={20} />, color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/20' },
                warning: { icon: <AlertTriangle size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-400/5', border: 'border-yellow-400/20' },
                tip: { icon: <Lightbulb size={20} />, color: 'text-green-400', bg: 'bg-green-400/5', border: 'border-green-400/20' },
                danger: { icon: <AlertTriangle size={20} />, color: 'text-red-400', bg: 'bg-red-400/5', border: 'border-red-400/20' }
            }
            const v = variants[block.variant || 'info']
            return (
                <div className={`p-6 sm:p-8 rounded-2xl border ${v.border} ${v.bg} flex gap-4 sm:gap-6`}>
                    <div className={`${v.color} shrink-0 mt-1`}>{v.icon}</div>
                    <div className="flex-1">
                        {block.title && <h4 className={`text-sm font-black uppercase tracking-wider mb-2 ${v.color}`}>{block.title}</h4>}
                        <div
                            className={`prose prose-invert ${isMobile ? 'prose-sm' : 'prose-lg'} max-w-none prose-p:text-[var(--foreground)]/80 prose-p:mb-0`}
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text || '') }}
                        />
                    </div>
                </div>
            )
        case 'terminal':
            return (
                <div className="terminal-container border border-white/10 rounded-2xl overflow-hidden bg-black/60 shadow-2xl">
                    <div className="bg-[#1a1a1a] px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#ff5f56]"></div>
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#ffbd2e]"></div>
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#27c93f]"></div>
                            <span className="ml-1 sm:ml-2 text-[8px] sm:text-[10px] text-white/30 font-mono tracking-wider sm:tracking-widest uppercase flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                                <TerminalIcon size={10} className="sm:w-3 sm:h-3" />
                                Terminal
                            </span>
                        </div>
                        {block.language && <span className="text-[8px] sm:text-[10px] text-white/20 font-mono uppercase ml-2">{block.language}</span>}
                    </div>
                    <div className="p-4 sm:p-6 font-mono text-green-400 text-[11px] sm:text-sm overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal"><code>{escapeHtml(block.code || '')}</code></pre>
                    </div>
                </div>
            )
        case 'prerequisites':
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {block.items?.map((item, i) => (
                        <div key={i} className="p-4 bg-[var(--os-surface-hover)] border border-[var(--os-border)] rounded-xl flex items-center gap-4 group hover:border-[var(--primary)]/30 transition-all shadow-lg">
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="text-sm font-bold text-[var(--foreground)]/80 leading-tight">{item}</span>
                        </div>
                    ))}
                </div>
            )
        case 'image':
            return (
                <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20">
                        <img src={block.src} alt={block.alt} className="w-full h-auto block" />
                    </div>
                    {block.alt && <p className="text-center text-xs text-[var(--muted-foreground)] font-medium italic">
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

    // Code blocks & Terminals
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        if (lang === 'terminal') {
            return `
                <div class="terminal-container my-10 border border-white/10 rounded-xl overflow-hidden bg-black/60 shadow-2xl">
                    <div class="terminal-header">
                        <div class="terminal-dot bg-[#ff5f56]"></div>
                        <div class="terminal-dot bg-[#ffbd2e]"></div>
                        <div class="terminal-dot bg-[#27c93f]"></div>
                        <div class="ml-2 text-[10px] text-white/30 font-mono tracking-widest uppercase">sddionOS Terminal</div>
                    </div>
                    <div class="terminal-content">
                        <pre><code>${escapeHtml(code.trim())}</code></pre>
                    </div>
                </div>
            `
        }
        return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
    })

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

    // Horizontal Rules
    html = html.replace(/^---$/gm, '<hr />')

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

    // Links (with target _blank)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

    // Paragraphs
    html = html.replace(/^(?!<[hup]|<div|```|<li|<\/[uo]l>|<pre>|<blockquote|<hr)(.+)$/gm, '<p>$1</p>')

    // Tables (basic support)
    html = html.replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim())
        return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>'
    })
    html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>')

    return html
}

function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, m => map[m])
}

"use client"

import React, { useState } from "react"
import { Book, Calendar, User, Tag, ArrowLeft, Search } from "lucide-react"
import { blogPosts } from "@/data/blog"

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
}

export function BlogApp() {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(false)

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

    const renderPostContent = (post: BlogPost) => (
        <article className={`max-w-4xl mx-auto px-4 py-8 ${isMobile ? 'pb-24' : ''}`}>
            {/* Featured Image */}
            {post.featuredImage && (
                <div className={`${isMobile ? 'h-48' : 'h-64'} mb-8 rounded-2xl overflow-hidden bg-[var(--os-surface-hover)] shadow-xl`}>
                    <div
                        className="h-full w-full bg-contain bg-center bg-no-repeat bg-black/40"
                        style={{ backgroundImage: `url(${post.featuredImage})` }}
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
            <div
                className={`prose prose-invert ${isMobile ? 'prose-sm' : 'prose-lg'} max-w-none
                    prose-headings:text-[var(--foreground)] prose-headings:font-black tracking-tight
                    prose-p:text-[var(--foreground)]/80 prose-p:leading-relaxed
                    prose-a:text-[var(--primary)] prose-a:no-underline font-bold hover:prose-a:opacity-80
                    prose-code:text-orange-400 prose-code:bg-[var(--os-surface-hover)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-black/50 prose-pre:border prose-pre:border-[var(--os-border)] prose-pre:rounded-xl
                    prose-blockquote:border-l-[var(--primary)] prose-blockquote:bg-[var(--primary)]/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:text-[var(--muted-foreground)]
                    prose-img:rounded-2xl prose-img:shadow-2xl prose-img:mx-auto
                    prose-table:text-sm prose-table:border prose-table:border-[var(--os-border)]`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />
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
                    </div>

                    {/* Main Post Grid */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[var(--accent)]/10 via-transparent to-transparent">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.map(post => (
                                <article
                                    key={post.id}
                                    onClick={() => setSelectedPost(post)}
                                    className="group bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl overflow-hidden hover:border-[var(--primary)]/50 hover:bg-[var(--os-surface-hover)] transition-all cursor-pointer flex flex-col h-full"
                                >
                                    <div className="h-40 bg-black/20 overflow-hidden shrink-0">
                                        <div
                                            className="h-full w-full bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                            style={{ backgroundImage: `url(${post.featuredImage})` }}
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
                    </div>
                </div>
            )}
        </div>
    )

    const renderMobile = () => (
        <div className="h-full bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col">
            {selectedPost ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Floating Back Button */}
                    <button
                        onClick={() => setSelectedPost(null)}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full font-black text-sm shadow-[0_8px_30px_rgba(37,99,235,0.4)] border border-[var(--primary)]/50 flex items-center gap-2 active:scale-95 transition-transform"
                    >
                        <ArrowLeft size={18} />
                        BACK TO FEED
                    </button>
                    <div className="flex-1 overflow-y-auto bg-black/20">
                        {renderPostContent(selectedPost)}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Android Style Header */}
                    <div className="px-6 pt-12 pb-6 bg-gradient-to-b from-[var(--primary)]/20 to-transparent">
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Sanju<span className="text-[var(--primary)]">Blog</span></h1>
                        <p className="text-[var(--muted-foreground)] font-medium mb-6">Explore the latest tech insights</p>

                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
                            <input
                                type="text"
                                placeholder="Search tutorials..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl pl-12 pr-4 py-4 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
                            />
                        </div>

                        {/* Category Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all ${!selectedCategory ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--os-surface)] text-[var(--muted-foreground)]'}`}
                            >
                                ALL
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--os-surface)] text-[var(--muted-foreground)]'}`}
                                >
                                    {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Card List */}
                    <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
                        {filteredPosts.map(post => (
                            <article
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                className="bg-[var(--os-surface)] border border-[var(--os-border)] rounded-3xl overflow-hidden active:scale-[0.98] transition-all"
                            >
                                <div className="h-48 bg-black/20">
                                    <div
                                        className="h-full w-full bg-contain bg-center bg-no-repeat opacity-80"
                                        style={{ backgroundImage: `url(${post.featuredImage})` }}
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3 text-[10px] font-black tracking-widest uppercase">
                                        <span className="text-[var(--primary)]">{post.category}</span>
                                        <span className="text-[var(--muted-foreground)]">{new Date(post.date).toLocaleDateString()}</span>
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 leading-tight text-[var(--foreground)]">{post.title}</h2>
                                    <p className="text-[var(--muted-foreground)] text-xs line-clamp-2 leading-relaxed">{post.description}</p>
                                </div>
                            </article>
                        ))}
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
function renderMarkdown(markdown: string): string {
    let html = markdown

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
    })

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

    // Paragraphs
    html = html.replace(/^(?!<[hup]|```|<li|<\/[uo]l>)(.+)$/gm, '<p>$1</p>')

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

"use client"

import React, { useState } from "react"
import { Book, Calendar, User, Tag, ArrowLeft, Search, ChevronRight, Sparkles, FileText } from "lucide-react"
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
}

interface BlogLandingProps {
    onNavigate: (url: string) => void
    currentPath?: string
}

export function BlogLanding({ onNavigate, currentPath }: BlogLandingProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const posts: BlogPost[] = blogPosts as BlogPost[]
    const categories = Array.from(new Set(posts.map(p => p.category)))

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || post.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const featuredPost = posts[0]

    return (
        <div className="min-h-full bg-gradient-to-b from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f] text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12">
                    {/* Logo & Title */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white/60 mb-6">
                            <Sparkles size={14} className="text-primary" />
                            SanjuOS Knowledge Base
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                            Tech <span className="text-primary">Archive</span>
                        </h1>
                        <p className="text-lg text-white/50 max-w-md mx-auto">
                            Tutorials, guides, and deep dives into embedded systems, web development, and more.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="max-w-xl mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-medium outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!selectedCategory ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                        >
                            All Posts
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Post */}
            {featuredPost && !searchQuery && !selectedCategory && (
                <div className="max-w-6xl mx-auto px-6 mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles size={16} className="text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/40">Featured</span>
                    </div>
                    <button
                        onClick={() => onNavigate(`sanjuos://blog/${featuredPost.id}`)}
                        className="group w-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:border-primary/30 transition-all text-left"
                    >
                        <div className="grid md:grid-cols-2 gap-0">
                            <div className="aspect-video md:aspect-auto bg-black/20 relative overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${featuredPost.featuredImage})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0f]/80 hidden md:block" />
                            </div>
                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <span className="text-xs font-black text-primary uppercase tracking-widest mb-4">{featuredPost.category}</span>
                                <h2 className="text-2xl md:text-3xl font-black mb-4 group-hover:text-primary transition-colors leading-tight">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-white/50 text-sm leading-relaxed mb-6 line-clamp-3">{featuredPost.description}</p>
                                <div className="flex items-center gap-4 text-xs text-white/30">
                                    <span className="flex items-center gap-2">
                                        <User size={12} />
                                        {featuredPost.author}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar size={12} />
                                        {new Date(featuredPost.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {/* Posts Grid */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                <div className="flex items-center gap-3 mb-8">
                    <FileText size={16} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-white/40">
                        {selectedCategory ? selectedCategory : 'All Articles'} ({filteredPosts.length})
                    </span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post, idx) => (
                        <button
                            key={post.id}
                            onClick={() => onNavigate(`sanjuos://blog/${post.id}`)}
                            className="group bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/20 hover:bg-white/[0.05] transition-all text-left"
                        >
                            <div className="aspect-video bg-black/20 relative overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${post.featuredImage})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-white/80">
                                    {post.category}
                                </span>
                            </div>
                            <div className="p-5">
                                <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-white/40 line-clamp-2 mb-4">{post.description}</p>
                                <div className="flex items-center justify-between text-[10px] text-white/30">
                                    <span>{new Date(post.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1 text-primary font-bold">
                                        Read <ChevronRight size={12} />
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-20">
                        <Search size={48} className="mx-auto text-white/10 mb-4" />
                        <p className="text-white/40">No articles found</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 py-8">
                <p className="text-center text-xs text-white/20">
                    © 2025 SanjuOS • Built with Next.js
                </p>
            </div>
        </div>
    )
}

"use client"

import React, { useState } from "react"
import { Book, Calendar, User, Tag, ArrowLeft, Search } from "lucide-react"
import blogPosts from "@/data/blog-posts.json"

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

    if (selectedPost) {
        return (
            <div className="h-full bg-zinc-900 text-white overflow-auto">
                {/* Header */}
                <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-lg border-b border-zinc-800 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Back to Blog
                        </button>
                    </div>
                </div>

                {/* Post Content */}
                <article className="max-w-4xl mx-auto px-4 py-8">
                    {/* Featured Image */}
                    {selectedPost.featuredImage && (
                        <div className="h-64 mb-8 rounded-2xl overflow-hidden bg-zinc-800">
                            <div
                                className="h-full w-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${selectedPost.featuredImage})` }}
                            />
                        </div>
                    )}

                    {/* Post Header */}
                    <header className="mb-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-blue-600 rounded-full text-xs">{selectedPost.category}</span>
                            {selectedPost.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-zinc-800 rounded-full text-xs">{tag}</span>
                            ))}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{selectedPost.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                            <span className="flex items-center gap-2">
                                <User size={16} />
                                {selectedPost.author}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar size={16} />
                                {new Date(selectedPost.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </header>

                    {/* Post Body - Markdown rendered as HTML */}
                    <div
                        className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-zinc-300 prose-p:leading-relaxed
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
              prose-strong:text-white prose-strong:font-bold
              prose-code:text-orange-400 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-zinc-800 prose-pre:borderborder-zinc-700
              prose-blockquote:border-l-blue-500 prose-blockquote:text-zinc-400
              prose-img:rounded-xl prose-img:shadow-2xl
              prose-ul:text-zinc-300 prose-ol:text-zinc-300
              prose-li:text-zinc-300
              prose-table:text-zinc-300"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedPost.content) }}
                    />
                </article>
            </div>
        )
    }

    return (
        <div className="h-full bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-900/20 text-white overflow-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center">
                            <Book className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">SanjuOS Blog</h1>
                            <p className="text-sm sm:text-base text-blue-100">Tutorials, guides, and tech insights</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-lg transition-colors ${!selectedCategory
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                    >
                        All Posts
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Posts Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-zinc-500">No posts found matching your search</p>
                        </div>
                    ) : (
                        filteredPosts.map(post => (
                            <article
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                className="bg-zinc-800/50 backdrop-blur rounded-xl overflow-hidden border border-zinc-700 hover:border-blue-500 transition-all cursor-pointer group"
                            >
                                {/* Featured Image */}
                                <div className="h-48 bg-zinc-700 overflow-hidden">
                                    <div
                                        className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${post.featuredImage})` }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    {/* Category & Tags */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                                            {post.category}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>

                                    {/* Description */}
                                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{post.description}</p>

                                    {/* Metadata */}
                                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(post.date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Tag size={12} />
                                            {post.tags.length} tags
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
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

"use client"

import React from "react"
import { ArrowLeft, Calendar, User, Tag, Clock, Share2, Bookmark, ChevronRight, AlertTriangle, Info, Lightbulb, AlertCircle, Terminal as TerminalIcon, CheckCircle } from "lucide-react"
import { blogPosts } from "@/data/blog"

interface ContentBlock {
    type: string
    text?: string
    title?: string
    items?: string[]
    number?: number
    code?: string
    language?: string
    src?: string
    alt?: string
    variant?: string
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
    contentBlocks?: ContentBlock[]
}

interface BlogPostViewerProps {
    postId: string
    onNavigate: (url: string) => void
}

export function BlogPostViewer({ postId, onNavigate }: BlogPostViewerProps) {
    const posts = blogPosts as BlogPost[]
    const post = posts.find(p => p.id === postId)

    if (!post) {
        return (
            <div className="min-h-full bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Post Not Found</h2>
                    <p className="text-white/40 mb-6">The article you're looking for doesn't exist.</p>
                    <button
                        onClick={() => onNavigate("sddionOS://blog")}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
                    >
                        Back to Blog
                    </button>
                </div>
            </div>
        )
    }

    const escapeHtml = (text: string) => text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    const renderMarkdown = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-primary text-xs">$1</code>')
            .replace(/\n/g, '<br />')
    }

    const renderBlock = (block: ContentBlock, index: number) => {
        switch (block.type) {
            case 'markdown':
                return (
                    <div
                        key={index}
                        className="prose prose-invert prose-sm max-w-none prose-p:text-white/70 prose-headings:text-white"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text || '') }}
                    />
                )
            case 'step':
                return (
                    <div key={index} className="relative pl-12 py-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary/30 rounded-l-2xl" />
                        <div className="absolute top-6 left-4 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs">
                            {block.number}
                        </div>
                        {block.title && <h3 className="text-lg font-bold text-white mb-2">{block.title}</h3>}
                        <div
                            className="text-sm text-white/60"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text || '') }}
                        />
                    </div>
                )
            case 'note':
                const noteStyles = {
                    tip: { icon: Lightbulb, bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
                    info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
                    warning: { icon: AlertTriangle, bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
                }
                const style = noteStyles[block.variant as keyof typeof noteStyles] || noteStyles.info
                const Icon = style.icon
                return (
                    <div key={index} className={`${style.bg} ${style.border} border rounded-xl p-4 flex gap-3`}>
                        <Icon size={18} className={`${style.text} shrink-0 mt-0.5`} />
                        <div>
                            {block.title && <p className={`font-bold ${style.text} text-sm mb-1`}>{block.title}</p>}
                            <p className="text-sm text-white/60">{block.text}</p>
                        </div>
                    </div>
                )
            case 'terminal':
                return (
                    <div key={index} className="border border-white/10 rounded-xl overflow-hidden bg-black/40">
                        <div className="bg-[#1a1a1a] px-4 py-2 flex items-center gap-2 border-b border-white/5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                            <span className="ml-2 text-[10px] text-white/30 font-mono uppercase">{block.language || 'terminal'}</span>
                        </div>
                        <pre className="p-4 font-mono text-xs text-green-400 overflow-x-auto">
                            <code>{escapeHtml(block.code || '')}</code>
                        </pre>
                    </div>
                )
            case 'prerequisites':
                return (
                    <div key={index} className="grid grid-cols-2 gap-3">
                        {block.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                                <CheckCircle size={16} className="text-primary shrink-0" />
                                <span className="text-sm text-white/70">{item}</span>
                            </div>
                        ))}
                    </div>
                )
            case 'image':
                return (
                    <div key={index} className="rounded-xl overflow-hidden border border-white/10">
                        <img src={block.src} alt={block.alt || ''} className="w-full" />
                        {block.alt && <p className="text-xs text-white/30 text-center py-2 bg-black/20">{block.alt}</p>}
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-full bg-gradient-to-b from-[#0a0a0f] to-[#0d0d15] text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => onNavigate("sddionOS://blog")}
                        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Blog
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50">
                            <Share2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50">
                            <Bookmark size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.featuredImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-20">
                {/* Post Header */}
                <div className="mb-10">
                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold mb-4">
                        {post.category}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{post.title}</h1>
                    <p className="text-lg text-white/50 mb-6">{post.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-2">
                            <User size={14} />
                            {post.author}
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock size={14} />
                            {Math.ceil((post.contentBlocks?.length || 5) * 0.5)} min read
                        </span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {post.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/50">
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Content Blocks */}
                <div className="space-y-6">
                    {post.contentBlocks?.map((block, index) => renderBlock(block, index))}
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-white/10">
                    <p className="text-sm text-white/30 text-center">
                        Found this helpful? Share it with others!
                    </p>
                </div>
            </div>
        </div>
    )
}

"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Files, Terminal, Bug, Play, Plus, Search,
    MoreVertical, ChevronRight, Folder, FileCode,
    Settings, X, Trash2, Cpu, GitBranch, RefreshCw, Check, Zap, MessageSquare, List
} from "lucide-react"
import Editor from "@monaco-editor/react"
import { cn } from "@/lib/utils"
import { IDEFile, IDESettings } from "./types"

interface MobileIDEProps {
    files: IDEFile[]
    activeFileId: string | null
    onFileClick: (id: string) => void
    onUpdateContent: (value: string | undefined) => void
    onBuild: () => void
    onFlash: () => void
    compiling: boolean
    status: string
    consoleOutput: string[]
    settings: IDESettings
    onDelete: (id: string) => void
    onCreateFile: (name: string) => void
    onOpenSettings: () => void
    // Git Props
    onCommit?: (message: string, fileIds: string[]) => void
    onGitInit?: () => void
    onGitPush?: () => void
    onGitPull?: () => void
}

export function MobileIDE({
    files,
    activeFileId,
    onFileClick,
    onUpdateContent,
    onBuild,
    onFlash,
    compiling,
    status,
    consoleOutput,
    settings,
    onDelete,
    onCreateFile,
    onOpenSettings,
    onCommit,
    onGitInit,
    onGitPush,
    onGitPull
}: MobileIDEProps) {
    const [activeTab, setActiveTab] = useState<'editor' | 'explorer' | 'terminal' | 'debug' | 'git'>('editor')
    const [commitMessage, setCommitMessage] = useState("")
    const [stagedFiles, setStagedFiles] = useState<string[]>([])
    const activeFile = files.find(f => f.id === activeFileId)

    const tabs = [
        { id: 'editor', label: 'Editor', icon: <FileCode size={20} /> },
        { id: 'explorer', label: 'Explorer', icon: <Files size={20} /> },
        { id: 'git', label: 'Git', icon: <GitBranch size={20} /> },
        { id: 'terminal', label: 'Terminal', icon: <Terminal size={20} /> },
        { id: 'debug', label: 'Debug', icon: <Bug size={20} /> },
    ]

    // Sort files to show folders first, then files
    const sortedFiles = [...files].sort((a, b) => {
        if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name)
        return a.isFolder ? -1 : 1
    })

    return (
        <div className="h-full flex flex-col bg-[#0c0c0c] text-[#e0e0e0] font-sans selection:bg-[#c0ff33]/30">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#121212]/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold tracking-tight text-white/90">Studio Project</h1>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-semibold">Android Style</span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2.5 text-zinc-400 hover:text-white transition-colors active:bg-white/5 rounded-full">
                        <Search size={20} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={onOpenSettings}
                        className="p-2.5 text-zinc-400 hover:text-white transition-colors active:bg-white/5 rounded-full"
                    >
                        <Settings size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 relative overflow-hidden bg-[#121212]">
                <AnimatePresence mode="wait">
                    {activeTab === 'editor' && (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.2, ease: "circOut" }}
                            className="h-full flex flex-col"
                        >
                            {/* Editor Tabs/Breadcrumbs */}
                            <div className="h-12 flex items-center px-4 bg-[#1a1a1a] border-b border-white/5 gap-3 overflow-x-auto no-scrollbar">
                                {activeFile ? (
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
                                        <FileCode size={14} className="text-blue-400" />
                                        <span>{activeFile.name}</span>
                                        {activeFile.isModified && <div className="w-1.5 h-1.5 rounded-full bg-[#c0ff33]" />}
                                    </div>
                                ) : (
                                    <span className="text-xs text-zinc-500 italic px-2">No file open</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <Editor
                                    height="100%"
                                    theme="vs-dark"
                                    path={activeFile?.id}
                                    defaultLanguage="cpp"
                                    value={activeFile?.content || ""}
                                    onChange={onUpdateContent}
                                    loading={<div className="h-full w-full flex items-center justify-center text-xs text-zinc-500 font-mono tracking-widest animate-pulse">LOADING_RUNTIME</div>}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                                        lineNumbers: 'on',
                                        renderLineHighlight: 'all',
                                        wordWrap: 'on',
                                        scrollBeyondLastLine: false,
                                        padding: { top: 16 },
                                        fontFamily: "'Fira Code', monospace",
                                        lineHeight: 22,
                                        cursorSmoothCaretAnimation: "on",
                                        cursorBlinking: "expand",
                                        folding: false,
                                        glyphMargin: false,
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'explorer' && (
                        <motion.div
                            key="explorer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="h-full p-6 space-y-8 overflow-y-auto"
                        >
                            <button
                                onClick={() => {
                                    const name = prompt("New file name:")
                                    if (name) onCreateFile(name)
                                }}
                                className="w-full py-4 flex items-center justify-center gap-2 bg-[#c0ff33] text-black rounded-[28px] font-bold text-sm shadow-xl shadow-[#c0ff33]/10 active:scale-95 transition-all"
                            >
                                <Plus size={20} strokeWidth={3} />
                                New File
                            </button>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2 text-zinc-500">
                                    <Folder size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Project Root</span>
                                </div>

                                <div className="space-y-1 pl-4 border-l border-white/5 ml-4">
                                    {sortedFiles.map(f => (
                                        <div
                                            key={f.id}
                                            onClick={() => {
                                                onFileClick(f.id)
                                                setActiveTab('editor')
                                            }}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]",
                                                activeFileId === f.id
                                                    ? "bg-[#c0ff33]/10 border-l-4 border-l-[#c0ff33] text-white"
                                                    : "hover:bg-white/5 text-zinc-400"
                                            )}
                                        >
                                            {f.isFolder ? (
                                                <Folder size={20} className="text-yellow-500/80" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                                                    <FileCode size={20} strokeWidth={2.5} />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-bold">{f.name}</p>
                                                <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">{f.isFolder ? 'Directory' : 'Source File'}</p>
                                            </div>
                                            {activeFileId !== f.id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onDelete(f.id)
                                                    }}
                                                    className="p-2 opacity-10 hover:opacity-100 text-red-400 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'terminal' && (
                        <motion.div
                            key="terminal"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="h-full flex flex-col bg-[#080808]"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#121212]">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Output Console</h2>
                                <div className="flex items-center gap-3 bg-white/5 px-3 py-1 rounded-full">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full shadow-sm",
                                        status === 'building' ? 'bg-yellow-500 animate-pulse' :
                                            status === 'success' ? 'bg-[#c0ff33]' : 'bg-zinc-700'
                                    )} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{status}</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] space-y-1.5 selection:bg-white/10">
                                {consoleOutput.map((log, i) => (
                                    <div key={i} className={cn(
                                        "leading-relaxed",
                                        log.includes('ERROR') ? 'text-red-400' :
                                            log.includes('SYSTEM') ? 'text-blue-400/80' :
                                                log.includes('Success') ? 'text-[#c0ff33]' : 'text-zinc-500'
                                    )}>
                                        <span className="opacity-30 mr-2">[{i.toString().padStart(2, '0')}]</span>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'debug' && (
                        <motion.div
                            key="debug"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="w-24 h-24 rounded-3xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                                <Cpu size={48} className="text-purple-400" />
                            </div>
                            <h2 className="text-lg font-bold mb-2">Hardware Debug</h2>
                            <p className="text-xs text-zinc-500 leading-relaxed max-w-[240px]">
                                Real-time CPU and Memory profiling tools are currently in development.
                            </p>
                        </motion.div>
                    )}

                    {activeTab === 'git' && (
                        <motion.div
                            key="git"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col bg-[#0c0c0c]"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#121212]">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Source Control</h2>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onGitPull?.()} className="p-2 text-zinc-400 hover:text-white transition-colors">
                                        <RefreshCw size={16} />
                                    </button>
                                    <button onClick={() => onCommit?.(commitMessage, stagedFiles.length > 0 ? stagedFiles : files.filter(f => f.isModified).map(f => f.id))} className="p-2 text-zinc-400 hover:text-white transition-colors">
                                        <Check size={18} />
                                    </button>
                                    <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* Message Input */}
                                <div className="space-y-3">
                                    <div className="relative">
                                        <textarea
                                            value={commitMessage}
                                            onChange={(e) => setCommitMessage(e.target.value)}
                                            placeholder="Message (Ctrl+Enter to commit)"
                                            className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl p-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#c0ff33]/30 min-h-[100px] resize-none pr-28"
                                        />
                                        <button className="absolute right-3 top-3 px-3 py-1.5 bg-[#007acc] text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 hover:bg-[#0062a3] transition-colors shadow-lg shadow-blue-500/20">
                                            Generate
                                            <Zap size={10} fill="currentColor" strokeWidth={0} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const modifiedIds = files.filter(f => f.isModified).map(f => f.id)
                                            if (modifiedIds.length > 0) {
                                                onCommit?.(commitMessage, modifiedIds)
                                                setCommitMessage("")
                                            }
                                        }}
                                        className="w-full py-3.5 bg-[#007acc] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all"
                                    >
                                        <Check size={18} strokeWidth={3} />
                                        Commit
                                    </button>
                                </div>

                                {/* Changes List */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-2">
                                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                            <ChevronRight size={14} className="rotate-90" />
                                            Changes
                                        </button>
                                        <span className="text-[10px] font-black bg-white/5 text-zinc-400 px-2 py-0.5 rounded-full">
                                            {files.filter(f => f.isModified).length}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {files.filter(f => f.isModified).map(file => (
                                            <div
                                                key={file.id}
                                                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <FileCode size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold truncate text-zinc-300">{file.name}</p>
                                                    <p className="text-[10px] text-zinc-600 truncate">{file.parentId || 'root'}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "text-[10px] font-black w-5 h-5 flex items-center justify-center rounded",
                                                        file.isModified ? "text-yellow-500" : "text-green-500"
                                                    )}>
                                                        {file.isModified ? 'M' : 'U'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {files.filter(f => f.isModified).length === 0 && (
                                            <div className="py-12 flex flex-col items-center justify-center text-zinc-600 space-y-3">
                                                <div className="p-4 bg-white/5 rounded-full">
                                                    <MessageSquare size={32} strokeWidth={1.5} />
                                                </div>
                                                <p className="text-xs font-medium">No changes detected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Graph Placeholder */}
                                <div className="flex items-center justify-between px-2 pt-4">
                                    <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                        <ChevronRight size={14} />
                                        Graph
                                    </button>
                                    <List size={14} className="text-zinc-700" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* FAB */}
                <button
                    onClick={() => {
                        onBuild()
                        setActiveTab('terminal')
                    }}
                    disabled={compiling}
                    className={cn(
                        "absolute bottom-8 right-8 w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl shadow-[#c0ff33]/20 transition-all active:scale-90 z-10",
                        compiling ? "bg-zinc-800 text-zinc-500" : "bg-[#c0ff33] text-black hover:shadow-[#c0ff33]/40"
                    )}
                >
                    {compiling ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        >
                            <Settings size={28} strokeWidth={2.5} />
                        </motion.div>
                    ) : (
                        <Play size={28} fill="currentColor" strokeWidth={0} />
                    )}
                </button>
            </main>

            {/* Navigation */}
            <nav className="h-24 bg-[#121212]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 pb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "relative flex flex-col items-center gap-1.5 px-4 h-full justify-center transition-all",
                            activeTab === tab.id ? "text-white" : "text-zinc-500"
                        )}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="nav-pill"
                                className="absolute inset-x-0 top-3 h-10 bg-white/5 rounded-full z-0"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <div className="relative z-10">
                            {tab.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] relative z-10">{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    )
}

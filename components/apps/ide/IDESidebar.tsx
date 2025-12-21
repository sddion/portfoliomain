import React, { useState } from "react"
import {
    ChevronRight, ChevronDown, FileCode, Folder, Hash,
    MoreHorizontal, Search, FilePlus, FolderPlus, Trash2,
    Settings, Activity, Monitor, Type, AlignLeft, List, Minimize, Terminal as TerminalIcon,
    GitGraph, Check, Plus, X, Minus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { IDEFile, IDESettings, ArduinoLibrary, BoardPlatform } from "./types"

interface IDESidebarProps {
    activeTab: "explorer" | "libraries" | "git" | "settings" | "boards" | "tools"
    files: IDEFile[]
    activeFileId: string | null
    onFileClick: (id: string) => void
    onFileDelete: (id: string) => void
    onCreateFile: (name: string, parentId?: string) => void
    onCreateFolder: (name: string, parentId?: string) => void
    settings: IDESettings
    onUpdateSettings: (s: Partial<IDESettings>) => void
    sidebarWidth: number
    libraries?: ArduinoLibrary[]
    platforms?: BoardPlatform[]
    onCommit?: (message: string, fileIds: string[]) => void
    onGitInit?: () => void
    onGitPush?: () => void
    onGitPull?: () => void
    onGitRemote?: (url: string) => void
}

export function IDESidebar({
    activeTab, files, activeFileId, onFileClick, onFileDelete,
    onCreateFile, onCreateFolder, settings, onUpdateSettings, sidebarWidth, libraries, platforms,
    onCommit, onGitInit, onGitPush, onGitPull, onGitRemote
}: IDESidebarProps) {

    // Global creation state for the sidebar interactions
    const [creationState, setCreationState] = useState<{ type: 'file' | 'folder', parentId: string | null } | null>(null)

    const handleStartCreate = (type: 'file' | 'folder', parentId: string | null = null) => {
        setCreationState({ type, parentId })
    }

    const handleCancelCreate = () => {
        setCreationState(null)
    }

    const handleCreate = (name: string) => {
        if (!creationState) return
        if (creationState.type === 'file') {
            onCreateFile(name, creationState.parentId || undefined)
        } else {
            onCreateFolder(name, creationState.parentId || undefined)
        }
        setCreationState(null)
    }

    if (activeTab === "settings") {
        return <SettingsPanel settings={settings} onUpdateSettings={onUpdateSettings} />
    }

    if (activeTab === "libraries" && libraries) {
        return <LibrariesPanel libraries={libraries} />
    }

    if (activeTab === "boards" && platforms) {
        return <BoardsPanel platforms={platforms} />
    }

    if (activeTab === "git") {
        return <GitPanel
            files={files}
            onCommit={onCommit}
            onInit={onGitInit}
            onPush={onGitPush}
            onPull={onGitPull}
            onRemote={onGitRemote}
        />
    }

    if (activeTab === "tools") {
        return <ToolsPanel />
    }

    if (activeTab === "explorer") {
        return (
            <div className="h-full flex flex-col bg-[#252526] text-[#cccccc]">
                <div className="flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] shrink-0">
                    <span className="flex items-center gap-2">
                        <FilesIcon size={14} className="text-[#cccccc]" /> EXPLORER
                    </span>
                    <div className="flex items-center gap-1">
                        <button className="p-1 hover:bg-white/10 rounded" title="Collapse All">
                            <Minimize size={14} />
                        </button>
                        <MoreHorizontal size={14} className="cursor-pointer hover:text-white" />
                    </div>
                </div>

                {/* Search Box */}
                <div className="px-3 pb-2">
                    <div className="relative group">
                        <Search size={12} className="absolute left-2 top-2 text-white/20 group-focus-within:text-[var(--primary)] transition-colors" />
                        <input
                            className="w-full bg-[#3c3c3c] border border-transparent focus:border-[var(--primary)] text-xs rounded-sm py-1.5 pl-7 pr-2 outline-none text-white placeholder:text-white/20 transition-all font-sans"
                            placeholder="Search..."
                        />
                    </div>
                </div>

                {/* Workspace Header */}
                <div className="group flex items-center justify-between px-2 py-1 bg-[#37373d] text-xs font-bold cursor-pointer">
                    <div className="flex items-center gap-1">
                        <ChevronDown size={14} />
                        <span className="uppercase font-bold text-xs truncate">Workspace</span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleStartCreate('file')} className="p-0.5 hover:bg-white/10 rounded"><FilePlus size={14} /></button>
                        <button onClick={() => handleStartCreate('folder')} className="p-0.5 hover:bg-white/10 rounded"><FolderPlus size={14} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {/* File Tree */}
                    <ExplorerTree
                        files={files}
                        activeFileId={activeFileId}
                        onFileClick={onFileClick}
                        onFileDelete={onFileDelete}
                        creationState={creationState}
                        onCreate={handleCreate}
                        onCancelCreate={handleCancelCreate}
                        onStartCreate={handleStartCreate}
                    />
                </div>

                {/* Timeline / Outline placeholders (using unused icons) */}
                <div className="border-t border-[#333]">
                    <div className="flex items-center gap-2 px-4 py-1 text-[11px] font-bold uppercase text-[#bbbbbb] hover:bg-[#2a2d2e] cursor-pointer">
                        <ChevronRight size={14} />
                        <span className="flex items-center gap-2"><List size={14} /> Timeline</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1 text-[11px] font-bold uppercase text-[#bbbbbb] hover:bg-[#2a2d2e] cursor-pointer">
                        <ChevronRight size={14} />
                        <span className="flex items-center gap-2"><AlignLeft size={14} /> Outline</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1 text-[11px] font-bold uppercase text-[#bbbbbb] hover:bg-[#2a2d2e] cursor-pointer">
                        <ChevronRight size={14} />
                        <span className="flex items-center gap-2"><TerminalIcon size={14} /> Scripts</span>
                    </div>
                </div>
            </div>
        )
    }

    // Default Empty State for other tabs
    return (
        <div className="h-full flex flex-col items-center justify-center text-[#555] text-xs uppercase font-bold tracking-widest gap-2">
            <Activity size={32} className="opacity-20" />
            <span>{activeTab} Panel</span>
        </div>
    )
}

// Helper icon component since 'Files' from lucide might conflict or be missing in imports
function FilesIcon({ size, className }: { size: number, className?: string }) {
    return <FileCode size={size} className={className} />
}

function ExplorerTree({
    files, activeFileId, onFileClick, onFileDelete,
    creationState, onCreate, onCancelCreate, onStartCreate
}: {
    files: IDEFile[],
    activeFileId: string | null,
    onFileClick: (id: string) => void,
    onFileDelete: (id: string) => void
    creationState: { type: 'file' | 'folder', parentId: string | null } | null
    onCreate: (name: string) => void
    onCancelCreate: () => void
    onStartCreate: (type: 'file' | 'folder', parentId: string | null) => void
}) {
    // We'll treat files without parentId as root
    const rootFiles = files.filter(f => !f.parentId)
    const isCreatingAtRoot = creationState && creationState.parentId === null

    return (
        <div className="flex flex-col select-none">
            {rootFiles.sort((a, b) => (a.isFolder === b.isFolder ? 0 : a.isFolder ? -1 : 1)).map(file => (
                <FileTreeItem
                    key={file.id}
                    file={file}
                    allFiles={files}
                    depth={0}
                    activeFileId={activeFileId}
                    onFileClick={onFileClick}
                    onFileDelete={onFileDelete}
                    creationState={creationState}
                    onCreate={onCreate}
                    onCancelCreate={onCancelCreate}
                    onStartCreate={onStartCreate}
                />
            ))}
            {isCreatingAtRoot && (
                <InlineCreateInput
                    type={creationState!.type}
                    depth={0}
                    onConfirm={onCreate}
                    onCancel={onCancelCreate}
                />
            )}
        </div>
    )
}

function FileTreeItem({
    file, allFiles, depth, activeFileId, onFileClick, onFileDelete,
    creationState, onCreate, onCancelCreate, onStartCreate
}: {
    file: IDEFile,
    allFiles: IDEFile[],
    depth: number,
    activeFileId: string | null,
    onFileClick: (id: string) => void,
    onFileDelete: (id: string) => void
    creationState: { type: 'file' | 'folder', parentId: string | null } | null
    onCreate: (name: string) => void
    onCancelCreate: () => void
    onStartCreate: (type: 'file' | 'folder', parentId: string | null) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true)
    const children = allFiles.filter(f => f.parentId === file.id)
    const isCreatingHere = creationState && creationState.parentId === file.id

    if (file.isFolder) {
        return (
            <div>
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="group flex items-center justify-between cursor-pointer hover:bg-[#2a2d2e] py-0.5 px-2 text-[13px]"
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                >
                    <div className="flex items-center gap-1">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <Folder size={14} className="text-[#dcb67a]" />
                        <span className="font-bold truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onStartCreate('file', file.id); setIsExpanded(true) }}
                            className="p-0.5 hover:bg-white/10 rounded"
                        >
                            <FilePlus size={12} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onStartCreate('folder', file.id); setIsExpanded(true) }}
                            className="p-0.5 hover:bg-white/10 rounded"
                        >
                            <FolderPlus size={12} />
                        </button>
                    </div>
                </div>
                {isExpanded && (
                    <>
                        {children.map(child => (
                            <FileTreeItem
                                key={child.id}
                                file={child}
                                allFiles={allFiles}
                                depth={depth + 1}
                                activeFileId={activeFileId}
                                onFileClick={onFileClick}
                                onFileDelete={onFileDelete}
                                creationState={creationState}
                                onCreate={onCreate}
                                onCancelCreate={onCancelCreate}
                                onStartCreate={onStartCreate}
                            />
                        ))}
                        {isCreatingHere && (
                            <InlineCreateInput
                                type={creationState!.type}
                                depth={depth + 1}
                                onConfirm={onCreate}
                                onCancel={onCancelCreate}
                            />
                        )}
                    </>
                )}
            </div>
        )
    }

    return (
        <div
            onClick={() => onFileClick(file.id)}
            className={cn(
                "group flex items-center gap-2 cursor-pointer py-0.5 px-2 text-[13px] border border-transparent",
                activeFileId === file.id ? "bg-[#37373d] text-white" : "hover:bg-[#2a2d2e] text-[#cccccc]"
            )}
            style={{ paddingLeft: `${depth * 12 + 20}px` }}
        >
            <FileCode size={14} className="text-[#4fc1ff] shrink-0" />
            <span className="truncate flex-1">{file.name}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onFileDelete(file.id)
                }}
                className="opacity-0 group-hover:opacity-100 text-[#cccccc] hover:text-white p-0.5"
            >
                <Trash2 size={12} />
            </button>
        </div>
    )
}

function InlineCreateInput({ type, depth, onConfirm, onCancel }: {
    type: 'file' | 'folder',
    depth: number,
    onConfirm: (val: string) => void,
    onCancel: () => void
}) {
    const [value, setValue] = useState("")

    return (
        <div
            className="flex items-center gap-1 py-0.5 px-2 text-[13px]"
            style={{ paddingLeft: `${depth * 12 + (type === 'file' ? 20 : 8)}px` }}
        >
            {type === 'folder' && <Folder size={14} className="text-[#dcb67a]" />}
            {type === 'file' && <FileCode size={14} className="text-[#4fc1ff]" />}
            <input
                autoFocus
                className="bg-[#3c3c3c] text-white border border-[var(--primary)] outline-none px-1 w-full max-w-[150px]"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        if (value.trim()) onConfirm(value.trim())
                    } else if (e.key === 'Escape') {
                        onCancel()
                    }
                }}
                onBlur={() => {
                    // Optional: Cancel on blur, or commit? VS Code commits if valid, cancels if empty.
                    if (!value.trim()) onCancel()
                    // If value exists, maybe don't auto-commit to avoid accidents, let user hit enter.
                }}
            />
        </div>
    )
}

function GitPanel({
    files, onCommit, onInit, onPush, onPull, onRemote
}: {
    files: IDEFile[],
    onCommit?: (msg: string, ids: string[]) => void,
    onInit?: () => void,
    onPush?: () => void,
    onPull?: () => void,
    onRemote?: (url: string) => void
}) {
    const [message, setMessage] = useState("")
    const [isInitialized, setIsInitialized] = useState(false)
    const [remoteUrl, setRemoteUrl] = useState("")
    const [showRemoteInput, setShowRemoteInput] = useState(false)
    const [showTokenInput, setShowTokenInput] = useState(false)
    const [authToken, setAuthToken] = useState("")
    const [currentBranch, setCurrentBranch] = useState("main")
    const [stagedFiles, setStagedFiles] = useState<string[]>([])
    const [expandStaged, setExpandStaged] = useState(true)
    const [expandChanges, setExpandChanges] = useState(true)

    // Files that are modified but not staged
    const modifiedFiles = files.filter(f => f.isModified)
    const unstagedFiles = modifiedFiles.filter(f => !stagedFiles.includes(f.id))
    const stagedFileObjects = modifiedFiles.filter(f => stagedFiles.includes(f.id))

    // Stage a file
    const stageFile = (fileId: string) => {
        setStagedFiles(prev => [...new Set([...prev, fileId])])
    }

    // Unstage a file
    const unstageFile = (fileId: string) => {
        setStagedFiles(prev => prev.filter(id => id !== fileId))
    }

    // Stage all
    const stageAll = () => {
        setStagedFiles(modifiedFiles.map(f => f.id))
    }

    // Unstage all
    const unstageAll = () => {
        setStagedFiles([])
    }

    // Handle commit
    const handleCommit = () => {
        if (message.trim() && stagedFileObjects.length > 0 && onCommit) {
            onCommit(message.trim(), stagedFiles)
            setMessage("")
            setStagedFiles([])
        }
    }

    // Check for GitHub auth on mount
    React.useEffect(() => {
        const checkGitHubAuth = async () => {
            try {
                const { getGitHubToken } = await import('@/lib/Supabase')
                const token = await getGitHubToken()
                if (token) {
                    setAuthToken(token)
                } else {
                    const saved = localStorage.getItem('git_auth_token')
                    if (saved) setAuthToken(saved)
                }
            } catch {
                const saved = localStorage.getItem('git_auth_token')
                if (saved) setAuthToken(saved)
            }
        }
        checkGitHubAuth()
    }, [])

    if (!isInitialized) {
        return (
            <div className="h-full flex flex-col bg-[#252526] text-[#cccccc] items-center justify-center p-4 text-center">
                <GitGraph size={48} className="opacity-20 mb-4" />
                <p className="text-sm font-bold mb-2">No Repository Found</p>
                <p className="text-xs opacity-60 mb-4">Initialize a git repository to track changes in this workspace.</p>
                <button
                    onClick={() => {
                        setIsInitialized(true)
                        if (onInit) onInit()
                    }}
                    className="bg-[var(--primary)] text-white text-xs font-bold py-1.5 px-4 rounded hover:opacity-90"
                >
                    Initialize Repository
                </button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-[#252526] text-[#cccccc]">
            {/* Header */}
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-black/20 flex items-center justify-between">
                <span className="flex items-center gap-2"><GitGraph size={14} /> Source Control</span>
                <div className="flex gap-1">
                    <button onClick={() => setShowTokenInput(!showTokenInput)} className="p-1 hover:bg-white/10 rounded" title="Auth Token">
                        <Settings size={12} />
                    </button>
                    <button onClick={() => setShowRemoteInput(!showRemoteInput)} className="p-1 hover:bg-white/10 rounded" title="Add Remote">
                        <Activity size={12} />
                    </button>
                </div>
            </div>

            {/* Branch Selector */}
            <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
                <GitGraph size={12} className="text-[var(--primary)]" />
                <select
                    value={currentBranch}
                    onChange={(e) => setCurrentBranch(e.target.value)}
                    className="flex-1 bg-transparent text-xs outline-none cursor-pointer"
                >
                    <option value="main">main</option>
                    <option value="develop">develop</option>
                    <option value="feature">feature/new-branch</option>
                </select>
            </div>

            {/* Remote Input */}
            {showRemoteInput && (
                <div className="px-3 py-2 bg-[#1e1e1e] border-b border-white/5">
                    <label className="text-[10px] text-white/50 uppercase mb-1 block">Remote URL</label>
                    <div className="flex gap-1">
                        <input
                            value={remoteUrl}
                            onChange={e => setRemoteUrl(e.target.value)}
                            placeholder="https://github.com/user/repo.git"
                            className="flex-1 bg-[#3c3c3c] border border-black/20 rounded px-2 py-1 text-xs outline-none"
                        />
                        <button
                            onClick={() => {
                                if (onRemote) onRemote(remoteUrl)
                                setShowRemoteInput(false)
                            }}
                            className="bg-[var(--primary)] text-white px-2 rounded text-xs"
                        >Set</button>
                    </div>
                </div>
            )}

            {/* GitHub Auth */}
            {showTokenInput && (
                <div className="px-3 py-2 bg-[#1e1e1e] border-b border-white/5">
                    <label className="text-[10px] text-white/50 uppercase mb-2 block">GitHub Authentication</label>
                    {authToken ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#4caf50] flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                </div>
                                <span className="text-xs text-[#4caf50]">Connected</span>
                            </div>
                            <button
                                onClick={() => setAuthToken('')}
                                className="text-[10px] text-white/50 hover:text-red-400"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={async () => {
                                try {
                                    const { signInWithGitHub } = await import('@/lib/Supabase')
                                    await signInWithGitHub()
                                } catch (e) {
                                    console.error('GitHub login error:', e)
                                }
                            }}
                            className="w-full py-2 bg-[#24292e] hover:bg-[#2f363d] text-white text-xs font-bold rounded flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            Sign in with GitHub
                        </button>
                    )}
                    <p className="text-[9px] text-white/30 mt-2">Enables push/pull to your repositories</p>
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                {/* Commit Message */}
                <div className="p-3 border-b border-white/5">
                    <textarea
                        className="w-full bg-[#3c3c3c] border border-black/20 rounded p-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-[var(--primary)] resize-none"
                        rows={2}
                        placeholder="Commit message"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && e.ctrlKey) handleCommit()
                        }}
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleCommit}
                            disabled={!message.trim() || stagedFileObjects.length === 0}
                            className={cn(
                                "flex-1 bg-[var(--primary)] text-white text-xs font-bold py-1.5 rounded hover:opacity-90 transition-opacity",
                                (!message.trim() || stagedFileObjects.length === 0) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Check size={12} className="inline mr-1" /> Commit
                        </button>
                    </div>
                </div>

                {/* Push/Pull Actions */}
                <div className="px-3 py-2 flex gap-2 border-b border-white/5">
                    <button onClick={() => onPull && onPull()} className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[10px] py-1.5 rounded flex items-center justify-center gap-1">
                        <ChevronDown size={10} /> Pull
                    </button>
                    <button onClick={() => onPush && onPush()} className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[10px] py-1.5 rounded flex items-center justify-center gap-1">
                        <ChevronRight size={10} /> Push
                    </button>
                </div>

                {/* Staged Changes */}
                <div className="border-b border-white/5">
                    <button
                        onClick={() => setExpandStaged(!expandStaged)}
                        className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold uppercase text-[#bbbbbb] hover:bg-white/5"
                    >
                        <span className="flex items-center gap-1">
                            {expandStaged ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            Staged Changes
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="bg-[#4caf50] text-[#1e1e1e] px-1.5 rounded-full text-[10px]">{stagedFileObjects.length}</span>
                            {stagedFileObjects.length > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); unstageAll() }} className="p-0.5 hover:bg-white/10 rounded" title="Unstage All">
                                    <Minus size={12} />
                                </button>
                            )}
                        </div>
                    </button>
                    {expandStaged && stagedFileObjects.length > 0 && (
                        <div className="px-3 pb-2">
                            {stagedFileObjects.map(file => (
                                <div key={file.id} className="py-1 flex items-center justify-between group cursor-pointer hover:bg-white/5 px-2 -mx-2 rounded">
                                    <div className="flex items-center gap-2 truncate">
                                        <span className="text-[10px] text-[#4caf50] font-bold">A</span>
                                        <span className="text-xs text-[#4caf50] truncate">{file.name}</span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                        <button onClick={() => unstageFile(file.id)} className="p-0.5 hover:text-white" title="Unstage">
                                            <Minus size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Unstaged Changes */}
                <div>
                    <button
                        onClick={() => setExpandChanges(!expandChanges)}
                        className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold uppercase text-[#bbbbbb] hover:bg-white/5"
                    >
                        <span className="flex items-center gap-1">
                            {expandChanges ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            Changes
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="bg-[#e2c08d] text-[#1e1e1e] px-1.5 rounded-full text-[10px]">{unstagedFiles.length}</span>
                            {unstagedFiles.length > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); stageAll() }} className="p-0.5 hover:bg-white/10 rounded" title="Stage All">
                                    <Plus size={12} />
                                </button>
                            )}
                        </div>
                    </button>
                    {expandChanges && (
                        <div className="px-3 pb-2">
                            {unstagedFiles.length === 0 ? (
                                <div className="text-xs text-white/30 italic text-center py-3">
                                    No unstaged changes
                                </div>
                            ) : (
                                unstagedFiles.map(file => (
                                    <div key={file.id} className="py-1 flex items-center justify-between group cursor-pointer hover:bg-white/5 px-2 -mx-2 rounded">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="text-[10px] text-[#e2c08d] font-bold">M</span>
                                            <span className="text-xs text-[#e2c08d] truncate">{file.name}</span>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                            <button className="p-0.5 hover:text-red-400" title="Discard Changes">
                                                <X size={12} />
                                            </button>
                                            <button onClick={() => stageFile(file.id)} className="p-0.5 hover:text-white" title="Stage">
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


function SettingsPanel({ settings, onUpdateSettings }: { settings: IDESettings, onUpdateSettings: (s: Partial<IDESettings>) => void }) {
    return (
        <div className="h-full flex flex-col bg-[#252526] text-[#cccccc] overflow-y-auto">
            <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-black/20 flex items-center gap-2">
                <Settings size={14} /> Settings
            </div>

            <div className="p-4 space-y-6">
                <OptionSection title="Appearance">
                    <SettingDropdown
                        label="Editor Theme"
                        value={settings.theme}
                        options={["vs-dark", "vs", "hc-black"]}
                        onChange={(v) => onUpdateSettings({ theme: v as string })}
                    />
                </OptionSection>

                <OptionSection title="Text Editor">
                    <SettingToggle
                        icon={<Type size={14} />}
                        label="Font Size"
                        value={settings.fontSize}
                        type="number"
                        onChange={(v) => onUpdateSettings({ fontSize: Number(v) })}
                    />
                    <SettingDropdown
                        label="Tab Size"
                        value={settings.tabSize}
                        options={[2, 4, 8]}
                        onChange={(v) => onUpdateSettings({ tabSize: Number(v) })}
                    />
                    <SettingDropdown
                        label="Line Numbers"
                        value={settings.lineNumbers}
                        options={["on", "off"]}
                        onChange={(v) => onUpdateSettings({ lineNumbers: v as "on" | "off" })}
                    />
                    <SettingDropdown
                        label="Word Wrap"
                        value={settings.wordWrap}
                        options={["on", "off"]}
                        onChange={(v) => onUpdateSettings({ wordWrap: v as "on" | "off" })}
                    />
                    <SettingCheckbox
                        label="Minimap"
                        checked={settings.minimap}
                        onChange={(v) => onUpdateSettings({ minimap: v })}
                    />
                </OptionSection>

                <OptionSection title="Hardware">
                    <SettingDropdown
                        icon={<Monitor size={14} />}
                        label="Baud Rate"
                        value={settings.baudRate}
                        options={[9600, 115200, 921600]}
                        onChange={(v) => onUpdateSettings({ baudRate: Number(v) })}
                    />
                </OptionSection>
            </div>
        </div>
    )
}

function OptionSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-[var(--primary)]">{title}</h3>
            <div className="space-y-2 pl-2 border-l border-white/5">
                {children}
            </div>
        </div>
    )
}

function SettingToggle({ label, value, type, onChange, icon }: { label: string, value: string | number, type: string, onChange: (val: string | number) => void, icon?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs flex items-center gap-2">{icon}{label}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-16 bg-[#3c3c3c] border border-black/20 rounded px-2 py-1 text-xs text-white focus:border-[var(--primary)] outline-none"
            />
        </div>
    )
}

function SettingDropdown({ label, value, options, onChange, icon }: { label: string, value: string | number, options: (string | number)[], onChange: (val: string | number) => void, icon?: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs flex items-center gap-2">{icon}{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#3c3c3c] border border-black/20 rounded px-2 py-1 text-xs text-white focus:border-[var(--primary)] outline-none"
            >
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </div>
    )
}

function SettingCheckbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {

    return (
        <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs">{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="accent-[var(--primary)]"
            />
        </label>
    )
}

function LibrariesPanel({ libraries }: { libraries: ArduinoLibrary[] }) {
    const [searchTerm, setSearchTerm] = useState("")

    const filtered = libraries.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="h-full flex flex-col bg-[#252526] text-[#cccccc] overflow-y-auto">
            <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-black/20 flex items-center gap-2">
                <List size={14} /> Library Manager
            </div>

            <div className="px-3 py-2">
                <input
                    className="w-full bg-[#3c3c3c] border border-transparent focus:border-[var(--primary)] text-xs rounded-sm py-1.5 px-2 outline-none text-white placeholder:text-white/20 transition-all font-sans"
                    placeholder="Filter libraries..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="divide-y divide-white/5">
                {filtered.map((lib, i) => (
                    <div key={i} className="p-3 hover:bg-white/5 cursor-default group">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-[var(--primary)]">{lib.name}</span>
                            <span className="text-[10px] bg-white/10 px-1.5 rounded text-white/70">{lib.version}</span>
                        </div>
                        <p className="text-[11px] opacity-70 line-clamp-2">{lib.description}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] opacity-50">
                            <span>{lib.author}</span>
                            <div className="flex items-center gap-2">
                                <select
                                    className="bg-[#3c3c3c] text-[10px] text-white/80 rounded border-none outline-none py-0.5 px-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <option>{lib.version}</option>
                                    <option>1.0.0</option>
                                </select>
                                <button className="hover:text-white bg-[#3c3c3c] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Install</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function BoardsPanel({ platforms }: { platforms: BoardPlatform[] }) {
    const [searchTerm, setSearchTerm] = useState("")

    // Safety check for platforms
    const safePlatforms = platforms || []

    const filtered = safePlatforms.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Local state hack for "installing" to show immediate UI feedback
    const [localInstalled, setLocalInstalled] = useState<string[]>([])

    const isInstalled = (p: BoardPlatform) => p.installed || localInstalled.includes(p.id)

    const handleInstall = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setLocalInstalled(prev => [...prev, id])
        // In a real app, this would call a parent prop to sync state
    }

    return (
        <div className="h-full flex flex-col bg-[#252526] text-[#cccccc] overflow-y-auto">
            <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-black/20 flex items-center gap-2">
                <Settings size={14} /> Board Manager
            </div>

            <div className="px-3 py-2">
                <input
                    className="w-full bg-[#3c3c3c] border border-transparent focus:border-[var(--primary)] text-xs rounded-sm py-1.5 px-2 outline-none text-white placeholder:text-white/20"
                    placeholder="Filter boards..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="divide-y divide-white/5">
                {filtered.map((p, i) => (
                    <div key={i} className="p-3 hover:bg-white/5 cursor-default group">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white truncate max-w-[70%]">{p.name}</span>
                            {isInstalled(p) ? (
                                <span className="text-[9px] font-bold bg-[#4caf50]/20 text-[#4caf50] border border-[#4caf50]/30 px-1.5 py-0.5 rounded">INSTALLED</span>
                            ) : (
                                <button
                                    onClick={(e) => handleInstall(p.id, e)}
                                    className="text-[10px] bg-[#007acc] hover:bg-[#007acc]/90 text-white px-2 py-0.5 rounded transition-colors duration-200 shadow-sm"
                                >
                                    Install
                                </button>
                            )}
                        </div>
                        <p className="text-[11px] opacity-70 line-clamp-2 mb-2">{p.description}</p>

                        <div className="flex items-center justify-between mt-2">
                            <div className="text-[10px] opacity-40">
                                {p.boards.length} Boards
                            </div>
                            {p.versions && p.versions.length > 0 && (
                                <select
                                    className="bg-[#3c3c3c] text-[10px] text-white/80 rounded border-none outline-none py-0.5 px-1 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {p.versions.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ToolsPanel() {
    const [activeView, setActiveView] = useState<'main' | 'partition'>('main')
    const [dataDir, setDataDir] = useState<File[]>([])
    const [fsType, setFsType] = useState<'littlefs' | 'spiffs'>('littlefs')

    const partitionSchemes = [
        { name: 'Default 4MB', flash: '4MB', app: '1.2MB', spiffs: '1.5MB', nvs: '20KB' },
        { name: 'Huge APP', flash: '4MB', app: '3MB', spiffs: '896KB', nvs: '16KB' },
        { name: 'No OTA', flash: '4MB', app: '2MB', spiffs: '1.9MB', nvs: '20KB' },
        { name: 'Minimal', flash: '4MB', app: '1.3MB', spiffs: '64KB', nvs: '12KB' },
        { name: '16MB Flash', flash: '16MB', app: '4MB', spiffs: '10MB', nvs: '24KB' },
    ]

    const handleDataDirUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDataDir(Array.from(e.target.files))
        }
    }

    if (activeView === 'partition') {
        return (
            <div className="h-full flex flex-col bg-[#252526] text-[#cccccc] overflow-y-auto">
                <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-black/20 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Settings size={14} /> Partition Table</span>
                    <button onClick={() => setActiveView('main')} className="text-xs hover:text-white">← Back</button>
                </div>

                <div className="p-4 space-y-3">
                    <p className="text-[10px] opacity-60">Select a partition scheme for your ESP32 board:</p>

                    {partitionSchemes.map((scheme, i) => (
                        <div key={i} className="p-3 bg-[#2d2d2d] rounded border border-transparent hover:border-[var(--primary)] cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-white">{scheme.name}</span>
                                <span className="text-[10px] text-[var(--primary)]">{scheme.flash}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[10px]">
                                <div>
                                    <span className="opacity-50">App:</span>
                                    <span className="ml-1">{scheme.app}</span>
                                </div>
                                <div>
                                    <span className="opacity-50">FS:</span>
                                    <span className="ml-1">{scheme.spiffs}</span>
                                </div>
                                <div>
                                    <span className="opacity-50">NVS:</span>
                                    <span className="ml-1">{scheme.nvs}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-[#252526] text-[#cccccc] overflow-y-auto">
            <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-black/20 flex items-center gap-2">
                <Settings size={14} /> Tools
            </div>

            <div className="p-4 space-y-4">
                {/* Filesystem Upload */}
                <div className="p-3 bg-[#2d2d2d] rounded">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-white">Filesystem Image</span>
                        <select
                            value={fsType}
                            onChange={(e) => setFsType(e.target.value as any)}
                            className="bg-[#3c3c3c] text-[10px] rounded px-2 py-1 outline-none"
                        >
                            <option value="littlefs">LittleFS</option>
                            <option value="spiffs">SPIFFS</option>
                        </select>
                    </div>

                    <label className="block w-full p-4 border-2 border-dashed border-white/20 rounded hover:border-[var(--primary)] cursor-pointer text-center transition-colors">
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleDataDirUpload}
                            {...{ webkitdirectory: "", directory: "" } as any}
                        />
                        <Hash size={24} className="mx-auto mb-2 opacity-40" />
                        <span className="text-[10px] opacity-60">
                            {dataDir.length > 0 ? `${dataDir.length} files selected` : 'Select data folder'}
                        </span>
                    </label>

                    {dataDir.length > 0 && (
                        <button className="w-full mt-3 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded hover:opacity-90">
                            Upload to Device
                        </button>
                    )}
                </div>

                {/* Partition Viewer */}
                <button
                    onClick={() => setActiveView('partition')}
                    className="w-full text-left p-3 bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <Settings size={16} className="text-[var(--ide-icon,#858585)] group-hover:text-[var(--ide-accent,#007acc)]" />
                        <div>
                            <div className="text-xs font-bold text-white">Partition Table</div>
                            <div className="text-[10px] opacity-60">View and select partition schemes</div>
                        </div>
                    </div>
                </button>

                {/* Erase Flash */}
                <button
                    onClick={() => {
                        if (confirm('This will erase ALL data on the device. Continue?')) {
                            alert('Flash erase requires device connection. Use esptool.py for now.')
                        }
                    }}
                    className="w-full text-left p-3 bg-[#2d2d2d] hover:bg-red-900/30 rounded transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <Trash2 size={16} className="text-[var(--ide-icon,#858585)] group-hover:text-red-400" />
                        <div>
                            <div className="text-xs font-bold text-white group-hover:text-red-400">Erase Flash</div>
                            <div className="text-[10px] opacity-60">Erase entire flash memory</div>
                        </div>
                    </div>
                </button>

                {/* Burn Bootloader */}
                <button className="w-full text-left p-3 bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded transition-colors group">
                    <div className="flex items-center gap-3">
                        <Activity size={16} className="text-[var(--ide-icon,#858585)] group-hover:text-[var(--ide-accent,#007acc)]" />
                        <div>
                            <div className="text-xs font-bold text-white">Burn Bootloader</div>
                            <div className="text-[10px] opacity-60">Flash bootloader to device</div>
                        </div>
                    </div>
                </button>
            </div>

            <div className="px-4 py-2 border-t border-white/5 mt-auto">
                <p className="text-[10px] opacity-40 text-center">
                    Connect a device via Web Serial to use these tools
                </p>
            </div>
        </div>
    )
}

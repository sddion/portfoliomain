import React, { useState } from "react"
import {
    ChevronRight, ChevronDown, FileCode, Folder, Hash,
    MoreHorizontal, Search, FilePlus, FolderPlus, Trash2,
    Settings, Activity, Monitor, Type, AlignLeft, List, Minimize, Terminal as TerminalIcon,
    GitGraph, Check, Plus, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { IDEFile, IDESettings, ArduinoLibrary, BoardPlatform } from "./types"

interface IDESidebarProps {
    activeTab: "explorer" | "libraries" | "git" | "settings" | "boards"
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
    const modifiedFiles = files.filter(f => f.isModified)
    const [message, setMessage] = useState("")
    const [isInitialized, setIsInitialized] = useState(false)
    const [remoteUrl, setRemoteUrl] = useState("")
    const [showRemoteInput, setShowRemoteInput] = useState(false)

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
            <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-black/20 flex items-center justify-between">
                <span className="flex items-center gap-2"><GitGraph size={14} /> Source Control</span>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-white/10 rounded" title="Commit"><Check size={14} /></button>
                    <button onClick={() => setShowRemoteInput(!showRemoteInput)} className="p-1 hover:bg-white/10 rounded" title="Add Remote"><Activity size={14} /></button>
                </div>
            </div>

            {showRemoteInput && (
                <div className="px-4 py-2 bg-[#1e1e1e] border-b border-white/5">
                    <div className="flex gap-1">
                        <input
                            value={remoteUrl}
                            onChange={e => setRemoteUrl(e.target.value)}
                            placeholder="https://github.com/..."
                            className="flex-1 bg-[#3c3c3c] border border-black/20 rounded px-2 py-1 text-xs outline-none"
                        />
                        <button
                            onClick={() => {
                                if (onRemote) onRemote(remoteUrl)
                                setShowRemoteInput(false)
                            }}
                            className="bg-[#007acc] text-white px-2 rounded text-xs"
                        >OK</button>
                    </div>
                </div>
            )}

            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                {/* Actions */}
                <div className="flex gap-2">
                    <button onClick={() => onPull && onPull()} className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-xs py-1.5 rounded flex items-center justify-center gap-2">
                        <ChevronDown size={12} /> Pull
                    </button>
                    <button onClick={() => onPush && onPush()} className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-xs py-1.5 rounded flex items-center justify-center gap-2">
                        Push <ChevronRight size={12} />
                    </button>
                </div>
                {/* Message Input */}
                <div className="flex flex-col gap-2">
                    <textarea
                        className="w-full bg-[#3c3c3c] border border-black/20 rounded p-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-[var(--primary)] resize-none"
                        rows={3}
                        placeholder="Message (Ctrl+Enter to commit)"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            if (message.trim() && modifiedFiles.length > 0 && onCommit) {
                                onCommit(message.trim(), modifiedFiles.map(f => f.id))
                                setMessage("")
                            }
                        }}
                        disabled={!message.trim() || modifiedFiles.length === 0}
                        className={cn(
                            "bg-[var(--primary)] text-white text-xs font-bold py-1.5 rounded hover:opacity-90 transition-opacity",
                            (!message.trim() || modifiedFiles.length === 0) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        Commit
                    </button>
                    <button className="bg-[#007acc] text-white text-xs font-bold py-1.5 rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                        <Activity size={12} className="animate-pulse" /> Sync Changes
                    </button>
                </div>

                {/* Changes List */}
                <div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase text-[#bbbbbb] mb-2 group">
                        <span>Changes</span>
                        <span className="bg-[#4caf50] text-[#1e1e1e] px-1.5 rounded-full text-[10px]">{modifiedFiles.length}</span>
                    </div>
                    {modifiedFiles.length === 0 ? (
                        <div className="text-xs text-white/30 italic text-center py-4">
                            No changes detected.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {modifiedFiles.map(file => (
                                <div key={file.id} className="py-1 flex items-center justify-between group cursor-pointer hover:bg-white/5 px-2 -mx-2 rounded">
                                    <div className="flex items-center gap-2 truncate">
                                        <FilesIcon size={12} className="text-[#e2c08d]" />
                                        <span className="text-xs text-[#e2c08d] truncate">{file.name}</span>
                                        <span className="text-[10px] text-white/30 truncate max-w-[60px]">{file.id}</span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                        <button className="p-0.5 hover:text-white" title="Open File"><FileCode size={12} /></button>
                                        <button className="p-0.5 hover:text-white" title="Discard Changes"><X size={12} /></button>
                                        <button className="p-0.5 hover:text-white" title="Stage Changes"><Plus size={12} /></button>
                                    </div>
                                </div>
                            ))}
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

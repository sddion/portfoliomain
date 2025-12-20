"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import Editor from "@monaco-editor/react"
import {
    IDEActivityBar
} from "@/components/apps/ide/IDEActivityBar"
import { IDESidebar } from "@/components/apps/ide/IDESidebar"
import { IDETabs } from "@/components/apps/ide/IDETabs"
import { IDEStatusBar } from "@/components/apps/ide/IDEStatusBar"
import { IDEFile, IDESettings, ArduinoLibrary, BoardPlatform } from "@/components/apps/ide/types"
import { useUserStore } from "@/hooks/use-user-store"
import {
    Activity, Play, Save, Vibrate, CheckCircle2,
    XCircle, Terminal as TerminalIcon, Monitor,
    Cpu, History, Files as FilesIcon, Search as SearchIcon,
    Library, SlidersHorizontal, Menu, Plus, X
} from "lucide-react"
import { cn } from "@/lib/utils"

const DEFAULT_CODE = `void setup() {
  Serial.begin(115200);
  Serial.println("Studio connected.");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`

const LIBS: ArduinoLibrary[] = [
    { name: "AccelStepper", version: "1.64.0", author: "Mike McCauley", description: "Multi-step motor library.", versions: ["1.64.0", "1.63.0", "1.61.0"], url: "https://www.arduinolibraries.info/libraries/accel-stepper" },
    { name: "ArduinoJson", version: "7.0.4", author: "Benoit Blanchon", description: "Most popular JSON library for Arduino.", versions: ["7.0.4", "6.21.3", "5.13.5"], url: "https://www.arduinolibraries.info/libraries/arduino-json" },
    { name: "AceButton", version: "1.10.1", author: "Brian Park", description: "Simplified button handling.", versions: ["1.10.1", "1.9.0"], url: "https://www.arduinolibraries.info/libraries/ace-button" },
    { name: "AUnit", version: "1.7.1", author: "Brian Park", description: "Unit testing for Arduino.", versions: ["1.7.1", "1.6.0"], url: "https://www.arduinolibraries.info/libraries/a-unit" },
    { name: "aREST", version: "2.9.0", author: "Marco Schwartz", description: "RESTful API for Arduino.", versions: ["2.9.0", "2.8.5"], url: "https://www.arduinolibraries.info/libraries/a-rest" }
]

export function IDEApp() {
    // Core State
    const [files, setFiles] = useState<IDEFile[]>([])
    const [activeFileId, setActiveFileId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"explorer" | "search" | "libraries" | "git" | "settings" | "boards">("explorer")
    const [isMobile, setIsMobile] = useState(false)
    const [showMobileSidebar, setShowMobileSidebar] = useState(false)

    // Status State
    const [settings, setSettings] = useState<IDESettings>({
        board: "ESP32 Dev Module",
        baudRate: 115200,
        fontSize: 14,
        fontFamily: "'Fira Code', monospace",
        verbose: false,
        theme: "vs-dark",
        tabSize: 4,
        wordWrap: "off",
        minimap: true,
        lineNumbers: "on"
    })

    const [status, setStatus] = useState<"idle" | "building" | "success" | "error">("idle")
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

    // Build & Flash State
    const [compiling, setCompiling] = useState(false)
    const [buildStatus, setBuildStatus] = useState<"idle" | "success" | "error">("idle")
    const [parserReady, setParserReady] = useState(false)
    const [terminalTab, setTerminalTab] = useState<"output" | "problems" | "serial">("output")
    const [consoleOutput, setConsoleOutput] = useState<string[]>([
        "SYSTEM: Studio Pro v2.0 ",
        "SYSTEM: Tree-Sitter C++ WASM loading...",
    ])
    const [buildErrors, setBuildErrors] = useState<string[]>([])
    const [isSerialConnected, setIsSerialConnected] = useState(false)
    const [flashing, setFlashing] = useState(false)
    const [flashProgress, setFlashProgress] = useState(0)
    const [platforms, setPlatforms] = useState<BoardPlatform[]>([])

    // 1. Initialize useRef
    const parserRef = useRef<any>(null)

    const { user } = useUserStore()

    // Load/Save state
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)

        // Initialize parser placeholder
        const timeout = setTimeout(() => {
            parserRef.current = "READY"
            setParserReady(true)
        }, 1500)

        // Log user login for demo purposes
        if (user) console.log("IDE: User session active", user.id)

        return () => {
            clearTimeout(timeout)
            window.removeEventListener('resize', checkMobile)
        }
    }, [user])

    useEffect(() => {
        async function fetchBoards() {
            try {
                const res = await fetch('/api/arduino/packages')
                const data = await res.json()
                if (data.packages) {
                    setPlatforms(data.packages)
                }
            } catch (e) {
                console.error("Failed to fetch boards", e)
            }
        }
        fetchBoards()
    }, [])

    useEffect(() => {
        const saved = localStorage.getItem("sddionOS_studio_files")
        if (saved) {
            try {
                setFiles(JSON.parse(saved))
            } catch (e) { console.error(e) }
        } else {
            const initialFile: IDEFile = { id: "main", name: "main.ino", content: DEFAULT_CODE, isOpen: true, isModified: false }
            setFiles([initialFile])
            setActiveFileId("main")
        }

        const savedSettings = localStorage.getItem("sddionOS_studio_settings")
        if (savedSettings) {
            try {
                setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }))
            } catch (e) { console.error(e) }
        }
    }, [])

    useEffect(() => {
        if (files.length > 0) localStorage.setItem("sddionOS_studio_files", JSON.stringify(files))
    }, [files])

    useEffect(() => {
        localStorage.setItem("sddionOS_studio_settings", JSON.stringify(settings))
    }, [settings])


    // File Operations
    const activeFile = useMemo(() => files.find(f => f.id === activeFileId), [files, activeFileId])

    const handleCreateFile = useCallback((name: string, parentId?: string) => {
        const newFile: IDEFile = {
            id: `file-${Date.now()}`,
            name,
            content: "",
            isOpen: true,
            isModified: false,
            parentId: parentId || undefined
        }
        setFiles(prev => [...prev, newFile])
        setActiveFileId(newFile.id)
    }, [])

    const handleCreateFolder = useCallback((name: string, parentId?: string) => {
        const newFolder: IDEFile = {
            id: `folder-${Date.now()}`,
            name,
            content: "",
            isOpen: false,
            isModified: false,
            isFolder: true,
            parentId: parentId || undefined
        }
        setFiles(prev => [...prev, newFolder])
    }, [])

    const handleDelete = useCallback((id: string) => {
        if (confirm("Delete this?")) {
            setFiles(prev => prev.filter(f => f.id !== id && f.parentId !== id))
            if (activeFileId === id) setActiveFileId(files.filter(f => f.id !== id)[0]?.id || null)
        }
    }, [activeFileId, files])

    const handleUpdateContent = (value: string | undefined) => {
        if (activeFileId && value !== undefined) {
            setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: value, isModified: true } : f))
        }
    }

    // Handlers for props
    const handleFileClick = (id: string) => {
        setActiveFileId(id)
        setFiles(prev => prev.map(f => f.id === id ? { ...f, isOpen: true } : f))
        if (isMobile) setShowMobileSidebar(false)
    }

    const handleFileDelete = handleDelete

    // Toolbar "New File" button handler (creates default file since we moved inline creation to sidebar)
    const handleNewFile = () => {
        handleCreateFile(`Untitled-${Date.now().toString().slice(-4)}.cpp`)
    }

    const updateSettings = (s: Partial<IDESettings>) => setSettings(prev => ({ ...prev, ...s }))

    const addLog = (msg: string) => {
        setConsoleOutput(prev => [...prev.slice(-99), `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    const handleBuild = async () => {
        setCompiling(true)
        setStatus("building")
        addLog("BUILD: Starting compilation...")

        await new Promise(r => setTimeout(r, 1500))

        const hasError = Math.random() > 0.9 // 10% chance of random error for demo

        if (hasError) {
            setBuildStatus("error")
            setStatus("error")
            setBuildErrors(["src/main.cpp:14:22: error: expected ';' before '}' token"])
            setTerminalTab("problems")
            addLog("BUILD: Failed with errors.")
        } else {
            setBuildStatus("success")
            setStatus("success")
            setBuildErrors([])
            addLog("BUILD: Success! Binary size: 428KB")
        }
        setCompiling(false)
    }

    const handleFlash = async () => {
        if (buildStatus !== 'success') {
            await handleBuild()
            if (buildStatus === 'error') return
        }

        setFlashing(true)
        addLog("FLASH: Connecting to ESP32...")

        // Simulating flash
        for (let i = 0; i <= 100; i += 10) {
            setFlashProgress(i)
            await new Promise(r => setTimeout(r, 200))
        }

        addLog("FLASH: Write complete. Resetting board...")
        setFlashing(false)
        setIsSerialConnected(true)
    }

    return (
        <div className="h-full bg-[#1e1e1e] flex flex-col font-sans select-none overflow-hidden relative text-[#cccccc]">
            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                <IDEActivityBar activeTab={activeTab} onTabChange={setActiveTab} />

                <div className={cn(
                    "bg-[#0d0d0d] border-r border-white/5 flex flex-col transition-all duration-300 z-[100] relative",
                    isMobile && showMobileSidebar ? "w-full absolute inset-0 bg-[#0d0d0d]" : isMobile ? "w-0" : "w-64"
                )}>
                    {(isMobile && showMobileSidebar) || !isMobile ? (
                        <div className="h-full relative flex flex-col">
                            {isMobile && (
                                <div className="flex items-center justify-between p-2 border-b border-white/10">
                                    <span className="text-xs font-bold uppercase text-white/50 pl-2">Browser</span>
                                    <button onClick={() => setShowMobileSidebar(false)} className="p-2 bg-white/10 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <IDESidebar
                                activeTab={activeTab}
                                files={files}
                                activeFileId={activeFileId}
                                onFileClick={handleFileClick}
                                onFileDelete={handleFileDelete}
                                onCreateFile={handleCreateFile}
                                onCreateFolder={handleCreateFolder}
                                settings={settings}
                                onUpdateSettings={updateSettings}
                                sidebarWidth={256}
                                libraries={LIBS}
                                platforms={platforms}
                            />
                        </div>
                    ) : null}
                </div>

                <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0 relative">
                    <div className="flex items-center">
                        <div className="flex-1 overflow-hidden">
                            <IDETabs
                                files={files}
                                activeFileId={activeFileId}
                                onTabClick={setActiveFileId}
                                onTabClose={(id) => {
                                    setFiles(prev => prev.map(f => f.id === id ? { ...f, isOpen: false } : f))
                                    if (activeFileId === id) {
                                        const open = files.filter(f => f.isOpen && f.id !== id)
                                        setActiveFileId(open[open.length - 1]?.id || null)
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={handleNewFile}
                            className="bg-[#252526] h-[35px] px-3 border-b border-l border-black/20 flex items-center justify-center text-white/40 hover:text-white hover:bg-[#2d2d2d] transition-colors"
                            title="New File"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Toolbar for Actions (Desktop) - Using unused icons */}
                    {!isMobile && (
                        <div className="h-9 bg-[#252526] border-b border-black/20 flex items-center justify-between px-2 shrink-0">
                            <div className="flex items-center">
                                {/* Small breadcrumb or file actions */}
                                <div className="text-xs text-white/40 ml-2 flex items-center gap-1">
                                    <span className="opacity-50">{settings.board}</span>
                                    <span>/</span>
                                    <span className="text-white/80 font-bold">{activeFile?.name}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleBuild}
                                    disabled={compiling}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-0.5 rounded text-[11px] transition-all hover:bg-white/10",
                                        compiling ? "text-yellow-400" : "text-white"
                                    )}
                                    title="Build Sketch"
                                >
                                    {compiling ? <Activity size={14} className="animate-spin" /> : <CheckCircle2 size={14} className="text-teal-400" />}
                                    <span>{compiling ? "Building..." : "Verify"}</span>
                                </button>

                                <button
                                    onClick={handleFlash}
                                    disabled={flashing || compiling}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-0.5 rounded text-[11px] transition-all hover:bg-white/10",
                                        flashing ? "text-orange-400" : "text-white"
                                    )}
                                    title="Upload to Board"
                                >
                                    {flashing ? <Vibrate size={14} className="animate-bounce" /> : <Play size={14} className="text-teal-400" />}
                                    <span>{flashing ? `Flashing ${flashProgress}%` : "Upload"}</span>
                                </button>

                                <div className="w-[1px] h-4 bg-white/10 mx-1" />

                                <button onClick={() => addLog("Project Saved.")} className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white" title="Save Project">
                                    <Save size={14} />
                                </button>
                            </div>
                        </div>
                    )}


                    <div className="flex-1 relative">
                        {activeFile ? (
                            <Editor
                                height="100%"
                                defaultLanguage="cpp"
                                language={activeFile.name.endsWith('.json') ? 'json' : 'cpp'}
                                value={activeFile.content}
                                theme={settings.theme}
                                onChange={handleUpdateContent}
                                onMount={(editor) => {
                                    editor.onDidChangeCursorPosition((e) => {
                                        setCursorPos({ line: e.position.lineNumber, col: e.position.column })
                                    })
                                    // This block is inserted here based on the user's instruction,
                                    // but it seems to be out of context for an Editor's onMount.
                                }}
                                options={{
                                    fontSize: settings.fontSize,
                                    fontFamily: settings.fontFamily,
                                    minimap: { enabled: settings.minimap },
                                    wordWrap: settings.wordWrap,
                                    lineNumbers: settings.lineNumbers as any,
                                    tabSize: settings.tabSize,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16 }
                                }}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-white/20">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl mb-4 flex items-center justify-center">
                                    <IDELogo />
                                </div>
                                <p>Select a file to edit</p>
                                <p className="text-xs mt-2 opacity-50">CMD + P to search files</p>
                            </div>
                        )}
                    </div>

                    {/* Terminal / Output Panel */}
                    <div className={cn("bg-[#1e1e1e] border-t border-[#333] flex flex-col shrink-0", isMobile ? "h-32 mb-12" : "h-48")}>
                        <div className="h-7 bg-[#1e1e1e] flex items-center px-4 gap-6 text-[11px] uppercase tracking-wide text-[#969696] shrink-0 border-b border-[#333]">
                            <div
                                onClick={() => setTerminalTab("output")}
                                className={cn("flex items-center gap-1.5 cursor-pointer h-full border-b-[1px]", terminalTab === "output" ? "text-white border-[#e7e7e7]" : "hover:text-[#cccccc] border-transparent")}
                            >
                                <TerminalIcon size={12} />
                                <span>Output</span>
                            </div>
                            <div
                                onClick={() => setTerminalTab("problems")}
                                className={cn("flex items-center gap-1.5 cursor-pointer h-full border-b-[1px]", terminalTab === "problems" ? "text-white border-[#e7e7e7]" : "hover:text-[#cccccc] border-transparent")}
                            >
                                <div className={cn("w-2 h-2 rounded-full", buildErrors.length > 0 ? "bg-red-500" : "bg-transparent border border-[#969696]")} />
                                <span>Problems {buildErrors.length > 0 ? `(${buildErrors.length})` : ""}</span>
                            </div>
                            <div
                                onClick={() => setTerminalTab("serial")}
                                className={cn("flex items-center gap-1.5 cursor-pointer h-full border-b-[1px]", terminalTab === "serial" ? "text-white border-[#e7e7e7]" : "hover:text-[#cccccc] border-transparent")}
                            >
                                <Monitor size={12} />
                                <span>Serial Monitor</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 font-mono text-[12px] space-y-0.5 bg-[#1e1e1e]">
                            {terminalTab === "output" ? (
                                consoleOutput.map((log, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="opacity-30 select-none">{log.match(/\[(.*?)\]/)?.[0] || ">"}</span>
                                        <span className={cn(
                                            log.includes("ERROR") ? "text-red-400" :
                                                log.includes("SUCCESS") ? "text-green-400" : "text-[#cccccc]"
                                        )}>
                                            {log.replace(/\[.*?\]/, "")}
                                        </span>
                                    </div>
                                ))
                            ) : terminalTab === "problems" ? (
                                <div className="text-[#cccccc]">
                                    {buildErrors.length > 0 ? buildErrors.map((e, i) => (
                                        <div key={i} className="flex gap-2 text-red-400 items-start">
                                            <XCircle size={14} className="mt-0.5 shrink-0" />
                                            <span>{e}</span>
                                        </div>
                                    )) : (
                                        <div className="flex items-center gap-2 opacity-50">
                                            <CheckCircle2 size={14} />
                                            <span>No problems have been detected in the workspace.</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[#cccccc]/50 mb-2 border-b border-white/5 pb-1">
                                        <span>Serial Port: {isSerialConnected ? "CONNECTED" : "DISCONNECTED"}</span>
                                        <span>Baud: {settings.baudRate}</span>
                                    </div>
                                    {isSerialConnected ? (
                                        consoleOutput.filter(l => l.includes("ESP:") || l.includes("BOOT:") || l.includes("FLASH:")).map((log, i) => (
                                            <div key={i} className="text-[#cccccc]">{log.replace(/\[.*?\]/, "")}</div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-[#cccccc]/30 py-4">
                                            <Monitor size={32} className="mb-2 opacity-20" />
                                            <span>Connect a device to view serial output</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isMobile && (
                <div className="absolute bottom-0 inset-x-0 h-14 bg-[#1e1e1e] flex items-center justify-around z-[200] border-t border-[#333]">
                    <button onClick={() => { setActiveTab("explorer"); setShowMobileSidebar(true) }} className="p-2 text-[#cccccc] flex flex-col items-center gap-1 active:scale-95 transition-transform"><FilesIcon size={20} /><span className="text-[9px]">Explorer</span></button>
                    <button onClick={() => { setActiveTab("search"); setShowMobileSidebar(true) }} className="p-2 text-[#cccccc] flex flex-col items-center gap-1 active:scale-95 transition-transform"><SearchIcon size={20} /><span className="text-[9px]">Search</span></button>
                    <button onClick={handleBuild} className={cn("p-2 -mt-6 rounded-full bg-blue-600 text-white shadow-lg", compiling ? "animate-pulse" : "")}><Play size={24} fill="currentColor" /></button>
                    <button onClick={() => { setActiveTab("libraries"); setShowMobileSidebar(true) }} className="p-2 text-[#cccccc] flex flex-col items-center gap-1 active:scale-95 transition-transform"><Library size={20} /><span className="text-[9px]">Libs</span></button>
                    <button onClick={() => { setActiveTab("settings"); setShowMobileSidebar(true) }} className="p-2 text-[#cccccc] flex flex-col items-center gap-1 active:scale-95 transition-transform"><SlidersHorizontal size={20} /><span className="text-[9px]">Settings</span></button>
                </div>
            )}

            <IDEStatusBar
                file={activeFile?.name}
                line={cursorPos.line}
                col={cursorPos.col}
                status={status}
                board={settings.board}
            />

            {/* Info Footer (Desktop) using unused icons */}
            {!isMobile && (
                <div className="h-5 bg-[#007acc] text-white flex items-center justify-between px-3 text-[10px] select-none shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer">
                            <History size={10} />
                            <span>master</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer">
                            <XCircle size={10} />
                            <span>0</span>
                            <div className="w-[1px] h-3 bg-white/20 mx-0.5" />
                            <Activity size={10} />
                            <span>0</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer">
                            <Cpu size={10} />
                            <span>{parserReady ? "Ready" : "Loading..."}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function IDELogo() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg>
    )
}


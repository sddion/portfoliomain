import React, { useState, useRef, useEffect } from "react"
import { Upload, Usb, CircleAlert, CheckCircle, Trash2, Play, X, LogIn, UserPlus, Cloud, Save, History, Loader2, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/Supabase"
import { User } from "@supabase/supabase-js"

export function ESP32FlasherApp() {
    const [connected, setConnected] = useState(false)
    const [connecting, setConnecting] = useState(false)
    const [flashing, setFlashing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [chipInfo, setChipInfo] = useState("")
    const [logs, setLogs] = useState<string[]>([])
    const [error, setError] = useState("")
    const [files, setFiles] = useState<Array<{ file?: File; address: string; name: string; size: number; cloudPath?: string }>>([])
    const [baudRate, setBaudRate] = useState(115200)

    // Auth & Cloud State
    const [user, setUser] = useState<User | null>(null)
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'none'>('none')
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [authLoading, setAuthLoading] = useState(false)
    const [cloudFiles, setCloudFiles] = useState<any[]>([])
    const [view, setView] = useState<'flasher' | 'gallery'>('flasher')
    const [uploading, setUploading] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const portRef = useRef<any>(null)
    const esploaderRef = useRef<any>(null)

    const supported = typeof window !== "undefined" && "serial" in navigator

    // Check auth on mount
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
            if (user) fetchCloudFiles(user.id)
        })
    }, [])

    const fetchCloudFiles = async (userId: string) => {
        const { data, error } = await supabase
            .from('bins')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (!error && data) setCloudFiles(data)
    }

    const handleAuth = async (mode: 'login' | 'signup') => {
        setAuthLoading(true)
        setError("")
        try {
            const { data, error } = mode === 'login'
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password })

            if (error) throw error
            if (data.user) {
                setUser(data.user)
                setAuthMode('none')
                fetchCloudFiles(data.user.id)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setAuthLoading(false)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setCloudFiles([])
        setView('flasher')
    }

    const calculateHash = async (file: File) => {
        const buffer = await file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
    }

    const saveToCloud = async (file: File, address: string) => {
        if (!user) {
            setAuthMode('login')
            return
        }

        setUploading(true)
        setError("")
        try {
            const hash = await calculateHash(file)

            // Check if file already exists for this user
            const { data: existing } = await supabase
                .from('bins')
                .select('*')
                .eq('user_id', user.id)
                .eq('hash', hash)
                .single()

            if (existing) {
                addLog(`File already in cloud: ${file.name}`)
                fetchCloudFiles(user.id)
                return
            }

            const fileName = `${user.id}/${Date.now()}_${file.name.replace(/\s/g, '_')}`
            const { error: uploadError } = await supabase.storage
                .from('personalized')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { error: dbError } = await supabase
                .from('bins')
                .insert({
                    user_id: user.id,
                    name: file.name,
                    size: file.size,
                    address: address,
                    storage_path: fileName,
                    hash: hash
                })

            if (dbError) throw dbError

            addLog(`Successfully saved ${file.name} to cloud`)
            fetchCloudFiles(user.id)
        } catch (err: any) {
            setError(`Cloud save failed: ${err.message}`)
        } finally {
            setUploading(false)
        }
    }

    const loadFromCloud = async (cloudFile: any) => {
        try {
            addLog(`Downloading ${cloudFile.name}...`)
            const { data, error } = await supabase.storage
                .from('personalized')
                .download(cloudFile.storage_path)

            if (error) throw error

            const file = new File([data], cloudFile.name, { type: 'application/octet-stream' })
            setFiles(prev => [...prev, {
                file,
                name: cloudFile.name,
                size: cloudFile.size,
                address: cloudFile.address,
                cloudPath: cloudFile.storage_path
            }])
            setView('flasher')
            addLog(`Ready to flash: ${cloudFile.name}`)
        } catch (err: any) {
            setError(`Failed to download: ${err.message}`)
        }
    }

    const addLog = (message: string) => {
        setLogs((prev: string[]) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-50))
    }

    const handleConnect = async () => {
        if (!supported) {
            setError("Web Serial API not supported. Use Chrome or Edge browser.")
            return
        }

        setConnecting(true)
        setError("")
        addLog("Requesting serial port...")

        try {
            const port = await (navigator as any).serial.requestPort()
            await port.open({ baudRate: baudRate })
            portRef.current = port

            addLog("Port opened successfully")
            const { Transport, ESPLoader } = await import("esptool-js")
            const transport = new Transport(port, true)
            const loader = new ESPLoader({
                transport,
                baudrate: baudRate,
                romBaudrate: baudRate,
                terminal: {
                    clean: () => setLogs([]),
                    writeLine: (data: string) => addLog(data),
                    write: (data: string) => addLog(data),
                },
            })

            esploaderRef.current = loader
            const chip = await loader.main()
            setChipInfo(`${chip} detected`)
            addLog(`Connected to ${chip}!`)
            setConnected(true)
        } catch (err: any) {
            setError(err.message || "Failed to connect. Make sure ESP32 is in bootloader mode.")
            addLog(`Error: ${err.message}`)
        } finally {
            setConnecting(false)
        }
    }

    const handleDisconnect = async () => {
        if (portRef.current) {
            try {
                await portRef.current.close()
                portRef.current = null
                esploaderRef.current = null
                setConnected(false)
                setChipInfo("")
                addLog("Disconnected")
            } catch (err: any) {
                addLog(`Disconnect error: ${err.message}`)
            }
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        const newFiles = selectedFiles.map(file => ({
            file,
            name: file.name,
            size: file.size,
            address: "0x10000"
        }))
        setFiles((prev: any[]) => [...prev, ...newFiles])
        addLog(`Added ${selectedFiles.length} local file(s)`)
    }

    const removeFile = (index: number) => {
        setFiles((prev: any[]) => prev.filter((_, i) => i !== index))
    }

    const updateAddress = (index: number, address: string) => {
        setFiles((prev: any[]) => prev.map((f, i) => i === index ? { ...f, address } : f))
    }

    const handleFlash = async () => {
        if (files.length === 0) {
            setError("Please select at least one .bin file")
            return
        }

        setFlashing(true)
        setError("")
        setProgress(0)
        addLog("Starting flash operation...")

        try {
            const loader = esploaderRef.current
            if (!loader) throw new Error("Not connected")

            const fileArray = await Promise.all(
                files.map(async ({ file, address }) => {
                    const arrayBuffer = await file!.arrayBuffer()
                    return {
                        data: new Uint8Array(arrayBuffer),
                        address: parseInt(address, 16)
                    }
                })
            )

            addLog(`Flashing ${files.length} file(s)...`)
            await loader.writeFlash({
                fileArray,
                flashSize: "keep",
                flashMode: "keep",
                flashFreq: "keep",
                eraseAll: false,
                compress: true,
                reportProgress: (fileIndex: number, written: number, total: number) => {
                    const percent = Math.round((written / total) * 100)
                    setProgress(percent)
                    if (written % 10000 < 1000) {
                        addLog(`Writing file ${fileIndex + 1}: ${percent}%`)
                    }
                }
            })

            addLog("Flash complete!")
            addLog("Hard resetting via RTS pin...")
            await loader.hardReset()
            setProgress(100)
        } catch (err: any) {
            setError(err.message || "Flash failed")
            addLog(`Flash error: ${err.message}`)
        } finally {
            setFlashing(false)
        }
    }

    const handleErase = async () => {
        if (!window.confirm("This will erase all flash memory. Continue?")) return
        setFlashing(true)
        setError("")
        addLog("Erasing flash...")
        try {
            const loader = esploaderRef.current
            if (!loader) throw new Error("Not connected")
            await loader.eraseFlash()
            addLog("Flash erased successfully!")
        } catch (err: any) {
            setError(err.message || "Erase failed")
            addLog(`Erase error: ${err.message}`)
        } finally {
            setFlashing(false)
        }
    }

    return (
        <div className="h-full bg-[var(--background)] text-[var(--foreground)] font-mono overflow-auto flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 select-none">
            {/* Main Cyber Container */}
            <div className="relative w-full max-w-none bg-[var(--os-surface)] border-2 border-[var(--primary)]/40 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,107,0,0.1)] flex flex-col my-4 sm:my-0">

                {/* Header Section */}
                <div className="relative pt-6 pb-4 px-8 border-b border-white/5 bg-black/20 flex flex-col items-center">
                    <div className="flex items-center gap-6 w-full justify-center">
                        <h1 className="text-xl sm:text-2xl font-black tracking-[0.2em] text-[var(--foreground)] uppercase">
                            ESP32 <span className="text-[var(--primary)]">Flasher</span> Tools
                        </h1>
                    </div>

                    {/* Control Bar */}
                    <div className="w-full flex items-center justify-between mt-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('flasher')}
                                className={`px-4 py-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'flasher' ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/5'}`}
                            >
                                <Usb size={12} /> Flasher
                            </button>
                            {user && (
                                <button
                                    onClick={() => setView('gallery')}
                                    className={`px-4 py-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'gallery' ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/5'}`}
                                >
                                    <History size={12} /> Gallery
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] opacity-60 truncate max-w-[100px]">{user.email}</span>
                                    <button onClick={handleSignOut} className="p-1 hover:text-red-400">
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAuthMode('login')}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase border border-[var(--primary)]/40 px-3 py-1 hover:bg-[var(--primary)]/10 transition-colors"
                                >
                                    <LogIn size={12} /> Login to Save
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Auth Portal Overlay */}
                {authMode !== 'none' && (
                    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="w-full max-w-sm bg-[var(--os-surface)] border border-[var(--primary)]/20 p-8 rounded shadow-2xl space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-black uppercase tracking-widest">
                                    {authMode === 'login' ? 'Authentication Required' : 'Access Portal v2.0'}
                                </h2>
                                <p className="text-[9px] opacity-60">Join the cloud network to store and access firmware binaries.</p>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="NETWORK ID (EMAIL)"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 px-4 py-3 text-xs outline-none focus:border-[var(--primary)]"
                                />
                                <input
                                    type="password"
                                    placeholder="ACCESS CODE"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 px-4 py-3 text-xs outline-none focus:border-[var(--primary)]"
                                />
                                {error && (
                                    <div className="flex items-center gap-2 mb-2 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">
                                        <CircleAlert size={12} className="text-red-500 shrink-0" />
                                        <p className="text-[9px] text-red-500 uppercase font-black">{error}</p>
                                    </div>
                                )}
                                <button
                                    disabled={authLoading}
                                    onClick={() => handleAuth(authMode === 'login' ? 'login' : 'signup')}
                                    className="w-full bg-[var(--primary)] py-3 font-black uppercase text-xs flex items-center justify-center gap-2"
                                >
                                    {authLoading ? <Loader2 size={16} className="animate-spin" /> : (authMode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />)}
                                    {authMode === 'login' ? 'ESTABLISH LINK' : 'INITIALIZE PROFILE'}
                                </button>
                                <button
                                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                                    className="w-full text-[9px] opacity-40 hover:opacity-100 uppercase font-black tracking-widest"
                                >
                                    {authMode === 'login' ? 'Create New Network ID' : 'Existing Profile Detected? Login'}
                                </button>
                                <button
                                    onClick={() => setAuthMode('none')}
                                    className="w-full text-[9px] opacity-20 hover:opacity-100 uppercase"
                                >
                                    Proceed without Cloud
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-auto">
                    {view === 'flasher' ? (
                        <div className="p-4 sm:p-6 space-y-6">
                            {/* File Drop/Selection Area */}
                            <div
                                className={`relative border-2 ${files.length > 0 ? 'border-[var(--primary)]/60' : 'border-[var(--primary)]/30'} border-dashed rounded-md bg-black/20 p-8 flex flex-col items-center transition-all duration-300 group hover:border-[var(--primary)]`}
                                onClick={() => !flashing && fileInputRef.current?.click()}
                            >
                                <input ref={fileInputRef} type="file" accept=".bin" multiple onChange={handleFileSelect} className="hidden" />
                                <div className="w-16 h-16 mb-4 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
                                    <Upload size={48} strokeWidth={1.5} className={uploading ? 'animate-bounce' : ''} />
                                </div>
                                <p className="text-[var(--primary)] text-sm font-bold tracking-widest uppercase mb-4">
                                    {files.length > 0 ? `${files.length} Files Initialized` : 'Protocol: Upload Firmware'}
                                </p>
                                <button className="px-6 py-2 border border-[var(--accent)] text-[var(--accent)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--accent)]/10">
                                    Fetch Binaries
                                </button>
                            </div>

                            {/* Info Section */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4">
                                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--accent)]">
                                        <div className="flex items-center gap-2">
                                            {progress === 100 && !flashing && <CheckCircle size={10} className="text-green-500" />}
                                            {flashing ? `Flashing: ${progress}%` : progress === 100 ? 'Flash Success' : error ? 'System Fault' : 'Ready for Uplink'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {!connected && (
                                            <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded border border-[var(--accent)]/20">
                                                <span className="text-[8px] opacity-60">BAUD:</span>
                                                <select
                                                    value={baudRate}
                                                    onChange={(e) => setBaudRate(Number(e.target.value))}
                                                    className="bg-transparent text-[var(--accent)] text-[10px] outline-none"
                                                >
                                                    <option value={9600}>9600</option>
                                                    <option value={115200}>115200</option>
                                                    <option value={921600}>921600</option>
                                                </select>
                                            </div>
                                        )}
                                        <button
                                            onClick={connected ? handleDisconnect : handleConnect}
                                            disabled={connecting || flashing}
                                            className={`flex items-center gap-2 px-6 py-1.5 border ${connected ? 'border-red-500 text-red-500' : 'border-[var(--accent)] text-[var(--accent)]'} text-[10px] font-black tracking-widest uppercase`}
                                        >
                                            <Usb size={14} />
                                            {connecting ? 'Linking...' : connected ? 'Unlink' : 'Establish Link'}
                                        </button>
                                    </div>
                                </div>
                                <div className="h-4 w-full bg-black/20 border border-white/5 p-0.5 flex">
                                    <div className="h-full bg-[var(--primary)] transition-all" style={{ width: `${progress}%` }} />
                                </div>
                            </div>

                            {/* Files List */}
                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-[9px] font-black uppercase opacity-60 tracking-widest pl-1">Active Payload</h3>
                                    <div className="bg-black/20 border border-white/5 rounded divide-y divide-white/5">
                                        {files.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center gap-4 p-3 group">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[10px] font-bold truncate">{item.name}</div>
                                                    <div className="text-[8px] opacity-40 uppercase">Size: {(item.size / 1024).toFixed(1)} KB</div>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={item.address}
                                                    onChange={(e) => updateAddress(index, e.target.value)}
                                                    className="bg-black/40 border border-white/10 text-[var(--primary)] w-20 px-2 py-1 text-[9px] rounded"
                                                />
                                                <div className="flex gap-2">
                                                    {!item.cloudPath && (
                                                        <button
                                                            onClick={() => saveToCloud(item.file!, item.address)}
                                                            className="p-1.5 hover:text-[var(--primary)] opacity-40 hover:opacity-100 transition-all"
                                                            title="Save to Cloud"
                                                        >
                                                            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                                        </button>
                                                    )}
                                                    <button onClick={() => removeFile(index)} className="p-1.5 hover:text-red-400 opacity-40 hover:opacity-100">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Terminal Logs */}
                            <div className="space-y-2">
                                <h3 className="text-[9px] font-black uppercase opacity-60 tracking-widest pl-1">Terminal Stream</h3>
                                <div className="bg-black/60 border border-white/5 p-4 h-32 overflow-y-auto font-mono text-[9px] leading-relaxed select-text custom-scrollbar">
                                    {logs.length === 0 ? <span className="opacity-20 italic">Awaiting terminal signal...</span> : logs.map((log: string, i: number) => <div key={i} className="mb-0.5 opacity-80">{log}</div>)}
                                </div>
                            </div>

                            {/* Flash Controls */}
                            {connected && (
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={handleFlash}
                                        disabled={flashing || files.length === 0}
                                        className="flex-1 h-12 bg-[var(--primary)] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                                    >
                                        <Play size={16} fill="currentColor" />
                                        {flashing ? 'Flash in Progress...' : 'Execute Flash Sequence'}
                                    </button>
                                    <button
                                        onClick={handleErase}
                                        disabled={flashing}
                                        className="w-12 h-12 border border-red-500/40 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-colors"
                                        title="Full Chip Erase"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Gallery View */
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black uppercase tracking-widest">Saved Firmwares</h2>
                                <span className="text-[9px] opacity-40 uppercase">Autodelete in 30 days</span>
                            </div>

                            {cloudFiles.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg">
                                    <Cloud size={32} className="opacity-10 mb-4" />
                                    <p className="text-[10px] opacity-40 uppercase font-black">Cloud Storage is Empty</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cloudFiles.map((f: any, i: number) => (
                                        <div key={i} className="bg-black/20 border border-white/5 p-4 rounded hover:border-[var(--primary)]/40 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="min-w-0 pr-4">
                                                    <div className="text-[11px] font-bold truncate text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{f.name}</div>
                                                    <div className="text-[8px] opacity-40 font-mono mt-1">{f.hash.substring(0, 16)}...</div>
                                                </div>
                                                <div className="text-[9px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded">{f.address}</div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="text-[9px] opacity-40 uppercase">{(f.size / 1024).toFixed(1)} KB</div>
                                                <button
                                                    onClick={() => loadFromCloud(f)}
                                                    className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[var(--primary)] hover:bg-[var(--primary)]/10 px-3 py-1.5 rounded transition-all"
                                                >
                                                    <Cloud size={10} /> Load to Flasher
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Status */}
                <div className="px-6 py-2 bg-black/40 border-t border-white/5 flex justify-between items-center text-[8px] uppercase tracking-[0.2em] font-black text-white/30">
                    <div>CHIP: {chipInfo || 'AWAITING LINK'}</div>
                    <div className="flex gap-4">
                        <span className={connected ? 'text-green-500 animate-pulse' : ''}>{connected ? 'LINK STABLE' : 'NO LINK'}</span>
                        <span>v2.0.4-CLOUD</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--primary);
                    opacity: 0.3;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    opacity: 0.6;
                }
            `}</style>
        </div>
    )
}

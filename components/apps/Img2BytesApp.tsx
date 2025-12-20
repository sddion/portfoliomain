"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import {
    Upload,
    Copy,
    Download,
    AlertTriangle,
    CheckCircle,
    Image as ImageIcon,
    Code,
    Sparkles,
    Trash2,
    Plus,
    Play,
    Pause,
    Layers,
    Grid3X3,
    Sliders,
    Eye,
    FileCode,
    Images,
    ChevronDown
} from "lucide-react"
import {
    ProcessingOptions,
    OutputOptions,
    ConversionResult,
    DefaultProcessingOptions,
    DefaultOutputOptions,
    CanvasPresets,
    LoadImageFromFile,
    ProcessImage,
    GenerateCode,
    DownloadFile,
    CopyToClipboard
} from "@/lib/ImageProcessor"

interface ImageItem {
    id: string
    file: File
    image: HTMLImageElement
    name: string
    result: ConversionResult | null
}

type MobileTab = 'images' | 'settings' | 'output'

export function Img2BytesApp() {
    // Multi-image state
    const [images, setImages] = useState<ImageItem[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)

    // Options state
    const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>(DefaultProcessingOptions)
    const [outputOptions, setOutputOptions] = useState<OutputOptions>(DefaultOutputOptions)

    // UI state
    const [isDragging, setIsDragging] = useState(false)
    const [copied, setCopied] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [animationPlaying, setAnimationPlaying] = useState(false)
    const [animationFrame, setAnimationFrame] = useState(0)
    const [activePanel, setActivePanel] = useState<'settings' | 'output'>('settings')
    const [mobileTab, setMobileTab] = useState<MobileTab>('images')
    const [settingsExpanded, setSettingsExpanded] = useState<string | null>('canvas')

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null)
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number | null>(null)

    // Current selected image
    const currentImage = images[selectedIndex] || null

    // Process all images when options change
    useEffect(() => {
        if (images.length === 0) return

        setIsProcessing(true)
        const timer = setTimeout(() => {
            const updated = images.map(item => {
                try {
                    const result = ProcessImage(item.image, processingOptions)
                    return { ...item, result }
                } catch (error) {
                    console.error('Processing error:', error)
                    return item
                }
            })
            setImages(updated)
            setIsProcessing(false)
        }, 10)

        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processingOptions])

    // Update preview canvas when image or settings change
    useEffect(() => {
        const displayImage = animationPlaying ? images[animationFrame] : currentImage
        if (displayImage?.result && previewCanvasRef.current) {
            const ctx = previewCanvasRef.current.getContext('2d')
            if (ctx) {
                previewCanvasRef.current.width = displayImage.result.previewCanvas.width
                previewCanvasRef.current.height = displayImage.result.previewCanvas.height
                ctx.drawImage(displayImage.result.previewCanvas, 0, 0)
            }
        }
    }, [currentImage, animationPlaying, animationFrame, images, processingOptions])

    // Animation loop
    useEffect(() => {
        if (animationPlaying && images.length > 1) {
            const animate = () => {
                setAnimationFrame(prev => (prev + 1) % images.length)
                animationRef.current = window.setTimeout(() => {
                    requestAnimationFrame(animate)
                }, 200) as unknown as number
            }
            animate()
        } else {
            if (animationRef.current) {
                clearTimeout(animationRef.current)
            }
        }
        return () => {
            if (animationRef.current) {
                clearTimeout(animationRef.current)
            }
        }
    }, [animationPlaying, images.length])

    // File handling
    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return

        setIsProcessing(true)
        const newImages: ImageItem[] = []

        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue

            try {
                const img = await LoadImageFromFile(file)
                const result = ProcessImage(img, processingOptions)
                newImages.push({
                    id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    file,
                    image: img,
                    name: file.name,
                    result
                })
            } catch (error) {
                console.error('Failed to load image:', file.name, error)
            }
        }

        setImages(prev => [...prev, ...newImages])
        setIsProcessing(false)
        if (newImages.length > 0) {
            setMobileTab('settings')
        }
    }, [processingOptions])

    // Drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
    }, [handleFiles])

    // Remove image
    const removeImage = useCallback((index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        if (selectedIndex >= index && selectedIndex > 0) {
            setSelectedIndex(prev => prev - 1)
        }
    }, [selectedIndex])

    // Clear all
    const clearAll = useCallback(() => {
        setImages([])
        setSelectedIndex(0)
        setAnimationPlaying(false)
        setMobileTab('images')
    }, [])

    // Generate combined output
    const generateCombinedCode = useCallback(() => {
        if (images.length === 0) return ''

        const lines: string[] = []
        lines.push('// Generated by Img2Bytes Converter')
        lines.push(`// Animation frames: ${images.length}`)
        lines.push(`// Dimensions: ${processingOptions.canvasWidth}x${processingOptions.canvasHeight}`)
        lines.push(`// Color Mode: ${processingOptions.colorMode.toUpperCase()}`)
        lines.push('')

        if (outputOptions.includeSize) {
            lines.push(`#define ${outputOptions.variableName.toUpperCase()}_WIDTH ${processingOptions.canvasWidth}`)
            lines.push(`#define ${outputOptions.variableName.toUpperCase()}_HEIGHT ${processingOptions.canvasHeight}`)
            lines.push(`#define ${outputOptions.variableName.toUpperCase()}_FRAME_COUNT ${images.length}`)
            lines.push('')
        }

        images.forEach((item, index) => {
            if (!item.result) return
            const frameName = images.length === 1
                ? outputOptions.variableName
                : `${outputOptions.variableName}_frame${index}`
            lines.push(GenerateCode(item.result, { ...outputOptions, variableName: frameName }))
            lines.push('')
        })

        if (images.length > 1) {
            const progmem = outputOptions.progmem ? ' PROGMEM' : ''
            lines.push(`// Animation frames array`)
            lines.push(`const unsigned char* const ${outputOptions.variableName}_frames[]${progmem} = {`)
            images.forEach((_, index) => {
                const comma = index < images.length - 1 ? ',' : ''
                lines.push(`  ${outputOptions.variableName}_frame${index}${comma}`)
            })
            lines.push('};')
        }

        return lines.join('\n')
    }, [images, processingOptions, outputOptions])

    const generatedCode = generateCombinedCode()

    // Copy to clipboard
    const handleCopy = useCallback(async () => {
        const success = await CopyToClipboard(generatedCode)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }, [generatedCode])

    // Download
    const handleDownload = useCallback((extension: 'h' | 'txt') => {
        const baseName = images.length === 1
            ? images[0].name.replace(/\.[^/.]+$/, '')
            : 'animation'
        DownloadFile(generatedCode, `${baseName}.${extension}`)
    }, [generatedCode, images])

    // Update options
    const updateProcessing = useCallback(<K extends keyof ProcessingOptions>(
        key: K,
        value: ProcessingOptions[K]
    ) => {
        setProcessingOptions(prev => ({ ...prev, [key]: value }))
    }, [])

    const updateOutput = useCallback(<K extends keyof OutputOptions>(
        key: K,
        value: OutputOptions[K]
    ) => {
        setOutputOptions(prev => ({ ...prev, [key]: value }))
    }, [])

    // Memory calculation
    const totalBytes = images.reduce((sum, img) => sum + (img.result?.totalBytes || 0), 0)
    const memoryWarning = totalBytes > 32768
        ? { level: 'critical', message: `${totalBytes.toLocaleString()} bytes exceeds 32KB` }
        : totalBytes > 8192
            ? { level: 'warning', message: `${totalBytes.toLocaleString()} bytes exceeds 8KB` }
            : null

    // Accordion toggle
    const toggleSection = (section: string) => {
        setSettingsExpanded(prev => prev === section ? null : section)
    }

    // Settings Section Component
    const SettingsSection = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: React.ElementType, children: React.ReactNode }) => (
        <div className="border border-slate-700/50 rounded-xl overflow-hidden">
            <button
                onClick={() => toggleSection(id)}
                className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-cyan-400" />
                    <span className="text-sm font-medium">{title}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${settingsExpanded === id ? 'rotate-180' : ''}`} />
            </button>
            {settingsExpanded === id && (
                <div className="p-4 bg-slate-900/30 space-y-3">
                    {children}
                </div>
            )}
        </div>
    )

    // Upload Zone Component
    const UploadZone = ({ compact = false }: { compact?: boolean }) => (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${isDragging
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-slate-600 hover:border-cyan-500/50 hover:bg-slate-800/50'
                } ${compact ? 'py-6 px-4' : 'h-full p-8'}`}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/bmp,image/gif"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
            />
            <div className={`rounded-2xl bg-slate-800 flex items-center justify-center ${compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'}`}>
                <Upload size={compact ? 20 : 28} className="text-cyan-400" />
            </div>
            <p className={`font-medium text-slate-300 mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                {compact ? 'Add images' : 'Drop images here'}
            </p>
            {!compact && <p className="text-xs text-slate-500">or click to browse</p>}
            <p className={`text-slate-600 mt-2 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>PNG, JPG, BMP, GIF</p>
        </div>
    )

    // Preview Component - Fixed size, no zoom, stable during animation
    const Preview = ({ className = '' }: { className?: string }) => {
        const displayImage = animationPlaying ? images[animationFrame] : currentImage
        const hasImage = displayImage?.result

        return (
            <div className={`bg-slate-900/50 rounded-xl border border-slate-700/50 p-3 ${className}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
                        <Eye size={12} />
                        Preview
                        {animationPlaying && (
                            <span className="text-cyan-400 text-[10px]">
                                Frame {animationFrame + 1}/{images.length}
                            </span>
                        )}
                    </span>
                    {hasImage && (
                        <span className="text-[10px] text-slate-500">
                            {processingOptions.canvasWidth}×{processingOptions.canvasHeight}
                        </span>
                    )}
                </div>
                <div
                    className="relative bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:12px_12px] rounded-lg flex items-center justify-center"
                    style={{ minHeight: '160px', maxHeight: '200px' }}
                >
                    {hasImage ? (
                        <canvas
                            ref={previewCanvasRef}
                            style={{ imageRendering: 'pixelated', maxWidth: '100%', maxHeight: '180px' }}
                            className="border border-cyan-500/30"
                        />
                    ) : (
                        <div className="py-8 text-xs text-slate-500">No image selected</div>
                    )}
                    {isProcessing && (
                        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center rounded-lg">
                            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Settings Content
    const SettingsContent = () => (
        <div className="space-y-3">
            <SettingsSection id="canvas" title="Canvas Size" icon={Grid3X3}>
                <select
                    onChange={(e) => {
                        const preset = CanvasPresets[parseInt(e.target.value)]
                        if (preset && preset.width > 0) {
                            updateProcessing('canvasWidth', preset.width)
                            updateProcessing('canvasHeight', preset.height)
                        }
                    }}
                    className="w-full bg-slate-700/50 border border-slate-600 text-sm p-2 rounded-lg outline-none focus:border-cyan-500"
                >
                    {CanvasPresets.map((preset, i) => (
                        <option key={i} value={i} className="bg-slate-800">{preset.label}</option>
                    ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase">Width</label>
                        <input
                            type="number"
                            value={processingOptions.canvasWidth}
                            onChange={(e) => updateProcessing('canvasWidth', parseInt(e.target.value) || 1)}
                            className="w-full mt-1 bg-slate-700/50 border border-slate-600 text-sm p-2 rounded-lg outline-none focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase">Height</label>
                        <input
                            type="number"
                            value={processingOptions.canvasHeight}
                            onChange={(e) => updateProcessing('canvasHeight', parseInt(e.target.value) || 1)}
                            className="w-full mt-1 bg-slate-700/50 border border-slate-600 text-sm p-2 rounded-lg outline-none focus:border-cyan-500"
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection id="processing" title="Image Processing" icon={Sparkles}>
                <div>
                    <label className="text-[10px] text-slate-500 uppercase block mb-2">Background</label>
                    <div className="flex gap-2">
                        {(['white', 'black', 'transparent'] as const).map(bg => (
                            <button
                                key={bg}
                                onClick={() => updateProcessing('backgroundColor', bg)}
                                className={`flex-1 py-2 text-xs rounded-lg capitalize transition-all ${processingOptions.backgroundColor === bg
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                    : 'bg-slate-700/50 text-slate-400 border border-transparent hover:border-slate-600'
                                    }`}
                            >
                                {bg}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-slate-500 uppercase block mb-2">Scaling</label>
                    <select
                        value={processingOptions.scaling}
                        onChange={(e) => updateProcessing('scaling', e.target.value as ProcessingOptions['scaling'])}
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm p-2 rounded-lg outline-none focus:border-cyan-500"
                    >
                        <option value="original">Original Size</option>
                        <option value="fit">Scale to Fit</option>
                        <option value="stretch">Stretch to Fill</option>
                        <option value="stretchH">Stretch Horizontally</option>
                        <option value="stretchV">Stretch Vertically</option>
                    </select>
                </div>

                <div>
                    <label className="text-[10px] text-slate-500 uppercase block mb-2">Rotation</label>
                    <div className="flex gap-1">
                        {([0, 90, 180, 270] as const).map(deg => (
                            <button
                                key={deg}
                                onClick={() => updateProcessing('rotation', deg)}
                                className={`flex-1 py-2 text-xs rounded-lg transition-all ${processingOptions.rotation === deg
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                    : 'bg-slate-700/50 text-slate-400 border border-transparent hover:border-slate-600'
                                    }`}
                            >
                                {deg}°
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={processingOptions.flipH} onChange={(e) => updateProcessing('flipH', e.target.checked)} className="accent-cyan-500" />
                        <span className="text-xs text-slate-400">Flip H</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={processingOptions.centerH} onChange={(e) => updateProcessing('centerH', e.target.checked)} className="accent-cyan-500" />
                        <span className="text-xs text-slate-400">Center H</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={processingOptions.centerV} onChange={(e) => updateProcessing('centerV', e.target.checked)} className="accent-cyan-500" />
                        <span className="text-xs text-slate-400">Center V</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={processingOptions.invert} onChange={(e) => updateProcessing('invert', e.target.checked)} className="accent-cyan-500" />
                        <span className="text-xs text-slate-400">Invert</span>
                    </label>
                </div>
            </SettingsSection>

            <SettingsSection id="color" title="Color Mode" icon={ImageIcon}>
                <select
                    value={processingOptions.colorMode}
                    onChange={(e) => updateProcessing('colorMode', e.target.value as ProcessingOptions['colorMode'])}
                    className="w-full bg-slate-700/50 border border-slate-600 text-sm p-2 rounded-lg outline-none focus:border-cyan-500"
                >
                    <option value="mono">Monochrome (1-bit)</option>
                    <option value="grayscale">Grayscale (8-bit)</option>
                    <option value="rgb565">RGB565 (16-bit)</option>
                    <option value="rgb888">RGB888 (24-bit)</option>
                </select>

                {processingOptions.colorMode === 'mono' && (
                    <>
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase flex justify-between mb-1">
                                <span>Threshold</span>
                                <span className="text-cyan-400">{processingOptions.threshold}</span>
                            </label>
                            <input
                                type="range"
                                value={processingOptions.threshold}
                                onChange={(e) => updateProcessing('threshold', parseInt(e.target.value))}
                                min={0}
                                max={255}
                                className="w-full accent-cyan-500"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-500 uppercase block mb-2">Dithering</label>
                            <select
                                value={processingOptions.dithering}
                                onChange={(e) => updateProcessing('dithering', e.target.value as ProcessingOptions['dithering'])}
                                className="w-full bg-slate-700/50 border border-slate-600 text-sm p-2 rounded-lg outline-none focus:border-cyan-500"
                            >
                                <option value="none">None</option>
                                <option value="floydSteinberg">Floyd-Steinberg</option>
                                <option value="atkinson">Atkinson</option>
                                <option value="bayer">Bayer (Ordered)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-500 uppercase block mb-2">Byte Orientation</label>
                            <div className="flex gap-2">
                                {(['horizontal', 'vertical'] as const).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => updateProcessing('drawMode', mode)}
                                        className={`flex-1 py-2 text-xs rounded-lg capitalize transition-all ${processingOptions.drawMode === mode
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                            : 'bg-slate-700/50 text-slate-400 border border-transparent hover:border-slate-600'
                                            }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </SettingsSection>

            <SettingsSection id="output" title="Output Options" icon={Code}>
                <div>
                    <label className="text-[10px] text-slate-500 uppercase block mb-1">Variable Name</label>
                    <input
                        type="text"
                        value={outputOptions.variableName}
                        onChange={(e) => updateOutput('variableName', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm p-2 rounded-lg outline-none focus:border-cyan-500"
                    />
                </div>

                <div>
                    <label className="text-[10px] text-slate-500 uppercase block mb-2">Format</label>
                    <div className="flex gap-2">
                        {(['hex', 'decimal', 'binary'] as const).map(fmt => (
                            <button
                                key={fmt}
                                onClick={() => updateOutput('format', fmt)}
                                className={`flex-1 py-2 text-xs rounded-lg capitalize transition-all ${outputOptions.format === fmt
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                    : 'bg-slate-700/50 text-slate-400 border border-transparent hover:border-slate-600'
                                    }`}
                            >
                                {fmt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={outputOptions.progmem} onChange={(e) => updateOutput('progmem', e.target.checked)} className="accent-cyan-500" />
                        <span className="text-xs text-slate-400">PROGMEM</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={outputOptions.includeSize} onChange={(e) => updateOutput('includeSize', e.target.checked)} className="accent-cyan-500" />
                        <span className="text-xs text-slate-400">Size Defines</span>
                    </label>
                </div>
            </SettingsSection>
        </div>
    )

    // Output Content
    const OutputContent = () => (
        <div className="space-y-4 flex flex-col h-full">
            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleCopy}
                    disabled={!generatedCode}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${copied
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50 disabled:opacity-50'
                        }`}
                >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                    onClick={() => handleDownload('h')}
                    disabled={!generatedCode}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                    <Download size={14} />
                    .h
                </button>
                <button
                    onClick={() => handleDownload('txt')}
                    disabled={!generatedCode}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                    <Download size={14} />
                    .txt
                </button>
            </div>

            {/* Memory Warning */}
            {memoryWarning && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${memoryWarning.level === 'critical'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                    <AlertTriangle size={14} />
                    {memoryWarning.message}
                </div>
            )}

            {/* Stats */}
            {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                        { label: 'Frames', value: images.length },
                        { label: 'W', value: processingOptions.canvasWidth },
                        { label: 'H', value: processingOptions.canvasHeight },
                        { label: 'Bytes', value: totalBytes.toLocaleString() }
                    ].map(stat => (
                        <div key={stat.label} className="p-2 bg-slate-800/50 rounded-lg">
                            <div className="text-sm font-bold text-cyan-400">{stat.value}</div>
                            <div className="text-[9px] text-slate-500 uppercase">{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Code Output */}
            <div className="flex-1 min-h-0 relative">
                <pre className="h-full overflow-auto p-3 bg-slate-950 rounded-xl border border-slate-700/50 text-[10px] text-slate-300 font-mono leading-relaxed">
                    {generatedCode || '// Upload images to generate code'}
                </pre>
            </div>
        </div>
    )

    return (
        <div className="h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="shrink-0 px-4 py-3 border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Grid3X3 size={16} className="text-white sm:w-5 sm:h-5" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold tracking-tight">Img2Bytes</h1>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest hidden sm:block">Image → C/C++ Array</p>
                        </div>
                    </div>
                    {images.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">
                                {images.length} image{images.length !== 1 ? 's' : ''} • {totalBytes.toLocaleString()}B
                            </span>
                            <button onClick={clearAll} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Tab Bar */}
            <div className="shrink-0 flex border-b border-slate-700/50 lg:hidden">
                {[
                    { id: 'images' as const, label: 'Images', icon: Images, count: images.length },
                    { id: 'settings' as const, label: 'Settings', icon: Sliders },
                    { id: 'output' as const, label: 'Output', icon: FileCode }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setMobileTab(tab.id)}
                        className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${mobileTab === tab.id
                            ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-400'
                            : 'text-slate-400'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-[9px] rounded-full bg-cyan-500/20 text-cyan-400">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Desktop: Left Sidebar */}
                <div className="hidden lg:flex w-72 xl:w-80 shrink-0 border-r border-slate-700/50 flex-col bg-slate-900/30">
                    <div className="flex-1 overflow-auto p-3">
                        {images.length === 0 ? (
                            <UploadZone />
                        ) : (
                            <div className="space-y-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    <Plus size={14} /> Add Images
                                </button>

                                <div className="grid grid-cols-3 gap-2">
                                    {images.map((item, index) => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group transition-all ${selectedIndex === index ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : 'hover:ring-1 hover:ring-slate-500'
                                                }`}
                                        >
                                            <img src={item.image.src} alt={item.name} className="w-full h-full object-cover" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                            <span className="absolute bottom-1 left-1 text-[8px] text-white/80 bg-black/50 px-1 rounded">#{index + 1}</span>
                                        </div>
                                    ))}
                                </div>

                                {images.length > 1 && (
                                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                                                <Layers size={12} /> Animation
                                            </span>
                                            <span className="text-[10px] text-slate-500">{images.length} frames</span>
                                        </div>
                                        <button
                                            onClick={() => setAnimationPlaying(!animationPlaying)}
                                            className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${animationPlaying ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                        >
                                            {animationPlaying ? <Pause size={14} /> : <Play size={14} />}
                                            {animationPlaying ? 'Stop' : 'Play'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {currentImage && <Preview className="shrink-0 m-3 mt-0" />}
                </div>

                {/* Desktop: Right Panel */}
                <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
                    <div className="shrink-0 px-4 pt-4 flex gap-2">
                        <button
                            onClick={() => setActivePanel('settings')}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${activePanel === 'settings' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            <Sliders size={14} /> Settings
                        </button>
                        <button
                            onClick={() => setActivePanel('output')}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${activePanel === 'output' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            <FileCode size={14} /> Output
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        {activePanel === 'settings' ? <SettingsContent /> : <OutputContent />}
                    </div>
                </div>

                {/* Mobile: Tab Content */}
                <div className="flex-1 overflow-auto p-3 lg:hidden">
                    {mobileTab === 'images' && (
                        <>
                            {images.length === 0 ? (
                                <UploadZone />
                            ) : (
                                <div className="space-y-3">
                                    <UploadZone compact />

                                    <div className="grid grid-cols-4 gap-2">
                                        {images.map((item, index) => (
                                            <div
                                                key={item.id}
                                                onClick={() => setSelectedIndex(index)}
                                                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group transition-all ${selectedIndex === index ? 'ring-2 ring-cyan-400' : ''
                                                    }`}
                                            >
                                                <img src={item.image.src} alt={item.name} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <Trash2 size={8} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <Preview />

                                    {images.length > 1 && (
                                        <button
                                            onClick={() => setAnimationPlaying(!animationPlaying)}
                                            className={`w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${animationPlaying ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300'
                                                }`}
                                        >
                                            {animationPlaying ? <Pause size={16} /> : <Play size={16} />}
                                            {animationPlaying ? 'Stop Animation' : 'Play Animation'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                    {mobileTab === 'settings' && <SettingsContent />}
                    {mobileTab === 'output' && <OutputContent />}
                </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-4 py-2 bg-slate-900/50 border-t border-slate-700/50 flex justify-between items-center text-[9px] text-slate-500 uppercase tracking-wider">
                <span>100% Open Source</span>
                <span>Works Offline</span>
            </div>
        </div>
    )
}

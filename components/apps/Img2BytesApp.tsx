"use client"

import React, { useState, useRef, useCallback, useEffect, startTransition } from "react"
import {
    Upload,
    Copy,
    Download,
    CheckCircle,
    Image as ImageIcon,
    Grid3X3,
    Trash2,
    Play,
    Pause,
    Layers,
    ChevronDown,
    Settings,
    ScanLine,
    RotateCw,
    FlipHorizontal,
    Move,
    Palette,
    Code,
    Sliders,
    Eye
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
import { AdUnit } from "@/components/os/AdUnit"

interface ImageItem {
    id: string
    file: File
    image: HTMLImageElement
    name: string
    result: ConversionResult | null
}

type MobileTab = 'settings' | 'preview' | 'code'

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
    const [expandedSection, setExpandedSection] = useState<string | null>('canvas')
    const [mobileTab, setMobileTab] = useState<MobileTab>('preview')

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null)
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number | null>(null)

    // Current selected image
    const currentImage = images[selectedIndex] || null

    // Detect mobile
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

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
            setMobileTab('preview')
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
        startTransition(() => {
            setImages(prev => prev.filter((_, i) => i !== index))
            if (selectedIndex >= index && selectedIndex > 0) {
                setSelectedIndex(prev => prev - 1)
            }
        })
    }, [selectedIndex])

    // Clear all
    const clearAll = useCallback(() => {
        startTransition(() => {
            setImages([])
            setSelectedIndex(0)
            setAnimationPlaying(false)
        })
    }, [])

    // Generate combined output
    const generateCombinedCode = useCallback(() => {
        if (images.length === 0) return ''

        const lines: string[] = []
        lines.push(`// C++ Byte Array - ${processingOptions.canvasWidth}x${processingOptions.canvasHeight} ${processingOptions.colorMode === 'mono' ? 'Monochrome' : processingOptions.colorMode}`)

        if (outputOptions.includeSize) {
            lines.push(`#define ${outputOptions.variableName.toUpperCase()}_WIDTH ${processingOptions.canvasWidth}`)
            lines.push(`#define ${outputOptions.variableName.toUpperCase()}_HEIGHT ${processingOptions.canvasHeight}`)
            lines.push('')
        }

        images.forEach((item, index) => {
            if (!item.result) return
            const frameName = images.length === 1
                ? outputOptions.variableName
                : `${outputOptions.variableName}_frame${index}`
            lines.push(GenerateCode(item.result, { ...outputOptions, variableName: frameName }))
            if (index < images.length - 1) lines.push('')
        })

        if (images.length > 1) {
            const progmem = outputOptions.progmem ? ' PROGMEM' : ''
            lines.push('')
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
    const totalBytes = images.reduce((sum, img) => sum + (img.result?.totalBytes || 0), 0)

    // Copy to clipboard
    const handleCopy = useCallback(async () => {
        const success = await CopyToClipboard(generatedCode)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }, [generatedCode])

    // Download
    const handleDownload = useCallback(() => {
        const baseName = images.length === 1
            ? images[0].name.replace(/\.[^/.]+$/, '')
            : 'animation'
        DownloadFile(generatedCode, `${baseName}.h`)
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

    // Syntax highlighting for code
    const highlightCode = (code: string) => {
        return code
            .replace(/(\/\/.*)/g, '<span class="text-slate-500">$1</span>')
            .replace(/(const|unsigned|char|int|PROGMEM)/g, '<span class="text-pink-400">$1</span>')
            .replace(/(\w+)(\[\]|\s*=)/g, '<span class="text-cyan-300">$1</span>$2')
            .replace(/(0x[0-9A-Fa-f]+)/g, '<span class="text-amber-300">$1</span>')
            .replace(/(#define)/g, '<span class="text-purple-400">$1</span>')
    }

    // Collapsible section component
    const Section = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: React.ElementType, children: React.ReactNode }) => (
        <div className="border border-slate-700/50 rounded-xl overflow-hidden">
            <button
                onClick={() => setExpandedSection(expandedSection === id ? null : id)}
                className="w-full px-3 py-2.5 flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-cyan-400" />
                    <span className="text-xs font-medium">{title}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedSection === id ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === id && (
                <div className="p-3 bg-slate-900/30 space-y-3">
                    {children}
                </div>
            )}
        </div>
    )

    // Toggle component
    const Toggle = ({ checked, onChange, label }: { checked: boolean, onChange: (v: boolean) => void, label: string }) => (
        <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-8 h-4 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                <div className={`w-3 h-3 rounded-full bg-white m-0.5 transition-transform ${checked ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-xs text-slate-300">{label}</span>
        </label>
    )

    // Settings Content Component
    const SettingsContent = () => (
        <div className="space-y-2">
            {/* Upload Button */}
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 border border-cyan-500/30 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
            >
                <Upload size={16} />
                Upload Image
            </button>

            {/* Thumbnail */}
            {currentImage && (
                <div className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-xl">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-600/50 bg-slate-800 shrink-0">
                        <img src={currentImage.image.src} alt={currentImage.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 truncate">{currentImage.name}</p>
                        <p className="text-[10px] text-slate-500">{currentImage.image.width}×{currentImage.image.height}</p>
                    </div>
                    <button onClick={clearAll} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* Canvas Size */}
            <Section id="canvas" title="Canvas Size" icon={Grid3X3}>
                <select
                    onChange={(e) => {
                        const preset = CanvasPresets[parseInt(e.target.value)]
                        if (preset && preset.width > 0) {
                            updateProcessing('canvasWidth', preset.width)
                            updateProcessing('canvasHeight', preset.height)
                        }
                    }}
                    className="w-full bg-slate-800/80 border border-slate-600/50 text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan-500/50"
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
                            className="w-full mt-1 bg-slate-800/80 border border-slate-600/50 text-xs p-2 rounded-lg outline-none focus:border-cyan-500/50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase">Height</label>
                        <input
                            type="number"
                            value={processingOptions.canvasHeight}
                            onChange={(e) => updateProcessing('canvasHeight', parseInt(e.target.value) || 1)}
                            className="w-full mt-1 bg-slate-800/80 border border-slate-600/50 text-xs p-2 rounded-lg outline-none focus:border-cyan-500/50"
                        />
                    </div>
                </div>
            </Section>

            {/* Color Mode */}
            <Section id="color" title="Color Mode" icon={Palette}>
                <div className="space-y-1">
                    {[
                        { value: 'mono', label: 'Monochrome (1-bit)' },
                        { value: 'grayscale', label: 'Grayscale (8-bit)' },
                        { value: 'rgb565', label: 'RGB565 (16-bit)' },
                        { value: 'rgb888', label: 'RGB888 (24-bit)' }
                    ].map(mode => (
                        <label
                            key={mode.value}
                            onClick={() => updateProcessing('colorMode', mode.value as ProcessingOptions['colorMode'])}
                            className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${processingOptions.colorMode === mode.value ? 'bg-slate-700/50' : 'hover:bg-slate-800/50'}`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${processingOptions.colorMode === mode.value ? 'border-cyan-400' : 'border-slate-500'}`}>
                                {processingOptions.colorMode === mode.value && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                            </div>
                            <span className="text-xs">{mode.label}</span>
                        </label>
                    ))}
                </div>

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
                            <div className="space-y-1">
                                {[
                                    { value: 'none', label: 'None' },
                                    { value: 'floydSteinberg', label: 'Floyd-Steinberg' },
                                    { value: 'atkinson', label: 'Atkinson' },
                                    { value: 'bayer', label: 'Bayer (Ordered)' }
                                ].map(dither => (
                                    <label
                                        key={dither.value}
                                        onClick={() => updateProcessing('dithering', dither.value as ProcessingOptions['dithering'])}
                                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${processingOptions.dithering === dither.value ? 'bg-slate-700/50' : 'hover:bg-slate-800/50'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${processingOptions.dithering === dither.value ? 'border-purple-400' : 'border-slate-500'}`}>
                                            {processingOptions.dithering === dither.value && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                                        </div>
                                        <span className="text-xs">{dither.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-500 uppercase block mb-2">Byte Orientation</label>
                            <div className="flex gap-2">
                                {(['horizontal', 'vertical'] as const).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => updateProcessing('drawMode', mode)}
                                        className={`flex-1 py-2 text-xs rounded-lg capitalize transition-all ${processingOptions.drawMode === mode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-700/50 text-slate-400 border border-transparent hover:border-slate-600'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </Section>

            {/* Image Processing */}
            <Section id="processing" title="Image Processing" icon={Sliders}>
                <div>
                    <label className="text-[10px] text-slate-500 uppercase block mb-2">Background</label>
                    <div className="flex gap-2">
                        {(['white', 'black', 'transparent'] as const).map(bg => (
                            <button
                                key={bg}
                                onClick={() => updateProcessing('backgroundColor', bg)}
                                className={`flex-1 py-2 text-xs rounded-lg capitalize transition-all ${processingOptions.backgroundColor === bg ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-700/50 text-slate-400 border border-transparent hover:border-slate-600'}`}
                            >
                                {bg}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5 mb-2">
                        <Move size={10} />
                        Scaling
                    </label>
                    <select
                        value={processingOptions.scaling}
                        onChange={(e) => updateProcessing('scaling', e.target.value as ProcessingOptions['scaling'])}
                        className="w-full bg-slate-800/80 border border-slate-600/50 text-xs p-2 rounded-lg outline-none focus:border-cyan-500/50"
                    >
                        <option value="original">Original Size</option>
                        <option value="fit">Scale to Fit</option>
                        <option value="stretch">Stretch to Fill</option>
                        <option value="stretchH">Stretch Horizontally</option>
                        <option value="stretchV">Stretch Vertically</option>
                    </select>
                </div>

                <div>
                    <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5 mb-2">
                        <RotateCw size={10} />
                        Rotation
                    </label>
                    <div className="flex gap-1">
                        {([0, 90, 180, 270] as const).map(deg => (
                            <button
                                key={deg}
                                onClick={() => updateProcessing('rotation', deg)}
                                className={`flex-1 py-2 text-xs rounded-lg transition-all ${processingOptions.rotation === deg ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-700/50 text-slate-400 border border-transparent hover:border-slate-600'}`}
                            >
                                {deg}°
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-1">
                    <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5 mb-2">
                        <FlipHorizontal size={10} />
                        Transform
                    </label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <Toggle checked={processingOptions.flipH} onChange={(v) => updateProcessing('flipH', v)} label="Flip H" />
                        <Toggle checked={processingOptions.centerH} onChange={(v) => updateProcessing('centerH', v)} label="Center H" />
                        <Toggle checked={processingOptions.centerV} onChange={(v) => updateProcessing('centerV', v)} label="Center V" />
                        <Toggle checked={processingOptions.invert} onChange={(v) => updateProcessing('invert', v)} label="Invert" />
                    </div>
                </div>
            </Section>

            {/* Output Options */}
            <Section id="output" title="Output Options" icon={Code}>
                <div>
                    <label className="text-[10px] text-slate-500 uppercase block mb-1">Variable Name</label>
                    <input
                        type="text"
                        value={outputOptions.variableName}
                        onChange={(e) => updateOutput('variableName', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        className="w-full bg-slate-800/80 border border-slate-600/50 text-xs p-2 rounded-lg outline-none focus:border-cyan-500/50"
                    />
                </div>

                <div>
                    <label className="text-[10px] text-slate-500 uppercase block mb-2">Format</label>
                    <div className="flex gap-2">
                        {(['hex', 'decimal', 'binary'] as const).map(fmt => (
                            <button
                                key={fmt}
                                onClick={() => updateOutput('format', fmt)}
                                className={`flex-1 py-2 text-xs rounded-lg capitalize transition-all ${outputOptions.format === fmt ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-slate-700/50 text-slate-400 border border-transparent hover:border-slate-600'}`}
                            >
                                {fmt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 pt-1">
                    <Toggle checked={outputOptions.progmem} onChange={(v) => updateOutput('progmem', v)} label="PROGMEM" />
                    <Toggle checked={outputOptions.includeSize} onChange={(v) => updateOutput('includeSize', v)} label="Size Defines" />
                </div>
            </Section>

            {/* Animation Controls */}
            {images.length > 1 && (
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-300 flex items-center gap-2">
                            <Layers size={12} className="text-purple-400" />
                            Animation
                        </span>
                        <span className="text-[10px] text-slate-500">{images.length} frames</span>
                    </div>
                    <button
                        onClick={() => setAnimationPlaying(!animationPlaying)}
                        className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${animationPlaying ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        {animationPlaying ? <Pause size={14} /> : <Play size={14} />}
                        {animationPlaying ? 'Stop' : 'Play'}
                    </button>
                </div>
            )}

            {/* In-App Ad Unit */}
            <div className="pt-4 border-t border-slate-700/50">
                <AdUnit slot="img2bytes-sidebar" format="auto" className="w-full" />
            </div>
        </div>
    )

    // Preview Content Component
    const PreviewContent = () => (
        <div className="h-full flex flex-col">
            <div
                className="flex-1 bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:16px_16px] rounded-xl flex items-center justify-center overflow-hidden relative border border-cyan-500/10"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !currentImage && fileInputRef.current?.click()}
                style={{ cursor: !currentImage ? 'pointer' : 'default' }}
            >
                {currentImage?.result ? (
                    <canvas
                        ref={previewCanvasRef}
                        style={{ imageRendering: 'pixelated', maxWidth: '100%', maxHeight: '100%' }}
                        className="border border-white/20 shadow-2xl"
                    />
                ) : (
                    <div className={`text-center p-8 ${isDragging ? 'opacity-100' : 'opacity-60'}`}>
                        <Upload size={40} className={`mx-auto mb-3 ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <p className="text-sm text-slate-400">Drop image here</p>
                        <p className="text-xs text-slate-600 mt-1">or tap to browse</p>
                    </div>
                )}
                {isProcessing && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {animationPlaying && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-purple-500/80 rounded-md text-[10px] font-bold">
                        Frame {animationFrame + 1}/{images.length}
                    </div>
                )}
            </div>
            {currentImage && (
                <div className="mt-3 text-center text-[10px] text-slate-500">
                    {processingOptions.canvasWidth}×{processingOptions.canvasHeight} • {totalBytes.toLocaleString()} bytes
                </div>
            )}
        </div>
    )

    // Code Content Component
    const CodeContent = () => (
        <div className="h-full flex flex-col">
            <div className="flex gap-2 mb-3">
                <button
                    onClick={handleDownload}
                    disabled={!generatedCode}
                    className="flex-1 py-2.5 bg-slate-700/50 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-slate-700 transition-colors disabled:opacity-40"
                >
                    <Download size={14} />
                    Download .h
                </button>
                <button
                    onClick={handleCopy}
                    disabled={!generatedCode}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-40'
                        }`}
                >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="flex-1 min-h-0 bg-[#0a0a12] rounded-xl overflow-auto border border-slate-700/50">
                <pre
                    className="p-3 text-[10px] font-mono leading-relaxed"
                    dangerouslySetInnerHTML={{
                        __html: generatedCode ? highlightCode(generatedCode) : '<span class="text-slate-600">// Upload an image to generate code</span>'
                    }}
                />
            </div>
        </div>
    )

    // Hidden file input
    const FileInput = () => (
        <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/bmp,image/gif"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
        />
    )

    // MOBILE LAYOUT
    if (isMobile) {
        return (
            <div className="h-full bg-[#0d0d1a] text-white flex flex-col">
                <FileInput />

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-3">
                    {mobileTab === 'settings' && <SettingsContent />}
                    {mobileTab === 'preview' && <PreviewContent />}
                    {mobileTab === 'code' && <CodeContent />}
                </div>

                {/* Bottom Tab Bar - Android Style */}
                <div className="shrink-0 bg-slate-900/95 border-t border-slate-700/50 backdrop-blur-xl">
                    <div className="flex">
                        {[
                            { id: 'settings' as const, label: 'Settings', icon: Settings },
                            { id: 'preview' as const, label: 'Preview', icon: Eye },
                            { id: 'code' as const, label: 'Code', icon: Code }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => startTransition(() => setMobileTab(tab.id))}
                                className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${mobileTab === tab.id
                                    ? 'text-cyan-400'
                                    : 'text-slate-500'
                                    }`}
                            >
                                <tab.icon size={20} />
                                <span className="text-[10px] font-medium">{tab.label}</span>
                                {mobileTab === tab.id && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // DESKTOP LAYOUT
    return (
        <div className="h-full bg-[#0d0d1a] text-white overflow-hidden flex flex-col">
            <FileInput />

            {/* Main Layout */}
            <div className="flex-1 flex flex-row gap-3 p-3 overflow-hidden">
                {/* Left Panel - Settings */}
                <div className="w-72 lg:w-80 shrink-0 overflow-auto custom-scrollbar">
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-3 shadow-xl shadow-cyan-500/5">
                        <h2 className="text-sm font-bold mb-3 flex items-center gap-2 px-1">
                            <Settings size={14} className="text-cyan-400" />
                            Image Settings
                        </h2>
                        <SettingsContent />
                    </div>
                </div>

                {/* Right Panel - Preview & Code */}
                <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
                    {/* Preview */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 shadow-xl shadow-cyan-500/5 flex-1 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <ScanLine size={14} className="text-cyan-400" />
                                Preview
                            </h2>
                            {currentImage && (
                                <span className="text-[10px] text-slate-500">
                                    {processingOptions.canvasWidth}×{processingOptions.canvasHeight} • {totalBytes.toLocaleString()} bytes
                                </span>
                            )}
                        </div>
                        <PreviewContent />
                    </div>

                    {/* Code Output */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 shadow-xl shadow-purple-500/5 h-56 flex flex-col shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <ImageIcon size={14} className="text-purple-400" />
                                Code Output
                            </h2>
                        </div>
                        <CodeContent />
                    </div>
                </div>
            </div>
        </div>
    )
}

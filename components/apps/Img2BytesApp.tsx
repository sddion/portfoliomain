"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
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
    Zap
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
    }, [])

    // Generate combined output
    const generateCombinedCode = useCallback(() => {
        if (images.length === 0) return ''

        const lines: string[] = []
        lines.push(`// C++ Byte Array - ${processingOptions.canvasWidth}x${processingOptions.canvasHeight} ${processingOptions.colorMode === 'mono' ? 'Monochrome' : processingOptions.colorMode}`)

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

    // Detect mobile
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
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

    return (
        <div className="h-full bg-[#0d0d1a] text-white overflow-hidden flex flex-col">
            {/* Main Layout */}
            <div className="flex-1 flex flex-col md:flex-row gap-3 p-3 overflow-hidden">
                {/* Left Panel - Image Settings */}
                <div className="w-full md:w-80 shrink-0 flex flex-col gap-3 overflow-auto">
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 shadow-xl shadow-cyan-500/5">
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <Settings size={14} className="text-cyan-400" />
                            Image Settings
                        </h2>

                        {/* Canvas Size */}
                        <div className="mb-4">
                            <label className="text-xs text-slate-400 block mb-2">Canvas Size</label>
                            <div className="flex gap-2">
                                <select
                                    onChange={(e) => {
                                        const preset = CanvasPresets[parseInt(e.target.value)]
                                        if (preset && preset.width > 0) {
                                            updateProcessing('canvasWidth', preset.width)
                                            updateProcessing('canvasHeight', preset.height)
                                        }
                                    }}
                                    className="flex-1 bg-slate-800/80 border border-slate-600/50 text-sm px-3 py-2 rounded-lg outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
                                >
                                    {CanvasPresets.slice(0, -1).map((preset, i) => (
                                        <option key={i} value={i} className="bg-slate-800">{preset.width}x{preset.height}</option>
                                    ))}
                                </select>
                                <button className="p-2 bg-slate-800/80 border border-slate-600/50 rounded-lg hover:border-cyan-500/50 transition-colors">
                                    <Grid3X3 size={16} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Color Mode */}
                        <div className="mb-4">
                            <label className="text-xs text-slate-400 block mb-2">Color Mode</label>
                            <div className="space-y-1">
                                {[
                                    { value: 'mono', label: 'Monochrome (1-bit)' },
                                    { value: 'grayscale', label: 'Grayscale (8-bit)' },
                                    { value: 'rgb565', label: 'RGB565 (16-bit)' }
                                ].map(mode => (
                                    <label
                                        key={mode.value}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${processingOptions.colorMode === mode.value ? 'bg-slate-700/50' : 'hover:bg-slate-800/50'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${processingOptions.colorMode === mode.value ? 'border-cyan-400' : 'border-slate-500'}`}>
                                            {processingOptions.colorMode === mode.value && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                                        </div>
                                        <span className="text-sm">{mode.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Dithering */}
                        {processingOptions.colorMode === 'mono' && (
                            <div className="mb-4">
                                <label className="text-xs text-slate-400 block mb-2">Dithering</label>
                                <div className="space-y-1">
                                    {[
                                        { value: 'none', label: 'None' },
                                        { value: 'floydSteinberg', label: 'Floyd-Steinberg' },
                                        { value: 'bayer', label: 'Bayer' }
                                    ].map(dither => (
                                        <label
                                            key={dither.value}
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${processingOptions.dithering === dither.value ? 'bg-slate-700/50' : 'hover:bg-slate-800/50'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${processingOptions.dithering === dither.value ? 'border-purple-400' : 'border-slate-500'}`}>
                                                {processingOptions.dithering === dither.value && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                                            </div>
                                            <span className="text-sm">{dither.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 bg-gradient-to-r from-slate-700/80 to-slate-800/80 border border-slate-600/50 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
                        >
                            <Upload size={16} className="text-cyan-400" />
                            Upload Image
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/bmp,image/gif"
                            multiple
                            onChange={(e) => handleFiles(e.target.files)}
                            className="hidden"
                        />

                        {/* Thumbnail */}
                        {currentImage && (
                            <div className="mt-4 flex items-center gap-3">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-600/50 bg-slate-800">
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

                        {/* Animation Controls */}
                        {images.length > 1 && (
                            <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
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
                    </div>
                </div>

                {/* Right Panel - Preview & Code */}
                <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
                    {/* Converted Preview */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 shadow-xl shadow-cyan-500/5 flex-1 min-h-0 flex flex-col">
                        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                            <Zap size={14} className="text-cyan-400" />
                            Converted Preview
                        </h2>
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
                                    <p className="text-xs text-slate-600 mt-1">or click to browse</p>
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
                    </div>

                    {/* Code Output */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 shadow-xl shadow-purple-500/5 h-52 md:h-60 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <ImageIcon size={14} className="text-purple-400" />
                                Code Output
                            </h2>
                            {currentImage && (
                                <span className="text-[10px] text-slate-500">
                                    {currentImage.result?.totalBytes.toLocaleString()} bytes
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-h-0 bg-[#0a0a12] rounded-xl overflow-auto border border-slate-700/50">
                            <pre
                                className="p-4 text-[11px] font-mono leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: generatedCode ? highlightCode(generatedCode) : '<span class="text-slate-600">// Upload an image to generate code</span>'
                                }}
                            />
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={handleCopy}
                                disabled={!generatedCode}
                                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed'
                                    }`}
                            >
                                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy to Clipboard'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

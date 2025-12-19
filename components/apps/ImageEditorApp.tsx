
"use client"

import React, { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { EditorToolbar } from '@/components/image-editor/EditorToolbar'
import { ExportDialog, ExportFormat } from '@/components/image-editor/ExportDialog'
import { useBackgroundRemoval } from '@/components/image-editor/useBackgroundRemoval'
import { CanvasStageRef } from '@/components/image-editor/CanvasStage'

// Dynamically import CanvasStage with no SSR because Konva uses window
const CanvasStage = dynamic(
    () => import('@/components/image-editor/CanvasStage').then(mod => mod.CanvasStage),
    { ssr: false }
)

export function ImageEditorApp() {
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
    const [isCropping, setIsCropping] = useState(false)
    const [showExportDialog, setShowExportDialog] = useState(false)

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null)
    const stageRef = useRef<CanvasStageRef>(null)

    // Background removal hook
    const {
        removeBackground,
        resultUrl,
        isProcessing,
        progress,
        error,
        reset
    } = useBackgroundRemoval()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Cleanup previous if exists
        if (originalImageUrl) URL.revokeObjectURL(originalImageUrl)

        const url = URL.createObjectURL(file)
        setOriginalImageUrl(url)
        reset() // Reset previous results
        setIsCropping(false)
    }

    const triggerFileSelect = () => {
        fileInputRef.current?.click()
    }

    const handleRemoveBackground = async () => {
        if (originalImageUrl) {
            await removeBackground(originalImageUrl)
        }
    }

    const handleToggleCrop = () => {
        setIsCropping(prev => !prev)
    }

    const handleConfirmCrop = () => {
        stageRef.current?.applyCrop()
        setIsCropping(false)
    }

    const handleExport = async (format: ExportFormat, quality: number, pixelRatio: number) => {
        if (!stageRef.current) return

        const dataUrl = stageRef.current.exportImage(format, quality, pixelRatio)

        if (dataUrl) {
            const link = document.createElement('a')
            link.href = dataUrl
            // Determine extension
            const ext = format.split('/')[1]
            link.download = `edited-image.${ext}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const handleReset = () => {
        if (originalImageUrl) URL.revokeObjectURL(originalImageUrl)
        setOriginalImageUrl(null)
        setIsCropping(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        reset()
    }

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            if (originalImageUrl) URL.revokeObjectURL(originalImageUrl)
        }
    }, [originalImageUrl])

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-white font-sans overflow-hidden">
            <EditorToolbar
                hasImage={!!originalImageUrl}
                hasResult={!!resultUrl}
                isProcessing={isProcessing}
                isCropping={isCropping}
                progress={progress}
                onOpenImage={triggerFileSelect}
                onRemoveBackground={handleRemoveBackground}
                onToggleCrop={handleToggleCrop}
                onConfirmCrop={handleConfirmCrop}
                onCancelCrop={() => setIsCropping(false)}
                onExport={() => setShowExportDialog(true)}
                onReset={handleReset}
            />

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <div className="flex-1 relative">
                <CanvasStage
                    ref={stageRef}
                    originalImageUrl={originalImageUrl}
                    resultImageUrl={resultUrl}
                    isCropping={isCropping}
                />

                {error && (
                    <div className="absolute bottom-4 left-4 right-4 z-50">
                        <div className="bg-red-500/90 text-white px-4 py-2 rounded shadow-lg backdrop-blur-sm text-sm">
                            Error: {error}
                        </div>
                    </div>
                )}
            </div>

            <ExportDialog
                open={showExportDialog}
                onOpenChange={setShowExportDialog}
                onExport={handleExport}
            />

            {/* Attribution / Info */}
            <div className="bg-zinc-900 border-t border-zinc-800 p-1 text-[10px] text-zinc-500 text-center select-none">
                Powered by Konva.js & @imgly/background-removal
            </div>
        </div>
    )
}

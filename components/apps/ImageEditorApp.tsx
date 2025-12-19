
"use client"

import React, { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { EditorToolbar } from '@/components/image-editor/EditorToolbar'
import { useBackgroundRemoval } from '@/components/image-editor/useBackgroundRemoval'

// Dynamically import CanvasStage with no SSR because Konva uses window
const CanvasStage = dynamic(
    () => import('@/components/image-editor/CanvasStage').then(mod => mod.CanvasStage),
    { ssr: false }
)

export function ImageEditorApp() {
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Background removal hook
    const {
        removeBackground,
        resultUrl,
        isProcessing,
        error,
        reset
    } = useBackgroundRemoval()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        setOriginalImageUrl(url)
        // Reset result when new image is loaded
        // Note: useBackgroundRemoval reset logic is handled if we called reset(), 
        // but here we just want to clear the result display, handled by prop passed to CanvasStage?
        // Actually, we should call reset() from the hook if we want to clear the hook's state.
        // But the hook exposes `removeBackground`, `resultUrl`. 
        // We can just ignore the old resultUrl or wrap the reset.
        // Let's implement reset in the App state or use the hook's reset if I added it.
        // I added `reset` to the hook.
    }

    const triggerFileSelect = () => {
        fileInputRef.current?.click()
    }

    const handleRemoveBackground = async () => {
        if (originalImageUrl) {
            await removeBackground(originalImageUrl)
        }
    }

    const handleDownload = () => {
        if (resultUrl) {
            const link = document.createElement('a')
            link.href = resultUrl
            link.download = 'removed-background.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const handleReset = () => {
        setOriginalImageUrl(null)
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
                onOpenImage={triggerFileSelect}
                onRemoveBackground={handleRemoveBackground}
                onDownload={handleDownload}
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
                    originalImageUrl={originalImageUrl}
                    resultImageUrl={resultUrl}
                />

                {error && (
                    <div className="absolute bottom-4 left-4 right-4 z-50">
                        <div className="bg-red-500/90 text-white px-4 py-2 rounded shadow-lg backdrop-blur-sm text-sm">
                            Error: {error}
                        </div>
                    </div>
                )}
            </div>

            {/* Attribution / Info */}
            <div className="bg-zinc-900 border-t border-zinc-800 p-1 text-[10px] text-zinc-500 text-center select-none">
                Powered by Konva.js & @imgly/background-removal
            </div>
        </div>
    )
}

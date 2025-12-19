
import React from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Scissors, Download, RefreshCw, Loader2 } from 'lucide-react'

interface EditorToolbarProps {
    hasImage: boolean
    hasResult: boolean
    isProcessing: boolean
    onOpenImage: () => void
    onRemoveBackground: () => void
    onDownload: () => void
    onReset: () => void
}

export function EditorToolbar({
    hasImage,
    hasResult,
    isProcessing,
    onOpenImage,
    onRemoveBackground,
    onDownload,
    onReset
}: EditorToolbarProps) {
    return (
        <div className="flex items-center gap-2 p-2 bg-[var(--os-surface)] border-b border-[var(--os-border)]">
            <Button
                variant="outline"
                size="sm"
                onClick={onOpenImage}
                disabled={isProcessing}
            >
                <ImagePlus className="w-4 h-4 mr-2" />
                Open Image
            </Button>

            <Button
                variant="default"
                size="sm"
                onClick={onRemoveBackground}
                disabled={!hasImage || isProcessing}
            >
                {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Scissors className="w-4 h-4 mr-2" />
                )}
                Remove Background
            </Button>

            <div className="flex-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                disabled={!hasImage || isProcessing}
            >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                disabled={!hasResult || isProcessing}
            >
                <Download className="w-4 h-4 mr-2" />
                Download
            </Button>
        </div>
    )
}

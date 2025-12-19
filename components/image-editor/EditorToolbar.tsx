import React from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Scissors, Download, RefreshCw, Loader2, Crop, Check, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface EditorToolbarProps {
    hasImage: boolean
    hasResult: boolean
    isProcessing: boolean
    isCropping: boolean
    progress: number
    onOpenImage: () => void
    onRemoveBackground: () => void
    onToggleCrop: () => void
    onConfirmCrop: () => void
    onCancelCrop: () => void
    onExport: () => void
    onReset: () => void
}

export function EditorToolbar({
    hasImage,
    hasResult,
    isProcessing,
    isCropping,
    progress,
    onOpenImage,
    onRemoveBackground,
    onToggleCrop,
    onConfirmCrop,
    onCancelCrop,
    onExport,
    onReset
}: EditorToolbarProps) {
    return (
        <div className="flex items-center gap-2 p-2 bg-[var(--os-surface)] border-b border-[var(--os-border)] h-14">
            <Button
                variant="outline"
                size="sm"
                onClick={onOpenImage}
                disabled={isProcessing || isCropping}
            >
                <ImagePlus className="w-4 h-4 mr-2" />
                Open
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
                variant={hasResult ? "default" : "secondary"}
                size="sm"
                onClick={onRemoveBackground}
                disabled={!hasImage || isProcessing || isCropping}
            >
                {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Scissors className="w-4 h-4 mr-2" />
                )}
                {isProcessing ? `Processing ${progress}%` : "Remove BG"}
            </Button>

            {hasResult && !isProcessing && (
                <>
                    <Separator orientation="vertical" className="h-6" />

                    {!isCropping ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onToggleCrop}
                        >
                            <Crop className="w-4 h-4 mr-2" />
                            Crop
                        </Button>
                    ) : (
                        <div className="flex bg-zinc-800 rounded-md p-0.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCancelCrop}
                                className="h-8 px-2 text-red-300 hover:text-red-200 hover:bg-red-900/50"
                            >
                                <X className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onConfirmCrop}
                                className="h-8 px-2 text-green-300 hover:text-green-200 hover:bg-green-900/50"
                            >
                                <Check className="w-4 h-4 mr-1" /> Apply
                            </Button>
                        </div>
                    )}
                </>
            )}

            <div className="flex-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                disabled={!hasImage || isProcessing || isCropping}
            >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={!hasResult || isProcessing || isCropping}
            >
                <Download className="w-4 h-4 mr-2" />
                Export
            </Button>
        </div>
    )
}

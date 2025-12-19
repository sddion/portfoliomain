
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Download, Loader2 } from 'lucide-react'

export type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp'

interface ExportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onExport: (format: ExportFormat, quality: number, pixelRatio: number) => Promise<void>
}

export function ExportDialog({ open, onOpenChange, onExport }: ExportDialogProps) {
    const [format, setFormat] = useState<ExportFormat>('image/png')
    const [quality, setQuality] = useState([0.9]) // 0-1
    const [pixelRatio, setPixelRatio] = useState([1]) // Scale
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            await onExport(format, quality[0], pixelRatio[0])
            onOpenChange(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-zinc-100 border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Export Image</DialogTitle>
                    <DialogDescription>
                        Choose format and quality settings for your download.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="format" className="text-right">
                            Format
                        </Label>
                        <Select
                            value={format}
                            onValueChange={(v) => setFormat(v as ExportFormat)}
                        >
                            <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-700">
                                <SelectValue placeholder="Format" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                                <SelectItem value="image/png">PNG (Transparent)</SelectItem>
                                <SelectItem value="image/jpeg">JPEG</SelectItem>
                                <SelectItem value="image/webp">WebP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quality" className="text-right">
                            Quality
                        </Label>
                        <div className="col-span-3">
                            <Slider
                                id="quality"
                                min={0.1}
                                max={1}
                                step={0.1}
                                value={quality}
                                onValueChange={setQuality}
                                className="w-[180px]"
                            />
                            <span className="text-xs text-zinc-500 ml-1">{Math.round(quality[0] * 100)}%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="scale" className="text-right">
                            Scale
                        </Label>
                        <div className="col-span-3">
                            <Slider
                                id="scale"
                                min={0.5}
                                max={3}
                                step={0.5}
                                value={pixelRatio}
                                onValueChange={setPixelRatio}
                                className="w-[180px]"
                            />
                            <span className="text-xs text-zinc-500 ml-1">{pixelRatio[0]}x Resolution</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

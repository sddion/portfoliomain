
import { useState, useCallback } from 'react'

interface BackgroundRemovalState {
    isProcessing: boolean
    progress: number
    error: string | null
    resultUrl: string | null
}

export function useBackgroundRemoval() {
    const [state, setState] = useState<BackgroundRemovalState>({
        isProcessing: false,
        progress: 0,
        error: null,
        resultUrl: null,
    })

    const removeBackground = useCallback(async (imageUrl: string) => {
        if (state.isProcessing) return null;

        setState({ isProcessing: true, progress: 0, error: null, resultUrl: null })

        try {
            const imgly = await import("@imgly/background-removal")
            
            // Total progress needs aggregation because multiple assets download
            // Simple approach: Map "fetching" phases to 0-50% and "processing" to 50-100%
            // or just use the raw bytes downloading for now.
            // @imgly progress callback: (key, current, total)
            
            const blob = await imgly.removeBackground(imageUrl, {
                progress: (key, current, total) => {
                    const percent = Math.round((current / total) * 100)
                    // We only update if significant change to avoid React thrashing
                    setState(prev => {
                        // Keep previous valid state, update progress
                        if (percent > prev.progress) {
                            return { ...prev, progress: percent }
                        }
                        return prev
                    })
                }
            })
            
            const url = URL.createObjectURL(blob)
            setState({ isProcessing: false, progress: 100, error: null, resultUrl: url })
            return url
        } catch (err: any) {
            console.error("Background removal failed:", err)
            setState({ 
                isProcessing: false, 
                progress: 0,
                error: err.message || "Failed to remove background", 
                resultUrl: null 
            })
            return null
        }
    }, [state.isProcessing])

    const reset = useCallback(() => {
        if (state.resultUrl) {
            URL.revokeObjectURL(state.resultUrl)
        }
        setState({ isProcessing: false, progress: 0, error: null, resultUrl: null })
    }, [state.resultUrl])

    return {
        ...state,
        removeBackground,
        reset
    }
}

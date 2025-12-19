
import { useState, useCallback } from 'react'

interface BackgroundRemovalState {
    isProcessing: boolean
    error: string | null
    resultUrl: string | null
}

export function useBackgroundRemoval() {
    const [state, setState] = useState<BackgroundRemovalState>({
        isProcessing: false,
        error: null,
        resultUrl: null,
    })

    const removeBackground = useCallback(async (imageUrl: string) => {
        setState(prev => ({ ...prev, isProcessing: true, error: null }))

        try {
            // Lazy load the library
            const imgly = await import("@imgly/background-removal")
            
            // The library works best if we pass the blob or url directly
            const blob = await imgly.removeBackground(imageUrl, {
                progress: (key, current, total) => {
                   // Optional: could expose progress
                   // console.log(`Downloading ${key}: ${current} of ${total}`);
                }
            })
            
            const url = URL.createObjectURL(blob)
            setState({ isProcessing: false, error: null, resultUrl: url })
            return url
        } catch (err: any) {
            console.error("Background removal failed:", err)
            setState({ 
                isProcessing: false, 
                error: err.message || "Failed to remove background", 
                resultUrl: null 
            })
            return null
        }
    }, [])

    const reset = useCallback(() => {
        if (state.resultUrl) {
            URL.revokeObjectURL(state.resultUrl)
        }
        setState({ isProcessing: false, error: null, resultUrl: null })
    }, [state.resultUrl])

    return {
        ...state,
        removeBackground,
        reset
    }
}

"use client"

import React, { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
    rating: number
    maxRating?: number
    onRatingChange?: (rating: number) => void
    readOnly?: boolean
    size?: number
    fillColor?: string
    emptyColor?: string
}

export function StarRating({
    rating,
    maxRating = 5,
    onRatingChange,
    readOnly = false,
    size = 16,
    fillColor = "text-amber-400 fill-amber-400",
    emptyColor = "text-zinc-600"
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0)

    return (
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {Array.from({ length: maxRating }, (_, i) => {
                const starValue = i + 1
                const isFilled = (hoverRating || rating) >= starValue

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={readOnly}
                        className={`transition-transform ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
                        onClick={() => !readOnly && onRatingChange?.(starValue)}
                        onMouseEnter={() => !readOnly && setHoverRating(starValue)}
                    >
                        <Star
                            size={size}
                            className={`transition-colors ${isFilled ? fillColor : emptyColor}`}
                        />
                    </button>
                )
            })}
        </div>
    )
}

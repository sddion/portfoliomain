"use client"

import React, { useState } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { StarRating } from "@/components/ui/star-rating"
import { useAppReviews, useSubmitReview } from "@/hooks/use-reviews"
import { ArrowLeft, Download, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AppDetailsProps {
    appId: string
    onBack: () => void
}

export function AppStoreDetails({ appId, onBack }: AppDetailsProps) {
    const { allApps, installApp, uninstallApp, isAppInstalled, openWindow } = useWindowManager()

    // Find the app from the window manager's registry
    // We cast to 'any' here briefly because our AppConfig extension with longDescription 
    // might not be fully inferred in the WindowManager context yet, 
    // but we know it exists from apps-config.ts
    const app = allApps.find(a => a.id === appId) as any

    const { reviews, averageRating, totalReviews, loading } = useAppReviews(appId)
    const { submitReview, submitting } = useSubmitReview()

    const [userRating, setUserRating] = useState(0)
    const [reviewText, setReviewText] = useState("")
    const [userName, setUserName] = useState("")
    const [showReviewForm, setShowReviewForm] = useState(false)

    if (!app) return <div className="p-8 text-center text-zinc-500">App not found</div>

    const isInstalled = isAppInstalled(appId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await submitReview(appId, userRating, reviewText, userName)
        if (success) {
            setShowReviewForm(false)
            setReviewText("")
            setUserRating(0)
        }
    }

    return (
        <div className="h-full flex flex-col bg-[#09090b] text-white overflow-hidden animate-in fade-in slide-in-from-right-10 duration-200">
            {/* Header / Nav */}
            <div className="p-4 border-b border-white/5 flex items-center gap-4 shrink-0 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <span className="font-bold text-lg">Back to Store</span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-8" style={{ overscrollBehaviorY: 'contain' }}>
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* App Hero */}
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0 shadow-2xl">
                            {React.cloneElement(app.icon, { size: 64 })}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">{app.title}</h1>
                                <div className="flex items-center gap-3 text-sm text-zinc-400">
                                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                        {app.category}
                                    </span>
                                    <span>•</span>
                                    <span>v1.0.0</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {isInstalled ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openWindow(app.id, app.title, app.component, app.icon, { width: app.width, height: app.height })}
                                            className="px-8 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            Open
                                        </button>
                                        <button
                                            onClick={() => uninstallApp(app.id)}
                                            className="px-4 py-2.5 rounded-full bg-zinc-800 hover:text-red-400 transition-colors"
                                        >
                                            Uninstall
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => installApp(app.id)}
                                        className="px-8 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    >
                                        <Download size={18} />
                                        Get
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6">
                        <div className="text-center border-r border-white/5">
                            <div className="flex items-center justify-center gap-1 font-bold text-xl md:text-2xl mb-1">
                                <span>{averageRating}</span>
                                <StarRating rating={Math.round(averageRating)} readOnly size={16} />
                            </div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest">{totalReviews} Ratings</div>
                        </div>
                        <div className="text-center border-r border-white/5">
                            <div className="font-bold text-xl md:text-2xl mb-1">#1</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest">{app.category}</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-xl md:text-2xl mb-1">E</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest">Everyone</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="font-bold text-xl mb-4">About</h3>
                        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {app.longDescription || app.description}
                        </p>
                    </div>

                    {/* Reviews */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl">Ratings & Reviews</h3>
                            {!showReviewForm && (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="text-blue-400 text-sm font-medium hover:underline"
                                >
                                    Write a Review
                                </button>
                            )}
                        </div>

                        {/* Review Form */}
                        {showReviewForm && (
                            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-white/10 p-6 rounded-xl mb-8 animate-in slide-in-from-top-4">
                                <h4 className="font-bold mb-4">Write a Review</h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            <StarRating rating={userRating} onRatingChange={setUserRating} size={24} />
                                            <span className="text-zinc-400 text-sm ml-2">{userRating > 0 ? `${userRating} Stars` : "Select rating"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            placeholder="Your Name"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Review</label>
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="Tell us what you think..."
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm h-32 focus:border-blue-500 outline-none resize-none"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowReviewForm(false)}
                                            className="px-4 py-2 rounded-lg hover:bg-white/5 text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || userRating === 0}
                                            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold"
                                        >
                                            {submitting ? "Posting..." : "Submit Review"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Reviews List */}
                        {loading ? (
                            <div className="text-center py-10 text-zinc-500">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-10 bg-zinc-900/30 rounded-xl border border-white/5">
                                <p className="text-zinc-400 mb-2">No reviews yet.</p>
                                <p className="text-sm text-zinc-600">Be the first to review this app!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {reviews.map(review => (
                                    <div key={review.id} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-sm tracking-tight">{review.user_name}</div>
                                                <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                                </div>
                                            </div>
                                            <StarRating rating={review.rating} readOnly size={12} />
                                        </div>
                                        <p className="text-sm text-zinc-300 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

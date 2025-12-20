"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/Supabase"
import { useNotifications } from "@/hooks/useNotifications"

export interface Review {
    id: string
    app_id: string
    user_name: string
    rating: number
    comment: string
    created_at: string
}

export function useAppReviews(appId: string) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [averageRating, setAverageRating] = useState(0)
    const [totalReviews, setTotalReviews] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        
        // Initial Fetch
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from("app_reviews")
                .select("*")
                .eq("app_id", appId)
                .order("created_at", { ascending: false })
            
            if (!error && data) {
                setReviews(data)
                calculateStats(data)
            }
            setLoading(false)
        }

        fetchReviews()

        // Realtime Subscription
        const subscription = supabase
            .channel(`reviews:${appId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "app_reviews", filter: `app_id=eq.${appId}` },
                (payload) => {
                    fetchReviews() // Re-fetch to keep it simple and consistent
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [appId])

    const calculateStats = (data: Review[]) => {
        setTotalReviews(data.length)
        if (data.length === 0) {
            setAverageRating(0)
            return
        }
        const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
        setAverageRating(Number((sum / data.length).toFixed(1)))
    }

    return { reviews, averageRating, totalReviews, loading }
}

export function useSubmitReview() {
    const [submitting, setSubmitting] = useState(false)
    const { showNotification } = useNotifications()

    const submitReview = async (appId: string, rating: number, comment: string, userName: string) => {
        setSubmitting(true)
        
        // Basic validation
        if (rating < 1 || rating > 5) {
            showNotification("Error", { body: "Please select a star rating." })
            setSubmitting(false)
            return false
        }

        const { error } = await supabase
            .from("app_reviews")
            .insert({
                app_id: appId,
                rating,
                comment,
                user_name: userName || "Guest"
            })

        setSubmitting(false)

        if (error) {
            console.error(error)
            showNotification("Failed", { body: "Could not submit review. Please try again." })
            return false
        }

        showNotification("Success", { body: "Review submitted successfully!" })
        return true
    }

    return { submitReview, submitting }
}

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || 'unknown'
    
    // Try to get IP from request body first (client-side fetch), then fall back to headers
    let ip = 'unknown'
    try {
      const body = await req.json()
      if (body.ip) ip = body.ip
    } catch (e) {
      // Body parsing failed or empty, ignore
    }

    if (ip === 'unknown') {
        ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
             headersList.get('x-real-ip') || 
             'unknown'
    }

    // Get the session token from the Authorization header
    const authHeader = headersList.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    // Create a Supabase client specifically for this request to forward the user's auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Call the database function
    const { data, error } = await supabase.rpc('sync_anonymous_profile', {
      user_ip: ip,
      user_ua: userAgent,
    })

    if (error) {
      console.error('Error syncing profile:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.error('Unexpected error in sync-profile:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

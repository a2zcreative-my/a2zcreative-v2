import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

function getR2() {
    try {
        const { env } = getRequestContext()
        return env.R2_BUCKET
    } catch {
        // @ts-expect-error - Cloudflare bindings available at runtime
        return globalThis.R2_BUCKET
    }
}

function getDB() {
    try {
        const { env } = getRequestContext()
        return env.DB
    } catch {
        // @ts-expect-error - Cloudflare bindings available at runtime
        return globalThis.DB
    }
}

async function getCurrentUser(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = cookieHeader.split(';').map(c => {
        const [name, ...rest] = c.trim().split('=')
        return { name: name || '', value: rest.join('=') }
    }).filter(c => c.name)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookies,
                setAll: () => { },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    return { user, supabase }
}

export async function POST(request: NextRequest) {
    try {
        const { user } = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.' }, { status: 400 })
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Max size is 2MB.' }, { status: 400 })
        }

        const r2 = getR2()
        if (!r2) {
            return NextResponse.json({ error: 'Storage not available' }, { status: 503 })
        }

        // Create unique key: avatars/userId/timestamp.ext
        const ext = file.type.split('/')[1]
        const key = `avatars/${user.id}/${Date.now()}.${ext}`

        // Upload to R2
        await r2.put(key, file.stream(), {
            httpMetadata: { contentType: file.type }
        })

        // Construct public URL (using our proxy route)
        const publicUrl = `/api/images/${key}`

        // Save avatar URL to D1 database (persists across OAuth logins)
        const db = getDB()
        if (db) {
            try {
                await db.prepare(`
                    UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
                `).bind(publicUrl, user.id).run()
            } catch (dbError) {
                console.error('Failed to update avatar in D1:', dbError)
                // Continue anyway - R2 upload succeeded
            }
        }

        return NextResponse.json({
            success: true,
            url: publicUrl
        })
    } catch (error) {
        console.error('[Upload API Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

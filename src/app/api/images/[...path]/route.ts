import { NextRequest, NextResponse } from 'next/server'
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

// GET /api/images/[...path] - Serve images from R2
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    try {
        const { path } = await params
        const key = path.join('/')

        const r2 = getR2()
        if (!r2) {
            return new NextResponse('Storage not available', { status: 503 })
        }

        const object = await r2.get(key)
        if (!object) {
            return new NextResponse('Image not found', { status: 404 })
        }

        const headers = new Headers()
        object.writeHttpMetadata(headers)
        headers.set('etag', object.httpEtag)

        return new NextResponse(object.body, { headers })
    } catch (error) {
        console.error('[Image API Error]:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

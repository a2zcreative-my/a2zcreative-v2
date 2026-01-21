import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    variables: string;
    updated_at: string;
}

// GET - Fetch all email templates
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { env } = getRequestContext();
        const db = env.DB;

        // Check if user is admin
        const userResult = await db.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first<{ role: string }>();

        if (!userResult || userResult.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const templates = await db.prepare(
            'SELECT * FROM email_templates ORDER BY name'
        ).all<EmailTemplate>();

        return NextResponse.json({ templates: templates.results || [] });
    } catch (error) {
        console.error('Error fetching email templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

// PUT - Update an email template
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { env } = getRequestContext();
        const db = env.DB;

        // Check if user is admin
        const userResult = await db.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first<{ role: string }>();

        if (!userResult || userResult.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id, subject, body } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        await db.prepare(
            `UPDATE email_templates 
             SET subject = ?, body = ?, updated_at = datetime('now')
             WHERE id = ?`
        ).bind(subject, body, id).run();

        return NextResponse.json({ message: 'Template updated successfully' });
    } catch (error) {
        console.error('Error updating email template:', error);
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}

export const runtime = 'edge';

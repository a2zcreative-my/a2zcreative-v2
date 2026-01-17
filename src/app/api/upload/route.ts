import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const R2_PUBLIC_URL = "https://pub-48391ed48a91437f9391d8228555a06a.r2.dev";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folder = formData.get("folder") as string || "uploads";

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
                { status: 400 }
            );
        }

        // Validate file size (2MB max)
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File size exceeds 2MB limit" },
                { status: 413 }
            );
        }

        // Get R2 bucket from Cloudflare context
        const { env } = getRequestContext();
        const bucket = env.R2_BUCKET;

        if (!bucket) {
            console.error("R2_BUCKET not found in environment");
            return NextResponse.json(
                { error: "Storage not configured" },
                { status: 500 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split(".").pop() || "jpg";
        const key = `${folder}/${timestamp}-${randomStr}.${extension}`;

        // Upload to R2
        const arrayBuffer = await file.arrayBuffer();
        await bucket.put(key, arrayBuffer, {
            httpMetadata: {
                contentType: file.type,
            },
        });

        // Return public URL
        const publicUrl = `${R2_PUBLIC_URL}/${key}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            key: key,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://65.108.79.220:3000";

/**
 * POST /api/jobs
 * Proxy to backend /api/jobs with FormData
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const authHeader = request.headers.get("Authorization");

        const headers: HeadersInit = {};
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }

        const response = await fetch(`${BACKEND_URL}/api/jobs`, {
            method: "POST",
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { success: false, message: errorData.message || `Backend error: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error proxying to POST /api/jobs:", error);
        return NextResponse.json(
            { success: false, message: "Failed to connect to backend" },
            { status: 500 }
        );
    }
}

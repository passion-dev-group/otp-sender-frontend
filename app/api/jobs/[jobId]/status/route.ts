import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://65.108.79.220:3000";

// Force dynamic rendering - prevents caching for polling
export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs/[jobId]/status
 * Proxy to backend /api/jobs/:jobId/status
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;
        const authHeader = request.headers.get("Authorization");

        const headers: HeadersInit = {};
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }

        const response = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/status`, {
            headers,
            cache: 'no-store',  // Disable caching for polling to work
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("[API /jobs/status] Backend response:", JSON.stringify(data));
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error proxying to GET /api/jobs/[jobId]/status:", error);
        return NextResponse.json(
            { success: false, message: "Failed to connect to backend" },
            { status: 500 }
        );
    }
}

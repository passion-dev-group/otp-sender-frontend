import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://65.108.79.220:3000";

/**
 * GET /api/sites
 * Proxy to backend /api/sites
 */
export async function GET() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/sites`);

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error proxying to /api/sites:", error);
        return NextResponse.json(
            { success: false, message: "Failed to connect to backend" },
            { status: 500 }
        );
    }
}

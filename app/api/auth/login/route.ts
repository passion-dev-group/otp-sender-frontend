import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://65.108.79.220:3000";

/**
 * POST /api/auth/login
 * Proxy to backend /api/auth/login
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { success: false, message: errorData.message || "Invalid secret key" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error proxying to POST /api/auth/login:", error);
        return NextResponse.json(
            { success: false, message: "Failed to connect to backend" },
            { status: 500 }
        );
    }
}

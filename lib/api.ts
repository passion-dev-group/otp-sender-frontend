/**
 * Backend API Client
 * Base URL: http://localhost:3000
 */

const API_BASE = "http://localhost:3000";

// =============================================================================
// Types
// =============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface SitesResponse {
    sites: string[];
    count: number;
}

export interface CreateJobResponse {
    jobId: string;
    siteName: string;
    country: string;
    otpType: "TXT" | "VOICE";
    status: string;
}

export interface JobStatusResponse {
    jobId: string;
    siteName: string;
    country: string;
    otpType: "TXT" | "VOICE" | null;
    status: "pending" | "processing" | "completed" | "cancelled";
    cancelled: number;  // 0 or 1
    createdAt: string;
    updatedAt: string;
    cancelledAt?: string;
    jobDetail: {
        completed: number;
        failed: number;
        cancelled: number;
    };
}

export interface JobProfile {
    profileId: number;
    proxyId: string;
    phoneNumber: string;
    email: string | null;
    status: string;
    actions: JobAction[];
    completedAt?: string;
}

export interface JobAction {
    action: string;
    result: string;
    errorMessage?: string;
    executedAt: string;
}

export interface CancelJobResponse {
    jobId: string;
    status: string;
}

// Auth types
export interface AuthUser {
    id: number;
    secret_key: string;
    active: boolean;
    last_login?: string;
    created_at?: string;
    updated_at?: string;
}

export interface LoginResponse {
    user: AuthUser;
}

export interface RegisterResponse {
    user: AuthUser;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get the stored auth key from localStorage
 * Returns the decrypted secret_key or null if not found
 */
function getAuthKey(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const authKey = window.localStorage.getItem("auth_key");
        if (!authKey) return null;

        // Import CryptoJS dynamically to avoid SSR issues
        const CryptoJS = require("crypto-js");
        const bytes = CryptoJS.AES.decrypt(authKey, process.env.NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET!);
        const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        return decrypted.secret_key || null;
    } catch {
        return null;
    }
}

/**
 * Get all available sites
 * GET /api/sites
 */
export async function getSites(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/api/sites`);

    if (!response.ok) {
        throw new Error(`Failed to fetch sites: ${response.statusText}`);
    }

    const data: ApiResponse<SitesResponse> = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Failed to fetch sites");
    }

    return data.data.sites;
}

/**
 * Create a new job
 * POST /api/jobs
 */
export async function createJob(formData: FormData): Promise<CreateJobResponse> {
    const authKey = getAuthKey();

    const headers: HeadersInit = {};
    if (authKey) {
        headers["Authorization"] = `Bearer ${authKey}`;
    }

    const response = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST",
        headers,
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create job: ${response.statusText}`);
    }

    const data: ApiResponse<CreateJobResponse> = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Failed to create job");
    }

    return data.data;
}

/**
 * Get job status
 * GET /api/jobs/:jobId/status
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const authKey = getAuthKey();

    const headers: HeadersInit = {};
    if (authKey) {
        headers["Authorization"] = `Bearer ${authKey}`;
    }

    const response = await fetch(`${API_BASE}/api/jobs/${jobId}/status`, {
        headers,
    });

    if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.statusText}`);
    }

    const data: ApiResponse<JobStatusResponse> = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Failed to get job status");
    }

    return data.data;
}

/**
 * Cancel a job
 * DELETE /api/jobs/:jobId
 */
export async function cancelJob(jobId: string): Promise<CancelJobResponse> {
    const authKey = getAuthKey();

    const headers: HeadersInit = {};
    if (authKey) {
        headers["Authorization"] = `Bearer ${authKey}`;
    }

    const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to cancel job: ${response.statusText}`);
    }

    const data: ApiResponse<CancelJobResponse> = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Failed to cancel job");
    }

    return data.data;
}

// =============================================================================
// Auth API Functions
// =============================================================================

/**
 * Login with secret key
 * POST /api/auth/login
 */
export async function login(secretKey: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ secret_key: secretKey }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid secret key");
    }

    const data: ApiResponse<LoginResponse> = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Login failed");
    }

    return data.data;
}


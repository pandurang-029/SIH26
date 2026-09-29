import {
  HealthCheckResponse,
  DocumentUploadResponse,
  DocumentExtractionResponse,
  CommonContentRepresentation,
  GeneratedOutputsResponse,
  TransformationConfig,
  QualityControlReport,
} from "./types";

export type {
  HealthCheckResponse,
  DocumentUploadResponse,
  DocumentExtractionResponse,
  CommonContentRepresentation,
  GeneratedOutputsResponse,
  TransformationConfig,
  QualityControlReport,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchHealthStatus(): Promise<{
  success: boolean;
  data: HealthCheckResponse | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data: HealthCheckResponse = await res.json();
    return { success: true, data, error: null };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to connect to FastAPI backend server.";
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}

export async function uploadDocumentFile(file: File): Promise<{
  success: boolean;
  data: DocumentUploadResponse | null;
  error: string | null;
}> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const msg = errorJson.detail || `Upload failed with status ${res.status}`;
      throw new Error(msg);
    }

    const data: DocumentUploadResponse = await res.json();
    return { success: true, data, error: null };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unable to upload document to backend.";
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}

export async function extractDocumentContent(documentId: string): Promise<{
  success: boolean;
  data: DocumentExtractionResponse | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/extract`, {
      method: "POST",
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const msg = errorJson.detail || `Extraction failed with status ${res.status}`;
      throw new Error(msg);
    }

    const data: DocumentExtractionResponse = await res.json();
    return { success: true, data, error: null };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unable to extract content from this document.";
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}

export async function analyzeDocumentContent(documentId: string): Promise<{
  success: boolean;
  data: CommonContentRepresentation | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/analyze`, {
      method: "POST",
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const msg = errorJson.detail || `AI Analysis failed with status ${res.status}`;
      throw new Error(msg);
    }

    const data: CommonContentRepresentation = await res.json();
    return { success: true, data, error: null };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unable to perform AI content understanding on this document.";
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}

export async function generateDocumentOutputs(
  documentId: string,
  outputTypes: string[],
  configuration?: TransformationConfig
): Promise<{
  success: boolean;
  data: GeneratedOutputsResponse | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        output_types: outputTypes,
        configuration: configuration || undefined,
      }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const msg = errorJson.detail || `Output generation failed with status ${res.status}`;
      throw new Error(msg);
    }

    const data: GeneratedOutputsResponse = await res.json();
    return { success: true, data, error: null };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unable to generate requested document outputs.";
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}

export async function runQualityCheck(
  documentId: string,
  outputTypes: string[]
): Promise<{
  success: boolean;
  data: QualityControlReport | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/quality-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ output_types: outputTypes }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const msg = errorJson.detail || `Quality check failed with status ${res.status}`;
      throw new Error(msg);
    }

    const data: QualityControlReport = await res.json();
    return { success: true, data, error: null };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unable to run Quality & Provenance Check.";
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}

export async function exportDocumentOutput(
  documentId: string,
  outputType: string,
  format: string
): Promise<{
  success: boolean;
  filename: string | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        output_type: outputType,
        format: format,
      }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const msg = errorJson.detail || `Export failed with HTTP ${res.status}`;
      throw new Error(msg);
    }

    // Extract filename from Content-Disposition header if available
    let downloadFilename = `${outputType}_${documentId}.${format}`;
    const disposition = res.headers.get("Content-Disposition");
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        downloadFilename = match[1];
      }
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, filename: downloadFilename, error: null };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to download requested export file.";
    return {
      success: false,
      filename: null,
      error: errorMessage,
    };
  }
}

export interface LoginResponseData {
  success: boolean;
  message: string;
  user?: {
    name: string;
    role: string;
    email: string;
  };
  token?: string;
  attempts_used: number;
  attempts_remaining: number;
  max_attempts: number;
  is_locked: boolean;
  lockout_until?: string | null;
  retry_after_seconds: number;
}

export interface LoginStatusData {
  is_locked: boolean;
  attempts_used: number;
  attempts_remaining: number;
  max_attempts: number;
  lockout_until?: string | null;
  retry_after_seconds: number;
  message: string;
}

export async function fetchLoginStatus(email?: string): Promise<LoginStatusData> {
  try {
    const url = new URL(`${API_BASE_URL}/api/auth/status`);
    if (email) url.searchParams.set("email", email);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch {
    return {
      is_locked: false,
      attempts_used: 0,
      attempts_remaining: 5,
      max_attempts: 5,
      lockout_until: null,
      retry_after_seconds: 0,
      message: "Authentication service operating.",
    };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{
  success: boolean;
  data: LoginResponseData | null;
  error: string | null;
  isLocked: boolean;
  attemptsRemaining: number;
  attemptsUsed: number;
  lockoutUntil?: string | null;
  retryAfterSeconds?: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const detail = body.detail || {};
      const isLocked = res.status === 429 || detail.error === "DAILY_LOGIN_LIMIT_EXCEEDED" || !!detail.is_locked;
      const message = typeof detail === "string" ? detail : (detail.message || "Invalid credentials.");

      return {
        success: false,
        data: null,
        error: message,
        isLocked,
        attemptsRemaining: typeof detail.attempts_remaining === "number" ? detail.attempts_remaining : (isLocked ? 0 : 4),
        attemptsUsed: typeof detail.attempts_used === "number" ? detail.attempts_used : (isLocked ? 5 : 1),
        lockoutUntil: detail.lockout_until || null,
        retryAfterSeconds: detail.retry_after_seconds || 0,
      };
    }

    return {
      success: true,
      data: body,
      error: null,
      isLocked: false,
      attemptsRemaining: body.attempts_remaining ?? 5,
      attemptsUsed: 0,
      lockoutUntil: null,
    };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unable to reach authentication server.";
    return {
      success: false,
      data: null,
      error: errorMessage,
      isLocked: false,
      attemptsRemaining: 5,
      attemptsUsed: 0,
    };
  }
}

export async function resetLoginRateLimit(email?: string): Promise<LoginStatusData> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch {
    return {
      is_locked: false,
      attempts_used: 0,
      attempts_remaining: 5,
      max_attempts: 5,
      lockout_until: null,
      retry_after_seconds: 0,
      message: "Reset completed.",
    };
  }
}


/**
 * Central place for API base URL + typed fetch helpers.
 *
 * Resolution order:
 *   1. VITE_API_URL, if set (works for both `vercel env` values and
 *      a local .env.local override) -- this is the normal path.
 *   2. If running in the browser in dev mode with nothing set,
 *      fall back to http://localhost:5000.
 *   3. If running in production with nothing set, fall back to the
 *      same-origin `/api` (useful if you ever merge frontend+backend
 *      into a single Vercel project instead of two).
 */
function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/+$/, ""); // strip trailing slash
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  return "/api";
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, init);

  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      details = await res.text().catch(() => undefined);
    }
    const message =
      (details as { message?: string } | undefined)?.message ??
      `Request to ${path} failed with status ${res.status}`;
    throw new ApiError(message, res.status, details);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res as unknown as T;
}

export interface HealthResponse {
  status: "ok";
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
}

export interface UploadResponse {
  fileId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  message: string;
}

export interface ManuscriptExportRequest {
  content: string;
  title?: string;
  author?: string;
}

export const api = {
  health: () => request<HealthResponse>("/health"),

  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return request<UploadResponse>("/upload", {
      method: "POST",
      body: formData,
    });
  },

  /** Returns a Blob the caller can turn into a download link. */
  exportPdf: async (payload: ManuscriptExportRequest): Promise<Blob> => {
    const url = `${API_BASE_URL}/export/pdf`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const details = await res.json().catch(() => undefined);
      throw new ApiError(
        (details as { message?: string } | undefined)?.message ?? "PDF export failed",
        res.status,
        details
      );
    }
    return res.blob();
  },

  exportDocx: async (payload: ManuscriptExportRequest): Promise<Blob> => {
    const url = `${API_BASE_URL}/export/docx`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const details = await res.json().catch(() => undefined);
      throw new ApiError(
        (details as { message?: string } | undefined)?.message ?? "DOCX export failed",
        res.status,
        details
      );
    }
    return res.blob();
  },
};

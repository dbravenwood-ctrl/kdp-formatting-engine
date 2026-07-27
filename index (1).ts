export interface HealthResponse {
  status: "ok";
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

export interface UploadResponse {
  fileId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  message: string;
}

export interface ManuscriptExportRequest {
  /** Plain-text or lightly-marked-up manuscript body */
  content: string;
  title?: string;
  author?: string;
}

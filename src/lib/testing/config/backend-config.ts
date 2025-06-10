
import { BackendConfig } from "../types/backend-types";

/**
 * Configuration for the backend service
 */
export const BACKEND_CONFIG: BackendConfig = {
  apiUrl: (import.meta.env.VITE_ISO_BACKEND_URL && import.meta.env.VITE_ISO_BACKEND_URL.trim() !== '') ? import.meta.env.VITE_ISO_BACKEND_URL.trim() : null,
  endpoints: {
    generateIso: "/api/iso/generate",
    status: "/api/iso/status",
    download: "/api/iso/download"
  },
  timeout: 300000 // 5 minutes timeout
};

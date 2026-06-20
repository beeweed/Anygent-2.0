const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim()
const normalizedBackendUrl = configuredBackendUrl ? configuredBackendUrl.replace(/\/$/, '') : ''

export const BACKEND_URL = normalizedBackendUrl
export const API_BASE_PATH = normalizedBackendUrl ? `${normalizedBackendUrl}/api` : '/api'

export function getApiBaseCandidates() {
  return [...new Set([API_BASE_PATH, '/api'])]
}

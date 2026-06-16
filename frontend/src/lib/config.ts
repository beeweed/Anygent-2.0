const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim()

export const BACKEND_URL = configuredBackendUrl ? configuredBackendUrl.replace(/\/$/, '') : ''
export const API_BASE_PATH = `${BACKEND_URL}/api`

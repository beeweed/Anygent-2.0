export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string

if (!BACKEND_URL) {
  throw new Error('VITE_BACKEND_URL is required in frontend/.env')
}

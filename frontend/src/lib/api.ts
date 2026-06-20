import { API_BASE_PATH, getApiBaseCandidates } from './config'
import type { FileNode } from '@/types/files'
import type { ModelSummary, ProviderSettings } from '@/types/settings'

class ApiNetworkError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ApiNetworkError'
  }
}

function mapOpenRouterModels(payload: { data?: Array<Record<string, unknown>> }): { data: ModelSummary[] } {
  return {
    data: (payload.data ?? []).map((item) => ({
      id: String(item.id ?? ''),
      name: String(item.name ?? item.id ?? 'Unknown model'),
      contextLength: typeof item.context_length === 'number' ? item.context_length : null,
      description: typeof item.description === 'string' ? item.description : null,
      promptPricing:
        typeof item.pricing === 'object' && item.pricing && typeof (item.pricing as Record<string, unknown>).prompt === 'string'
          ? String((item.pricing as Record<string, unknown>).prompt)
          : null,
      completionPricing:
        typeof item.pricing === 'object' && item.pricing && typeof (item.pricing as Record<string, unknown>).completion === 'string'
          ? String((item.pricing as Record<string, unknown>).completion)
          : null,
      supportedParameters: Array.isArray(item.supported_parameters)
        ? item.supported_parameters.map((value) => String(value))
        : [],
    })),
  }
}

function isJsonResponse(response: Response) {
  return response.headers.get('content-type')?.includes('application/json') ?? false
}

async function readErrorMessage(response: Response, fallbackMessage: string) {
  if (isJsonResponse(response)) {
    const payload = (await response.json().catch(() => null)) as { detail?: unknown; message?: unknown } | null
    const detail = payload?.detail ?? payload?.message

    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }
  }

  const text = await response.text().catch(() => '')
  return text.trim() || fallbackMessage
}

async function fetchFromApi(path: string, init?: RequestInit) {
  let lastError: Error | null = null

  for (const basePath of getApiBaseCandidates()) {
    try {
      return await fetch(`${basePath}${path}`, init)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  throw new ApiNetworkError(lastError?.message || `Request failed for ${path}`, {
    cause: lastError ?? undefined,
  })
}

export async function fetchHealth() {
  const response = await fetchFromApi('/health')
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Backend health check failed'))
  }
  return response.json() as Promise<{ status: string }>
}

export async function fetchOpenRouterModels(apiKey: string) {
  try {
    const response = await fetchFromApi('/providers/openrouter/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Unable to fetch models'))
    }

    return (await response.json()) as { data: ModelSummary[] }
  } catch (backendError) {
    if (!(backendError instanceof ApiNetworkError)) {
      throw backendError
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, backendError.message || 'Unable to fetch models'))
    }

    const payload = (await response.json()) as { data?: Array<Record<string, unknown>> }
    return mapOpenRouterModels(payload)
  }
}

export async function fetchFileTree(sessionId: string) {
  const response = await fetchFromApi(`/sessions/${sessionId}/files`)
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Unable to load file tree'))
  }
  return (await response.json()) as { root: FileNode[] }
}

export async function fetchFileContent(sessionId: string, path: string) {
  const response = await fetchFromApi(`/sessions/${sessionId}/file-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Unable to load file content'))
  }
  return (await response.json()) as { path: string; content: string }
}

export function buildStreamUrl() {
  return `${API_BASE_PATH}/chat/stream`
}

export type ChatPayload = {
  sessionId: string
  message: string
  settings: ProviderSettings
}

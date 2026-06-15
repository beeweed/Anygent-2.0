import { BACKEND_URL } from './config'
import type { FileNode } from '@/types/files'
import type { ModelSummary, ProviderSettings } from '@/types/settings'

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

export async function fetchHealth() {
  const response = await fetch(`${BACKEND_URL}/api/health`)
  if (!response.ok) {
    throw new Error('Backend health check failed')
  }
  return response.json() as Promise<{ status: string }>
}

export async function fetchOpenRouterModels(apiKey: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/providers/openrouter/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Unable to fetch models')
    }

    return (await response.json()) as { data: ModelSummary[] }
  } catch (backendError) {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const fallbackError = await response.text()
      throw new Error(
        fallbackError || (backendError instanceof Error ? backendError.message : 'Unable to fetch models'),
      )
    }

    const payload = (await response.json()) as { data?: Array<Record<string, unknown>> }
    return mapOpenRouterModels(payload)
  }
}

export async function fetchFileTree(sessionId: string) {
  const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/files`)
  if (!response.ok) {
    throw new Error('Unable to load file tree')
  }
  return (await response.json()) as { root: FileNode[] }
}

export async function fetchFileContent(sessionId: string, path: string) {
  const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/file-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Unable to load file content')
  }
  return (await response.json()) as { path: string; content: string }
}

export function buildStreamUrl() {
  return `${BACKEND_URL}/api/chat/stream`
}

export type ChatPayload = {
  sessionId: string
  message: string
  settings: ProviderSettings
}

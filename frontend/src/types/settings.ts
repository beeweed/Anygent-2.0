export type ProviderId = 'openrouter'

export type ProviderSettings = {
  provider: ProviderId
  openrouterApiKey: string
  selectedModel: string
  e2bApiKey: string
  e2bTemplateId: string
}

export type ModelSummary = {
  id: string
  name: string
  contextLength?: number | null
  description?: string | null
  promptPricing?: string | null
  completionPricing?: string | null
  supportedParameters: string[]
}

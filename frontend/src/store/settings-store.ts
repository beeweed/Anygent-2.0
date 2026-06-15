import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { fetchOpenRouterModels } from '@/lib/api'
import type { ModelSummary, ProviderSettings } from '@/types/settings'

type SettingsState = {
  settings: ProviderSettings
  availableModels: ModelSummary[]
  modelsStatus: 'idle' | 'loading' | 'ready' | 'error'
  modelsError: string | null
  updateSettings: (patch: Partial<ProviderSettings>) => void
  loadModels: () => Promise<void>
}

const initialSettings: ProviderSettings = {
  provider: 'openrouter',
  openrouterApiKey: '',
  selectedModel: '',
  e2bApiKey: '',
  e2bTemplateId: '',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: initialSettings,
      availableModels: [],
      modelsStatus: 'idle',
      modelsError: null,
      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      loadModels: async () => {
        const apiKey = get().settings.openrouterApiKey.trim()
        if (!apiKey) {
          set({ modelsStatus: 'error', modelsError: 'OpenRouter API key is required.' })
          return
        }
        set({ modelsStatus: 'loading', modelsError: null })
        try {
          const response = await fetchOpenRouterModels(apiKey)
          const selectedModel = get().settings.selectedModel
          set((state) => ({
            availableModels: response.data,
            modelsStatus: 'ready',
            modelsError: null,
            settings: {
              ...state.settings,
              selectedModel:
                selectedModel || response.data[0]?.id || '',
            },
          }))
        } catch (error) {
          set({
            modelsStatus: 'error',
            modelsError: error instanceof Error ? error.message : 'Unable to fetch models.',
          })
        }
      },
    }),
    {
      name: 'agent-studio-settings',
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
)

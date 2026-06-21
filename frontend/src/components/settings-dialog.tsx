import * as Dialog from '@radix-ui/react-dialog'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useEffect, useState } from 'react'

import { useSettingsStore } from '@/store/settings-store'

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { settings, updateSettings, availableModels, loadModels, modelsStatus, modelsError } = useSettingsStore()
  const [modelSearch, setModelSearch] = useState('')

  useEffect(() => {
    if (open && settings.openrouterApiKey && availableModels.length === 0) {
      void loadModels()
    }
    if (!open) {
      setModelSearch('')
    }
  }, [availableModels.length, loadModels, open, settings.openrouterApiKey])

  const filteredModels = availableModels.filter(
    (m) =>
      !modelSearch ||
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(modelSearch.toLowerCase()),
  )

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,500px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#2d2d2d] shadow-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-foreground">Settings</Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">Configure your agent</Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </Dialog.Close>
          </div>

          <ScrollArea.Root className="max-h-[70vh] overflow-hidden">
            <ScrollArea.Viewport className="max-h-[70vh] px-6 py-6">
              <div className="space-y-6">
                {/* API Key Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                    <label className="text-sm font-medium text-foreground">OpenRouter API Key</label>
                  </div>
                  <div className="bg-[#363638] rounded-xl px-4 py-3">
                    <input
                      type="password"
                      value={settings.openrouterApiKey}
                      onChange={(e) => updateSettings({ openrouterApiKey: e.target.value })}
                      placeholder="sk-or-v1-..."
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Get your API key
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                </div>

                {/* Model Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <label className="text-sm font-medium text-foreground">Select Model</label>
                  </div>

                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                      type="text"
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      placeholder="Search models..."
                      className="w-full bg-[#363638] rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="bg-[#363638] rounded-xl max-h-[280px] overflow-y-auto p-2 space-y-1">
                    {modelsStatus === 'loading' ? (
                      <div className="p-3 text-xs text-muted-foreground text-center">Loading models...</div>
                    ) : modelsError ? (
                      <div className="p-3 text-xs text-red-400 text-center">{modelsError}</div>
                    ) : filteredModels.length === 0 ? (
                      <div className="p-3 text-xs text-muted-foreground text-center">
                        {availableModels.length === 0 ? 'Enter an API key and refresh models.' : 'No models match your search.'}
                      </div>
                    ) : (
                      filteredModels.map((model) => {
                        const isSelected = settings.selectedModel === model.id
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => updateSettings({ selectedModel: model.id })}
                            className={`flex items-center justify-between w-full p-3 rounded-xl cursor-pointer transition-colors ${
                              isSelected ? 'bg-primary/15 border border-primary/30' : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="text-left">
                              <div className="text-sm font-medium text-foreground">{model.name}</div>
                              <div className="text-[10px] text-muted-foreground">{model.id}</div>
                            </div>
                            {isSelected && (
                              <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => void loadModels()}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <svg className={`w-3 h-3 ${modelsStatus === 'loading' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Refresh models
                  </button>
                </div>

                {/* E2B Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <label className="text-sm font-medium text-foreground">E2B Sandbox</label>
                  </div>
                  <div className="bg-[#363638] rounded-xl px-4 py-3">
                    <input
                      type="password"
                      value={settings.e2bApiKey}
                      onChange={(e) => updateSettings({ e2bApiKey: e.target.value })}
                      placeholder="e2b_..."
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                  <div className="bg-[#363638] rounded-xl px-4 py-3">
                    <input
                      type="text"
                      value={settings.e2bTemplateId}
                      onChange={(e) => updateSettings({ e2bTemplateId: e.target.value })}
                      placeholder="Optional template id"
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" className="flex w-2 touch-none bg-transparent p-0.5">
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-white/10" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#252525]">
            <Dialog.Close className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              Cancel
            </Dialog.Close>
            <Dialog.Close className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98]">
              Save Changes
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

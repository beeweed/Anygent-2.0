import * as Dialog from '@radix-ui/react-dialog'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Separator from '@radix-ui/react-separator'
import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons'
import { useEffect } from 'react'

import { useSettingsStore } from '@/store/settings-store'

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { settings, updateSettings, availableModels, loadModels, modelsStatus, modelsError } = useSettingsStore()

  useEffect(() => {
    if (open && settings.openrouterApiKey && availableModels.length === 0) {
      void loadModels()
    }
  }, [availableModels.length, loadModels, open, settings.openrouterApiKey])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,780px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/10 bg-[#090909] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
            <div>
              <Dialog.Title className="text-lg font-semibold text-zinc-50">Provider and sandbox settings</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-zinc-400">
                OpenRouter supplies models. E2B provides the isolated filesystem sandbox.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100">
              <Cross2Icon className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <ScrollArea.Root className="max-h-[75vh] overflow-hidden">
            <ScrollArea.Viewport className="max-h-[75vh] px-6 py-6">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">model provider</p>
                    <h3 className="mt-2 text-base font-medium text-zinc-100">OpenRouter</h3>
                  </div>

                  <label className="grid gap-2 text-sm text-zinc-200">
                    <span>OpenRouter API key</span>
                    <input
                      type="password"
                      value={settings.openrouterApiKey}
                      onChange={(event) => updateSettings({ openrouterApiKey: event.target.value })}
                      placeholder="sk-or-v1-..."
                      className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-zinc-100 outline-none transition focus:border-[#f97316]/60"
                    />
                  </label>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm text-zinc-200">Model</label>
                      <button
                        type="button"
                        onClick={() => void loadModels()}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/[0.06]"
                      >
                        <ReloadIcon className={`h-3.5 w-3.5 ${modelsStatus === 'loading' ? 'animate-spin' : ''}`} />
                        Refresh models
                      </button>
                    </div>
                    <select
                      value={settings.selectedModel}
                      onChange={(event) => updateSettings({ selectedModel: event.target.value })}
                      className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-zinc-100 outline-none transition focus:border-[#f97316]/60"
                    >
                      <option value="">Select a model</option>
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} · {model.id}
                        </option>
                      ))}
                    </select>
                    {modelsError ? <p className="text-sm text-rose-300">{modelsError}</p> : null}
                    {modelsStatus === 'ready' && availableModels.length > 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-xs text-zinc-400">
                        Loaded {availableModels.length} models from OpenRouter.
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">sandbox runtime</p>
                    <h3 className="mt-2 text-base font-medium text-zinc-100">E2B</h3>
                  </div>

                  <label className="grid gap-2 text-sm text-zinc-200">
                    <span>E2B API key</span>
                    <input
                      type="password"
                      value={settings.e2bApiKey}
                      onChange={(event) => updateSettings({ e2bApiKey: event.target.value })}
                      placeholder="e2b_..."
                      className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-zinc-100 outline-none transition focus:border-[#f97316]/60"
                    />
                  </label>

                  <label className="grid gap-2 text-sm text-zinc-200">
                    <span>Custom sandbox template id</span>
                    <input
                      type="text"
                      value={settings.e2bTemplateId}
                      onChange={(event) => updateSettings({ e2bTemplateId: event.target.value })}
                      placeholder="Optional template id"
                      className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-zinc-100 outline-none transition focus:border-[#f97316]/60"
                    />
                  </label>

                  <Separator.Root className="h-px bg-white/8" />

                  <div className="rounded-[24px] border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 text-sm text-zinc-300">
                    <p className="font-medium text-zinc-100">Session behavior</p>
                    <ul className="mt-3 space-y-2 text-zinc-400">
                      <li>Sandbox is created automatically on the first chat message.</li>
                      <li>Sandbox timeout is fixed to 1 hour.</li>
                      <li>Backend URL is sourced only from <code className="font-mono text-zinc-200">frontend/.env</code>.</li>
                    </ul>
                  </div>
                </section>
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" className="flex w-2.5 touch-none bg-transparent p-0.5">
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-white/10" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

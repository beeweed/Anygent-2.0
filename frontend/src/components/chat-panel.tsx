import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useEffect, useRef, useState } from 'react'

import { ThinkingIndicator } from '@/components/thinking-indicator'
import { useAgentChat } from '@/hooks/use-agent-chat'
import { useChatStore } from '@/store/chat-store'
import { useSettingsStore } from '@/store/settings-store'

export function ChatPanel() {
  const [message, setMessage] = useState('')
  const transcript = useChatStore((state) => state.transcript)
  const activeStatus = useChatStore((state) => state.activeStatus)
  const isStreaming = useChatStore((state) => state.isStreaming)
  const error = useChatStore((state) => state.error)
  const { sendMessage } = useAgentChat()
  const settings = useSettingsStore((state) => state.settings)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const ready = Boolean(
    settings.openrouterApiKey.trim() && settings.selectedModel.trim() && settings.e2bApiKey.trim(),
  )

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }, [activeStatus, transcript])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || isStreaming || !ready) {
      return
    }
    setMessage('')
    await sendMessage(trimmed)
  }

  return (
    <section className="flex min-h-[72vh] flex-col rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">chat</p>
          <h2 className="mt-1 text-sm font-medium text-zinc-100 sm:text-base">Live autonomous execution</h2>
        </div>
        {activeStatus ? <ThinkingIndicator label={activeStatus.label} /> : null}
      </div>

      <ScrollArea.Root className="min-h-0 flex-1">
        <ScrollArea.Viewport ref={viewportRef} className="h-[56vh] px-5 py-6 sm:px-6">
          <div className="space-y-6">
            {transcript.length === 0 ? (
              <div className="max-w-2xl rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm leading-7 text-zinc-400">
                Configure OpenRouter and E2B in Settings, then ask the agent to build or modify files inside the sandbox.
              </div>
            ) : null}

            {transcript.map((item) => {
              if (item.kind === 'user') {
                return (
                  <div key={item.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-[24px] border border-[#f97316]/20 bg-[#f97316]/10 px-4 py-3 text-sm leading-7 text-zinc-100 shadow-[0_10px_40px_rgba(249,115,22,0.08)]">
                      {item.content}
                    </div>
                  </div>
                )
              }

              if (item.kind === 'assistant') {
                return (
                  <div key={item.id} className="max-w-3xl text-[15px] leading-8 text-zinc-100 sm:text-base">
                    <div className="whitespace-pre-wrap">{item.content}</div>
                  </div>
                )
              }

              if (item.kind === 'tool') {
                return (
                  <div key={item.id} className="max-w-fit rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs tracking-[0.18em] text-zinc-200 uppercase">
                    {item.label}
                  </div>
                )
              }

              return null
            })}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="flex w-2.5 touch-none bg-transparent p-0.5">
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-white/10" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <div className="border-t border-white/8 p-4 sm:p-5">
        {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
        {!ready ? <p className="mb-3 text-sm text-amber-300">Add OpenRouter API key, choose a model, and add E2B API key before chatting.</p> : null}
        <form onSubmit={onSubmit} className="grid gap-3">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Describe what the agent should do inside the sandbox..."
            disabled={!ready || isStreaming}
            rows={4}
            className="min-h-[120px] rounded-[24px] border border-white/10 bg-black/60 px-4 py-4 text-sm leading-7 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#f97316]/60 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">Native tool calling · SSE streaming · E2B sandbox</p>
            <button
              type="submit"
              disabled={!ready || isStreaming || !message.trim()}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#f97316] px-6 text-sm font-medium text-black transition hover:bg-[#fb923c] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isStreaming ? 'Running' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

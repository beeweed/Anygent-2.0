import { BarChart3, Cloud, Code2, PenSquare } from 'lucide-react'
import { useEffect, useMemo, useRef, type KeyboardEvent } from 'react'

import { APP_ROUTES } from '@/app/routes/route'
import { useAgentChat } from '@/hooks/use-agent-chat'
import { useChatStore } from '@/store/chat-store'
import { useHistoryStore } from '@/store/history-store'

type ChatPanelProps = {
  mode: 'home' | 'chat'
  ready: boolean
  onNavigate: (path: string) => void
}

const suggestions = [
  { label: 'Weather', Icon: Cloud },
  { label: 'Code', Icon: Code2 },
  { label: 'Write', Icon: PenSquare },
  { label: 'Analyze', Icon: BarChart3 },
] as const

function AssistantMark() {
  return (
    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-neutral-200 text-[10px] font-bold text-black shadow-sm">
      A
    </div>
  )
}

export function ChatPanel({ mode, ready, onNavigate }: ChatPanelProps) {
  const transcript = useChatStore((state) => state.transcript)
  const activeStatus = useChatStore((state) => state.activeStatus)
  const isStreaming = useChatStore((state) => state.isStreaming)
  const error = useChatStore((state) => state.error)
  const composerDraft = useChatStore((state) => state.composerDraft)
  const queuedPrompt = useChatStore((state) => state.queuedPrompt)
  const setComposerDraft = useChatStore((state) => state.setComposerDraft)
  const queuePrompt = useChatStore((state) => state.queuePrompt)
  const consumeQueuedPrompt = useChatStore((state) => state.consumeQueuedPrompt)
  const setSessionId = useChatStore((state) => state.setSessionId)
  const loadTranscript = useChatStore((state) => state.loadTranscript)
  const setFileTree = useChatStore((state) => state.setFileTree)
  const selectFile = useChatStore((state) => state.selectFile)
  const setActiveChat = useHistoryStore((state) => state.setActiveChat)
  const { sendMessage } = useAgentChat()
  const threadViewportRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)

  const canSubmitChat = useMemo(
    () => ready && !isStreaming && Boolean(composerDraft.trim()),
    [composerDraft, isStreaming, ready],
  )

  useEffect(() => {
    if (mode !== 'chat') {
      return
    }

    const viewport = threadViewportRef.current
    if (!viewport) {
      return
    }

    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }, [activeStatus, mode, transcript])

  useEffect(() => {
    if (mode !== 'chat' || !queuedPrompt || isStreaming) {
      return
    }

    const prompt = consumeQueuedPrompt()
    if (!prompt) {
      return
    }

    if (ready) {
      setComposerDraft('')
      void sendMessage(prompt)
      return
    }

    setComposerDraft(prompt)
  }, [consumeQueuedPrompt, isStreaming, mode, queuedPrompt, ready, sendMessage, setComposerDraft])

  async function submitComposer() {
    const trimmed = composerDraft.trim()
    if (!trimmed) {
      return
    }

    if (mode === 'home') {
      setActiveChat(null)
      setSessionId(crypto.randomUUID())
      loadTranscript([])
      setFileTree([])
      selectFile(null, '')
      queuePrompt(trimmed)
      onNavigate(APP_ROUTES.chat)
      return
    }

    if (!ready || isStreaming) {
      return
    }

    setComposerDraft('')
    await sendMessage(trimmed)
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void submitComposer()
    }
  }

  function renderComposer() {
    return (
      <div className="relative flex w-full flex-col">
        <div className="flex w-full flex-col gap-2 rounded-[var(--composer-radius)] border border-neutral-800 bg-neutral-950 p-[var(--composer-padding)] shadow-lg transition focus-within:border-neutral-700">
          <div className="relative w-full">
            <textarea
              ref={composerRef}
              value={composerDraft}
              onChange={(event) => setComposerDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Ask a question or send a message..."
              rows={1}
              className="min-h-10 max-h-32 w-full resize-none bg-transparent px-2.5 py-2 text-base text-neutral-100 outline-none placeholder:text-neutral-500"
            />
          </div>

          <div className="relative flex items-center justify-end px-1">
            <button
              type="button"
              onClick={() => void submitComposer()}
              disabled={mode === 'chat' ? !canSubmitChat : !composerDraft.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-600"
              aria-label="Send message"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'home') {
    return (
      <main className="relative flex flex-1 overflow-hidden">
        <div className="relative flex h-full w-full flex-col overflow-x-auto overflow-y-auto scroll-smooth px-4 pt-4">
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="mx-auto mb-6 flex w-full max-w-[var(--thread-max-width)] flex-col items-center px-4 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">How can I help you today?</h1>
            </div>

            <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible pb-4 md:pb-6">
              {renderComposer()}

              <div className="flex w-full flex-col gap-2">
                <div className="scrollbar-none w-full overflow-x-auto">
                  <div className="mx-auto flex w-max items-center gap-2 py-0.5">
                    {suggestions.map(({ label, Icon }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setComposerDraft(label)
                          composerRef.current?.focus()
                        }}
                        className="flex h-auto items-center gap-1.5 rounded-full border border-neutral-800 px-3.5 py-1.5 text-xs font-normal text-neutral-300 transition hover:bg-neutral-800"
                      >
                        <Icon className="h-4 w-4 text-neutral-400" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div ref={threadViewportRef} className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
        <div className="mx-auto w-full max-w-[var(--thread-max-width)] space-y-4">
          {transcript.length === 0 ? (
            <div className="flex items-start gap-3 justify-start text-sm text-neutral-400">
              <AssistantMark />
              <div className="pt-0.5 leading-relaxed">Start a conversation from the composer below.</div>
            </div>
          ) : null}

          {transcript.map((item) => {
            if (item.kind === 'user') {
              return (
                <div key={item.id} className="flex w-full items-start justify-end gap-4">
                  <div className="flex max-w-[85%] flex-col items-end">
                    <div className="wrap-break-word rounded-2xl rounded-tr-sm bg-neutral-800 px-4 py-2 text-sm text-neutral-100 shadow-sm">
                      {item.content}
                    </div>
                  </div>
                </div>
              )
            }

            if (item.kind === 'assistant') {
              return (
                <div key={item.id} className="flex w-full items-start justify-start gap-3">
                  <AssistantMark />
                  <div className="flex max-w-[85%] flex-col items-start">
                    <div className="wrap-break-word whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
                      {item.content || (item.streaming ? '...' : '')}
                    </div>
                  </div>
                </div>
              )
            }

            if (item.kind === 'tool') {
              return (
                <div key={item.id} className="pl-8">
                  <div className={`inline-flex max-w-full items-center rounded-full border px-3 py-1.5 text-xs ${
                    item.isError
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300'
                  }`}>
                    <span className="truncate">{item.label}</span>
                  </div>
                </div>
              )
            }

            return null
          })}

          {activeStatus ? (
            <div className="flex w-full items-start justify-start gap-3">
              <AssistantMark />
              <div className="pt-0.5 text-sm leading-relaxed text-neutral-400">
                <span className="shimmer-text">{activeStatus.label}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 bg-gradient-to-t from-neutral-900 via-neutral-900 to-transparent px-4 pb-4 pt-2 md:pb-6">
        <div className="mx-auto w-full max-w-[var(--thread-max-width)]">
          {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
          {!ready ? (
            <p className="mb-3 text-sm text-amber-300">
              Add OpenRouter API key, choose a model, and add E2B API key before chatting.
            </p>
          ) : null}
          {renderComposer()}
        </div>
      </div>
    </main>
  )
}
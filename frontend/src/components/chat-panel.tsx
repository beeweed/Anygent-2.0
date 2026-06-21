import * as Collapsible from '@radix-ui/react-collapsible'
import { useEffect, useRef, useState } from 'react'

import { useAgentChat } from '@/hooks/use-agent-chat'
import { useChatStore } from '@/store/chat-store'
import type { TranscriptItem } from '@/types/chat'

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex gap-3 justify-end animate-fade-in">
      <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-md bg-primary text-primary-foreground shadow-lg shadow-primary/10">
        <p className="text-sm">{content}</p>
      </div>
      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
    </div>
  )
}

function FileCard({ item }: { item: TranscriptItem & { kind: 'tool' } }) {
  const isSuccess = item.status === 'success'
  const isLoading = item.status === 'loading' || item.status === 'pending'
  const isError = item.status === 'error'

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2a2a2c] border cursor-pointer transition-all duration-200 group ${
        isSuccess
          ? 'border-emerald-500/20 hover:bg-[#323234]'
          : isLoading
            ? 'border-primary/20 animate-pulse'
            : isError
              ? 'border-red-500/20'
              : 'border-white/10 hover:bg-[#323234]'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          isSuccess
            ? 'bg-emerald-500/10'
            : isLoading
              ? 'bg-primary/10'
              : isError
                ? 'bg-red-500/10'
                : 'bg-white/5'
        }`}
      >
        {isSuccess ? (
          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        ) : isLoading ? (
          <svg className="w-5 h-5 text-primary animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{item.path}</span>
          {isSuccess && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">created</span>
          )}
          {isLoading && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/15 text-primary">writing...</span>
          )}
          {isError && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400">error</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{item.label || item.name}</span>
      </div>
      <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
      </svg>
    </div>
  )
}

function ToolCallBlock({ item }: { item: TranscriptItem & { kind: 'tool' } }) {
  const [open, setOpen] = useState(false)
  const isSuccess = item.status === 'success' || !item.status
  const isLoading = item.status === 'loading'
  const isError = item.status === 'error'

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2d2d2f] border border-white/10 hover:bg-[#363638] transition-colors">
        <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{item.name}</span>
        {isSuccess && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">success</span>
        )}
        {isLoading && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">running...</span>
        )}
        {isError && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">failed</span>
        )}
        <svg
          className={`w-4 h-4 text-muted-foreground ml-auto transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
        </svg>
      </Collapsible.Trigger>
      <Collapsible.Content className="pt-2 pl-9">
        <div className="rounded-lg bg-[#252525] border border-white/10 p-3">
          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{item.path}</pre>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

function AssistantMessage({ items, iteration, maxIterations, isStreaming }: { items: TranscriptItem[]; iteration: number; maxIterations: number; isStreaming: boolean }) {
  const assistantItems = items.filter((i) => i.kind === 'assistant')
  const toolItems = items.filter((i) => i.kind === 'tool')
  const lastAssistant = assistantItems[assistantItems.length - 1]

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-muted-foreground mb-2 block">Vibe Coder</span>

        {iteration > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            <span className="text-[10px] font-medium text-primary">Iteration {iteration}/{maxIterations}</span>
          </div>
        )}

        {lastAssistant?.content && (
          <div className="text-sm leading-relaxed text-foreground/90 mb-3 whitespace-pre-wrap">
            {lastAssistant.content}
          </div>
        )}

        {toolItems.length > 0 && (
          <div className="space-y-2 mb-3">
            {toolItems.map((item) => {
              if (item.name?.startsWith('file_') || item.name?.startsWith('read') || item.name?.startsWith('write')) {
                return <FileCard key={item.id} item={item as TranscriptItem & { kind: 'tool' }} />
              }
              return <ToolCallBlock key={item.id} item={item as TranscriptItem & { kind: 'tool' }} />
            })}
          </div>
        )}

        {isStreaming && (
          <div className="flex items-center gap-1 px-1 py-2">
            <div className="w-2 h-2 rounded-full bg-primary thinking-dot"></div>
            <div className="w-2 h-2 rounded-full bg-primary thinking-dot"></div>
            <div className="w-2 h-2 rounded-full bg-primary thinking-dot"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ChatPanel({
  ready,
  isStreaming,
  iteration,
  maxIterations,
}: {
  ready: boolean
  isStreaming: boolean
  iteration: number
  maxIterations: number
}) {
  const [message, setMessage] = useState('')
  const transcript = useChatStore((state) => state.transcript)
  const activeStatus = useChatStore((state) => state.activeStatus)
  const error = useChatStore((state) => state.error)
  const { sendMessage } = useAgentChat()
  const viewportRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }, [activeStatus, transcript])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || isStreaming || !ready) return
    setMessage('')
    await sendMessage(trimmed)
  }

  function groupTranscriptItems(items: TranscriptItem[]): TranscriptItem[][] {
    const groups: TranscriptItem[][] = []
    let currentGroup: TranscriptItem[] = []

    for (const item of items) {
      if (item.kind === 'user') {
        if (currentGroup.length > 0) {
          groups.push(currentGroup)
          currentGroup = []
        }
        groups.push([item])
      } else {
        currentGroup.push(item)
      }
    }
    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }
    return groups
  }

  const groupedTranscript = groupTranscriptItems(transcript)

  return (
    <>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#1e1e1e]">
        {groupedTranscript.length === 0 ? (
          <div className="max-w-2xl rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm leading-7 text-muted-foreground">
            Configure OpenRouter and E2B in Settings, then ask the agent to build or modify files.
          </div>
        ) : (
          groupedTranscript.map((group, idx) => {
            const first = group[0]
            if (first.kind === 'user') {
              return <UserMessage key={first.id} content={first.content} />
            }
            return (
              <AssistantMessage
                key={idx}
                items={group}
                iteration={iteration}
                maxIterations={maxIterations}
                isStreaming={isStreaming}
              />
            )
          })
        )}

        {!isStreaming && activeStatus && transcript.length > 0 && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            <div className="flex items-center gap-1 px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-primary thinking-dot"></div>
              <div className="w-2 h-2 rounded-full bg-primary thinking-dot"></div>
              <div className="w-2 h-2 rounded-full bg-primary thinking-dot"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#252525] border-t border-white/10">
        <div className="relative">
          {error ? (
            <p className="mb-3 text-sm text-destructive">{error}</p>
          ) : null}
          {!ready ? (
            <p className="mb-3 text-sm text-amber-300">Add OpenRouter API key, choose a model, and add E2B API key before chatting.</p>
          ) : null}
          <form onSubmit={onSubmit}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe what you want to build..."
              disabled={!ready || isStreaming}
              className="w-full min-h-[100px] max-h-[200px] bg-[#323234] rounded-2xl px-4 py-4 pr-14 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              rows={3}
            />
            <button
              type="submit"
              disabled={!ready || isStreaming || !message.trim()}
              className="absolute bottom-3 right-3 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

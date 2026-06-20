import * as ScrollArea from '@radix-ui/react-scroll-area'
import { Cross2Icon } from '@radix-ui/react-icons'

import { useHistoryStore } from '@/store/history-store'
import type { ChatSession } from '@/types/chat'

export function ChatHistorySidebar({
  onGoHome,
  onSelectChat,
}: {
  onGoHome: () => void
  onSelectChat: (chat: ChatSession) => void
}) {
  const chats = useHistoryStore((state) => state.chats)
  const activeChatId = useHistoryStore((state) => state.activeChatId)
  const deleteChat = useHistoryStore((state) => state.deleteChat)

  function formatDate(ts: number) {
    const date = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60_000) return 'Just now'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col overflow-hidden border-r border-neutral-900 bg-neutral-950/95 backdrop-blur-xl">
      <button
        type="button"
        onClick={onGoHome}
        className="mt-2 flex h-12 shrink-0 items-center px-6 text-left transition hover:opacity-90"
      >
        <div className="flex items-center">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-neutral-200 text-[10px] font-bold text-black">
            A
          </div>
          <span className="ml-2 whitespace-nowrap text-sm font-medium text-neutral-100">assistant-ui</span>
        </div>
      </button>

      <div className="flex-1 overflow-hidden px-3 pb-3 pt-1">
        <div className="mb-3 flex items-center justify-between gap-3 px-3">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Recent Chats</div>
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex h-8 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 px-3 text-xs font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800"
          >
            <span className="mr-1 text-sm leading-none">+</span>
            New chat
          </button>
        </div>
        <ScrollArea.Root className="h-full overflow-hidden">
          <ScrollArea.Viewport className="h-full pr-1">
            {chats.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-800 px-3 py-4 text-sm text-neutral-500">
                Your recent conversations will appear here.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {chats.map((chat) => {
                  const isActive = chat.id === activeChatId

                  return (
                    <div key={chat.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => onSelectChat(chat)}
                        className={`w-full rounded-lg px-3 py-2 pr-8 text-left text-sm transition ${
                          isActive
                            ? 'bg-neutral-900/80 font-medium text-neutral-200'
                            : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <svg className="h-3.5 w-3.5 shrink-0 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="truncate">{chat.title}</span>
                        </div>
                        <div className="mt-1 truncate pl-5 text-[11px] text-neutral-500">{formatDate(chat.updatedAt)}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteChat(chat.id)
                          if (isActive) {
                            onGoHome()
                          }
                        }}
                        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full p-1 text-neutral-600 transition hover:bg-neutral-800 hover:text-neutral-200 group-hover:block"
                        aria-label={`Delete ${chat.title}`}
                      >
                        <Cross2Icon className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" className="flex w-2.5 touch-none bg-transparent p-0.5">
            <ScrollArea.Thumb className="relative flex-1 rounded-full bg-neutral-800" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </aside>
  )
}
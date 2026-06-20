import * as ScrollArea from '@radix-ui/react-scroll-area'
import { Cross2Icon, PlusIcon, ChatBubbleIcon } from '@radix-ui/react-icons'
import { useState } from 'react'

import { fetchFileTree } from '@/lib/api'
import { useChatStore } from '@/store/chat-store'
import { useHistoryStore } from '@/store/history-store'

export function ChatHistorySidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const chats = useHistoryStore((state) => state.chats)
  const activeChatId = useHistoryStore((state) => state.activeChatId)
  const setActiveChat = useHistoryStore((state) => state.setActiveChat)
  const deleteChat = useHistoryStore((state) => state.deleteChat)
  const createChat = useHistoryStore((state) => state.createChat)
  const setSessionId = useChatStore((state) => state.setSessionId)
  const loadTranscript = useChatStore((state) => state.loadTranscript)
  const setFileTree = useChatStore((state) => state.setFileTree)

  function handleSelectChat(chat: (typeof chats)[0]) {
    setActiveChat(chat.id)
    setSessionId(chat.sessionId)
    loadTranscript(chat.transcript)

    void fetchFileTree(chat.sessionId)
      .then((res) => setFileTree(res.root))
      .catch(() => setFileTree([]))
  }

  function handleNewChat() {
    const newId = crypto.randomUUID()
    setSessionId(newId)
    loadTranscript([])
    setFileTree([])
    createChat(newId)
  }

  function formatDate(ts: number) {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString()
  }

  if (collapsed) {
    return (
      <aside className="flex w-12 flex-col items-center border-r border-white/8 bg-black/60 py-3">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
          title="Open chat history"
        >
          <ChatBubbleIcon className="h-4 w-4" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex w-64 flex-col border-r border-white/8 bg-black/60">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">history</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
            title="New conversation"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
            title="Collapse sidebar"
          >
            <Cross2Icon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <ScrollArea.Root className="min-h-0 flex-1">
        <ScrollArea.Viewport className="h-full px-2 py-3">
          {chats.length === 0 ? (
            <div className="px-2 py-8 text-center text-xs leading-6 text-zinc-500">
              No conversations yet.<br />
              Send a message to start.
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => handleSelectChat(chat)}
                  className={`group relative flex w-full flex-col gap-0.5 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                    activeChatId === chat.id
                      ? 'bg-[#f97316]/10 text-zinc-100'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate text-[13px] font-medium leading-tight">
                    {chat.title}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {formatDate(chat.updatedAt)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChat(chat.id)
                      if (activeChatId === chat.id) {
                        handleNewChat()
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-600 opacity-0 transition hover:text-rose-400 group-hover:opacity-100"
                    title="Delete conversation"
                  >
                    <Cross2Icon className="h-3 w-3" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="flex w-2 touch-none bg-transparent p-0.5">
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-white/10" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </aside>
  )
}

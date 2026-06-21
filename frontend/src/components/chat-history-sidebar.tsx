import * as ScrollArea from '@radix-ui/react-scroll-area'

import { fetchFileTree } from '@/lib/api'
import { useChatStore } from '@/store/chat-store'
import { useHistoryStore } from '@/store/history-store'

export function ChatHistorySidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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

  function handleDeleteChat(id: string) {
    deleteChat(id)
    if (activeChatId === id) {
      handleNewChat()
    }
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

  if (!open) return null

  return (
    <aside className="flex w-64 flex-col bg-[#232323] border-r border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">History</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="New conversation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Close sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
        </div>
      </div>

      <ScrollArea.Root className="min-h-0 flex-1">
        <ScrollArea.Viewport className="h-full px-2 py-3">
          {chats.length === 0 ? (
            <div className="px-2 py-8 text-center text-xs text-muted-foreground">
              No conversations yet.<br />
              Send a message to start.
            </div>
          ) : (
            <div className="space-y-0.5">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => handleSelectChat(chat)}
                  className={`group relative flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeChatId === chat.id
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}
                >
                  <span className="truncate text-[13px] font-medium leading-tight">
                    {chat.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(chat.updatedAt)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteChat(chat.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                    title="Delete conversation"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </button>
              ))}
            </div>
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="flex w-1.5 touch-none bg-transparent p-0.5">
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-white/10" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </aside>
  )
}

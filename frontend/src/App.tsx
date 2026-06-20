import { useEffect, useMemo, useState } from 'react'

import { ChatHistorySidebar } from '@/components/chat-history-sidebar'
import { ChatPanel } from '@/components/chat-panel'
import { FileTreePanel } from '@/components/file-tree-panel'
import { HeaderBar } from '@/components/header-bar'
import { SettingsDialog } from '@/components/settings-dialog'
import { fetchFileTree, fetchHealth } from '@/lib/api'
import { useChatStore } from '@/store/chat-store'
import { useHistoryStore } from '@/store/history-store'
import { useSettingsStore } from '@/store/settings-store'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)
  const iteration = useChatStore((state) => state.iteration)
  const maxIterations = useChatStore((state) => state.maxIterations)
  const settings = useSettingsStore((state) => state.settings)
  const setSessionId = useChatStore((state) => state.setSessionId)
  const loadTranscript = useChatStore((state) => state.loadTranscript)
  const setFileTree = useChatStore((state) => state.setFileTree)
  const chats = useHistoryStore((state) => state.chats)
  const activeChatId = useHistoryStore((state) => state.activeChatId)

  const ready = useMemo(
    () =>
      Boolean(
        backendOnline &&
          settings.openrouterApiKey.trim() &&
          settings.selectedModel.trim() &&
          settings.e2bApiKey.trim(),
      ),
    [backendOnline, settings.e2bApiKey, settings.openrouterApiKey, settings.selectedModel],
  )

  useEffect(() => {
    document.documentElement.classList.add('dark')
    void fetchHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false))
  }, [])

  useEffect(() => {
    if (activeChatId) {
      const chat = chats.find((c) => c.id === activeChatId)
      if (chat) {
        setSessionId(chat.sessionId)
        loadTranscript(chat.transcript)
        void fetchFileTree(chat.sessionId)
          .then((res) => setFileTree(res.root))
          .catch(() => setFileTree([]))
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-100">
      <ChatHistorySidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderBar
          iteration={iteration}
          maxIterations={maxIterations}
          ready={ready}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <main className="mx-auto grid w-full max-w-[1800px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.9fr)] lg:px-8 lg:py-8">
          <ChatPanel />
          <FileTreePanel />
        </main>
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}

export default App

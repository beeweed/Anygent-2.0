import { useEffect, useMemo, useState } from 'react'

import { ChatHistorySidebar } from '@/components/chat-history-sidebar'
import { ChatPanel } from '@/components/chat-panel'
import { FileTreePanel } from '@/components/file-tree-panel'
import { MemorySidebar } from '@/components/memory-sidebar'
import { SettingsDialog } from '@/components/settings-dialog'
import { Toast } from '@/components/toast'
import { fetchFileTree, fetchHealth } from '@/lib/api'
import { useChatStore } from '@/store/chat-store'
import { useHistoryStore } from '@/store/history-store'
import { useSettingsStore } from '@/store/settings-store'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [memoryOpen, setMemoryOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [backendOnline, setBackendOnline] = useState(false)
  const [toast, setToast] = useState<{ message: string; description: string } | null>(null)
  const iteration = useChatStore((state) => state.iteration)
  const maxIterations = useChatStore((state) => state.maxIterations)
  const isStreaming = useChatStore((state) => state.isStreaming)
  const settings = useSettingsStore((state) => state.settings)
  const setSessionId = useChatStore((state) => state.setSessionId)
  const loadTranscript = useChatStore((state) => state.loadTranscript)
  const setFileTree = useChatStore((state) => state.setFileTree)
  const chats = useHistoryStore((state) => state.chats)
  const activeChatId = useHistoryStore((state) => state.activeChatId)
  const createChat = useHistoryStore((state) => state.createChat)
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
  }, [activeChatId])

  function handleNewChat() {
    const newId = crypto.randomUUID()
    setSessionId(newId)
    loadTranscript([])
    setFileTree([])
    createChat(newId)
  }

  return (
    <div id="app" className="h-screen w-screen overflow-hidden bg-[#272727]">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full bg-[#191919]">
        {/* SIDEBAR: Chat History */}
        <ChatHistorySidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        {/* LEFT SIDE: CHAT PANEL */}
        <div className="w-[440px] min-w-[380px] max-w-[520px] shrink-0 lg:w-[40%]">
          <div className="flex flex-col h-full m-3 rounded-3xl border border-white/5 overflow-hidden bg-[#1e1e1e]">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#252525] border-b border-white/10">
              <div className="flex items-center gap-3">
                {/* Hamburger button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 -ml-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-foreground">Vibe Coder</h1>
                  <p className="text-[11px] text-muted-foreground">Autonomous AI Agent</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMemoryOpen(true)}
                  className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </button>
                <button
                  onClick={handleNewChat}
                  className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
              </div>
            </div>

            <ChatPanel
              ready={ready}
              isStreaming={isStreaming}
              iteration={iteration}
              maxIterations={maxIterations}
            />
          </div>
        </div>

        {/* RIGHT SIDE: FILE PANEL */}
        <div className="flex-1 min-w-0 flex h-full">
          <FileTreePanel />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex-1 bg-[#1e1e1e] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Desktop View Required</h2>
            <p className="text-sm text-muted-foreground">Please use a larger screen for the full experience</p>
          </div>
        </div>
        <div className="flex h-14 bg-[#232323] border-t border-white/10">
          <button className="flex-1 flex items-center justify-center gap-2 text-primary bg-primary/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span className="text-sm font-medium">Chat</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            <span className="text-sm font-medium">Files</span>
          </button>
        </div>
      </div>

      <MemorySidebar open={memoryOpen} onOpenChange={setMemoryOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      {toast && <Toast message={toast.message} description={toast.description} onClose={() => setToast(null)} />}
    </div>
  )
}

export default App

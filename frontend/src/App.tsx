import { useEffect, useMemo, useRef, useState } from 'react'

import { APP_ROUTES } from '@/app/routes/route'
import { ChatHistorySidebar } from '@/components/chat-history-sidebar'
import { ChatPanel } from '@/components/chat-panel'
import { HeaderBar } from '@/components/header-bar'
import { SettingsDialog } from '@/components/settings-dialog'
import { fetchFileTree, fetchHealth } from '@/lib/api'
import { useChatStore } from '@/store/chat-store'
import { useHistoryStore } from '@/store/history-store'
import { useSettingsStore } from '@/store/settings-store'
import type { ChatSession } from '@/types/chat'

function normalizePath(pathname: string) {
  return pathname === APP_ROUTES.chat ? APP_ROUTES.chat : APP_ROUTES.home
}

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname))

  const iteration = useChatStore((state) => state.iteration)
  const maxIterations = useChatStore((state) => state.maxIterations)
  const settings = useSettingsStore((state) => state.settings)
  const setSessionId = useChatStore((state) => state.setSessionId)
  const loadTranscript = useChatStore((state) => state.loadTranscript)
  const setFileTree = useChatStore((state) => state.setFileTree)
  const selectFile = useChatStore((state) => state.selectFile)
  const setComposerDraft = useChatStore((state) => state.setComposerDraft)
  const chats = useHistoryStore((state) => state.chats)
  const activeChatId = useHistoryStore((state) => state.activeChatId)
  const setActiveChat = useHistoryStore((state) => state.setActiveChat)

  const hasRestoredInitialChat = useRef(false)
  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null

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

    const normalizedPath = normalizePath(window.location.pathname)
    if (window.location.pathname !== normalizedPath) {
      window.history.replaceState({}, '', normalizedPath)
    }
    setPathname(normalizedPath)

    void fetchHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false))

    const handlePopState = () => {
      setPathname(normalizePath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (hasRestoredInitialChat.current) {
      return
    }

    hasRestoredInitialChat.current = true

    if (!activeChatId) {
      return
    }

    const chat = chats.find((item) => item.id === activeChatId)
    if (!chat) {
      return
    }

    setSessionId(chat.sessionId)
    loadTranscript(chat.transcript)
    void fetchFileTree(chat.sessionId)
      .then((res) => setFileTree(res.root))
      .catch(() => setFileTree([]))
  }, [activeChatId, chats, loadTranscript, setFileTree, setSessionId])

  function navigate(nextPath: string) {
    const normalizedPath = normalizePath(nextPath)
    if (window.location.pathname !== normalizedPath) {
      window.history.pushState({}, '', normalizedPath)
    }
    setPathname(normalizedPath)
  }

  function resetToHome() {
    setActiveChat(null)
    setSessionId(crypto.randomUUID())
    loadTranscript([])
    setFileTree([])
    selectFile(null, '')
    setComposerDraft('')
    navigate(APP_ROUTES.home)
  }

  function handleSelectChat(chat: ChatSession) {
    setActiveChat(chat.id)
    setSessionId(chat.sessionId)
    loadTranscript(chat.transcript)
    void fetchFileTree(chat.sessionId)
      .then((res) => setFileTree(res.root))
      .catch(() => setFileTree([]))
    navigate(APP_ROUTES.chat)
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-50">
      <ChatHistorySidebar onGoHome={resetToHome} onSelectChat={handleSelectChat} />
      <div className="flex flex-1 flex-col overflow-hidden p-2 md:pl-0">
        <div className="flex flex-1 flex-col overflow-hidden rounded-[18px] border border-neutral-800/60 bg-neutral-900 shadow-[0_16px_60px_rgba(0,0,0,0.42)]">
          <HeaderBar
            title={pathname === APP_ROUTES.home ? 'Home' : activeChat?.title ?? 'New conversation'}
            iteration={iteration}
            maxIterations={maxIterations}
            ready={ready}
            onOpenSettings={() => setSettingsOpen(true)}
            onGoHome={resetToHome}
            showHomeShortcut={pathname === APP_ROUTES.chat}
          />
          <ChatPanel mode={pathname === APP_ROUTES.home ? 'home' : 'chat'} ready={ready} onNavigate={navigate} />
        </div>
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}

export default App
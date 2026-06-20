import { useCallback, useRef } from 'react'

import { fetchFileTree } from '@/lib/api'
import { streamChat, type ParsedEvent } from '@/lib/stream'
import { useChatStore } from '@/store/chat-store'
import { useHistoryStore } from '@/store/history-store'
import { useSettingsStore } from '@/store/settings-store'
import type { StreamEventMap } from '@/types/chat'

export function useAgentChat() {
  const settings = useSettingsStore((state) => state.settings)
  const {
    sessionId,
    startTurn,
    appendToken,
    pushToolChip,
    setStatus,
    setFileTree,
    setIteration,
    finishStream,
    setError,
    resetAssistantStreamingState,
  } = useChatStore()
  const createChat = useHistoryStore((state) => state.createChat)
  const activeChatId = useHistoryStore((state) => state.activeChatId)
  const updateTranscript = useHistoryStore((state) => state.updateTranscript)
  const updateTitle = useHistoryStore((state) => state.updateTitle)
  const chatIdRef = useRef<string | null>(null)

  const saveTranscript = useCallback(() => {
    const currentId = chatIdRef.current
    if (currentId) {
      const transcript = useChatStore.getState().transcript
      updateTranscript(currentId, transcript)
    }
  }, [updateTranscript])

  const sendMessage = useCallback(
    async (message: string) => {
      let chatId = activeChatId

      if (!chatId) {
        chatId = createChat(sessionId)
      }
      chatIdRef.current = chatId

      startTurn(message)
      saveTranscript()

      if (chatId) {
        const chats = useHistoryStore.getState().chats
        const chat = chats.find((c) => c.id === chatId)
        if (chat && chat.title === 'New conversation') {
          const title = message.length > 50 ? `${message.slice(0, 50)}...` : message
          updateTitle(chatId, title)
        }
      }

      try {
        await streamChat(
          {
            sessionId,
            message,
            settings,
          },
          (event: ParsedEvent) => {
            const data = event.data as StreamEventMap[keyof StreamEventMap]
            switch (event.event) {
              case 'status':
                setStatus(data as StreamEventMap['status'])
                break
              case 'iteration': {
                const payload = data as StreamEventMap['iteration']
                setIteration(payload.current, payload.max)
                break
              }
              case 'token':
                appendToken((data as StreamEventMap['token']).text)
                saveTranscript()
                break
              case 'tool_call':
                resetAssistantStreamingState()
                pushToolChip({ ...(data as StreamEventMap['tool_call']) })
                saveTranscript()
                break
              case 'tool_result':
                saveTranscript()
                break
              case 'files':
                setFileTree((data as StreamEventMap['files']).tree)
                break
              case 'done':
                finishStream()
                saveTranscript()
                break
              case 'error':
                finishStream()
                setError((data as StreamEventMap['error']).message)
                saveTranscript()
                break
              default:
                break
            }
          },
        )

        const latestTree = await fetchFileTree(sessionId)
        setFileTree(latestTree.root)
      } catch (error) {
        finishStream()
        setError(error instanceof Error ? error.message : 'Unable to complete the request.')
        saveTranscript()
      }
    },
    [
      activeChatId,
      appendToken,
      createChat,
      finishStream,
      pushToolChip,
      resetAssistantStreamingState,
      sessionId,
      saveTranscript,
      setError,
      setFileTree,
      setIteration,
      setStatus,
      settings,
      startTurn,
      updateTitle,
    ],
  )

  return { sendMessage }
}

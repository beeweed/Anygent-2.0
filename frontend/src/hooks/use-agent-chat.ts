import { useCallback } from 'react'

import { fetchFileTree } from '@/lib/api'
import { streamChat, type ParsedEvent } from '@/lib/stream'
import { useChatStore } from '@/store/chat-store'
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

  const sendMessage = useCallback(
    async (message: string) => {
      startTurn(message)
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
                break
              case 'tool_call':
                resetAssistantStreamingState()
                pushToolChip({ ...(data as StreamEventMap['tool_call']) })
                break
              case 'tool_result':
                break
              case 'files':
                setFileTree((data as StreamEventMap['files']).tree)
                break
              case 'done':
                finishStream()
                break
              case 'error':
                finishStream()
                setError((data as StreamEventMap['error']).message)
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
      }
    },
    [
      appendToken,
      finishStream,
      pushToolChip,
      resetAssistantStreamingState,
      sessionId,
      setError,
      setFileTree,
      setIteration,
      setStatus,
      settings,
      startTurn,
    ],
  )

  return { sendMessage }
}

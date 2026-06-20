import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ChatSession, TranscriptItem } from '@/types/chat'

type HistoryState = {
  chats: ChatSession[]
  activeChatId: string | null
  createChat: (sessionId: string) => string
  deleteChat: (id: string) => void
  setActiveChat: (id: string | null) => void
  updateTranscript: (chatId: string, transcript: TranscriptItem[]) => void
  updateTitle: (chatId: string, title: string) => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      chats: [],
      activeChatId: null,

      createChat: (sessionId) => {
        const id = crypto.randomUUID()
        const chat: ChatSession = {
          id,
          sessionId,
          title: 'New conversation',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          transcript: [],
        }
        set((state) => ({
          chats: [chat, ...state.chats],
          activeChatId: id,
        }))
        return id
      },

      deleteChat: (id) => {
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          activeChatId: state.activeChatId === id ? null : state.activeChatId,
        }))
      },

      setActiveChat: (id) => set({ activeChatId: id }),

      updateTranscript: (chatId, transcript) => {
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? { ...c, transcript, updatedAt: Date.now() }
              : c,
          ),
        }))
      },

      updateTitle: (chatId, title) => {
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? { ...c, title, updatedAt: Date.now() }
              : c,
          ),
        }))
      },
    }),
    {
      name: 'agent-studio-history',
    },
  ),
)

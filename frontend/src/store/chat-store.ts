import { create } from 'zustand'

import type { TranscriptItem } from '@/types/chat'
import type { FileNode } from '@/types/files'

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

type ChatState = {
  sessionId: string
  transcript: TranscriptItem[]
  activeStatus: { label: string; phase: string } | null
  fileTree: FileNode[]
  selectedFilePath: string | null
  selectedFileContent: string
  iteration: number
  maxIterations: number
  isStreaming: boolean
  error: string | null
  startTurn: (message: string) => void
  appendToken: (text: string) => void
  pushToolChip: (payload: { label: string; name: string; path: string; isError?: boolean }) => void
  setStatus: (status: { label: string; phase: string } | null) => void
  setFileTree: (tree: FileNode[]) => void
  selectFile: (path: string | null, content?: string) => void
  setIteration: (current: number, max: number) => void
  finishStream: () => void
  setError: (message: string | null) => void
  resetAssistantStreamingState: () => void
  setSessionId: (id: string) => void
  loadTranscript: (transcript: TranscriptItem[]) => void
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: crypto.randomUUID(),
  transcript: [],
  activeStatus: null,
  fileTree: [],
  selectedFilePath: null,
  selectedFileContent: '',
  iteration: 0,
  maxIterations: 1000,
  isStreaming: false,
  error: null,
  startTurn: (message) =>
    set((state) => ({
      transcript: [...state.transcript, { id: id('user'), kind: 'user', content: message }],
      activeStatus: { label: 'thinking....', phase: 'thinking' },
      iteration: 0,
      maxIterations: 1000,
      isStreaming: true,
      error: null,
    })),
  appendToken: (text) =>
    set((state) => {
      const transcript = [...state.transcript]
      const last = transcript[transcript.length - 1]
      if (last?.kind === 'assistant' && last.streaming) {
        last.content += text
      } else {
        transcript.push({ id: id('assistant'), kind: 'assistant', content: text, streaming: true })
      }
      return { transcript }
    }),
  pushToolChip: (payload) =>
    set((state) => {
      const transcript = [...state.transcript]
      const last = transcript[transcript.length - 1]
      if (last?.kind === 'assistant' && last.streaming) {
        last.streaming = false
      }
      transcript.push({ id: id('tool'), kind: 'tool', ...payload })
      return { transcript }
    }),
  setStatus: (status) => set({ activeStatus: status }),
  setFileTree: (tree) => set({ fileTree: tree }),
  selectFile: (path, content = '') => set({ selectedFilePath: path, selectedFileContent: content }),
  setIteration: (current, max) => set({ iteration: current, maxIterations: max }),
  finishStream: () =>
    set((state) => ({
      isStreaming: false,
      activeStatus: null,
      transcript: state.transcript.map((item, index) =>
        index === state.transcript.length - 1 && item.kind === 'assistant'
          ? { ...item, streaming: false }
          : item,
      ),
    })),
  setError: (message) => set({ error: message }),
  resetAssistantStreamingState: () =>
    set((state) => ({
      transcript: state.transcript.map((item, index) =>
        index === state.transcript.length - 1 && item.kind === 'assistant'
          ? { ...item, streaming: false }
          : item,
      ),
    })),
  setSessionId: (id) => set({ sessionId: id }),
  loadTranscript: (transcript) =>
    set({
      transcript,
      fileTree: [],
      selectedFilePath: null,
      selectedFileContent: '',
      iteration: 0,
      maxIterations: 1000,
      isStreaming: false,
      error: null,
      activeStatus: null,
    }),
}))

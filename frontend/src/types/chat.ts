export type TranscriptItem =
  | {
      id: string
      kind: 'user'
      content: string
    }
  | {
      id: string
      kind: 'assistant'
      content: string
      streaming: boolean
    }
  | {
      id: string
      kind: 'tool'
      label: string
      name: string
      path: string
      isError?: boolean
    }
  | {
      id: string
      kind: 'status'
      label: string
      phase: string
    }

export type ChatSession = {
  id: string
  sessionId: string
  title: string
  createdAt: number
  updatedAt: number
  transcript: TranscriptItem[]
}

export type StreamEventMap = {
  status: { label: string; phase: string }
  iteration: { current: number; max: number }
  token: { text: string }
  tool_call: { toolCallId: string; name: string; path: string; label: string }
  tool_result: { toolCallId: string; name: string; path: string; content: string; isError: boolean }
  files: { tree: import('./files').FileNode[] }
  done: { iterations: number }
  error: { message: string }
}

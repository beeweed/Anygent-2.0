import { buildStreamUrl, type ChatPayload } from './api'

export type ParsedEvent = {
  event: string
  data: unknown
}

function parseEventBlock(block: string): ParsedEvent | null {
  const lines = block.split('\n')
  let event = 'message'
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  }

  if (!dataLines.length) {
    return null
  }

  return {
    event,
    data: JSON.parse(dataLines.join('\n')),
  }
}

export async function streamChat(
  payload: ChatPayload,
  onEvent: (event: ParsedEvent) => void,
) {
  const response = await fetch(buildStreamUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok || !response.body) {
    const error = await response.text()
    throw new Error(error || 'Streaming request failed')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })

    while (buffer.includes('\n\n')) {
      const boundary = buffer.indexOf('\n\n')
      const block = buffer.slice(0, boundary).trim()
      buffer = buffer.slice(boundary + 2)
      if (!block) {
        continue
      }
      const parsed = parseEventBlock(block)
      if (parsed) {
        onEvent(parsed)
      }
    }
  }
}

import * as Collapsible from '@radix-ui/react-collapsible'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { ChevronDownIcon, ChevronRightIcon, ReloadIcon } from '@radix-ui/react-icons'
import { FileCode2, FolderTree } from 'lucide-react'
import { useState } from 'react'

import { fetchFileContent, fetchFileTree } from '@/lib/api'
import { useChatStore } from '@/store/chat-store'
import type { FileNode } from '@/types/files'

function FileTreeNode({ node, depth, onSelect }: { node: FileNode; depth: number; onSelect: (path: string) => void }) {
  const [open, setOpen] = useState(depth < 1)

  if (node.nodeType === 'file') {
    return (
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04]"
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
      >
        <FileCode2 className="h-4 w-4 text-zinc-500" />
        <span className="truncate">{node.name}</span>
      </button>
    )
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="space-y-1">
      <Collapsible.Trigger className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-white/[0.04]" style={{ paddingLeft: `${depth * 14 + 12}px` }}>
        {open ? <ChevronDownIcon className="h-4 w-4 text-zinc-500" /> : <ChevronRightIcon className="h-4 w-4 text-zinc-500" />}
        <FolderTree className="h-4 w-4 text-[#f97316]" />
        <span className="truncate">{node.name}</span>
      </Collapsible.Trigger>
      <Collapsible.Content className="space-y-1">
        {node.children.map((child) => (
          <FileTreeNode key={child.path} node={child} depth={depth + 1} onSelect={onSelect} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export function FileTreePanel() {
  const sessionId = useChatStore((state) => state.sessionId)
  const fileTree = useChatStore((state) => state.fileTree)
  const selectedFilePath = useChatStore((state) => state.selectedFilePath)
  const selectedFileContent = useChatStore((state) => state.selectedFileContent)
  const setFileTree = useChatStore((state) => state.setFileTree)
  const selectFile = useChatStore((state) => state.selectFile)
  const [loading, setLoading] = useState(false)

  async function refreshTree() {
    setLoading(true)
    try {
      const response = await fetchFileTree(sessionId)
      setFileTree(response.root)
    } finally {
      setLoading(false)
    }
  }

  async function handleSelect(path: string) {
    const response = await fetchFileContent(sessionId, path)
    selectFile(path, response.content)
  }

  return (
    <section className="grid min-h-[72vh] grid-rows-[minmax(0,1fr)_minmax(240px,0.9fr)] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_24px_70px_rgba(0,0,0,0.42)] lg:grid-rows-1">
      <div className="flex min-h-0 flex-col border-b border-white/8 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">filesystem</p>
            <h2 className="mt-1 text-sm font-medium text-zinc-100 sm:text-base">Sandbox explorer</h2>
          </div>
          <button
            type="button"
            onClick={() => void refreshTree()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/[0.06]"
          >
            <ReloadIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <ScrollArea.Root className="min-h-0 flex-1">
          <ScrollArea.Viewport className="h-[34vh] px-3 py-4 lg:h-full">
            {fileTree.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-4 text-sm text-zinc-500">
                Files appear here after the first sandbox-backed tool run.
              </div>
            ) : (
              <div className="space-y-1">
                {fileTree.map((node) => (
                  <FileTreeNode key={node.path} node={node} depth={0} onSelect={handleSelect} />
                ))}
              </div>
            )}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" className="flex w-2.5 touch-none bg-transparent p-0.5">
            <ScrollArea.Thumb className="relative flex-1 rounded-full bg-white/10" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>

      <div className="flex min-h-0 flex-col bg-black/40">
        <div className="border-b border-white/8 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">preview</p>
          <h3 className="mt-1 truncate text-sm text-zinc-200">{selectedFilePath ?? 'Select a file'}</h3>
        </div>
        <ScrollArea.Root className="min-h-0 flex-1">
          <ScrollArea.Viewport className="h-[28vh] px-5 py-4 lg:h-full">
            <pre className="min-h-full whitespace-pre-wrap break-words font-mono text-[12px] leading-6 text-zinc-300">
              {selectedFileContent || 'No file selected.'}
            </pre>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" className="flex w-2.5 touch-none bg-transparent p-0.5">
            <ScrollArea.Thumb className="relative flex-1 rounded-full bg-white/10" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </section>
  )
}

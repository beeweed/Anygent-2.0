import * as Collapsible from '@radix-ui/react-collapsible'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useState } from 'react'

import { fetchFileContent, fetchFileTree } from '@/lib/api'
import { useChatStore } from '@/store/chat-store'
import type { FileNode } from '@/types/files'

function FileTreeNode({ node, depth, onSelect, selectedPath }: { node: FileNode; depth: number; onSelect: (path: string) => void; selectedPath: string | null }) {
  const [open, setOpen] = useState(depth < 1)

  if (node.nodeType === 'file') {
    const isSelected = selectedPath === node.path
    return (
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        className={`flex w-full items-center gap-1.5 px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 ${
          isSelected ? 'bg-primary/15 text-primary' : 'hover:bg-white/5 text-foreground'
        }`}
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
      >
        <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
        </svg>
        <span className="text-[13px] truncate">{node.name}</span>
      </button>
    )
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger
        className="flex w-full items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-white/5 rounded-lg transition-all duration-150"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        <svg className="w-3 h-3 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          )}
        </svg>
        <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
        </svg>
        <span className="text-[13px] text-foreground truncate">{node.name}</span>
      </Collapsible.Trigger>
      <Collapsible.Content>
        {node.children.map((child) => (
          <FileTreeNode key={child.path} node={child} depth={depth + 1} onSelect={onSelect} selectedPath={selectedPath} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()
  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return { icon: 'code', color: 'text-blue-400' }
    case 'css':
    case 'scss':
    case 'less':
      return { icon: 'file', color: 'text-purple-400' }
    case 'json':
      return { icon: 'file', color: 'text-yellow-400' }
    case 'html':
      return { icon: 'code', color: 'text-orange-400' }
    case 'md':
      return { icon: 'file', color: 'text-green-400' }
    default:
      return { icon: 'file', color: 'text-blue-400' }
  }
}

function EditorTab({ name, active, onClick, onClose }: { name: string; active: boolean; onClick: () => void; onClose: () => void }) {
  const { color } = getFileIcon(name)
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${
        active
          ? 'bg-background border-t-2 border-t-primary rounded-t-lg text-foreground'
          : 'text-muted-foreground hover:bg-white/5 rounded-t-lg'
      }`}
    >
      <svg className={`w-4 h-4 ${color} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
      </svg>
      <span className="text-xs">{name}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="p-0.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
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
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
    if (!openTabs.includes(path)) {
      setOpenTabs([...openTabs, path])
    }
    setActiveTab(path)
    try {
      const response = await fetchFileContent(sessionId, path)
      selectFile(path, response.content)
    } catch {
      selectFile(path, 'Error loading file content.')
    }
  }

  function handleCloseTab(path: string) {
    const newTabs = openTabs.filter((t) => t !== path)
    setOpenTabs(newTabs)
    if (activeTab === path) {
      const nextTab = newTabs[newTabs.length - 1] || null
      setActiveTab(nextTab)
      if (nextTab) {
        void fetchFileContent(sessionId, nextTab).then((r) => selectFile(nextTab, r.content))
      } else {
        selectFile(null, '')
      }
    }
  }

  const breadcrumbParts = activeTab ? activeTab.split('/').filter(Boolean) : []

  return (
    <div className="flex-1 min-w-0 flex h-full">
      {!sidebarCollapsed && (
        <div className="w-56 lg:w-64 bg-[#232323] border-r border-white/10 flex flex-col">
          <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Explorer</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void refreshTree()}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>
          </div>

          <ScrollArea.Root className="min-h-0 flex-1">
            <ScrollArea.Viewport className="h-full py-2">
              {/* Files section */}
              <div className="px-2">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Files</span>
                </div>
                {fileTree.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-muted-foreground">Files appear here after the first tool run.</div>
                ) : (
                  <div className="space-y-0.5">
                    {fileTree.map((node) => (
                      <FileTreeNode key={node.path} node={node} depth={0} onSelect={handleSelect} selectedPath={selectedFilePath} />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" className="flex w-1.5 touch-none bg-transparent p-0.5">
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-white/10" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          <div className="p-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              <span>Collapse</span>
            </button>
          </div>
        </div>
      )}

      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        {sidebarCollapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="p-1.5 rounded-r-lg bg-[#232323] border border-l-0 border-white/10 text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        )}

        {/* Editor Tabs Bar */}
        <div className="flex items-center h-10 bg-[#1e1e1e] border-b border-white/10 px-2 gap-1 overflow-x-auto">
          {openTabs.length === 0 ? (
            <span className="text-xs text-muted-foreground px-3">No file open</span>
          ) : (
            openTabs.map((tabPath) => {
              const name = tabPath.split('/').pop() || tabPath
              return (
                <EditorTab
                  key={tabPath}
                  name={name}
                  active={activeTab === tabPath}
                  onClick={() => handleSelect(tabPath)}
                  onClose={() => handleCloseTab(tabPath)}
                />
              )
            })
          )}
        </div>

        {/* Breadcrumb */}
        {activeTab && breadcrumbParts.length > 0 && (
          <div className="flex items-center h-7 px-4 bg-[#1e1e1e] border-b border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              {breadcrumbParts.map((part, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  )}
                  <span className={idx === breadcrumbParts.length - 1 ? 'text-foreground' : ''}>{part}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-6">
          {selectedFileContent ? (
            <pre className="hljs" dangerouslySetInnerHTML={{ __html: highlightCode(selectedFileContent) }} />
          ) : (
            <div className="text-muted-foreground text-sm">Select a file to preview its contents</div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between h-6 px-3 bg-[#232323] border-t border-white/10 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{activeTab?.endsWith('.tsx') ? 'TypeScript React' : activeTab?.endsWith('.ts') ? 'TypeScript' : activeTab?.endsWith('.css') ? 'CSS' : activeTab?.endsWith('.json') ? 'JSON' : 'Plain Text'}</span>
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function highlightCode(code: string): string {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Simple syntax highlighting for common patterns
  return escaped
    .replace(/(\/\/.*)/g, '<span class="hljs-comment">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hljs-comment">$1</span>')
    .replace(/\b(import|export|from|return|const|let|var|function|if|else|for|while|class|interface|type|extends|implements|new|try|catch|throw|async|await|default|typeof|void|this|super|null|undefined|true|false|break|continue|switch|case|enum|module|namespace|declare|as|any|boolean|number|string)\b/g,
      '<span class="hljs-keyword">$1</span>')
    .replace(/\b(console|Math|JSON|Object|Array|String|Number|Boolean|Promise|crypto|fetch|setTimeout|setInterval|document|window)\b/g,
      '<span class="hljs-built_in">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
      '<span class="hljs-string">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g,
      '<span class="hljs-number">$1</span>')
    .replace(/&lt;(\/?[\w-]+)/g,
      '<span class="hljs-tag">&lt;$1</span>')
}

import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useState } from 'react'

import { useChatStore } from '@/store/chat-store'

export function MemorySidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const iteration = useChatStore((state) => state.iteration)
  const fileTree = useChatStore((state) => state.fileTree)
  const transcript = useChatStore((state) => state.transcript)
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'timeline'>('overview')

  const toolCalls = transcript.filter((t) => t.kind === 'tool').length
  const fileCount = fileTree.reduce((count, node) => countFiles(node, count), 0)

  function countFiles(node: import('@/types/files').FileNode, acc: number): number {
    if (node.nodeType === 'file') return acc + 1
    return node.children.reduce((sum, child) => countFiles(child, sum), acc)
  }

  return (
    <div id="memory-sidebar" className={`fixed inset-0 z-50 ${open ? '' : 'hidden'}`}>
      <div
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] md:w-[480px] lg:w-[520px] bg-[#2d2d2d] shadow-2xl animate-slide-in-right overflow-hidden flex flex-col">
        <div className="bg-[#232323] px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Agent Memory</h2>
                <p className="text-xs text-muted-foreground">Session context & history</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span className="text-[10px] font-medium text-primary uppercase tracking-wide">Iterations</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{iteration}</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wide">Files</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{fileCount}</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
                <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wide">Tool Calls</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{toolCalls}</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wide">Context</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{transcript.length}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-4">
          {(['overview', 'files', 'timeline'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'overview' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              )}
              {tab === 'files' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"/>
                </svg>
              )}
              {tab === 'timeline' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              )}
              {tab}
            </button>
          ))}
        </div>

        <ScrollArea.Root className="flex-1">
          <ScrollArea.Viewport className="h-full p-4">
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-[#363638] border border-white/10 overflow-hidden">
                  <div className="px-4 py-3 bg-[#2a2a2c] border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      <span className="text-sm font-medium text-foreground">Context Overview</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-xs text-muted-foreground">Code Files</span>
                      </div>
                      <span className="text-xs font-medium text-foreground">{fileCount} files</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-xs text-muted-foreground">Style Files</span>
                      </div>
                      <span className="text-xs font-medium text-foreground">0 files</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-xs text-muted-foreground">Config Files</span>
                      </div>
                      <span className="text-xs font-medium text-foreground">0 files</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#363638] border border-white/10 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Session Info</h4>
                  <p className="text-xs text-muted-foreground">
                    This panel shows the current agent state, including iteration count, file operations, and tool calls made during this session.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-2">
                {fileTree.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-4">No files in the current session.</div>
                ) : (
                  fileTree.map((node) => (
                    <div key={node.path} className="flex items-center gap-2 p-2 rounded-lg bg-[#363638] border border-white/10">
                      <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                      </svg>
                      <span className="text-sm text-foreground truncate">{node.name}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-2">
                {transcript.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-4">No activity yet.</div>
                ) : (
                  transcript.map((item, idx) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#363638] border border-white/10">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.kind === 'user' ? 'bg-primary/20' : item.kind === 'tool' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                      }`}>
                        {item.kind === 'user' ? (
                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        ) : item.kind === 'tool' ? (
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground capitalize">{item.kind}</span>
                          {item.kind === 'tool' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              item.status === 'success' ? 'bg-emerald-500/15 text-emerald-400' :
                              item.status === 'loading' ? 'bg-primary/15 text-primary' :
                              'bg-muted/15 text-muted-foreground'
                            }`}>
                              {item.status || 'done'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.kind === 'user' ? item.content : item.kind === 'tool' ? item.path : 'Processing...'}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{idx + 1}s ago</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" className="flex w-2 touch-none bg-transparent p-0.5">
            <ScrollArea.Thumb className="relative flex-1 rounded-full bg-white/10" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </div>
  )
}

export function HeaderBar({
  iteration,
  maxIterations,
  ready,
  onOpenSettings,
}: {
  iteration: number
  maxIterations: number
  ready: boolean
  onOpenSettings: () => void
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.36em] text-muted-foreground">agent studio</p>
            <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">Autonomous sandbox file agent</h1>
          </div>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
              iteration <span className="text-foreground">{iteration}</span> / {maxIterations}
            </div>
            <div className={`rounded-full px-3 py-1.5 text-xs ${ready ? 'bg-emerald-500/12 text-emerald-300' : 'bg-amber-500/12 text-amber-300'}`}>
              {ready ? 'ready' : 'settings required'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground transition hover:bg-white/[0.08]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Settings
        </button>
      </div>
    </header>
  )
}

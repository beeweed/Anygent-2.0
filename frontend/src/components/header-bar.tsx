import { GearIcon } from '@radix-ui/react-icons'

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
    <header className="sticky top-0 z-20 border-b border-white/8 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.36em] text-zinc-500">agent studio</p>
            <h1 className="truncate text-lg font-semibold text-zinc-50 sm:text-xl">Autonomous sandbox file agent</h1>
          </div>
          <div className="hidden h-8 w-px bg-white/8 sm:block" />
          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300">
              iteration <span className="text-zinc-50">{iteration}</span> / {maxIterations}
            </div>
            <div className={`rounded-full px-3 py-1.5 text-xs ${ready ? 'bg-emerald-500/12 text-emerald-300' : 'bg-amber-500/12 text-amber-300'}`}>
              {ready ? 'ready' : 'settings required'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-100 transition hover:bg-white/[0.08]"
        >
          <GearIcon className="h-4 w-4" />
          Settings
        </button>
      </div>
    </header>
  )
}

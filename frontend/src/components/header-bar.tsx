import { GearIcon } from '@radix-ui/react-icons'

export function HeaderBar({
  title,
  iteration,
  maxIterations,
  ready,
  onOpenSettings,
}: {
  title: string
  iteration: number
  maxIterations: number
  ready: boolean
  onOpenSettings: () => void
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-neutral-800/50 px-4">
      <div className="min-w-0 flex-1">
        {title ? <span className="block truncate text-sm font-medium text-neutral-200">{title}</span> : null}
        <span className="sr-only">
          iteration {iteration} of {maxIterations}; {ready ? 'ready' : 'settings required'}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-200"
        aria-label="Open settings"
      >
        <GearIcon className="h-4 w-4" />
      </button>
    </header>
  )
}
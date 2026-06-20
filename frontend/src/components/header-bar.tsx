import { GearIcon } from '@radix-ui/react-icons'

export function HeaderBar({
  title,
  iteration,
  maxIterations,
  ready,
  onOpenSettings,
  onGoHome,
  showHomeShortcut,
}: {
  title: string
  iteration: number
  maxIterations: number
  ready: boolean
  onOpenSettings: () => void
  onGoHome: () => void
  showHomeShortcut: boolean
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-neutral-800/50 px-4">
      <button
        type="button"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-300 md:hidden"
        aria-label="Open navigation"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onGoHome}
        className={`hidden h-8 w-8 items-center justify-center rounded-md transition md:flex ${
          showHomeShortcut
            ? 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            : 'pointer-events-none text-neutral-700'
        }`}
        aria-label="Go to home"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      <div className="min-w-0">
        <span className="block truncate text-sm font-medium text-neutral-200">{title}</span>
        <span className="sr-only">
          iteration {iteration} of {maxIterations}; {ready ? 'ready' : 'settings required'}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-200"
        aria-label="Open settings"
      >
        <GearIcon className="h-4 w-4" />
      </button>
    </header>
  )
}
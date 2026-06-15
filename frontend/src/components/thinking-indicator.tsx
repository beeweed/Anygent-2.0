import { cn } from '@/utils/cn'

export function ThinkingIndicator({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-300',
        className,
      )}
    >
      <span className="relative block h-2 w-2 rounded-full bg-[#f97316] shadow-[0_0_18px_rgba(249,115,22,0.8)] before:absolute before:inset-0 before:animate-ping before:rounded-full before:bg-[#f97316]/40" />
      <span className="shimmer-text">{label}</span>
    </div>
  )
}

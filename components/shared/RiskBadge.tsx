import { RiskLevel } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
  compact?: boolean
}

export function RiskBadge({ level, className, compact }: RiskBadgeProps) {
  const styles = {
    LOW: 'bg-risk-low/20 text-risk-low border-risk-low/30 shadow-[0_0_12px_rgba(34,197,94,0.3)]',
    MEDIUM: 'bg-risk-medium/20 text-risk-medium border-risk-medium/30',
    HIGH: 'bg-risk-high/20 text-risk-high border-risk-high/30 animate-pulse',
    UNKNOWN: 'bg-text-muted/10 text-text-muted border-dashed border-text-muted/30',
  }

  const dotStyles = {
    LOW: 'bg-risk-low shadow-[0_0_8px_rgba(34,197,94,0.5)]',
    MEDIUM: 'bg-risk-medium',
    HIGH: 'bg-risk-high animate-pulse',
    UNKNOWN: 'bg-text-muted',
  }

  const labels = {
    LOW: 'LOW RISK',
    MEDIUM: 'MEDIUM RISK',
    HIGH: 'HIGH RISK',
    UNKNOWN: '—',
  }

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider",
          compact && 'text-text-muted',
          className
        )}
      >
        <span className={cn("w-2 h-2 rounded-full", dotStyles[level])} />
        {labels[level]}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider border",
        styles[level],
        className
      )}
    >
      {labels[level]}
    </span>
  )
}

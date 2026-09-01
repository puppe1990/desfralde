import { weekdayLabelsPt } from '../domains/star-chart'
import type { StarKind, StarMark } from '../domains/star-chart'

type StarGridProps = {
  dates: Array<string>
  marks: Array<StarMark>
  onToggle: (date: string, kind: StarKind) => void
}

const kinds: Array<StarKind> = ['xixi', 'coco']

export function StarGrid({ dates, marks, onToggle }: StarGridProps) {
  const labels = weekdayLabelsPt()

  return (
    <div className="grid grid-cols-8 items-center gap-2 rounded-3xl bg-[#fff8ec] p-4 shadow-[0_18px_40px_rgba(42,33,24,0.12)]">
      <div />
      {labels.map((label) => (
        <div key={label} className="text-center font-display text-sm">
          {label}
        </div>
      ))}
      {kinds.map((kind) => (
        <StarRow
          key={kind}
          kind={kind}
          dates={dates}
          marks={marks}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

function StarRow({
  kind,
  dates,
  marks,
  onToggle,
}: {
  kind: StarKind
  dates: Array<string>
  marks: Array<StarMark>
  onToggle: (date: string, kind: StarKind) => void
}) {
  return (
    <>
      <div className="font-display text-sm capitalize">{kind}</div>
      {dates.map((date) => {
        const on = marks.some(
          (mark) => mark.date === date && mark.kind === kind,
        )
        return (
          <button
            key={`${kind}-${date}`}
            type="button"
            aria-label={`${kind} ${date}`}
            onClick={() => onToggle(date, kind)}
            className={`aspect-square rounded-xl border-2 ${
              on
                ? 'border-[#b87a1c] bg-[#fff3d6] text-xl'
                : 'border-dashed border-[#e7d7b8] bg-white'
            }`}
          >
            {on ? '★' : ''}
          </button>
        )
      })}
    </>
  )
}

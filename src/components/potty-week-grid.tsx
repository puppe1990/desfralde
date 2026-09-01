import {
  POTTY_KIND_LABELS,
  formatPottyClock,
  formatPottyWeekday,
  isPottyToday,
} from '../domains/potty-log'
import type { PottyDay, PottyKind } from '../domains/potty-log'

const kindTone: Record<PottyKind, string> = {
  xixi: 'border-[#9a3d28] bg-[#fde7df] text-[#9a3d28]',
  coco: 'border-[#335648] bg-[#e7f1eb] text-[#335648]',
}

type PottyWeekGridProps = {
  days: Array<PottyDay>
  today?: string
}

export function PottyWeekGrid({ days, today }: PottyWeekGridProps) {
  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((day) => (
        <PottyWeekDay
          key={day.date}
          day={day}
          isToday={today ? day.date === today : isPottyToday(day.date)}
        />
      ))}
    </div>
  )
}

function PottyWeekDay({ day, isToday }: { day: PottyDay; isToday: boolean }) {
  return (
    <article
      className={`rounded-[22px] border-4 bg-[#fff8ec] p-3 shadow-[0_18px_40px_rgba(42,33,24,0.08)] ${
        isToday ? 'border-[#c45c3e]' : 'border-[#e7d7b8]'
      }`}
    >
      <h3 className="font-display text-lg">{formatPottyWeekday(day.date)}</h3>
      {day.entries.length === 0 ? (
        <p className="mt-3 text-sm text-[#5a4c3d]">Nada</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {day.entries.map((event) => (
            <li
              key={event.id}
              className={`rounded-2xl border-2 px-2 py-1.5 ${kindTone[event.kind]}`}
            >
              <span className="block font-bold">
                {formatPottyClock(event.occurredAt)}
              </span>
              <span className="text-sm">{POTTY_KIND_LABELS[event.kind]}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

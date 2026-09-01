import { Link, createFileRoute } from '@tanstack/react-router'

import { PottyWeekGrid } from '../components/potty-week-grid'
import {
  formatPottyWeekRange,
  groupPottyEventsInWeek,
  pottyDayKey,
  pottyWeekDates,
  shiftPottyDay,
} from '../domains/potty-log'
import { getChildBoardFn, listPottyEventsFn } from '../server/child-board'

type HorariosSearch = {
  semana?: string
}

function parseSemana(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  return value
}

export const Route = createFileRoute('/criancas/$childId/horarios')({
  validateSearch: (search: Record<string, unknown>): HorariosSearch => ({
    semana: parseSemana(search.semana),
  }),
  loader: async ({ params }) => {
    const [board, events] = await Promise.all([
      getChildBoardFn({ data: { childId: params.childId } }),
      listPottyEventsFn({ data: { childId: params.childId } }),
    ])
    return { board, events }
  },
  component: HorariosPage,
})

function HorariosPage() {
  const { board, events } = Route.useLoaderData()
  const { semana } = Route.useSearch()
  const today = pottyDayKey(Date.now())
  const week = pottyWeekDates(semana ?? today)
  const days = groupPottyEventsInWeek(events, week)
  const monday = week[0] ?? today
  const childId = board.child.id

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="font-serif text-4xl">Horários de {board.child.name}</h2>
      <p className="mt-2 text-[#5a4c3d]">
        Os xixi e cocô de cada dia · {formatPottyWeekRange(week)}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to="/criancas/$childId/horarios"
          params={{ childId }}
          search={{ semana: shiftPottyDay(monday, -7) }}
          className="rounded-2xl border-2 border-[#2a2118] px-4 py-2 font-bold text-[#2a2118] no-underline"
        >
          Semana anterior
        </Link>
        <Link
          to="/criancas/$childId/horarios"
          params={{ childId }}
          search={{ semana: today }}
          className="rounded-2xl border-2 border-[#2a2118] px-4 py-2 font-bold text-[#2a2118] no-underline"
        >
          Esta semana
        </Link>
        <Link
          to="/criancas/$childId/horarios"
          params={{ childId }}
          search={{ semana: shiftPottyDay(monday, 7) }}
          className="rounded-2xl border-2 border-[#2a2118] px-4 py-2 font-bold text-[#2a2118] no-underline"
        >
          Próxima semana
        </Link>
      </div>
      <div className="mt-6">
        <PottyWeekGrid days={days} today={today} />
      </div>
    </main>
  )
}

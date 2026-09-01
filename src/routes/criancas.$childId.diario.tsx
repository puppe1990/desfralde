import { createFileRoute, useRouter } from '@tanstack/react-router'

import { PottyNow } from '../components/potty-now'
import {
  formatPottyClock,
  formatPottyDayLabel,
  groupPottyEventsByDay,
  POTTY_KIND_LABELS,
} from '../domains/potty-log'
import {
  deletePottyEventFn,
  getChildBoardFn,
  listPottyEventsFn,
  logPottyEventFn,
} from '../server/child-board'

export const Route = createFileRoute('/criancas/$childId/diario')({
  loader: async ({ params }) => {
    const [board, events] = await Promise.all([
      getChildBoardFn({ data: { childId: params.childId } }),
      listPottyEventsFn({ data: { childId: params.childId } }),
    ])
    return { board, events }
  },
  component: DiarioPage,
})

function DiarioPage() {
  const { board, events } = Route.useLoaderData()
  const router = useRouter()
  const days = groupPottyEventsByDay(events)

  async function refreshAfter(action: () => Promise<unknown>) {
    await action()
    await router.invalidate()
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="font-serif text-4xl">Diário de {board.child.name}</h2>
      <p className="mt-2 text-[#5a4c3d]">
        Horário de cada xixi e cocô. Assim a casa e a creche veem o ritmo.
      </p>

      <div className="mt-6">
        <PottyNow
          events={events}
          onLog={(kind, when) =>
            refreshAfter(() =>
              logPottyEventFn({
                data: {
                  childId: board.child.id,
                  kind,
                  clock: when?.clock,
                  day: when?.day,
                },
              }),
            )
          }
          onDelete={(eventId) =>
            refreshAfter(() =>
              deletePottyEventFn({
                data: { childId: board.child.id, eventId },
              }),
            )
          }
        />
      </div>

      {days.length === 0 ? (
        <p className="mt-8 text-[#5a4c3d]">Ainda não anotaram nada.</p>
      ) : (
        <ol className="mt-8 grid gap-5">
          {days.map((day) => (
            <li
              key={day.date}
              className="rounded-[22px] bg-[#fff8ec] p-4 shadow-[0_18px_40px_rgba(42,33,24,0.08)]"
            >
              <h3 className="font-display text-xl capitalize">
                {formatPottyDayLabel(day.date)}
              </h3>
              <ul className="mt-3 grid gap-2">
                {day.entries.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[#2a2118]/10 bg-white px-3 py-2"
                  >
                    <span className="font-bold">
                      {formatPottyClock(event.occurredAt)}
                    </span>
                    <span>{POTTY_KIND_LABELS[event.kind]}</span>
                    <button
                      type="button"
                      className="text-sm font-bold text-[#9a3d28]"
                      onClick={() =>
                        void refreshAfter(() =>
                          deletePottyEventFn({
                            data: {
                              childId: board.child.id,
                              eventId: event.id,
                            },
                          }),
                        )
                      }
                    >
                      Apagar
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}

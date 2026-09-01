import { createFileRoute, useRouter } from '@tanstack/react-router'

import { ChildAvatar } from '../components/child-avatar'
import { PecsCard } from '../components/pecs-card'
import { PottyNow } from '../components/potty-now'
import {
  deletePottyEventFn,
  getChildBoardFn,
  listPottyEventsFn,
  logPottyEventFn,
} from '../server/child-board'

export const Route = createFileRoute('/criancas/$childId/')({
  loader: async ({ params }) => {
    const [board, events] = await Promise.all([
      getChildBoardFn({ data: { childId: params.childId } }),
      listPottyEventsFn({ data: { childId: params.childId } }),
    ])
    return { board, events }
  },
  component: ChildBoardPage,
})

function ChildBoardPage() {
  const { board, events } = Route.useLoaderData()
  const router = useRouter()

  async function refreshAfter(action: () => Promise<unknown>) {
    await action()
    await router.invalidate()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-center gap-4">
        <span className="size-24 overflow-hidden rounded-[18px] border-2 border-[#b87a1c] bg-[#f7f0e4]">
          <ChildAvatar name={board.child.name} avatar={board.child.avatar} />
        </span>
        <h2 className="font-serif text-4xl">O que você precisa?</h2>
      </div>
      <p className="mt-2 text-[#5a4c3d]">
        Toque no cartão para ouvir. A criança pode mostrar ou entregar.
      </p>

      <div className="mt-6">
        <PottyNow
          events={events}
          avatar={board.child.avatar}
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

      <h3 className="font-display mt-8 mb-3 text-2xl">Cartões de pedido</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {board.pedidos.map((card) => (
          <PecsCard key={card.id} {...card} avatar={board.child.avatar} />
        ))}
      </div>

      <h3 className="font-display mt-10 mb-3 text-2xl">Rotina</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {board.rotina.map((card, index) => (
          <PecsCard
            key={card.id}
            {...card}
            number={index + 1}
            avatar={board.child.avatar}
          />
        ))}
      </div>
    </main>
  )
}

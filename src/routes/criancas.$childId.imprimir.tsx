import { createFileRoute } from '@tanstack/react-router'

import { PecsCard } from '../components/pecs-card'
import { getChildBoardFn } from '../server/child-board'

export const Route = createFileRoute('/criancas/$childId/imprimir')({
  loader: ({ params }) => getChildBoardFn({ data: { childId: params.childId } }),
  component: ImprimirPage,
})

function ImprimirPage() {
  const board = Route.useLoaderData()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 print:max-w-none">
      <div className="mb-6 flex items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-serif text-4xl">Imprimir kit</h2>
          <p className="mt-2 text-[#5a4c3d]">
            Recorte, plastifique e cole velcro. Ative gráficos de fundo na
            impressão.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-[#c45c3e] px-5 py-3 font-bold text-white"
        >
          Imprimir
        </button>
      </div>

      <h3 className="font-display mb-3 text-2xl">Pedidos de {board.child.name}</h3>
      <div className="grid grid-cols-2 gap-4">
        {board.pedidos.map((card) => (
          <PecsCard key={card.id} {...card} />
        ))}
      </div>

      <h3 className="font-display mt-8 mb-3 text-2xl">Rotina</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {board.rotina.map((card, index) => (
          <PecsCard key={card.id} {...card} number={index + 1} />
        ))}
      </div>
    </main>
  )
}

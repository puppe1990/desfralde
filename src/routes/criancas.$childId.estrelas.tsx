import { createFileRoute, useRouter } from '@tanstack/react-router'

import { StarGrid } from '../components/star-grid'
import { weekStartingMonday } from '../domains/star-chart'
import {
  getChildBoardFn,
  listStarsFn,
  toggleStarFn,
} from '../server/child-board'

export const Route = createFileRoute('/criancas/$childId/estrelas')({
  loader: async ({ params }) => {
    const [board, marks] = await Promise.all([
      getChildBoardFn({ data: { childId: params.childId } }),
      listStarsFn({ data: { childId: params.childId } }),
    ])
    return { board, marks }
  },
  component: EstrelasPage,
})

function EstrelasPage() {
  const { board, marks } = Route.useLoaderData()
  const router = useRouter()
  const dates = weekStartingMonday(new Date())

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="font-serif text-4xl">Estrelas do vaso</h2>
      <p className="mt-2 text-[#5a4c3d]">
        Cada ida com sucesso vira uma estrela para {board.child.name}.
      </p>
      <div className="mt-6">
        <StarGrid
          dates={dates}
          marks={marks}
          onToggle={async (date, kind) => {
            await toggleStarFn({
              data: { childId: board.child.id, date, kind },
            })
            await router.invalidate()
          }}
        />
      </div>
    </main>
  )
}

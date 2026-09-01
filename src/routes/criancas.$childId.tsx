import { Outlet, createFileRoute } from '@tanstack/react-router'

import { ChildNav } from '../components/child-nav'
import { getChildBoardFn } from '../server/child-board'

export const Route = createFileRoute('/criancas/$childId')({
  loader: ({ params }) => getChildBoardFn({ data: { childId: params.childId } }),
  component: ChildLayout,
})

function ChildLayout() {
  const board = Route.useLoaderData()

  return (
    <div>
      <ChildNav
        childId={board.child.id}
        childName={board.child.name}
        avatar={board.child.avatar}
      />
      <Outlet />
    </div>
  )
}

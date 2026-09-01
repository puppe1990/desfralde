import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { ChildNav } from '../components/child-nav'
import { getCurrentUserFn } from '../server/auth'
import { getChildBoardFn } from '../server/child-board'

export const Route = createFileRoute('/criancas/$childId')({
  loader: async ({ params }) => {
    const [board, user] = await Promise.all([
      getChildBoardFn({ data: { childId: params.childId } }),
      getCurrentUserFn(),
    ])
    if (!user) throw redirect({ to: '/entrar' })
    return { board, user }
  },
  component: ChildLayout,
})

function ChildLayout() {
  const { board, user } = Route.useLoaderData()

  return (
    <div>
      <ChildNav
        childId={board.child.id}
        childName={board.child.name}
        avatar={board.child.avatar}
        userName={user.name}
      />
      <Outlet />
    </div>
  )
}

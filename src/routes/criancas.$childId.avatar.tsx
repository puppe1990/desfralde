import { createFileRoute, useRouter } from '@tanstack/react-router'

import { AvatarPicker } from '../components/avatar-picker'
import { getChildBoardFn, updateChildAvatarFn } from '../server/child-board'

export const Route = createFileRoute('/criancas/$childId/avatar')({
  loader: ({ params }) =>
    getChildBoardFn({ data: { childId: params.childId } }),
  component: AvatarPage,
})

function AvatarPage() {
  const board = Route.useLoaderData()
  const router = useRouter()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="font-serif mb-6 text-4xl">Avatar de {board.child.name}</h2>
      <AvatarPicker
        name={board.child.name}
        value={board.child.avatar}
        onChange={(avatar) => {
          void updateChildAvatarFn({
            data: { childId: board.child.id, avatar },
          }).then(() => router.invalidate())
        }}
      />
    </main>
  )
}

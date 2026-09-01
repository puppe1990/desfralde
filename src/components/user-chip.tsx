import { Link, useRouter } from '@tanstack/react-router'

import { personInitial } from '../domains/person-initial'
import { logoutFn } from '../server/auth'

export function UserChip({
  name,
  childId,
}: {
  name: string
  childId?: string
}) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      {childId ? (
        <Link
          to="/criancas/$childId/configuracao"
          params={{ childId }}
          aria-label={`Conta de ${name}`}
          title={name}
          className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-[#2a2118] bg-[#e0a03a] font-display text-lg font-extrabold text-[#2a2118] no-underline"
        >
          {personInitial(name)}
        </Link>
      ) : (
        <Link
          to="/configuracao"
          aria-label={`Conta de ${name}`}
          title={name}
          className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-[#2a2118] bg-[#e0a03a] font-display text-lg font-extrabold text-[#2a2118] no-underline"
        >
          {personInitial(name)}
        </Link>
      )}
      <button
        type="button"
        className="rounded-full border-2 border-[#2a2118] px-4 py-2 text-sm font-bold"
        onClick={async () => {
          await logoutFn()
          await router.navigate({ to: '/' })
          await router.invalidate()
        }}
      >
        Sair
      </button>
    </div>
  )
}

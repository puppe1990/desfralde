import { Link } from '@tanstack/react-router'

import { ChildAvatar } from './child-avatar'
import { UserChip } from './user-chip'
import type { ChildAvatar as Avatar } from '../domains/child-avatar'

const links = [
  { to: '/criancas/$childId', label: 'Quadro' },
  { to: '/criancas/$childId/diario', label: 'Diário' },
  { to: '/criancas/$childId/passos', label: 'Passo a passo' },
  { to: '/criancas/$childId/estrelas', label: 'Estrelas' },
  { to: '/criancas/$childId/avatar', label: 'Avatar' },
  { to: '/criancas/$childId/imprimir', label: 'Imprimir' },
] as const

export function ChildNav({
  childId,
  childName,
  avatar,
  userName,
}: {
  childId: string
  childName: string
  avatar: Avatar
  userName: string
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#2a2118]/10 bg-[#fff8ec]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-3 text-[#2a2118] no-underline"
        >
          <span className="size-14 overflow-hidden rounded-2xl border-2 border-[#b87a1c] bg-[#f7f0e4]">
            <ChildAvatar name={childName} avatar={avatar} />
          </span>
          <span>
            <strong className="font-serif text-lg">{childName}</strong>
            <span className="block text-[0.7rem] tracking-[0.08em] text-[#5a4c3d] uppercase">
              PECS de desfralde
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              params={{ childId }}
              className="rounded-full bg-[#2a2118]/6 px-3 py-1.5 text-sm font-bold text-[#2a2118] no-underline"
              activeProps={{
                className:
                  'rounded-full bg-[#2a2118] px-3 py-1.5 text-sm font-bold text-[#fff8ec] no-underline',
              }}
            >
              {link.label}
            </Link>
          ))}
          <UserChip name={userName} childId={childId} />
        </nav>
      </div>
    </header>
  )
}

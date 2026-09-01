import { Link } from '@tanstack/react-router'

import { UserChip } from './user-chip'

export function FamilyHeader({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#2a2118]/10 bg-[#fff8ec]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-[#2a2118] no-underline">
          <strong className="font-serif text-lg">Desfralde</strong>
          <span className="block text-[0.7rem] tracking-[0.08em] text-[#5a4c3d] uppercase">
            PECS de desfralde
          </span>
        </Link>
        <UserChip name={userName} />
      </div>
    </header>
  )
}

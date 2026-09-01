import { speakPortuguese } from '../lib/speak-portuguese'
import type { CardTone } from '../domains/pecs-card'

const toneClass: Record<CardTone, string> = {
  terra: 'border-[#9a3d28] bg-[#fde7df] text-[#9a3d28]',
  sage: 'border-[#335648] bg-[#e7f1eb] text-[#335648]',
  honey: 'border-[#b87a1c] bg-[#fff3d6] text-[#8a5a10]',
}

type PecsCardProps = {
  label: string
  speak: string
  imageSrc: string
  tone: CardTone
  number?: number
}

export function PecsCard({
  label,
  speak,
  imageSrc,
  tone,
  number,
}: PecsCardProps) {
  return (
    <button
      type="button"
      onClick={() => speakPortuguese(speak)}
      className={`pecs-card relative w-full overflow-hidden rounded-[22px] border-4 bg-[#fff8ec] text-left shadow-[0_18px_40px_rgba(42,33,24,0.12)] ${toneClass[tone]}`}
    >
      <span className="relative block aspect-square overflow-hidden bg-[#f7f0e4]">
        {number != null ? (
          <span className="absolute top-2.5 left-2.5 z-10 grid size-8 place-items-center rounded-full border-2 border-[#2a2118] bg-[#e0a03a] font-display text-sm font-extrabold text-[#2a2118]">
            {number}
          </span>
        ) : null}
        <img src={imageSrc} alt={label} className="size-full object-cover" />
      </span>
      <span className="block border-t-3 border-[#2a2118] px-2 py-2.5 text-center font-display text-xl font-bold">
        {label}
      </span>
    </button>
  )
}

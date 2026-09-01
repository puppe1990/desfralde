import { useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'

import { pecsCardImageSrc } from '../domains/pecs-card'
import type { CardTone } from '../domains/pecs-card'
import type { ChildAvatar } from '../domains/child-avatar'
import { speakPortuguese } from '../lib/speak-portuguese'
import { tapPointPercent } from '../lib/tap-point'

const toneClass: Record<CardTone, string> = {
  terra: 'border-[#9a3d28] bg-[#fde7df] text-[#9a3d28]',
  sage: 'border-[#335648] bg-[#e7f1eb] text-[#335648]',
  honey: 'border-[#b87a1c] bg-[#fff3d6] text-[#8a5a10]',
}

function pecsCardClass(tone: CardTone, speaking: boolean) {
  const speakingClass = speaking ? 'is-speaking' : ''
  return `pecs-card relative w-full overflow-hidden rounded-[22px] border-4 bg-[#fff8ec] text-left shadow-[0_18px_40px_rgba(42,33,24,0.12)] ${toneClass[tone]} ${speakingClass}`
}

function restartSpeaking(card: HTMLButtonElement) {
  card.classList.remove('is-speaking')
  void card.offsetWidth
  card.classList.add('is-speaking')
}

type PecsCardProps = {
  slug?: string
  label: string
  speak: string
  imageSrc: string
  tone: CardTone
  number?: number
  avatar?: ChildAvatar
}

function useCardPress() {
  const [burst, setBurst] = useState(0)
  const [tap, setTap] = useState({ x: 50, y: 50 })

  function markTap(event: PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    setTap(tapPointPercent(rect, event.clientX, event.clientY))
  }

  function press(card: HTMLButtonElement) {
    restartSpeaking(card)
    setBurst((count) => count + 1)
  }

  return { tap, speaking: burst > 0, markTap, press }
}

export function PecsCard({
  slug,
  label,
  speak,
  imageSrc,
  tone,
  number,
  avatar,
}: PecsCardProps) {
  const press = useCardPress()
  const tintedSrc = pecsCardImageSrc(slug ?? '', imageSrc, avatar)
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null)
  const src = brokenSrc === tintedSrc ? imageSrc : tintedSrc

  return (
    <button
      type="button"
      onPointerDown={press.markTap}
      onClick={(event) => {
        speakPortuguese(speak)
        press.press(event.currentTarget)
      }}
      style={
        {
          '--tap-x': `${press.tap.x}%`,
          '--tap-y': `${press.tap.y}%`,
        } as CSSProperties
      }
      className={pecsCardClass(tone, press.speaking)}
    >
      <span className="relative block aspect-square overflow-hidden bg-[#f7f0e4]">
        {number != null ? (
          <span className="absolute top-2.5 left-2.5 z-10 grid size-8 place-items-center rounded-full border-2 border-[#2a2118] bg-[#e0a03a] font-display text-sm font-extrabold text-[#2a2118]">
            {number}
          </span>
        ) : null}
        <img
          src={src}
          alt={label}
          className="size-full object-cover"
          onError={() => setBrokenSrc(tintedSrc)}
        />
      </span>
      <span className="block border-t-3 border-[#2a2118] px-2 py-2.5 text-center font-display text-xl font-bold">
        {label}
      </span>
    </button>
  )
}

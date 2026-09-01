import { useState } from 'react'

import { CustomPottyTimeForm } from './custom-potty-time-form'
import type { CustomPottyWhen } from './custom-potty-time-form'
import { pecsCardImageSrc } from '../domains/pecs-card'
import type { ChildAvatar } from '../domains/child-avatar'
import {
  POTTY_KIND_LABELS,
  eventsOnDay,
  formatPottyClock,
  pottyDayKey,
} from '../domains/potty-log'
import type { PottyEvent, PottyKind } from '../domains/potty-log'
import { speakPortuguese } from '../lib/speak-portuguese'

type PottyNowProps = {
  events: Array<PottyEvent>
  avatar?: ChildAvatar
  onLog: (kind: PottyKind, when?: CustomPottyWhen) => Promise<void>
  onDelete: (eventId: string) => Promise<void>
}

const buttons: Array<{ kind: PottyKind; image: string; tone: string }> = [
  {
    kind: 'xixi',
    image: '/pecs/xixi-pedido.jpg',
    tone: 'border-[#9a3d28] bg-[#fde7df]',
  },
  {
    kind: 'coco',
    image: '/pecs/coco-pedido.jpg',
    tone: 'border-[#335648] bg-[#e7f1eb]',
  },
]

export function PottyNow({ events, avatar, onLog, onDelete }: PottyNowProps) {
  const today = pottyDayKey(Date.now())
  const todays = eventsOnDay(events, today)
  const [customOpen, setCustomOpen] = useState(false)

  return (
    <section className="rounded-[22px] border-4 border-[#b87a1c] bg-[#fff8ec] p-4 shadow-[0_18px_40px_rgba(42,33,24,0.08)]">
      <h3 className="font-display text-2xl">Fez agora?</h3>
      <p className="mt-1 text-sm text-[#5a4c3d]">
        Um toque anota agora. Se já passou, coloque a hora.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {buttons.map((button) => (
          <button
            key={button.kind}
            type="button"
            onClick={() => {
              speakPortuguese(POTTY_KIND_LABELS[button.kind])
              void onLog(button.kind)
            }}
            className={`flex min-h-20 items-center gap-3 rounded-2xl border-4 px-3 py-2 text-left ${button.tone}`}
          >
            <img
              src={pecsCardImageSrc(button.kind, button.image, avatar)}
              alt=""
              className="size-16 rounded-xl object-cover"
            />
            <span className="font-display text-2xl font-bold">
              {POTTY_KIND_LABELS[button.kind]}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCustomOpen(true)}
          className="font-display min-h-14 rounded-2xl border-4 border-[#b87a1c] bg-[#fff3d6] text-xl font-bold text-[#8a5a10] sm:col-span-2"
        >
          Outro horário
        </button>
      </div>
      {customOpen ? (
        <CustomPottyTimeForm
          onCancel={() => setCustomOpen(false)}
          onSubmit={(kind, when) => {
            void onLog(kind, when)
            setCustomOpen(false)
          }}
        />
      ) : null}
      <p className="mt-4 font-display text-lg">Hoje</p>
      {todays.length === 0 ? (
        <p className="mt-1 text-sm text-[#5a4c3d]">Nada anotado ainda.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {todays.map((event) => (
            <li key={event.id}>
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#2a2118] bg-white px-3 py-1.5 text-sm font-bold">
                {formatPottyClock(event.occurredAt)}{' '}
                {POTTY_KIND_LABELS[event.kind]}
                <button
                  type="button"
                  aria-label={`Apagar ${POTTY_KIND_LABELS[event.kind]} das ${formatPottyClock(event.occurredAt)}`}
                  onClick={() => void onDelete(event.id)}
                  className="text-[#9a3d28]"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

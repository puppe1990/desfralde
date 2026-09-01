import { useState } from 'react'
import type { FormEvent } from 'react'

import { pecsTextFieldClass } from './settings-form-chrome'
import {
  POTTY_KIND_LABELS,
  POTTY_KINDS,
  occurredAtOnPottyDay,
  parsePottyClock,
  pottyDayKey,
} from '../domains/potty-log'
import type { PottyKind } from '../domains/potty-log'

export type CustomPottyWhen = {
  clock: string
  day: string
}

type CustomPottyTimeFormProps = {
  onSubmit: (kind: PottyKind, when: CustomPottyWhen) => void
  onCancel: () => void
}

export function CustomPottyTimeForm({
  onSubmit,
  onCancel,
}: CustomPottyTimeFormProps) {
  const [kind, setKind] = useState<PottyKind>('xixi')
  const [day, setDay] = useState(() => pottyDayKey(Date.now()))
  const [clock, setClock] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      parsePottyClock(clock)
      occurredAtOnPottyDay(day, clock)
      onSubmit(kind, { clock, day })
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Horário inválido para anotar.',
      )
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 grid gap-3 rounded-2xl border-4 border-[#b87a1c] bg-[#fff3d6] p-3"
    >
      <p className="font-display text-xl font-bold">Que horas foi?</p>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-bold">O que foi?</legend>
        <div className="flex flex-wrap gap-2">
          {POTTY_KINDS.map((item) => (
            <label
              key={item}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#2a2118] bg-white px-3 py-1.5 text-sm font-bold"
            >
              <input
                type="radio"
                name="potty-kind"
                value={item}
                checked={kind === item}
                onChange={() => setKind(item)}
              />
              {POTTY_KIND_LABELS[item]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-1 text-sm font-bold">
        Dia
        <input
          type="date"
          value={day}
          onChange={(event) => setDay(event.target.value)}
          className={pecsTextFieldClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Hora
        <input
          type="time"
          value={clock}
          step={60}
          onChange={(event) => setClock(event.target.value)}
          required
          className={pecsTextFieldClass}
        />
      </label>
      {error ? <p className="text-sm text-[#9a3d28]">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="min-h-12 rounded-2xl bg-[#c45c3e] px-5 font-bold text-white"
        >
          Anotar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-12 rounded-2xl border-2 border-[#2a2118] px-5 font-bold"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { updateTherapistFn } from '../server/account'
import { pecsTextFieldClass, SettingsFormStatus } from './settings-form-chrome'

export function TherapistNameForm({
  therapistName,
}: {
  therapistName: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  return (
    <section className="rounded-[22px] border-4 border-[#335648] bg-[#fff8ec] p-5 shadow-[0_18px_40px_rgba(42,33,24,0.08)]">
      <h2 className="font-display text-2xl">Terapeuta</h2>
      <p className="mt-1 text-sm text-[#5a4c3d]">
        {therapistName
          ? `Hoje a terapeuta da casa é ${therapistName}.`
          : 'Ainda não há terapeuta nesta casa.'}
      </p>
      <form
        key={therapistName}
        className="mt-4 grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          const fields = new FormData(event.currentTarget)
          setError(null)
          setDone(false)
          try {
            await updateTherapistFn({
              data: { name: String(fields.get('name') ?? '') },
            })
            setDone(true)
            await router.invalidate()
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : 'Não foi possível salvar a terapeuta',
            )
          }
        }}
      >
        <input
          name="name"
          required
          defaultValue={therapistName}
          placeholder="Nome da terapeuta"
          className={pecsTextFieldClass}
        />
        <button
          type="submit"
          className="rounded-2xl bg-[#335648] px-5 py-3 font-bold text-white"
        >
          Salvar terapeuta
        </button>
      </form>
      <SettingsFormStatus
        error={error}
        done={done ? 'Terapeuta atualizada.' : null}
      />
    </section>
  )
}

import { useState } from 'react'

import { changePasswordFn } from '../server/account'
import { pecsTextFieldClass, SettingsFormStatus } from './settings-form-chrome'

export function PasswordChangeForm({ email }: { email: string }) {
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  return (
    <section className="rounded-[22px] border-4 border-[#b87a1c] bg-[#fff8ec] p-5 shadow-[0_18px_40px_rgba(42,33,24,0.08)]">
      <h2 className="font-display text-2xl">Senha</h2>
      <p className="mt-1 text-sm text-[#5a4c3d]">
        Use a senha atual para confirmar que é você.
      </p>
      <form
        className="mt-4 grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          const form = event.currentTarget
          const fields = new FormData(form)
          setError(null)
          setDone(false)
          try {
            await changePasswordFn({
              data: {
                currentPassword: String(fields.get('currentPassword') ?? ''),
                newPassword: String(fields.get('newPassword') ?? ''),
                confirmPassword: String(fields.get('confirmPassword') ?? ''),
              },
            })
            form.reset()
            setDone(true)
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : 'Não foi possível trocar a senha',
            )
          }
        }}
      >
        <input
          type="email"
          autoComplete="username"
          value={email}
          readOnly
          tabIndex={-1}
          aria-hidden
          className="sr-only"
        />
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Senha atual"
          className={pecsTextFieldClass}
        />
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Nova senha (mín. 8)"
          className={pecsTextFieldClass}
        />
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Confirmar nova senha"
          className={pecsTextFieldClass}
        />
        <button
          type="submit"
          className="rounded-2xl bg-[#c45c3e] px-5 py-3 font-bold text-white"
        >
          Salvar senha
        </button>
      </form>
      <SettingsFormStatus
        error={error}
        done={
          done ? 'Senha atualizada. Entre com a nova da próxima vez.' : null
        }
      />
    </section>
  )
}

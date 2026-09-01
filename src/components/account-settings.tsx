import { Link, redirect } from '@tanstack/react-router'

import { getCurrentUserFn } from '../server/auth'
import { getFamilyFn } from '../server/onboarding'
import { PasswordChangeForm } from './password-change-form'
import { SettingsTabs } from './settings-tabs'
import { TeacherAccessForm } from './teacher-access-form'
import { TherapistNameForm } from './therapist-name-form'

export async function loadAccountSettings() {
  const user = await getCurrentUserFn()
  if (!user) throw redirect({ to: '/entrar' })
  if (!user.familyId) throw redirect({ to: '/comecar' })
  const family = await getFamilyFn()
  return {
    user,
    therapistName:
      family?.adults.find((adult) => adult.role === 'terapeuta')?.name ?? '',
    teacherName:
      family?.adults.find((adult) => adult.role === 'professora')?.name ?? '',
  }
}

export function AccountSettings({
  user,
  therapistName,
  teacherName,
  childId,
}: Awaited<ReturnType<typeof loadAccountSettings>> & { childId?: string }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-serif text-5xl leading-none">Configuração</h1>
      <p className="mt-4 text-[#5a4c3d]">
        Senha da conta, terapeuta e acesso da professora da creche.
      </p>
      <SettingsTabs
        senha={<PasswordChangeForm email={user.email} />}
        terapeuta={<TherapistNameForm therapistName={therapistName} />}
        professora={<TeacherAccessForm teacherName={teacherName} />}
      />
      <p className="mt-8">
        {childId ? (
          <Link
            to="/criancas/$childId"
            params={{ childId }}
            className="font-bold text-[#9a3d28]"
          >
            Voltar ao quadro
          </Link>
        ) : (
          <Link to="/" className="font-bold text-[#9a3d28]">
            Voltar aos quadros
          </Link>
        )}
      </p>
    </main>
  )
}

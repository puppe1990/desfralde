import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { AdultList } from './adult-list'
import { AvatarPicker } from './avatar-picker'
import { defaultChildAvatar } from '../domains/child-avatar'
import type { ChildAvatar } from '../domains/child-avatar'
import {
  PARENT_ROLE_LABELS,
  STAFF_ROLE_LABELS,
  addAdultRow,
  removeAdultRow,
} from '../domains/onboarding-draft'
import type { ParentRole, StaffRole } from '../domains/onboarding-draft'
import { completeOnboardingFn } from '../server/onboarding'

type ParentDraft = { name: string; role: ParentRole }
type ChildDraft = { name: string; avatar: ChildAvatar }
type StaffDraft = { name: string; role: StaffRole }

const steps = ['Responsáveis', 'Crianças', 'Equipe', 'Avatares'] as const

export function OnboardingWizard({
  defaultParentName,
}: {
  defaultParentName: string
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [parents, setParents] = useState<Array<ParentDraft>>([
    { name: defaultParentName, role: 'mae' },
  ])
  const [kids, setKids] = useState<Array<ChildDraft>>([
    { name: '', avatar: defaultChildAvatar() },
  ])
  const [staff, setStaff] = useState<Array<StaffDraft>>([])
  const [avatarIndex, setAvatarIndex] = useState(0)

  async function finish() {
    setError(null)
    try {
      await completeOnboardingFn({
        data: {
          parents: parents.filter((adult) => adult.name.trim()),
          children: kids.filter((child) => child.name.trim()),
          staff: staff.filter((adult) => adult.name.trim()),
        },
      })
      await router.navigate({ to: '/' })
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível salvar',
      )
    }
  }

  const namedKids = kids.filter((child) => child.name.trim())
  const currentKid = namedKids.at(avatarIndex) ?? namedKids.at(0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs font-bold tracking-[0.22em] text-[#9a3d28] uppercase">
        Começar
      </p>
      <h1 className="font-serif mt-2 text-4xl">{steps[step]}</h1>
      <div className="mt-4 mb-8 flex gap-2">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`h-2 flex-1 rounded-full ${index <= step ? 'bg-[#c45c3e]' : 'bg-[#e7d7b8]'}`}
          />
        ))}
      </div>

      {step === 0 ? (
        <AdultList
          people={parents}
          roles={['mae', 'pai']}
          labels={PARENT_ROLE_LABELS}
          addLabel="Adicionar responsável"
          minimum={1}
          blankRole={
            parents.some((parent) => parent.role === 'mae') ? 'pai' : 'mae'
          }
          onChange={setParents}
        />
      ) : null}

      {step === 1 ? (
        <div className="grid gap-3">
          {kids.map((child, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={child.name}
                placeholder={`Nome da criança ${index + 1}`}
                onChange={(event) => {
                  const next = [...kids]
                  next[index] = { ...child, name: event.target.value }
                  setKids(next)
                }}
                className="min-w-0 flex-1 rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
              />
              {kids.length > 1 ? (
                <button
                  type="button"
                  aria-label={`Remover criança ${index + 1}`}
                  onClick={() => setKids(removeAdultRow(kids, index, 1))}
                  className="px-3 text-2xl font-bold text-[#9a3d28]"
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="rounded-2xl border-2 border-dashed border-[#b87a1c] px-4 py-3 text-left font-display text-xl font-bold text-[#8a5a10]"
            onClick={() =>
              setKids(
                addAdultRow(kids, { name: '', avatar: defaultChildAvatar() }),
              )
            }
          >
            + Outra criança
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <p className="mb-4 text-[#5a4c3d]">
            Opcional. Terapeuta, professora ou as duas.
          </p>
          <AdultList
            people={staff}
            roles={['terapeuta', 'professora']}
            labels={STAFF_ROLE_LABELS}
            addLabel="Adicionar terapeuta ou professora"
            minimum={0}
            blankRole="terapeuta"
            onChange={setStaff}
          />
        </div>
      ) : null}

      {step === 3 && currentKid ? (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {namedKids.map((child, index) => (
              <button
                key={child.name + index}
                type="button"
                onClick={() => setAvatarIndex(index)}
                className={`rounded-full px-3 py-1.5 font-bold ${
                  index === avatarIndex
                    ? 'bg-[#2a2118] text-[#fff8ec]'
                    : 'bg-[#fff8ec]'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
          <AvatarPicker
            name={currentKid.name}
            value={currentKid.avatar}
            onChange={(avatar) => {
              const sourceIndex = kids.indexOf(currentKid)
              if (sourceIndex < 0) return
              const updated = [...kids]
              updated[sourceIndex] = { ...currentKid, avatar }
              setKids(updated)
            }}
          />
        </div>
      ) : null}

      {error ? <p className="mt-4 text-[#9a3d28]">{error}</p> : null}

      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            className="rounded-2xl border-2 border-[#2a2118] px-5 py-3 font-bold"
            onClick={() => setStep(step - 1)}
          >
            Voltar
          </button>
        ) : null}
        {step < steps.length - 1 ? (
          <button
            type="button"
            className="rounded-2xl bg-[#c45c3e] px-5 py-3 font-bold text-white"
            onClick={() => setStep(step + 1)}
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            className="rounded-2xl bg-[#c45c3e] px-5 py-3 font-bold text-white"
            onClick={() => void finish()}
          >
            Abrir os quadros
          </button>
        )}
      </div>
    </div>
  )
}

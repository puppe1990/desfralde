import { addAdultRow, removeAdultRow } from '../domains/onboarding-draft'

type AdultListProps<TRole extends string> = {
  people: Array<{ name: string; role: TRole }>
  roles: Array<TRole>
  labels: Record<TRole, string>
  addLabel: string
  minimum: number
  blankRole: TRole
  onChange: (people: Array<{ name: string; role: TRole }>) => void
}

export function AdultList<TRole extends string>({
  people,
  roles,
  labels,
  addLabel,
  minimum,
  blankRole,
  onChange,
}: AdultListProps<TRole>) {
  return (
    <div className="grid gap-3">
      {people.map((person, index) => (
        <div
          key={index}
          className="grid gap-2 sm:grid-cols-[1fr_160px_auto] sm:items-center"
        >
          <input
            value={person.name}
            placeholder="Nome"
            onChange={(event) => {
              const next = [...people]
              next[index] = { ...person, name: event.target.value }
              onChange(next)
            }}
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          />
          <select
            value={person.role}
            onChange={(event) => {
              const next = [...people]
              next[index] = { ...person, role: event.target.value as TRole }
              onChange(next)
            }}
            className="rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {labels[role]}
              </option>
            ))}
          </select>
          {people.length > minimum ? (
            <button
              type="button"
              aria-label={`Remover ${addLabel.replace(/^Adicionar /i, '')} ${index + 1}`}
              onClick={() => onChange(removeAdultRow(people, index, minimum))}
              className="justify-self-start px-3 text-2xl font-bold text-[#9a3d28] sm:justify-self-center"
            >
              ×
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        className="justify-self-start font-bold text-[#9a3d28]"
        onClick={() =>
          onChange(addAdultRow(people, { name: '', role: blankRole }))
        }
      >
        + {addLabel}
      </button>
    </div>
  )
}

import { ChildAvatar } from './child-avatar'
import {
  GENDER_LABELS,
  GENDERS,
  HAIR_COLOR_HEX,
  HAIR_COLOR_LABELS,
  HAIR_COLORS,
  HAIR_TYPE_LABELS,
  HAIR_TYPES,
  SKIN_TONE_HEX,
  SKIN_TONE_LABELS,
  SKIN_TONES,
  type ChildAvatar as Avatar,
} from '../domains/child-avatar'

type AvatarPickerProps = {
  name: string
  value: Avatar
  onChange: (avatar: Avatar) => void
}

export function AvatarPicker({ name, value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
      <article className="overflow-hidden rounded-[22px] border-4 border-[#b87a1c] bg-[#fff8ec] text-[#8a5a10] shadow-[0_18px_40px_rgba(42,33,24,0.12)]">
        <div className="aspect-square bg-[#f7f0e4]">
          <ChildAvatar name={name} avatar={value} />
        </div>
        <p className="border-t-[3px] border-[#2a2118] px-2 py-2.5 text-center font-display text-xl font-bold text-[#2a2118]">
          {name || 'Criança'}
        </p>
      </article>
      <div className="grid gap-5">
        <ChoiceRow label="Gênero">
          {GENDERS.map((gender) => (
            <Chip
              key={gender}
              selected={value.gender === gender}
              onClick={() => onChange({ ...value, gender })}
            >
              {GENDER_LABELS[gender]}
            </Chip>
          ))}
        </ChoiceRow>
        <ChoiceRow label="Tom de pele">
          {SKIN_TONES.map((tone) => (
            <Swatch
              key={tone}
              title={SKIN_TONE_LABELS[tone]}
              color={SKIN_TONE_HEX[tone]}
              selected={value.skinTone === tone}
              onClick={() => onChange({ ...value, skinTone: tone })}
            />
          ))}
        </ChoiceRow>
        <ChoiceRow label="Tipo de cabelo">
          {HAIR_TYPES.map((type) => (
            <Chip
              key={type}
              selected={value.hairType === type}
              onClick={() => onChange({ ...value, hairType: type })}
            >
              {HAIR_TYPE_LABELS[type]}
            </Chip>
          ))}
        </ChoiceRow>
        <ChoiceRow label="Cor do cabelo">
          {HAIR_COLORS.map((color) => (
            <Swatch
              key={color}
              title={HAIR_COLOR_LABELS[color]}
              color={HAIR_COLOR_HEX[color]}
              selected={value.hairColor === color}
              onClick={() => onChange({ ...value, hairColor: color })}
            />
          ))}
        </ChoiceRow>
      </div>
    </div>
  )
}

function ChoiceRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 font-display text-lg">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-bold ${
        selected ? 'bg-[#2a2118] text-[#fff8ec]' : 'bg-[#fff8ec] text-[#2a2118]'
      }`}
    >
      {children}
    </button>
  )
}

function Swatch({
  color,
  title,
  selected,
  onClick,
}: {
  color: string
  title: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`size-9 rounded-full border-2 ${
        selected ? 'border-[#2a2118] scale-110' : 'border-white'
      }`}
      style={{ background: color }}
    />
  )
}



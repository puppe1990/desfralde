export const GENDERS = ['menino', 'menina', 'outro'] as const
export const SKIN_TONES = [
  'ivory',
  'peach',
  'golden',
  'amber',
  'bronze',
  'espresso',
] as const
export const HAIR_TYPES = [
  'short',
  'wavy',
  'curly',
  'long',
  'puff',
  'bun',
] as const
export const HAIR_COLORS = [
  'black',
  'brown',
  'blonde',
  'auburn',
  'red',
  'gray',
] as const

export type ChildGender = (typeof GENDERS)[number]
export type SkinTone = (typeof SKIN_TONES)[number]
export type HairType = (typeof HAIR_TYPES)[number]
export type HairColor = (typeof HAIR_COLORS)[number]

export type ChildAvatar = {
  gender: ChildGender
  skinTone: SkinTone
  hairType: HairType
  hairColor: HairColor
}

export const SKIN_TONE_HEX: Record<SkinTone, string> = {
  ivory: '#f3d4b8',
  peach: '#e8b894',
  golden: '#c88858',
  amber: '#a86a3c',
  bronze: '#7a4428',
  espresso: '#4a2a18',
}

export const HAIR_COLOR_HEX: Record<HairColor, string> = {
  black: '#1c1410',
  brown: '#4a2c16',
  blonde: '#d4a44a',
  auburn: '#7a3a16',
  red: '#c45c3e',
  gray: '#8a8078',
}

export const SKIN_TONE_LABELS: Record<SkinTone, string> = {
  ivory: 'Marfim',
  peach: 'Pêssego',
  golden: 'Dourado',
  amber: 'Âmbar',
  bronze: 'Bronze',
  espresso: 'Espresso',
}

export const HAIR_TYPE_LABELS: Record<HairType, string> = {
  short: 'Curto',
  wavy: 'Ondulado',
  curly: 'Cacheado',
  long: 'Longo',
  puff: 'Black power',
  bun: 'Coque',
}

export const HAIR_COLOR_LABELS: Record<HairColor, string> = {
  black: 'Preto',
  brown: 'Castanho',
  blonde: 'Loiro',
  auburn: 'Acaju',
  red: 'Ruivo',
  gray: 'Grisalho',
}

export const GENDER_LABELS: Record<ChildGender, string> = {
  menino: 'Menino',
  menina: 'Menina',
  outro: 'Outro',
}

export function defaultChildAvatar(): ChildAvatar {
  return {
    gender: 'menino',
    skinTone: 'golden',
    hairType: 'wavy',
    hairColor: 'brown',
  }
}

export function childAvatarSrc(avatar: ChildAvatar): string {
  return `/avatars/full/${avatar.gender}-${avatar.skinTone}-${avatar.hairType}-${avatar.hairColor}.jpg`
}

function pick<T extends string>(
  value: string | undefined,
  allowed: ReadonlyArray<T>,
  error: string,
): T {
  if (value == null) return allowed[0]
  if (!allowed.includes(value as T)) {
    throw new Error(`${error}: ${JSON.stringify(value)}`)
  }
  return value as T
}

export function normalizeChildAvatar(
  input: Partial<ChildAvatar> | Record<string, string | undefined>,
): ChildAvatar {
  const defaults = defaultChildAvatar()
  return {
    gender: pick(
      input.gender ?? defaults.gender,
      GENDERS,
      'Gênero do avatar inválido',
    ),
    skinTone: pick(
      input.skinTone ?? defaults.skinTone,
      SKIN_TONES,
      'Tom de pele inválido',
    ),
    hairType: pick(
      input.hairType ?? defaults.hairType,
      HAIR_TYPES,
      'Tipo de cabelo inválido',
    ),
    hairColor: pick(
      input.hairColor ?? defaults.hairColor,
      HAIR_COLORS,
      'Cor de cabelo inválida',
    ),
  }
}

import type { ChildAvatar, HairType } from './child-avatar'

export type CardKind = 'pedido' | 'rotina'
export type CardTone = 'terra' | 'sage' | 'honey'

export type PecsCardTemplate = {
  slug: string
  kind: CardKind
  label: string
  speak: string
  imageSrc: string
  tone: CardTone
  sortOrder: number
}

export const PECS_CHARACTER_SLUGS = [
  'xixi',
  'coco',
  'ajuda',
  'ir-banheiro',
  'sentar',
  'lavar-maos',
  'secar-maos',
  'subir-calca',
  'pronto',
  'descarga',
  'papel',
] as const

const CHARACTER_SLUGS = new Set<string>(PECS_CHARACTER_SLUGS)

export function pecsHairSilhouette(hairType: HairType): 'puff' | 'wavy' {
  return hairType === 'puff' ? 'puff' : 'wavy'
}

export function pecsCardImageSrc(
  slug: string,
  fallbackSrc: string,
  avatar?: ChildAvatar,
): string {
  if (!avatar || !CHARACTER_SLUGS.has(slug)) return fallbackSrc
  const hair = pecsHairSilhouette(avatar.hairType)
  return `/pecs/tinted/${slug}/${avatar.gender}-${avatar.skinTone}-${hair}-${avatar.hairColor}.jpg`
}

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

import { describe, expect, it } from 'vitest'

import { defaultDesfraldePack } from './default-desfralde-pack'

describe('defaultDesfraldePack', () => {
  it('returns Portuguese request cards before the bathroom routine', () => {
    const pack = defaultDesfraldePack()
    const pedidos = pack.filter((card) => card.kind === 'pedido')
    const rotina = pack.filter((card) => card.kind === 'rotina')

    expect(pedidos.map((card) => card.label)).toEqual([
      'Xixi',
      'Cocô',
      'Banheiro',
      'Ajuda',
    ])
    expect(rotina[0]?.label).toBe('Ir ao banheiro')
    expect(rotina.at(-1)?.label).toBe('Pronto!')
  })

  it('keeps the default pack generic instead of naming a specific child', () => {
    const labels = defaultDesfraldePack()
      .map((card) => `${card.label} ${card.speak}`)
      .join(' ')

    expect(labels.toLowerCase()).not.toContain('ícaro')
  })

  it('gives every card a speak phrase, image path, tone and unique slug', () => {
    const pack = defaultDesfraldePack()
    const slugs = pack.map((card) => card.slug)

    expect(new Set(slugs).size).toBe(pack.length)
    for (const card of pack) {
      expect(card.speak.length).toBeGreaterThan(0)
      expect(card.imageSrc).toMatch(/^\/pecs\/.+\.jpg$/)
      expect(['terra', 'sage', 'honey']).toContain(card.tone)
    }
  })
})

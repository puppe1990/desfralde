import { afterEach, describe, expect, it } from 'vitest'

import { openMemoryDesfraldeStore } from './memory-desfralde-store'

describe('createDesfraldeStore', () => {
  const opened: Array<{ close: () => void }> = []

  afterEach(() => {
    for (const client of opened) client.close()
    opened.length = 0
  })

  it('creates a child, seeds the default PECS pack, and lists newest first', async () => {
    const { client, store } = openMemoryDesfraldeStore()
    opened.push(client)

    const ana = await store.createChild('  Ana  ')
    const joao = await store.createChild('João')

    expect(ana.name).toBe('Ana')
    expect(joao.name).toBe('João')

    const children = await store.listChildren()
    expect(children.map((child) => child.name)).toEqual(['João', 'Ana'])

    const board = await store.getChildBoard(ana.id)
    expect(board.child.name).toBe('Ana')
    expect(board.pedidos.map((card) => card.label)).toEqual([
      'Xixi',
      'Cocô',
      'Banheiro',
      'Ajuda',
    ])
    expect(board.rotina.at(-1)?.label).toBe('Pronto!')
  })

  it('toggles stars per child without mixing profiles', async () => {
    const { client, store } = openMemoryDesfraldeStore()
    opened.push(client)

    const ana = await store.createChild('Ana')
    const joao = await store.createChild('João')

    await store.toggleStar(ana.id, '2026-08-30', 'xixi')
    await store.toggleStar(joao.id, '2026-08-30', 'coco')

    expect(await store.listStars(ana.id)).toEqual([
      { date: '2026-08-30', kind: 'xixi' },
    ])
    expect(await store.listStars(joao.id)).toEqual([
      { date: '2026-08-30', kind: 'coco' },
    ])

    await store.toggleStar(ana.id, '2026-08-30', 'xixi')
    expect(await store.listStars(ana.id)).toEqual([])
  })

  it('fails when the child does not exist', async () => {
    const { client, store } = openMemoryDesfraldeStore()
    opened.push(client)

    await expect(store.getChildBoard('missing')).rejects.toThrow(
      'Criança não encontrada',
    )
  })
})

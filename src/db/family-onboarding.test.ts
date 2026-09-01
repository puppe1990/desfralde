import { createClient } from '@libsql/client'
import { afterEach, describe, expect, it } from 'vitest'

import { createDesfraldeStore } from './desfralde-store'

function memoryStore() {
  const client = createClient({ url: ':memory:' })
  return { client, store: createDesfraldeStore(client) }
}

describe('family onboarding', () => {
  const opened: Array<{ close: () => void }> = []

  afterEach(() => {
    for (const client of opened) client.close()
    opened.length = 0
  })

  it('registers a caregiver and saves the family from the wizard', async () => {
    const { client, store } = memoryStore()
    opened.push(client)

    const user = await store.registerCaregiver({
      name: 'Maria',
      email: '  Maria@Casa.COM ',
      password: 'solzinho123',
    })
    expect(user.email).toBe('maria@casa.com')

    const family = await store.completeOnboarding(user.id, {
      parents: [{ name: 'Maria', role: 'mae' }, { name: 'João', role: 'pai' }],
      children: [
        {
          name: 'Ana',
          avatar: {
            gender: 'menina',
            skinTone: 'peach',
            hairType: 'curly',
            hairColor: 'black',
          },
        },
        { name: 'Pedro' },
      ],
      staff: [{ name: 'Carla', role: 'terapeuta' }],
    })

    expect(family.adults.map((adult) => adult.role).sort()).toEqual([
      'mae',
      'pai',
      'terapeuta',
    ])
    expect(family.children.map((child) => child.name)).toEqual(['Ana', 'Pedro'])
    expect(family.children[0]?.avatar).toEqual({
      gender: 'menina',
      skinTone: 'peach',
      hairType: 'curly',
      hairColor: 'black',
    })

    const board = await store.getChildBoard(family.children[0]!.id)
    expect(board.pedidos[0]?.label).toBe('Xixi')
  })

  it('does not let one family open another family child board', async () => {
    const { client, store } = memoryStore()
    opened.push(client)

    const maria = await store.registerCaregiver({
      name: 'Maria',
      email: 'maria@casa.com',
      password: 'solzinho123',
    })
    const joana = await store.registerCaregiver({
      name: 'Joana',
      email: 'joana@casa.com',
      password: 'solzinho123',
    })

    const familyA = await store.completeOnboarding(maria.id, {
      parents: [{ name: 'Maria', role: 'mae' }],
      children: [{ name: 'Ana' }],
      staff: [],
    })
    await store.completeOnboarding(joana.id, {
      parents: [{ name: 'Joana', role: 'mae' }],
      children: [{ name: 'Bia' }],
      staff: [],
    })

    await expect(
      store.getFamilyChildBoard(joana.id, familyA.children[0]!.id),
    ).rejects.toThrow('Criança não encontrada')
  })

  it('rejects a duplicate email', async () => {
    const { client, store } = memoryStore()
    opened.push(client)

    await store.registerCaregiver({
      name: 'Maria',
      email: 'maria@casa.com',
      password: 'solzinho123',
    })

    await expect(
      store.registerCaregiver({
        name: 'Outra',
        email: 'maria@casa.com',
        password: 'solzinho123',
      }),
    ).rejects.toThrow('Já existe uma conta com este e-mail')
  })
})

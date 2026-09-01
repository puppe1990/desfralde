import { afterEach, describe, expect, it } from 'vitest'

import { openMemoryDesfraldeStore } from './memory-desfralde-store'

describe('family onboarding', () => {
  const opened: Array<{ close: () => void }> = []

  afterEach(() => {
    for (const client of opened) client.close()
    opened.length = 0
  })

  it('registers a caregiver and saves the family from the wizard', async () => {
    const { client, store } = openMemoryDesfraldeStore()
    opened.push(client)

    const user = await store.registerCaregiver({
      name: 'Maria',
      email: '  Maria@Casa.COM ',
      password: 'solzinho123',
    })
    expect(user.email).toBe('maria@casa.com')

    const family = await store.completeOnboarding(user.id, {
      parents: [
        { name: 'Maria', role: 'mae' },
        { name: 'João', role: 'pai' },
      ],
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

    const board = await store.getChildBoard(family.children[0].id)
    expect(board.pedidos[0]?.label).toBe('Xixi')
  })

  it('does not let one family open another family child board', async () => {
    const { client, store } = openMemoryDesfraldeStore()
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
      store.getFamilyChildBoard(joana.id, familyA.children[0].id),
    ).rejects.toThrow('Criança não encontrada')
  })

  it('lets another adult in the house log in to the same child board', async () => {
    const { client, store } = openMemoryDesfraldeStore()
    opened.push(client)

    const maria = await store.registerCaregiver({
      name: 'Maria',
      email: 'maria@casa.com',
      password: 'solzinho123',
    })
    await store.completeOnboarding(maria.id, {
      parents: [{ name: 'Maria', role: 'mae' }],
      children: [{ name: 'Ana' }],
      staff: [{ name: 'Xereta', role: 'terapeuta' }],
    })

    const larissa = await store.addHouseholdLogin(maria.id, {
      name: 'Larissa',
      email: 'larissa@casa.com',
      password: 'solzinho123',
    })
    const family = await store.getFamily(larissa.id)
    expect(family.children.map((child) => child.name)).toEqual(['Ana'])
    const board = await store.getFamilyChildBoard(
      larissa.id,
      family.children[0].id,
    )
    expect(board.child.name).toBe('Ana')
  })

  it('adds another child to the house after onboarding', async () => {
    const { client, store } = openMemoryDesfraldeStore()
    opened.push(client)

    const maria = await store.registerCaregiver({
      name: 'Maria',
      email: 'maria@casa.com',
      password: 'solzinho123',
    })
    await store.completeOnboarding(maria.id, {
      parents: [{ name: 'Maria', role: 'mae' }],
      children: [{ name: 'Ana' }],
      staff: [],
    })

    const added = await store.addChildToFamily(maria.id, '  Pedro  ', {
      gender: 'menino',
      skinTone: 'golden',
      hairType: 'wavy',
      hairColor: 'brown',
    })
    expect(added.name).toBe('Pedro')
    expect(added.avatar.gender).toBe('menino')

    const names = (await store.getFamily(maria.id)).children.map(
      (child) => child.name,
    )
    expect(names.sort()).toEqual(['Ana', 'Pedro'])

    const board = await store.getChildBoard(added.id)
    expect(board.pedidos[0]?.label).toBe('Xixi')
  })

  it('renames a child and deletes an extra child from the house', async () => {
    const { client, store } = openMemoryDesfraldeStore()
    opened.push(client)

    const maria = await store.registerCaregiver({
      name: 'Maria',
      email: 'maria@casa.com',
      password: 'solzinho123',
    })
    const family = await store.completeOnboarding(maria.id, {
      parents: [{ name: 'Maria', role: 'mae' }],
      children: [{ name: 'Ana' }, { name: 'Pedro' }],
      staff: [],
    })
    const ana = family.children[0]
    const pedro = family.children[1]

    const renamed = await store.updateChild(maria.id, ana.id, {
      name: '  Ana Clara ',
      avatar: {
        gender: 'menina',
        skinTone: 'peach',
        hairType: 'long',
        hairColor: 'blonde',
      },
    })
    expect(renamed.name).toBe('Ana Clara')
    expect(renamed.avatar.hairType).toBe('long')

    await store.deleteChild(maria.id, pedro.id)
    expect(
      (await store.getFamily(maria.id)).children.map((child) => child.name),
    ).toEqual(['Ana Clara'])

    await expect(store.deleteChild(maria.id, ana.id)).rejects.toThrow(
      'A família precisa de pelo menos uma criança no quadro',
    )
  })

  it('rejects a duplicate email', async () => {
    const { client, store } = openMemoryDesfraldeStore()
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

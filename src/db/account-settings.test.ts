import { afterEach, describe, expect, it } from 'vitest'

import { openMemoryDesfraldeStore } from './memory-desfralde-store'

describe('account settings', () => {
  const opened: Array<{ close: () => void }> = []

  afterEach(() => {
    for (const client of opened) client.close()
    opened.length = 0
  })

  it('lets the logged-in caregiver change the password', async () => {
    const { client, store } = openMemoryDesfraldeStore()
    opened.push(client)

    const user = await store.registerCaregiver({
      name: 'Maria',
      email: 'maria@casa.com',
      password: 'solzinho123',
    })

    await store.changePassword(user.id, {
      currentPassword: 'solzinho123',
      newPassword: 'novasol123',
      confirmPassword: 'novasol123',
    })

    await expect(
      store.authenticate('maria@casa.com', 'solzinho123'),
    ).rejects.toThrow('E-mail ou senha inválidos')
    await expect(
      store.authenticate('maria@casa.com', 'novasol123'),
    ).resolves.toMatchObject({ id: user.id })
  })

  it('rejects a wrong current password without changing the hash', async () => {
    const { client, store } = openMemoryDesfraldeStore()
    opened.push(client)

    const user = await store.registerCaregiver({
      name: 'Maria',
      email: 'maria@casa.com',
      password: 'solzinho123',
    })

    await expect(
      store.changePassword(user.id, {
        currentPassword: 'errada',
        newPassword: 'novasol123',
        confirmPassword: 'novasol123',
      }),
    ).rejects.toThrow('Senha atual incorreta')

    await expect(
      store.authenticate('maria@casa.com', 'solzinho123'),
    ).resolves.toMatchObject({ id: user.id })
  })

  it('replaces the family therapist or creates one if missing', async () => {
    const { client, store } = openMemoryDesfraldeStore()
    opened.push(client)

    const maria = await store.registerCaregiver({
      name: 'Maria',
      email: 'maria@casa.com',
      password: 'solzinho123',
    })
    const family = await store.completeOnboarding(maria.id, {
      parents: [{ name: 'Maria', role: 'mae' }],
      children: [{ name: 'Ana' }],
      staff: [
        { name: 'Carla', role: 'terapeuta' },
        { name: 'Lúcia', role: 'professora' },
      ],
    })

    const updated = await store.updateFamilyTherapist(maria.id, '  Xereta  ')
    expect(updated).toMatchObject({ name: 'Xereta', role: 'terapeuta' })

    const after = await store.getFamily(maria.id)
    expect(
      after.adults
        .filter((adult) => adult.role === 'terapeuta')
        .map((adult) => adult.name),
    ).toEqual(['Xereta'])
    expect(
      after.adults.find((adult) => adult.role === 'professora')?.name,
    ).toBe('Lúcia')
    expect(
      after.adults.find((adult) => adult.id === family.adults[0]?.id)?.name,
    ).toBe('Maria')

    const joana = await store.registerCaregiver({
      name: 'Joana',
      email: 'joana@casa.com',
      password: 'solzinho123',
    })
    await store.completeOnboarding(joana.id, {
      parents: [{ name: 'Joana', role: 'mae' }],
      children: [{ name: 'Bia' }],
      staff: [],
    })

    const created = await store.updateFamilyTherapist(joana.id, 'Paula')
    expect(created).toMatchObject({ name: 'Paula', role: 'terapeuta' })
    const joanaFamily = await store.getFamily(joana.id)
    expect(
      joanaFamily.adults.filter((adult) => adult.role === 'terapeuta'),
    ).toEqual([created])
  })
})

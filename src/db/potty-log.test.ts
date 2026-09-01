import { createClient } from '@libsql/client'
import { afterEach, describe, expect, it } from 'vitest'

import { createDesfraldeStore } from './desfralde-store'

function memoryStore() {
  const client = createClient({ url: ':memory:' })
  return { client, store: createDesfraldeStore(client) }
}

describe('potty diary and teacher invite', () => {
  const opened: Array<{ close: () => void }> = []

  afterEach(() => {
    for (const client of opened) client.close()
    opened.length = 0
  })

  it('records several xixi and coco times for one child', async () => {
    const { client, store } = memoryStore()
    opened.push(client)

    const maria = await store.registerCaregiver({
      name: 'Maria',
      email: 'maria@casa.com',
      password: 'solzinho123',
    })
    const family = await store.completeOnboarding(maria.id, {
      parents: [{ name: 'Maria', role: 'mae' }],
      children: [{ name: 'Ana' }],
      staff: [],
    })
    const childId = family.children[0]!.id

    const first = await store.logPottyEvent(maria.id, childId, 'xixi')
    const second = await store.logPottyEvent(maria.id, childId, 'coco')
    expect(first.kind).toBe('xixi')
    expect(second.kind).toBe('coco')
    expect(second.occurredAt).toBeGreaterThanOrEqual(first.occurredAt)

    const listed = await store.listPottyEvents(maria.id, childId)
    expect(listed.map((event) => event.kind)).toEqual(['coco', 'xixi'])

    await store.deletePottyEvent(maria.id, childId, first.id)
    expect(
      (await store.listPottyEvents(maria.id, childId)).map((event) => event.id),
    ).toEqual([second.id])
  })

  it('does not let another family read or write the diary', async () => {
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
      store.logPottyEvent(joana.id, familyA.children[0]!.id, 'xixi'),
    ).rejects.toThrow('Criança não encontrada')
  })

  it('invites the teacher into the same house so she can log too', async () => {
    const { client, store } = memoryStore()
    opened.push(client)

    const maria = await store.registerCaregiver({
      name: 'Maria',
      email: 'maria@casa.com',
      password: 'solzinho123',
    })
    const family = await store.completeOnboarding(maria.id, {
      parents: [{ name: 'Maria', role: 'mae' }],
      children: [{ name: 'Ana' }],
      staff: [],
    })

    const invited = await store.inviteToFamily(maria.id, {
      name: 'Taize',
      email: '  Taize@Creche.COM ',
      password: 'creche123',
      role: 'professora',
    })
    expect(invited.email).toBe('taize@creche.com')
    expect(invited.familyId).toBe(family.id)

    const logged = await store.authenticate('taize@creche.com', 'creche123')
    expect(logged.familyId).toBe(family.id)

    const asTeacher = await store.getFamily(logged.id)
    expect(asTeacher.children.map((child) => child.name)).toEqual(['Ana'])
    expect(
      asTeacher.adults.find((adult) => adult.role === 'professora')?.name,
    ).toBe('Taize')

    const event = await store.logPottyEvent(logged.id, family.children[0]!.id, 'xixi')
    expect(
      (await store.listPottyEvents(maria.id, family.children[0]!.id)).map(
        (item) => item.id,
      ),
    ).toEqual([event.id])
  })
})

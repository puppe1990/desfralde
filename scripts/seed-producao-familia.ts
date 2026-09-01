import { execFileSync } from 'node:child_process'

import { createClient } from '@libsql/client'

import { createDesfraldeStore } from '../src/db/desfralde-store.ts'

const ICARO_AVATAR = {
  gender: 'menino' as const,
  skinTone: 'golden' as const,
  hairType: 'wavy' as const,
  hairColor: 'brown' as const,
}

const OWNER_EMAIL = process.env.SEED_EMAIL ?? 'matheus.puppe90@hotmail.com'
const OWNER_PASSWORD = process.env.SEED_PASSWORD
const LARISSA_EMAIL = process.env.LARISSA_EMAIL ?? 'larissa@desfralde.app'
const LARISSA_PASSWORD = process.env.LARISSA_PASSWORD
const XERETA_EMAIL = process.env.XERETA_EMAIL ?? 'xereta@desfralde.app'
const XERETA_PASSWORD = process.env.XERETA_PASSWORD

if (!OWNER_PASSWORD || !LARISSA_PASSWORD || !XERETA_PASSWORD) {
  throw new Error('Defina SEED_PASSWORD, LARISSA_PASSWORD e XERETA_PASSWORD.')
}

function turso(args: Array<string>) {
  return execFileSync('turso', args, { encoding: 'utf8' }).trim()
}

async function ensureLogin(
  store: ReturnType<typeof createDesfraldeStore>,
  ownerId: string,
  input: { name: string; email: string; password: string },
  role?: 'terapeuta' | 'professora',
) {
  try {
    if (role) {
      await store.inviteToFamily(ownerId, { ...input, role })
    } else {
      await store.addHouseholdLogin(ownerId, input)
    }
    console.log('Conta criada:', input.email)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Já existe uma conta')
    ) {
      console.log('Conta já existia:', input.email)
      return
    }
    throw error
  }
}

async function main() {
  const url = turso(['db', 'show', 'desfralde', '--url'])
  const authToken = turso(['db', 'tokens', 'create', 'desfralde'])
  const client = createClient({ url, authToken })
  const store = createDesfraldeStore(client)

  let owner
  try {
    owner = await store.registerCaregiver({
      name: 'Matheus Puppe',
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
    })
    console.log('Conta do Matheus criada')
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Já existe uma conta')
    ) {
      owner = await store.authenticate(OWNER_EMAIL, OWNER_PASSWORD)
      console.log('Conta do Matheus já existia')
    } else {
      throw error
    }
  }

  if (!owner.familyId) {
    await store.completeOnboarding(owner.id, {
      parents: [
        { name: 'Matheus Puppe', role: 'pai' },
        { name: 'Larissa Rodrigues', role: 'mae' },
      ],
      children: [{ name: 'Ícaro', avatar: ICARO_AVATAR }],
      staff: [
        { name: 'Xereta', role: 'terapeuta' },
        { name: 'Taize', role: 'professora' },
      ],
    })
    console.log('Família Puppe criada com o Ícaro')
  }

  await ensureLogin(store, owner.id, {
    name: 'Larissa Rodrigues',
    email: LARISSA_EMAIL,
    password: LARISSA_PASSWORD,
  })
  await ensureLogin(
    store,
    owner.id,
    {
      name: 'Xereta',
      email: XERETA_EMAIL,
      password: XERETA_PASSWORD,
    },
    'terapeuta',
  )

  const family = await store.getFamily(owner.id)
  console.log(
    'Pronta:',
    family.adults.map((adult) => `${adult.role}:${adult.name}`).join(', '),
    '|',
    family.children.map((child) => child.name).join(', '),
  )
  client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

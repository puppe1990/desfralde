import { createClient } from '@libsql/client'

import { createDesfraldeStore } from '../src/db/desfralde-store.ts'

const ICARO_AVATAR = {
  gender: 'menino' as const,
  skinTone: 'golden' as const,
  hairType: 'wavy' as const,
  hairColor: 'brown' as const,
}

const EMAIL = process.env.SEED_EMAIL
const PASSWORD = process.env.SEED_PASSWORD

if (!EMAIL || !PASSWORD) {
  throw new Error(
    'Defina SEED_EMAIL e SEED_PASSWORD no ambiente para rodar o seed.',
  )
}

async function main() {
  const client = createClient({ url: 'file:local.db' })
  const store = createDesfraldeStore(client)

  let user
  try {
    user = await store.registerCaregiver({
      name: 'Matheus Puppe',
      email: EMAIL,
      password: PASSWORD,
    })
    console.log('Conta criada:', user.email)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Já existe uma conta')
    ) {
      user = await store.authenticate(EMAIL, PASSWORD)
      console.log('Conta já existia:', user.email)
    } else {
      throw error
    }
  }

  if (!user.familyId) {
    const family = await store.completeOnboarding(user.id, {
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
    console.log(
      'Família criada:',
      family.adults.map((adult) => `${adult.role}:${adult.name}`).join(', '),
      '|',
      family.children.map((child) => child.name).join(', '),
    )
  } else {
    const family = await store.getFamily(user.id)
    if (!family.adults.some((adult) => adult.role === 'professora')) {
      await store.updateFamilyTeacher(user.id, 'Taize')
      console.log('Taize adicionada como professora da casa.')
    }
    const icaro = family.children.find((child) => child.name === 'Ícaro')
    if (icaro) {
      await store.updateChildAvatar(user.id, icaro.id, ICARO_AVATAR)
      console.log('Avatar do Ícaro atualizado para o visual original.')
    } else {
      await store.addChildToFamily(user.id, 'Ícaro', ICARO_AVATAR)
      console.log('Ícaro adicionado à família.')
    }
  }

  client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

import { readSessionUserId } from './session'

export async function requireSignedInUserId(): Promise<string> {
  const userId = await readSessionUserId()
  if (!userId) {
    throw new Error('Faça login para continuar')
  }
  return userId
}

import { eq } from 'drizzle-orm'

import { normalizeAccountEmail } from '../domains/account-email'
import { normalizePersonName } from '../domains/child-name'
import {
  assertPasswordLength,
  validatePasswordChange,
} from '../domains/password-change'
import { hashPassword, verifyPassword } from '../lib/password'
import { toUserRecord } from './desfralde-records'
import type { UserRecord } from './desfralde-records'
import { firstRow } from './first-row'
import type { ReadyDatabase } from './ready-database'
import { users } from './schema'

// Same duration as a real hash so a missing e-mail does not leak existence.
const DUMMY_PASSWORD_HASH =
  '00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

export function createUserAccountQueries(readyDb: ReadyDatabase) {
  return {
    async registerCaregiver(input: {
      name: string
      email: string
      password: string
    }): Promise<UserRecord> {
      const database = await readyDb()
      const email = normalizeAccountEmail(input.email)
      const name = normalizePersonName(input.name, 'Nome')
      assertPasswordLength(input.password, 'A senha')

      const existing = firstRow(
        await database
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1),
      )
      if (existing) {
        throw new Error(`Já existe uma conta com este e-mail: ${email}`)
      }

      const user = {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash: await hashPassword(input.password),
        familyId: null,
        createdAt: Date.now(),
      }
      await database.insert(users).values(user)
      return toUserRecord(user)
    },

    async authenticate(email: string, password: string): Promise<UserRecord> {
      const database = await readyDb()
      const normalized = normalizeAccountEmail(email)
      const user = firstRow(
        await database
          .select()
          .from(users)
          .where(eq(users.email, normalized))
          .limit(1),
      )
      const matches = await verifyPassword(
        password,
        user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      )
      if (!user || !matches) {
        throw new Error(`E-mail ou senha inválidos: ${normalized}`)
      }
      return toUserRecord(user)
    },

    async changePassword(
      userId: string,
      raw: {
        currentPassword: string
        newPassword: string
        confirmPassword: string
      },
    ): Promise<void> {
      const database = await readyDb()
      const change = validatePasswordChange(raw)
      const user = firstRow(
        await database
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1),
      )
      if (!user) {
        throw new Error(`Conta não encontrada: ${userId}`)
      }

      const matches = await verifyPassword(
        change.currentPassword,
        user.passwordHash,
      )
      if (!matches) {
        throw new Error(
          'Senha atual incorreta. Use a senha com que você entra no Desfralde',
        )
      }

      await database
        .update(users)
        .set({ passwordHash: await hashPassword(change.newPassword) })
        .where(eq(users.id, userId))
    },

    async getUser(userId: string): Promise<UserRecord | null> {
      const database = await readyDb()
      const user = firstRow(
        await database
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1),
      )
      return user ? toUserRecord(user) : null
    },
  }
}

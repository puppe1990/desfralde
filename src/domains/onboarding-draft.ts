import { normalizeChildName, normalizePersonName } from './child-name'
import { defaultChildAvatar, normalizeChildAvatar } from './child-avatar'
import type { ChildAvatar } from './child-avatar'

export const PARENT_ROLES = ['mae', 'pai'] as const
export const STAFF_ROLES = ['terapeuta', 'professora'] as const

export type ParentRole = (typeof PARENT_ROLES)[number]
export type StaffRole = (typeof STAFF_ROLES)[number]
export type AdultRole = ParentRole | StaffRole

export type AdultDraft = {
  name: string
  role: AdultRole
}

export type ChildDraft = {
  name: string
  avatar: ChildAvatar
}

export type OnboardingDraft = {
  parents: Array<AdultDraft>
  children: Array<ChildDraft>
  staff: Array<AdultDraft>
}

export type RawOnboardingDraft = {
  parents: Array<{ name: string; role: string }>
  children: Array<{ name: string; avatar?: Partial<ChildAvatar> }>
  staff: Array<{ name: string; role: string }>
}

export const PARENT_ROLE_LABELS: Record<ParentRole, string> = {
  mae: 'Mãe',
  pai: 'Pai',
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  terapeuta: 'Terapeuta',
  professora: 'Professora',
}

function asParentRole(role: string): ParentRole {
  if (!(PARENT_ROLES as ReadonlyArray<string>).includes(role)) {
    throw new Error(`Papel do responsável inválido: ${role}`)
  }
  return role as ParentRole
}

function asStaffRole(role: string): StaffRole {
  if (!(STAFF_ROLES as ReadonlyArray<string>).includes(role)) {
    throw new Error(`Papel da equipe inválido: ${role}`)
  }
  return role as StaffRole
}

export function addAdultRow<T extends { name: string }>(
  people: Array<T>,
  blank: T,
): Array<T> {
  if (people.some((person) => !person.name.trim())) return people
  return [...people, blank]
}

export function removeAdultRow<T>(
  people: Array<T>,
  index: number,
  minimum = 0,
): Array<T> {
  if (people.length <= minimum) return people
  if (index < 0 || index >= people.length) return people
  return people.filter((_, current) => current !== index)
}

export function validateOnboardingDraft(
  input: RawOnboardingDraft,
): OnboardingDraft {
  if (input.parents.length === 0) {
    throw new Error('Cadastre pelo menos um responsável (mãe ou pai)')
  }
  if (input.children.length === 0) {
    throw new Error('Cadastre pelo menos uma criança')
  }

  return {
    parents: input.parents.map((adult) => ({
      name: normalizePersonName(adult.name, 'Nome do responsável'),
      role: asParentRole(adult.role),
    })),
    children: input.children.map((child) => ({
      name: normalizeChildName(child.name),
      avatar: child.avatar
        ? normalizeChildAvatar(child.avatar)
        : defaultChildAvatar(),
    })),
    staff: input.staff.map((adult) => ({
      name: normalizePersonName(adult.name, 'Nome da equipe'),
      role: asStaffRole(adult.role),
    })),
  }
}

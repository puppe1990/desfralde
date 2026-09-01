export function normalizePersonName(name: string, label: string): string {
  const normalized = name.trim()
  if (!normalized) {
    throw new Error(`${label} é obrigatório`)
  }
  if (normalized.length > 80) {
    throw new Error(`${label} deve ter no máximo 80 caracteres`)
  }
  return normalized
}

export function normalizeChildName(name: string): string {
  return normalizePersonName(name, 'Nome da criança')
}

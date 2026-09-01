export function personInitial(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? ''
  const letter = [...first][0]
  return letter ? letter.toLocaleUpperCase('pt-BR') : '?'
}

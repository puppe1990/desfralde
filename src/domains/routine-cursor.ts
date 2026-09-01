export function nextRoutineIndex(current: number, length: number): number {
  if (length <= 0) return 0
  return (current + 1) % length
}

export function previousRoutineIndex(current: number, _length: number): number {
  if (current <= 0) return 0
  return current - 1
}

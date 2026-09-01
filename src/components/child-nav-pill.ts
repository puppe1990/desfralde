export function childNavIsActive(
  to: string,
  childId: string,
  pathname: string,
): boolean {
  const href = to.replace('$childId', childId)
  if (to === '/criancas/$childId') return pathname === href
  return pathname === href
}

export function childNavPillClass(isActive: boolean): string {
  const colors = isActive
    ? 'bg-[#2a2118] text-[#fff8ec]'
    : 'bg-[#2a2118]/10 text-[#2a2118]'
  return `rounded-full px-3 py-1.5 text-sm font-bold no-underline ${colors}`
}

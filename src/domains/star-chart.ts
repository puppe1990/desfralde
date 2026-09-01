export type StarKind = 'xixi' | 'coco'

export type StarMark = {
  date: string
  kind: StarKind
}

function isoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function weekStartingMonday(anchor: Date): Array<string> {
  const local = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    anchor.getDate(),
  )
  const weekday = local.getDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  local.setDate(local.getDate() - daysFromMonday)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(local)
    day.setDate(local.getDate() + index)
    return isoDate(day)
  })
}

export function weekdayLabelsPt(): Array<string> {
  return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
}

export function isStarOn(
  marks: Array<StarMark>,
  date: string,
  kind: StarKind,
): boolean {
  return marks.some((mark) => mark.date === date && mark.kind === kind)
}

export function toggleStarMarks(
  marks: Array<StarMark>,
  date: string,
  kind: StarKind,
): Array<StarMark> {
  if (isStarOn(marks, date, kind)) {
    return marks.filter((mark) => !(mark.date === date && mark.kind === kind))
  }
  return [...marks, { date, kind }]
}

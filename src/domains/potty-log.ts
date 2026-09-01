export const POTTY_KINDS = ['xixi', 'coco'] as const
export const POTTY_TIME_ZONE = 'America/Sao_Paulo'

export type PottyKind = (typeof POTTY_KINDS)[number]

export type PottyEvent = {
  id: string
  kind: PottyKind
  occurredAt: number
}

export type PottyDay = {
  date: string
  entries: Array<PottyEvent>
}

export const POTTY_KIND_LABELS: Record<PottyKind, string> = {
  xixi: 'Xixi',
  coco: 'Cocô',
}

export function isPottyKind(value: string): value is PottyKind {
  return (POTTY_KINDS as ReadonlyArray<string>).includes(value)
}

export function parsePottyKind(value: string): PottyKind {
  if (!isPottyKind(value)) {
    throw new Error('Anota só xixi ou cocô')
  }
  return value
}

export function formatPottyClock(occurredAt: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: POTTY_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(occurredAt))
}

export function pottyDayKey(occurredAt: number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: POTTY_TIME_ZONE,
  }).format(new Date(occurredAt))
}

export function formatPottyDayLabel(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return date
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(year, month - 1, day))
}

export function groupPottyEventsByDay(
  events: Array<PottyEvent>,
): Array<PottyDay> {
  const byDay = new Map<string, Array<PottyEvent>>()
  const ordered = [...events].sort((left, right) => left.occurredAt - right.occurredAt)
  for (const event of ordered) {
    const date = pottyDayKey(event.occurredAt)
    const bucket = byDay.get(date) ?? []
    bucket.push(event)
    byDay.set(date, bucket)
  }
  return [...byDay.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, entries]) => ({ date, entries }))
}

export function eventsOnDay(
  events: Array<PottyEvent>,
  date: string,
): Array<PottyEvent> {
  return events
    .filter((event) => pottyDayKey(event.occurredAt) === date)
    .sort((left, right) => left.occurredAt - right.occurredAt)
}

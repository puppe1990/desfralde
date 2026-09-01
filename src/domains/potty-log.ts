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
    throw new Error(`Anota só xixi ou cocô: recebido ${JSON.stringify(value)}`)
  }
  return value
}

export function parsePottyClock(value: string): {
  hour: number
  minute: number
} {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim())
  if (!match) {
    throw new Error(`Hora inválida: ${JSON.stringify(value)}. Use HH:mm.`)
  }
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) {
    throw new Error(`Hora inválida: ${JSON.stringify(value)}. Use HH:mm.`)
  }
  return { hour, minute }
}

export function occurredAtOnPottyDay(day: string, clock: string): number {
  const { hour, minute } = parsePottyClock(clock)
  const { year, month, date } = parsePottyDayParts(day)

  const wallAsUtc = Date.UTC(year, month - 1, date, hour, minute, 0)
  return wallAsUtc - saoPauloOffsetMs(wallAsUtc)
}

function saoPauloOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: POTTY_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs))
  const number = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)
  const wallAsUtc = Date.UTC(
    number('year'),
    number('month') - 1,
    number('day'),
    number('hour'),
    number('minute'),
    number('second'),
  )
  return wallAsUtc - utcMs
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
  const ordered = [...events].sort(
    (left, right) => left.occurredAt - right.occurredAt,
  )
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

function parsePottyDayParts(day: string): {
  year: number
  month: number
  date: number
} {
  const [year, month, date] = day.split('-').map(Number)
  if (!year || !month || !date) {
    throw new Error(`Dia inválido: ${JSON.stringify(day)}. Use AAAA-MM-DD.`)
  }
  return { year, month, date }
}

export function shiftPottyDay(day: string, days: number): string {
  const { year, month, date } = parsePottyDayParts(day)
  const local = new Date(year, month - 1, date)
  local.setDate(local.getDate() + days)
  const nextYear = local.getFullYear()
  const nextMonth = String(local.getMonth() + 1).padStart(2, '0')
  const nextDate = String(local.getDate()).padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDate}`
}

export function pottyWeekDates(day: string): Array<string> {
  const { year, month, date } = parsePottyDayParts(day)
  const fromMonday = (new Date(year, month - 1, date).getDay() + 6) % 7
  const monday = shiftPottyDay(day, -fromMonday)
  return Array.from({ length: 7 }, (_, index) => shiftPottyDay(monday, index))
}

export function groupPottyEventsInWeek(
  events: Array<PottyEvent>,
  week: Array<string>,
): Array<PottyDay> {
  return week.map((date) => ({
    date,
    entries: eventsOnDay(events, date),
  }))
}

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function formatPottyWeekday(date: string): string {
  const { year, month, date: day } = parsePottyDayParts(date)
  const weekday = new Date(year, month - 1, day).getDay()
  return `${WEEKDAY_SHORT[weekday]} ${day}`
}

export function formatPottyWeekRange(week: Array<string>): string {
  const first = week.at(0)
  const last = week.at(-1)
  if (!first || !last) return ''
  const compact = (day: string) => {
    const { year, month, date } = parsePottyDayParts(day)
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(year, month - 1, date))
  }
  return `${compact(first)} — ${compact(last)}`
}

export function isPottyToday(day: string, now = Date.now()): boolean {
  return day === pottyDayKey(now)
}

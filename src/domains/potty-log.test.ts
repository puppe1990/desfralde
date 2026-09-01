import { describe, expect, it } from 'vitest'

import {
  formatPottyClock,
  formatPottyWeekday,
  groupPottyEventsByDay,
  groupPottyEventsInWeek,
  isPottyKind,
  occurredAtOnPottyDay,
  parsePottyClock,
  pottyDayKey,
  pottyWeekDates,
  shiftPottyDay,
} from './potty-log'

describe('potty log', () => {
  it('only accepts xixi or coco', () => {
    expect(isPottyKind('xixi')).toBe(true)
    expect(isPottyKind('coco')).toBe(true)
    expect(isPottyKind('banheiro')).toBe(false)
  })

  it('shows São Paulo clock time so the creche and the house share the same hour', () => {
    expect(formatPottyClock(Date.parse('2026-09-01T12:15:00.000Z'))).toBe(
      '09:15',
    )
  })

  it('groups several pees and poops of the same local day', () => {
    const events = [
      {
        id: '1',
        kind: 'xixi' as const,
        occurredAt: Date.parse('2026-09-01T12:15:00.000Z'),
      },
      {
        id: '2',
        kind: 'coco' as const,
        occurredAt: Date.parse('2026-09-01T14:40:00.000Z'),
      },
      {
        id: '3',
        kind: 'xixi' as const,
        occurredAt: Date.parse('2026-09-02T11:05:00.000Z'),
      },
    ]

    const grouped = groupPottyEventsByDay(events)
    expect(grouped.map((day) => day.date)).toEqual([
      pottyDayKey(events[2].occurredAt),
      pottyDayKey(events[0].occurredAt),
    ])
    expect(grouped[1]?.entries.map((entry) => entry.kind)).toEqual([
      'xixi',
      'coco',
    ])
  })

  it('reads a clock typed as HH:mm', () => {
    expect(parsePottyClock('09:15')).toEqual({ hour: 9, minute: 15 })
    expect(parsePottyClock('09:15:00')).toEqual({ hour: 9, minute: 15 })
    expect(parsePottyClock('00:00')).toEqual({ hour: 0, minute: 0 })
    expect(parsePottyClock('23:59')).toEqual({ hour: 23, minute: 59 })
  })

  it('rejects a clock that is not a real time of day', () => {
    expect(() => parsePottyClock('24:00')).toThrow(/Hora inválida/)
    expect(() => parsePottyClock('12:60')).toThrow(/Hora inválida/)
    expect(() => parsePottyClock('manhã')).toThrow(/Hora inválida/)
  })

  it('turns a São Paulo wall clock into the same instant the diary already shows', () => {
    const occurredAt = occurredAtOnPottyDay('2026-09-01', '09:15')
    expect(occurredAt).toBe(Date.parse('2026-09-01T12:15:00.000Z'))
    expect(formatPottyClock(occurredAt)).toBe('09:15')
    expect(pottyDayKey(occurredAt)).toBe('2026-09-01')
  })

  it('builds a Monday-to-Sunday week around a São Paulo day', () => {
    expect(pottyWeekDates('2026-09-01')).toEqual([
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
      '2026-09-06',
    ])
    expect(shiftPottyDay('2026-09-01', -7)).toBe('2026-08-25')
    expect(formatPottyWeekday('2026-09-01')).toBe('Ter 1')
  })

  it('keeps empty weekdays so the house sees days without a pee or poop', () => {
    const events = [
      {
        id: '1',
        kind: 'xixi' as const,
        occurredAt: occurredAtOnPottyDay('2026-09-01', '09:15'),
      },
      {
        id: '2',
        kind: 'coco' as const,
        occurredAt: occurredAtOnPottyDay('2026-09-01', '11:40'),
      },
    ]
    const week = groupPottyEventsInWeek(events, pottyWeekDates('2026-09-01'))
    expect(week).toHaveLength(7)
    expect(week[0]?.entries).toEqual([])
    expect(week[1]?.date).toBe('2026-09-01')
    expect(week[1]?.entries.map((entry) => entry.kind)).toEqual([
      'xixi',
      'coco',
    ])
  })
})

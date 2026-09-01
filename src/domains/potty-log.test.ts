import { describe, expect, it } from 'vitest'

import {
  groupPottyEventsByDay,
  isPottyKind,
  formatPottyClock,
  pottyDayKey,
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
})

/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PottyWeekGrid } from './potty-week-grid'
import {
  groupPottyEventsInWeek,
  occurredAtOnPottyDay,
  pottyWeekDates,
} from '../domains/potty-log'

afterEach(cleanup)

describe('PottyWeekGrid', () => {
  it('shows each weekday with the clocks logged that day', () => {
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
    const days = groupPottyEventsInWeek(events, pottyWeekDates('2026-09-01'))
    render(<PottyWeekGrid days={days} today="2026-09-01" />)

    expect(screen.getByRole('heading', { name: 'Ter 1' })).toBeTruthy()
    expect(screen.getByText('09:15')).toBeTruthy()
    expect(screen.getByText('11:40')).toBeTruthy()
    expect(screen.getByText('Xixi')).toBeTruthy()
    expect(screen.getByText('Cocô')).toBeTruthy()
    expect(screen.getAllByText('Nada')).toHaveLength(6)
  })
})

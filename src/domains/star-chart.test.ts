import { describe, expect, it } from 'vitest'

import {
  isStarOn,
  toggleStarMarks,
  weekdayLabelsPt,
  weekStartingMonday,
} from './star-chart'

describe('star-chart', () => {
  it('builds a Monday-to-Sunday week around the given date', () => {
    expect(weekStartingMonday(new Date('2026-08-26T15:00:00'))).toEqual([
      '2026-08-24',
      '2026-08-25',
      '2026-08-26',
      '2026-08-27',
      '2026-08-28',
      '2026-08-29',
      '2026-08-30',
    ])
  })

  it('uses short Portuguese weekday labels starting on Monday', () => {
    expect(weekdayLabelsPt()).toEqual([
      'Seg',
      'Ter',
      'Qua',
      'Qui',
      'Sex',
      'Sáb',
      'Dom',
    ])
  })

  it('toggles a xixi or coco star for a given day', () => {
    const afterOn = toggleStarMarks([], '2026-08-30', 'xixi')
    expect(isStarOn(afterOn, '2026-08-30', 'xixi')).toBe(true)
    expect(isStarOn(afterOn, '2026-08-30', 'coco')).toBe(false)

    const afterOff = toggleStarMarks(afterOn, '2026-08-30', 'xixi')
    expect(isStarOn(afterOff, '2026-08-30', 'xixi')).toBe(false)
  })
})

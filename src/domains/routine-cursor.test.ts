import { describe, expect, it } from 'vitest'

import { nextRoutineIndex, previousRoutineIndex } from './routine-cursor'

describe('routine cursor', () => {
  it('advances to the next step and wraps to the start after the last', () => {
    expect(nextRoutineIndex(0, 11)).toBe(1)
    expect(nextRoutineIndex(10, 11)).toBe(0)
  })

  it('does not go before the first step', () => {
    expect(previousRoutineIndex(0, 11)).toBe(0)
    expect(previousRoutineIndex(4, 11)).toBe(3)
  })
})

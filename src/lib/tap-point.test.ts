import { describe, expect, it } from 'vitest'

import { tapPointPercent } from './tap-point'

describe('tapPointPercent', () => {
  const box = { left: 10, top: 20, width: 200, height: 100 }

  it('maps a client point onto the element as percentages', () => {
    expect(tapPointPercent(box, 110, 70)).toEqual({ x: 50, y: 50 })
    expect(tapPointPercent(box, 10, 20)).toEqual({ x: 0, y: 0 })
    expect(tapPointPercent(box, 210, 120)).toEqual({ x: 100, y: 100 })
  })

  it('falls back to the center when the element has no size', () => {
    expect(
      tapPointPercent({ left: 0, top: 0, width: 0, height: 0 }, 8, 8),
    ).toEqual({ x: 50, y: 50 })
  })
})

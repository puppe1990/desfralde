import { describe, expect, it } from 'vitest'

import { childNavIsActive, childNavPillClass } from './child-nav-pill'

describe('childNavPillClass', () => {
  it('keeps dark type on the idle pill so cream text never sits on a light chip', () => {
    const idle = childNavPillClass(false)
    const current = childNavPillClass(true)

    expect(idle).toContain('text-[#2a2118]')
    expect(idle).not.toContain('text-[#fff8ec]')
    expect(current).toContain('text-[#fff8ec]')
    expect(current).not.toContain('text-[#2a2118]')
    expect(current).toContain('bg-[#2a2118]')
    expect(current).not.toContain('bg-[#2a2118]/10')
  })
})

describe('childNavIsActive', () => {
  it('marks quadro only on the board index', () => {
    expect(childNavIsActive('/criancas/$childId', 'abc', '/criancas/abc')).toBe(
      true,
    )
    expect(
      childNavIsActive('/criancas/$childId', 'abc', '/criancas/abc/diario'),
    ).toBe(false)
  })

  it('marks a nested page by its own path', () => {
    expect(
      childNavIsActive(
        '/criancas/$childId/avatar',
        'abc',
        '/criancas/abc/avatar',
      ),
    ).toBe(true)
    expect(
      childNavIsActive(
        '/criancas/$childId/diario',
        'abc',
        '/criancas/abc/avatar',
      ),
    ).toBe(false)
  })
})

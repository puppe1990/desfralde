/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { UserChip } from './user-chip'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
    ...props
  }: {
    children: React.ReactNode
    to: string
    params?: { childId?: string }
    [key: string]: unknown
  }) => (
    <a
      href={params?.childId ? `${to}?childId=${params.childId}` : to}
      {...props}
    >
      {children}
    </a>
  ),
  useRouter: () => ({
    navigate: vi.fn(),
    invalidate: vi.fn(),
  }),
}))

vi.mock('../server/auth', () => ({
  logoutFn: vi.fn(),
}))

describe('UserChip', () => {
  it('shows the first-name initial and a logout button', () => {
    render(<UserChip name="Matheus Puppe" />)

    expect(screen.getByLabelText('Conta de Matheus Puppe').textContent).toBe(
      'M',
    )
    expect(screen.getByRole('button', { name: 'Sair' })).toBeTruthy()
    expect(
      screen.getByLabelText('Conta de Matheus Puppe').getAttribute('href'),
    ).toBe('/configuracao')
  })

  it('keeps the child board when opening settings from a child page', () => {
    render(<UserChip name="Taize" childId="crianca-1" />)

    expect(screen.getByLabelText('Conta de Taize').getAttribute('href')).toBe(
      '/criancas/$childId/configuracao?childId=crianca-1',
    )
  })
})

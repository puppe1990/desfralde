/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChildQuadros } from './child-quadros'
import { defaultChildAvatar } from '../domains/child-avatar'

afterEach(cleanup)

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
    invalidate: vi.fn(),
  }),
}))

vi.mock('../server/child-board', () => ({
  createChildFn: vi.fn(),
  updateChildFn: vi.fn(),
  deleteChildFn: vi.fn(),
}))

const icaro = {
  id: 'crianca-1',
  familyId: 'casa-1',
  name: 'Ícaro',
  avatar: defaultChildAvatar(),
  createdAt: 1,
}

describe('ChildQuadros', () => {
  it('lets the family open a form to add another child', () => {
    render(<ChildQuadros kids={[icaro]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Outra criança' }))

    expect(screen.getByRole('dialog', { name: 'Nova criança' })).toBeTruthy()
    expect(screen.getByLabelText('Nome')).toBeTruthy()
  })
})

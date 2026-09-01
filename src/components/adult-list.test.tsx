/** @vitest-environment jsdom */
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { AdultList } from './adult-list'
import { PARENT_ROLE_LABELS } from '../domains/onboarding-draft'
import type { ParentRole } from '../domains/onboarding-draft'

afterEach(cleanup)

function ParentsHarness() {
  const [people, setPeople] = useState<
    Array<{ name: string; role: ParentRole }>
  >([{ name: 'Maria', role: 'mae' }])

  return (
    <AdultList
      people={people}
      roles={['mae', 'pai']}
      labels={PARENT_ROLE_LABELS}
      addLabel="Adicionar responsável"
      minimum={1}
      blankRole="pai"
      onChange={setPeople}
    />
  )
}

describe('AdultList', () => {
  it('does not stack empty duplicate rows and can remove the extra one', () => {
    render(<ParentsHarness />)

    fireEvent.click(
      screen.getByRole('button', { name: '+ Adicionar responsável' }),
    )
    expect(screen.getAllByPlaceholderText('Nome')).toHaveLength(2)

    fireEvent.click(
      screen.getByRole('button', { name: '+ Adicionar responsável' }),
    )
    expect(screen.getAllByPlaceholderText('Nome')).toHaveLength(2)

    fireEvent.click(
      screen.getByRole('button', { name: 'Remover responsável 2' }),
    )
    expect(screen.getAllByPlaceholderText('Nome')).toHaveLength(1)
    expect(
      screen.queryByRole('button', { name: /Remover responsável/ }),
    ).toBeNull()
  })
})

/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { SettingsTabs } from './settings-tabs'

afterEach(cleanup)

describe('SettingsTabs', () => {
  it('shows one quadro at a time when a tab is selected', () => {
    render(
      <SettingsTabs
        senha={<p>Painel senha</p>}
        terapeuta={<p>Painel terapeuta</p>}
        professora={<p>Painel professora</p>}
      />,
    )

    expect(screen.getByText('Painel senha')).toBeTruthy()
    expect(screen.queryByText('Painel terapeuta')).toBeNull()

    fireEvent.click(screen.getByRole('tab', { name: 'Terapeuta' }))
    expect(screen.getByText('Painel terapeuta')).toBeTruthy()
    expect(screen.queryByText('Painel senha')).toBeNull()

    fireEvent.click(screen.getByRole('tab', { name: 'Professora' }))
    expect(screen.getByText('Painel professora')).toBeTruthy()
    expect(screen.queryByText('Painel terapeuta')).toBeNull()
  })
})

/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PottyNow } from './potty-now'

afterEach(cleanup)

describe('PottyNow', () => {
  it('shows xixi and cocô buttons with the selected avatar', () => {
    render(
      <PottyNow
        events={[]}
        avatar={{
          gender: 'menina',
          skinTone: 'espresso',
          hairType: 'puff',
          hairColor: 'black',
        }}
        onLog={vi.fn().mockResolvedValue(undefined)}
        onDelete={vi.fn()}
      />,
    )

    const images = document.querySelectorAll('img')
    expect(images[0]).toHaveProperty(
      'src',
      expect.stringContaining('/pecs/tinted/xixi/menina-espresso-black.jpg'),
    )
    expect(images[1]).toHaveProperty(
      'src',
      expect.stringContaining('/pecs/tinted/coco/menina-espresso-black.jpg'),
    )
  })

  it('lets the family log a custom clock time', () => {
    const onLog = vi.fn().mockResolvedValue(undefined)
    render(<PottyNow events={[]} onLog={onLog} onDelete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Outro horário' }))
    fireEvent.change(screen.getByLabelText('Dia'), {
      target: { value: '2026-09-01' },
    })
    fireEvent.change(screen.getByLabelText('Hora'), {
      target: { value: '09:15' },
    })
    fireEvent.click(screen.getByRole('radio', { name: 'Cocô' }))
    fireEvent.click(screen.getByRole('button', { name: 'Anotar' }))

    expect(onLog).toHaveBeenCalledWith('coco', {
      clock: '09:15',
      day: '2026-09-01',
    })
  })
})

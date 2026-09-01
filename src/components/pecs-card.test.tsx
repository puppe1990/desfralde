/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PecsCard } from './pecs-card'

describe('PecsCard', () => {
  it('shows the label and image for a request card', () => {
    render(
      <PecsCard
        label="Xixi"
        speak="Xixi"
        imageSrc="/pecs/xixi-pedido.jpg"
        tone="terra"
      />,
    )

    expect(screen.getByRole('button', { name: /xixi/i })).toBeTruthy()
    expect(screen.getByAltText('Xixi')).toHaveProperty(
      'src',
      expect.stringContaining('/pecs/xixi-pedido.jpg'),
    )
  })
})

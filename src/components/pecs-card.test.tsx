/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PecsCard } from './pecs-card'

afterEach(cleanup)

describe('PecsCard', () => {
  it('uses the tinted illustration that matches the selected avatar', () => {
    render(
      <PecsCard
        slug="xixi"
        label="Xixi"
        speak="Xixi"
        imageSrc="/pecs/xixi-pedido.jpg"
        tone="terra"
        avatar={{
          gender: 'menina',
          skinTone: 'espresso',
          hairType: 'puff',
          hairColor: 'black',
        }}
      />,
    )

    expect(screen.getByAltText('Xixi')).toHaveProperty(
      'src',
      expect.stringContaining('/pecs/tinted/xixi/menina-espresso-black.jpg'),
    )
  })

  it('keeps object cards on the generic illustration', () => {
    render(
      <PecsCard
        slug="banheiro"
        label="Banheiro"
        speak="Banheiro"
        imageSrc="/pecs/banheiro.jpg"
        tone="terra"
        avatar={{
          gender: 'menina',
          skinTone: 'espresso',
          hairType: 'puff',
          hairColor: 'black',
        }}
      />,
    )

    expect(screen.getByAltText('Banheiro')).toHaveProperty(
      'src',
      expect.stringContaining('/pecs/banheiro.jpg'),
    )
  })

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

  it('marks the card as speaking after a tap', () => {
    render(
      <PecsCard
        label="Xixi"
        speak="Xixi"
        imageSrc="/pecs/xixi-pedido.jpg"
        tone="terra"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /xixi/i }))

    expect(screen.getByRole('button', { name: /xixi/i }).className).toContain(
      'is-speaking',
    )
  })

  it('keeps the speaking press if the same card is tapped again', () => {
    render(
      <PecsCard
        label="Xixi"
        speak="Xixi"
        imageSrc="/pecs/xixi-pedido.jpg"
        tone="terra"
      />,
    )

    const card = screen.getByRole('button', { name: /xixi/i })
    fireEvent.click(card)
    fireEvent.click(card)

    expect(card.className).toContain('is-speaking')
  })
})

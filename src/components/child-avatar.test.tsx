/** @vitest-environment jsdom */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChildAvatar } from './child-avatar'

describe('ChildAvatar', () => {
  it('shows the illustrated portrait for the chosen look', () => {
    const { container } = render(
      <ChildAvatar
        name="Ana"
        avatar={{
          gender: 'menina',
          skinTone: 'espresso',
          hairType: 'curly',
          hairColor: 'black',
        }}
      />,
    )

    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe(
      '/avatars/full/menina-espresso-curly-black.jpg',
    )
    expect(img?.getAttribute('alt')).toContain('Ana')
    expect(img?.getAttribute('data-gender')).toBe('menina')
    expect(img?.getAttribute('data-skin-tone')).toBe('espresso')
    expect(img?.getAttribute('data-hair-type')).toBe('curly')
    expect(img?.getAttribute('data-hair-color')).toBe('black')
  })
})

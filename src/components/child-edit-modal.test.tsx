/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChildEditModal } from './child-edit-modal'
import { defaultChildAvatar } from '../domains/child-avatar'

afterEach(cleanup)

const child = {
  id: 'crianca-1',
  familyId: 'casa-1',
  name: 'Ícaro',
  avatar: defaultChildAvatar(),
  createdAt: 1,
}

describe('ChildEditModal', () => {
  it('saves the edited name and asks before deleting', () => {
    const onSave = vi.fn()
    const onDelete = vi.fn()
    render(
      <ChildEditModal
        child={child}
        childCount={2}
        onClose={vi.fn()}
        onSave={onSave}
        onDelete={onDelete}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Editar Ícaro' })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Ícaro Puppe' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onSave).toHaveBeenCalledWith({
      name: 'Ícaro Puppe',
      avatar: child.avatar,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Apagar criança' }))
    expect(
      screen.getByText(/apaga o quadro, o diário e as estrelas/i),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Apagar de vez' }))
    expect(onDelete).toHaveBeenCalled()
  })

  it('creates a new child with name and avatar', () => {
    const onSave = vi.fn()
    render(<ChildEditModal onClose={vi.fn()} onSave={onSave} />)

    expect(screen.getByRole('dialog', { name: 'Nova criança' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Apagar criança' })).toBeNull()
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Luna' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Menina' }))
    fireEvent.click(screen.getByRole('button', { name: 'Criar quadro' }))
    expect(onSave).toHaveBeenCalledWith({
      name: 'Luna',
      avatar: { ...defaultChildAvatar(), gender: 'menina' },
    })
  })

  it('shows the save error inside the create dialog', () => {
    render(
      <ChildEditModal
        error="Nome da criança é obrigatório"
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('dialog', { name: 'Nova criança' }).textContent,
    ).toContain('Nome da criança é obrigatório')
  })
})

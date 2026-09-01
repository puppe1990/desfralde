import { Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { ChildAvatar } from './child-avatar'
import { ChildEditModal } from './child-edit-modal'
import {
  createChildFn,
  deleteChildFn,
  updateChildFn,
} from '../server/child-board'
import type { ChildAvatar as Avatar } from '../domains/child-avatar'
import type { ChildRecord } from '../db/desfralde-records'

export function ChildQuadros({ kids }: { kids: Array<ChildRecord> }) {
  const router = useRouter()
  const [editing, setEditing] = useState<ChildRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addChild(patch: { name: string; avatar: Avatar }) {
    setError(null)
    try {
      await createChildFn({
        data: { name: patch.name, avatar: patch.avatar },
      })
      setCreating(false)
      await router.invalidate()
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível criar',
      )
    }
  }

  async function saveChild(patch: { name: string; avatar: Avatar }) {
    if (!editing) return
    setError(null)
    try {
      await updateChildFn({
        data: { childId: editing.id, name: patch.name, avatar: patch.avatar },
      })
      setEditing(null)
      await router.invalidate()
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível salvar',
      )
    }
  }

  async function removeChild() {
    if (!editing) return
    setError(null)
    try {
      await deleteChildFn({ data: { childId: editing.id } })
      setEditing(null)
      await router.invalidate()
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível apagar',
      )
    }
  }

  return (
    <>
      <ul className="mt-10 grid gap-3">
        {kids.map((child) => (
          <li
            key={child.id}
            className="flex items-center gap-3 rounded-2xl bg-[#fff8ec] pr-3 shadow-[0_18px_40px_rgba(42,33,24,0.08)]"
          >
            <Link
              to="/criancas/$childId"
              params={{ childId: child.id }}
              className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3 text-[#2a2118] no-underline"
            >
              <span className="size-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[#b87a1c] bg-[#f7f0e4]">
                <ChildAvatar name={child.name} avatar={child.avatar} />
              </span>
              <span className="font-display truncate text-2xl">
                {child.name}
              </span>
            </Link>
            <button
              type="button"
              aria-label={`Editar ${child.name}`}
              onClick={() => {
                setError(null)
                setEditing(child)
              }}
              className="shrink-0 rounded-2xl border-2 border-[#2a2118] px-4 py-2 text-sm font-bold"
            >
              Editar
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => {
              setError(null)
              setEditing(null)
              setCreating(true)
            }}
            className="flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-[#b87a1c] bg-[#fff8ec] px-4 py-3 text-left text-[#8a5a10]"
          >
            <span
              aria-hidden="true"
              className="grid size-20 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-[#b87a1c] font-display text-4xl"
            >
              +
            </span>
            <span className="font-display text-2xl">Outra criança</span>
          </button>
        </li>
      </ul>
      {error && !creating && !editing ? (
        <p className="mt-3 text-[#9a3d28]">{error}</p>
      ) : null}
      {creating ? (
        <ChildEditModal
          error={error}
          onClose={() => {
            setError(null)
            setCreating(false)
          }}
          onSave={(patch) => void addChild(patch)}
        />
      ) : null}
      {editing ? (
        <ChildEditModal
          child={editing}
          childCount={kids.length}
          error={error}
          onClose={() => {
            setError(null)
            setEditing(null)
          }}
          onSave={(patch) => void saveChild(patch)}
          onDelete={() => void removeChild()}
        />
      ) : null}
    </>
  )
}

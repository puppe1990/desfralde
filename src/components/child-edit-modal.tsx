import { useEffect, useId, useState } from 'react'

import { AvatarPicker } from './avatar-picker'
import { pecsTextFieldClass } from './settings-form-chrome'
import { defaultChildAvatar } from '../domains/child-avatar'
import type { ChildAvatar } from '../domains/child-avatar'
import type { ChildRecord } from '../db/desfralde-records'

type ChildEditModalProps = {
  child?: ChildRecord
  childCount?: number
  error?: string | null
  onClose: () => void
  onSave: (patch: { name: string; avatar: ChildAvatar }) => void
  onDelete?: () => void
}

export function ChildEditModal({
  child,
  childCount = 0,
  error,
  onClose,
  onSave,
  onDelete,
}: ChildEditModalProps) {
  const titleId = useId()
  const creating = child == null
  const [name, setName] = useState(child?.name ?? '')
  const [avatar, setAvatar] = useState(child?.avatar ?? defaultChildAvatar())
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-[#2a2118]/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border-4 border-[#2a2118] bg-[#fff8ec] p-5 shadow-[0_18px_40px_rgba(42,33,24,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        {confirmingDelete && child && onDelete ? (
          <DeleteChildConfirm
            titleId={titleId}
            name={child.name}
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={onDelete}
          />
        ) : (
          <EditChildForm
            titleId={titleId}
            creating={creating}
            name={name}
            avatar={avatar}
            error={error}
            canDelete={!creating && childCount > 1 && onDelete != null}
            onNameChange={setName}
            onAvatarChange={setAvatar}
            onClose={onClose}
            onSave={() => onSave({ name, avatar })}
            onAskDelete={() => setConfirmingDelete(true)}
          />
        )}
      </div>
    </div>
  )
}

function EditChildForm({
  titleId,
  creating,
  name,
  avatar,
  error,
  canDelete,
  onNameChange,
  onAvatarChange,
  onClose,
  onSave,
  onAskDelete,
}: {
  titleId: string
  creating: boolean
  name: string
  avatar: ChildAvatar
  error?: string | null
  canDelete: boolean
  onNameChange: (name: string) => void
  onAvatarChange: (avatar: ChildAvatar) => void
  onClose: () => void
  onSave: () => void
  onAskDelete: () => void
}) {
  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
      }}
    >
      <h2 id={titleId} className="font-serif text-3xl">
        {creating ? 'Nova criança' : `Editar ${name || 'criança'}`}
      </h2>
      <label className="grid gap-1 text-sm font-bold">
        Nome
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          autoFocus
          className={pecsTextFieldClass}
        />
      </label>
      <AvatarPicker name={name} value={avatar} onChange={onAvatarChange} />
      {error ? <p className="text-[#9a3d28]">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className="rounded-2xl bg-[#c45c3e] px-5 py-3 font-bold text-white"
        >
          {creating ? 'Criar quadro' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border-2 border-[#2a2118] px-5 py-3 font-bold"
        >
          Cancelar
        </button>
        {creating ? null : canDelete ? (
          <button
            type="button"
            onClick={onAskDelete}
            className="ml-auto font-bold text-[#9a3d28]"
          >
            Apagar criança
          </button>
        ) : (
          <p className="ml-auto text-sm text-[#5a4c3d]">
            A casa precisa de pelo menos uma criança.
          </p>
        )}
      </div>
    </form>
  )
}

function DeleteChildConfirm({
  titleId,
  name,
  onCancel,
  onConfirm,
}: {
  titleId: string
  name: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="grid gap-4">
      <h2 id={titleId} className="font-serif text-3xl">
        Apagar {name}?
      </h2>
      <p className="text-[#5a4c3d]">
        Isso apaga o quadro, o diário e as estrelas. Não dá para desfazer.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-2xl bg-[#9a3d28] px-5 py-3 font-bold text-white"
        >
          Apagar de vez
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border-2 border-[#2a2118] px-5 py-3 font-bold"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

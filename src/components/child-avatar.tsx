import { childAvatarSrc } from '../domains/child-avatar'
import type { ChildAvatar as Avatar } from '../domains/child-avatar'

type ChildAvatarProps = {
  name: string
  avatar: Avatar
  className?: string
}

export function ChildAvatar({ name, avatar, className }: ChildAvatarProps) {
  return (
    <img
      src={childAvatarSrc(avatar)}
      alt={`Avatar de ${name}`}
      data-gender={avatar.gender}
      data-skin-tone={avatar.skinTone}
      data-hair-type={avatar.hairType}
      data-hair-color={avatar.hairColor}
      className={className ?? 'h-full w-full object-contain'}
    />
  )
}

import type { PlayerProfile } from "../types"
import { getAvatarUrl } from "../lib/avatars"

type AvatarProps = {
  player: PlayerProfile
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-14 w-14 sm:h-16 sm:w-16",
}

export function Avatar({ player, size = "md" }: AvatarProps) {
  return (
    <img
      alt={`${player.name} avatar`}
      className={`${sizeClasses[size]} rounded-full border border-slate-200 bg-white object-cover`}
      draggable={false}
      src={getAvatarUrl(player.avatarSeed)}
    />
  )
}

import type { PlayerMark } from "@tik-tak/types"
import type { PlayerProfile } from "../types"

const diceBearBaseUrl = "https://api.dicebear.com/9.x/adventurer/svg"

export function getAvatarUrl(seed: string): string {
  const params = new URLSearchParams({
    seed,
    radius: "50",
    backgroundColor: "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  })

  return `${diceBearBaseUrl}?${params.toString()}`
}

export function createPlayerProfile(mark: PlayerMark, name: string, seed: string): PlayerProfile {
  return {
    mark,
    name,
    avatarSeed: seed,
  }
}

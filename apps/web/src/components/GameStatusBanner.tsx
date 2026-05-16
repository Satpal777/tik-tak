import type { GameState, PlayerMark } from "@tik-tak/types"
import { Avatar } from "./Avatar"
import type { PlayerProfile } from "../types"

type GameStatusBannerProps = {
  gameState: GameState
  players: Record<PlayerMark, PlayerProfile>
  fallbackText: string
  busyText?: string
  isBusy?: boolean
  error?: string | null
}

export function GameStatusBanner({
  gameState,
  players,
  fallbackText,
  busyText,
  isBusy = false,
  error,
}: GameStatusBannerProps) {
  if (error) {
    return (
      <div className="w-full max-w-xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-700">
        {error}
      </div>
    )
  }

  if (gameState.status === "won" && gameState.winner) {
    const winner = players[gameState.winner]

    return (
      <div className="flex w-full max-w-xl items-center justify-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-left shadow-sm">
        <Avatar player={winner} size="sm" />
        <div>
          <p className="text-sm font-bold text-emerald-900">{winner.name} wins</p>
          <p className="text-xs text-emerald-700">Game over</p>
        </div>
      </div>
    )
  }

  if (gameState.status === "draw") {
    return (
      <div className="w-full max-w-xl rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm font-semibold text-amber-800">
        Match draw
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 shadow-sm">
      {isBusy && busyText ? busyText : fallbackText}
    </div>
  )
}

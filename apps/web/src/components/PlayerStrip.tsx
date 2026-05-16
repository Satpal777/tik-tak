import type { PlayerMark } from "@tik-tak/types"
import { Avatar } from "./Avatar"
import type { PlayerProfile } from "../types"

type PlayerStripProps = {
  currentTurn?: PlayerMark
  players: Record<PlayerMark, PlayerProfile>
}

export function PlayerStrip({ currentTurn, players }: PlayerStripProps) {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-2 sm:gap-3">
      {(["X", "O"] as const).map((mark) => {
        const player = players[mark]
        const isActive = currentTurn === mark

        return (
          <div
            className={`flex min-w-0 items-center gap-2 rounded-lg border bg-white p-2 shadow-sm sm:gap-3 sm:p-3 ${
              isActive ? "border-teal-500 ring-2 ring-teal-100" : "border-slate-200"
            }`}
            key={mark}
          >
            <Avatar player={player} />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">{player.name}</p>
              <p className="text-xs font-semibold text-slate-500">{mark}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

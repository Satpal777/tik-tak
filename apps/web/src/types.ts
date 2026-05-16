import type { Dispatch, SetStateAction } from "react"
import type { Board, Move, PlayerMark } from "@tik-tak/types"

export type AppRoute = "/" | "/computer" | "/local-friend" | "/online-friend"

export type TickTakBoardProps = {
  board: Board
  disabled?: boolean
  onCellClick: (move: Move) => void
  players: Record<PlayerMark, PlayerProfile>
}

export type GamePageProps = {
  board: Board
  setBoard: Dispatch<SetStateAction<Board>>
  onBack: () => void
}

export type PlayerProfile = {
  mark: PlayerMark
  name: string
  avatarSeed: string
}

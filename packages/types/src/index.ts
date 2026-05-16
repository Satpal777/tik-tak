export type PlayerMark = "X" | "O"
export type BoardCell = PlayerMark | null
export type Board = BoardCell[][]

export type Move = {
  row: number
  col: number
}

export type GameStatus = "playing" | "won" | "draw"

export type GameState = {
  board: Board
  currentTurn: PlayerMark
  winner: PlayerMark | null
  status: GameStatus
}

export type AiMoveRequest = {
  board: Board
  aiPlayer: PlayerMark
}

export type AiMoveResponse = {
  move: Move
  confidence?: number
  reasoning?: string
}

export type ApiErrorResponse = {
  error: string
}

export type RoomPlayer = {
  playerId: string
  mark: PlayerMark
}

export type RoomState = GameState & {
  roomId: string
  players: RoomPlayer[]
}

export type JoinRoomPayload = {
  roomId: string
  playerId: string
}

export type RoomMovePayload = JoinRoomPayload & {
  move: Move
}

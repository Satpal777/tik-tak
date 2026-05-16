import type { Board, BoardCell, GameState, Move, PlayerMark } from "@tik-tak/types"

export const BOARD_SIZE = 3
export const PLAYERS: readonly PlayerMark[] = ["X", "O"]

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array<BoardCell>(BOARD_SIZE).fill(null))
}

export function getOpponent(player: PlayerMark): PlayerMark {
  return player === "X" ? "O" : "X"
}

export function isPlayerMark(value: unknown): value is PlayerMark {
  return value === "X" || value === "O"
}

export function isValidBoard(board: unknown): board is Board {
  return (
    Array.isArray(board) &&
    board.length === BOARD_SIZE &&
    board.every(
      (row) =>
        Array.isArray(row) &&
        row.length === BOARD_SIZE &&
        row.every((cell) => cell === "X" || cell === "O" || cell === null),
    )
  )
}

export function getAvailableMoves(board: Board): Move[] {
  const moves: Move[] = []

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === null) {
        moves.push({ row: rowIndex, col: colIndex })
      }
    })
  })

  return moves
}

export function isMoveInsideBoard(move: Move): boolean {
  return (
    Number.isInteger(move.row) &&
    Number.isInteger(move.col) &&
    move.row >= 0 &&
    move.row < BOARD_SIZE &&
    move.col >= 0 &&
    move.col < BOARD_SIZE
  )
}

export function isLegalMove(board: Board, move: Move): boolean {
  return isMoveInsideBoard(move) && board[move.row]?.[move.col] === null
}

export function applyMove(board: Board, move: Move, player: PlayerMark): Board {
  if (!isLegalMove(board, move)) {
    throw new Error("Cannot apply an illegal move.")
  }

  return board.map((row, rowIndex) =>
    row.map((cell, colIndex) => (rowIndex === move.row && colIndex === move.col ? player : cell)),
  )
}

export function getWinner(board: Board): PlayerMark | null {
  const winningLines = [
    [board[0]?.[0], board[0]?.[1], board[0]?.[2]],
    [board[1]?.[0], board[1]?.[1], board[1]?.[2]],
    [board[2]?.[0], board[2]?.[1], board[2]?.[2]],
    [board[0]?.[0], board[1]?.[0], board[2]?.[0]],
    [board[0]?.[1], board[1]?.[1], board[2]?.[1]],
    [board[0]?.[2], board[1]?.[2], board[2]?.[2]],
    [board[0]?.[0], board[1]?.[1], board[2]?.[2]],
    [board[0]?.[2], board[1]?.[1], board[2]?.[0]],
  ]

  for (const line of winningLines) {
    if (line[0] && line[0] === line[1] && line[1] === line[2]) {
      return line[0]
    }
  }

  return null
}

export function isDraw(board: Board): boolean {
  return getWinner(board) === null && getAvailableMoves(board).length === 0
}

export function getGameState(board: Board, currentTurn: PlayerMark): GameState {
  const winner = getWinner(board)

  if (winner) {
    return {
      board,
      currentTurn,
      winner,
      status: "won",
    }
  }

  if (isDraw(board)) {
    return {
      board,
      currentTurn,
      winner: null,
      status: "draw",
    }
  }

  return {
    board,
    currentTurn,
    winner: null,
    status: "playing",
  }
}

export function findBestDeterministicMove(board: Board, aiPlayer: PlayerMark): Move | null {
  const availableMoves = getAvailableMoves(board)
  const opponent = getOpponent(aiPlayer)

  return (
    findWinningMove(board, aiPlayer, availableMoves) ??
    findWinningMove(board, opponent, availableMoves) ??
    availableMoves.find((move) => move.row === 1 && move.col === 1) ??
    availableMoves.find((move) => isCorner(move)) ??
    availableMoves[0] ??
    null
  )
}

function findWinningMove(board: Board, player: PlayerMark, moves: Move[]): Move | null {
  return moves.find((move) => getWinner(applyMove(board, move, player)) === player) ?? null
}

function isCorner(move: Move): boolean {
  return (
    (move.row === 0 && move.col === 0) ||
    (move.row === 0 && move.col === 2) ||
    (move.row === 2 && move.col === 0) ||
    (move.row === 2 && move.col === 2)
  )
}

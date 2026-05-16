import { useCallback, useState } from "react"
import { applyMove, createEmptyBoard, getGameState, isLegalMove } from "@tik-tak/game-engine"
import type { Move, PlayerMark } from "@tik-tak/types"
import { GameStatusBanner } from "../components/GameStatusBanner"
import { PlayerStrip } from "../components/PlayerStrip"
import { TickTakBoard } from "../components/TickTakBoard"
import { createPlayerProfile } from "../lib/avatars"
import type { GamePageProps } from "../types"

const localPlayers = {
  X: createPlayerProfile("X", "Player One", "local-player-one"),
  O: createPlayerProfile("O", "Player Two", "local-player-two"),
}

export function WithFriends({ board, setBoard, onBack }: GamePageProps) {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerMark>("X")
  const gameState = getGameState(board, currentPlayer)

  const handleLocalFriendMove = useCallback(
    (move: Move) => {
      const currentState = getGameState(board, currentPlayer)

      if (currentState.status !== "playing" || !isLegalMove(board, move)) {
        return
      }

      const nextBoard = applyMove(board, move, currentPlayer)
      const nextPlayer = currentPlayer === "X" ? "O" : "X"
      const nextState = getGameState(nextBoard, nextPlayer)

      setBoard(nextBoard)

      if (nextState.status === "playing") {
        setCurrentPlayer(nextPlayer)
      }
    },
    [board, currentPlayer, setBoard],
  )

  function resetLocalGame() {
    setBoard(createEmptyBoard())
    setCurrentPlayer("X")
  }

  return (
    <section className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center gap-3 sm:gap-4">
      <div className="text-center">
        <button className="mb-2 text-sm font-semibold text-teal-700 hover:text-teal-900" onClick={onBack} type="button">
          Back to modes
        </button>
        <h1 className="text-2xl font-bold sm:text-3xl">Play With Local Friend</h1>
      </div>

      <PlayerStrip currentTurn={currentPlayer} players={localPlayers} />

      <GameStatusBanner
        fallbackText={`${localPlayers[currentPlayer].name}'s turn`}
        gameState={gameState}
        players={localPlayers}
      />

      <TickTakBoard
        board={board}
        disabled={gameState.status !== "playing"}
        onCellClick={handleLocalFriendMove}
        players={localPlayers}
      />

      <button
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        onClick={resetLocalGame}
        type="button"
      >
        New local game
      </button>
    </section>
  )
}

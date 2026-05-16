import { useCallback, useState } from "react"
import { applyMove, createEmptyBoard, getGameState, isLegalMove } from "@tik-tak/game-engine"
import type { Move } from "@tik-tak/types"
import { requestAiMove } from "../api/ai"
import { GameStatusBanner } from "../components/GameStatusBanner"
import { PlayerStrip } from "../components/PlayerStrip"
import { TickTakBoard } from "../components/TickTakBoard"
import { createPlayerProfile } from "../lib/avatars"
import type { GamePageProps } from "../types"

const computerPlayers = {
  X: createPlayerProfile("X", "You", "local-human-player"),
  O: createPlayerProfile("O", "Computer", "ai-computer-player"),
}

export function WithComputer({ board, setBoard, onBack }: GamePageProps) {
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const gameState = getGameState(board, "X")

  const handlePlayerMove = useCallback(
    async (move: Move) => {
      const currentState = getGameState(board, "X")

      if (isAiThinking || currentState.status !== "playing" || !isLegalMove(board, move)) {
        return
      }

      setError(null)
      const boardAfterPlayerMove = applyMove(board, move, "X")
      setBoard(boardAfterPlayerMove)

      if (getGameState(boardAfterPlayerMove, "O").status !== "playing") {
        return
      }

      setIsAiThinking(true)

      try {
        const aiResponse = await requestAiMove({
          board: boardAfterPlayerMove,
          aiPlayer: "O",
        })

        setBoard((currentBoard) => {
          if (!isLegalMove(currentBoard, aiResponse.move)) {
            return currentBoard
          }

          return applyMove(currentBoard, aiResponse.move, "O")
        })
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "AI move failed.")
      } finally {
        setIsAiThinking(false)
      }
    },
    [board, isAiThinking, setBoard],
  )

  function resetComputerGame() {
    setBoard(createEmptyBoard())
    setError(null)
    setIsAiThinking(false)
  }

  return (
    <section className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center gap-3 sm:gap-4">
      <div className="text-center">
        <button className="mb-2 text-sm font-semibold text-teal-700 hover:text-teal-900" onClick={onBack} type="button">
          Back to modes
        </button>
        <h1 className="text-2xl font-bold sm:text-3xl">Play Against Computer</h1>
      </div>

      <PlayerStrip currentTurn={isAiThinking ? "O" : "X"} players={computerPlayers} />

      <GameStatusBanner
        busyText="Computer is choosing a move..."
        error={error}
        fallbackText="Your turn"
        gameState={gameState}
        isBusy={isAiThinking}
        players={computerPlayers}
      />

      <TickTakBoard
        board={board}
        disabled={isAiThinking || gameState.status !== "playing"}
        onCellClick={handlePlayerMove}
        players={computerPlayers}
      />

      <button
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        onClick={resetComputerGame}
        type="button"
      >
        New computer game
      </button>
    </section>
  )
}

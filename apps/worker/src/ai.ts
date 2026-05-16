import {
  findBestDeterministicMove,
  getAvailableMoves,
  getOpponent,
} from "@tik-tak/game-engine"
import type { AiMoveRequest, AiMoveResponse, Move } from "@tik-tak/types"
import { AI_MODEL } from "./config"
import type { Env } from "./env"

type AiMessage = {
  role: "system" | "user"
  content: string
}

export async function getAiMove(request: AiMoveRequest, _env: Env): Promise<AiMoveResponse> {
  const bestMove = findBestDeterministicMove(request.board, request.aiPlayer)

  if (!bestMove) {
    throw new Error("No legal moves are available.")
  }

  return {
    move: bestMove,
    confidence: 1,
    reasoning: "Perfect move selected with minimax search.",
  }
}

export async function streamAiMoveAnalysis(request: AiMoveRequest, env: Env): Promise<ReadableStream> {
  const aiResponse = (await env.AI.run(AI_MODEL, {
    messages: createAiMessages(request, getAvailableMoves(request.board)),
    stream: true,
  })) as unknown

  if (!(aiResponse instanceof ReadableStream)) {
    throw new Error("Workers AI did not return a readable stream.")
  }

  return aiResponse
}

function createAiMessages(request: AiMoveRequest, availableMoves: Move[]): AiMessage[] {
  const opponent = getOpponent(request.aiPlayer)

  return [
    {
      role: "system",
      content:
        "You are a tic-tac-toe move engine. Return only valid compact JSON. Do not include markdown.",
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Choose the best legal move for aiPlayer.",
        board: request.board,
        aiPlayer: request.aiPlayer,
        opponent,
        availableMoves,
        responseShape: {
          move: { row: 0, col: 0 },
          confidence: 0.9,
          reasoning: "short optional reason",
        },
        strategy:
          "Win immediately if possible. Otherwise block opponent wins. Otherwise choose center, corners, then sides.",
      }),
    },
  ]
}

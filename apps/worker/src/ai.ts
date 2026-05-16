import {
  findBestDeterministicMove,
  getAvailableMoves,
  getOpponent,
  isLegalMove,
} from "@tik-tak/game-engine"
import type { AiMoveRequest, AiMoveResponse, Move } from "@tik-tak/types"
import { AI_MODEL } from "./config"
import type { Env } from "./env"

type WorkersAiTextResponse = {
  response?: string
}

type AiMessage = {
  role: "system" | "user"
  content: string
}

export async function getAiMove(request: AiMoveRequest, env: Env): Promise<AiMoveResponse> {
  const fallbackMove = findBestDeterministicMove(request.board, request.aiPlayer)

  if (!fallbackMove) {
    throw new Error("No legal moves are available.")
  }

  const availableMoves = getAvailableMoves(request.board)
  const aiResponse = await env.AI.run(AI_MODEL, {
    messages: createAiMessages(request, availableMoves),
  })

  const parsedMove = parseAiMove(aiResponse)

  if (!parsedMove || !isLegalMove(request.board, parsedMove.move)) {
    return {
      move: fallbackMove,
      confidence: 0.5,
      reasoning: "Fallback move selected because the AI response was missing or illegal.",
    }
  }

  return parsedMove
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

function parseAiMove(aiResponse: unknown): AiMoveResponse | null {
  const content =
    typeof aiResponse === "object" && aiResponse !== null && "response" in aiResponse
      ? (aiResponse as WorkersAiTextResponse).response
      : null

  if (!content) {
    return null
  }

  try {
    const parsed = JSON.parse(content) as Partial<AiMoveResponse>
    const move = parsed.move

    if (!isMoveLike(move)) {
      return null
    }

    return {
      move,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : undefined,
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : undefined,
    }
  } catch {
    return null
  }
}

function isMoveLike(value: unknown): value is Move {
  const move = value as Partial<Move>

  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger(move.row) &&
    Number.isInteger(move.col)
  )
}

import { isPlayerMark, isValidBoard } from "@tik-tak/game-engine"
import { API_PATHS } from "@tik-tak/shared"
import type { AiMoveRequest } from "@tik-tak/types"
import { getAiMove, streamAiMoveAnalysis } from "./ai"
import { corsHeaders } from "./cors"
import type { Env } from "./env"
import { errorResponse, jsonResponse } from "./responses"

export async function routeRequest(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(env) })
  }

  const url = new URL(request.url)

  if (request.method === "GET" && url.pathname === "/health") {
    return jsonResponse({ ok: true }, env)
  }

  if (request.method === "POST" && url.pathname === API_PATHS.aiBestMove) {
    return handleAiMove(request, env, url.searchParams.get("stream") === "true")
  }

  return errorResponse("Not found.", env, 404)
}

async function handleAiMove(request: Request, env: Env, stream: boolean): Promise<Response> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return errorResponse("Request body must be valid JSON.", env, 400)
  }

  const parsed = parseAiMoveRequest(body)

  if (!parsed.ok) {
    return errorResponse(parsed.error, env, 400)
  }

  try {
    if (stream) {
      const bodyStream = await streamAiMoveAnalysis(parsed.request, env)

      return new Response(bodyStream, {
        headers: {
          ...corsHeaders(env),
          "Content-Type": "text/event-stream",
        },
      })
    }

    const aiMove = await getAiMove(parsed.request, env)

    return jsonResponse(aiMove, env)
  } catch (error) {
    console.error("AI move generation failed", error)

    return errorResponse("Failed to generate AI move.", env, 500)
  }
}

function parseAiMoveRequest(body: unknown):
  | { ok: true; request: AiMoveRequest }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be an object." }
  }

  const candidate = body as Partial<AiMoveRequest>

  if (!isValidBoard(candidate.board)) {
    return { ok: false, error: "Invalid board. Expected a 3x3 array of X, O, or null." }
  }

  if (!isPlayerMark(candidate.aiPlayer)) {
    return { ok: false, error: "Invalid aiPlayer. Expected X or O." }
  }

  return {
    ok: true,
    request: {
      board: candidate.board,
      aiPlayer: candidate.aiPlayer,
    },
  }
}

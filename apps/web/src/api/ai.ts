import { API_PATHS } from "@tik-tak/shared"
import type { AiMoveRequest, AiMoveResponse } from "@tik-tak/types"
import { postJson } from "./client"

export function requestAiMove(request: AiMoveRequest): Promise<AiMoveResponse> {
  return postJson<AiMoveResponse>(API_PATHS.aiBestMove, request)
}

import type { ApiErrorResponse } from "@tik-tak/types"
import type { Env } from "./env"
import { withCors } from "./cors"

export function jsonResponse(data: unknown, env: Env, init?: ResponseInit): Response {
  return withCors(Response.json(data, init), env)
}

export function errorResponse(error: string, env: Env, status = 400): Response {
  const body: ApiErrorResponse = { error }

  return jsonResponse(body, env, { status })
}

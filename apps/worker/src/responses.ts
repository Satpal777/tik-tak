import type { ApiErrorResponse } from "@tik-tak/types"
import type { Env } from "./env"
import { withCors } from "./cors"

export function jsonResponse(data: unknown, env: Env, request?: Request, init?: ResponseInit): Response {
  return withCors(Response.json(data, init), env, request)
}

export function errorResponse(error: string, env: Env, request?: Request, status = 400): Response {
  const body: ApiErrorResponse = { error }

  return jsonResponse(body, env, request, { status })
}

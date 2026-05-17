import type { Env } from "./env"

export function corsHeaders(env: Env, request?: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  }

  const allowedOrigin = getAllowedOrigin(env, request)

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin
  }

  if (parseClientOrigins(env.CLIENT_ORIGIN).length > 1) {
    headers.Vary = "Origin"
  }

  return headers
}

export function withCors(response: Response, env: Env, request?: Request): Response {
  const headers = new Headers(response.headers)

  Object.entries(corsHeaders(env, request)).forEach(([key, value]) => {
    headers.set(key, value)
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function getAllowedOrigin(env: Env, request?: Request): string | undefined {
  const allowedOrigins = parseClientOrigins(env.CLIENT_ORIGIN)

  if (allowedOrigins.length === 0 || allowedOrigins.includes("*")) {
    return "*"
  }

  const requestOrigin = request?.headers.get("Origin")

  if (!requestOrigin) {
    return allowedOrigins[0]
  }

  return allowedOrigins.includes(requestOrigin) ? requestOrigin : undefined
}

function parseClientOrigins(clientOrigin?: string): string[] {
  return (clientOrigin ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
}

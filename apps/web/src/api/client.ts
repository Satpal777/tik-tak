import type { ApiErrorResponse } from "@tik-tak/types"

const API_BASE_URL = import.meta.env.VITE_AI_API_URL ?? ""

export async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const data = (await response.json()) as TResponse | ApiErrorResponse

  if (!response.ok) {
    throw new Error(isApiErrorResponse(data) ? data.error : "Request failed.")
  }

  return data as TResponse
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  )
}

export function getRoomIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("room")
}

export function createRoomId(): string {
  return crypto.randomUUID().slice(0, 8)
}

export function replaceOnlineRoomUrl(roomId: string): string {
  const url = new URL(window.location.href)
  url.pathname = "/online-friend"
  url.searchParams.set("room", roomId)
  window.history.replaceState(null, "", url)

  return url.toString()
}

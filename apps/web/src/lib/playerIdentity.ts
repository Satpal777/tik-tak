const PLAYER_ID_KEY = "tik-tak-player-id"

export function getOrCreatePlayerId(): string {
  const storedPlayerId = window.localStorage.getItem(PLAYER_ID_KEY)

  if (storedPlayerId) {
    return storedPlayerId
  }

  const playerId = crypto.randomUUID()
  window.localStorage.setItem(PLAYER_ID_KEY, playerId)

  return playerId
}

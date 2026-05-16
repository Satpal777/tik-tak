import { useCallback, useEffect, useMemo, useState } from "react"
import { getGameState, isLegalMove } from "@tik-tak/game-engine"
import type { Move, PlayerMark, RoomState } from "@tik-tak/types"
import { io, type Socket } from "socket.io-client"
import { GameStatusBanner } from "../components/GameStatusBanner"
import { PlayerStrip } from "../components/PlayerStrip"
import { TickTakBoard } from "../components/TickTakBoard"
import { createPlayerProfile } from "../lib/avatars"
import { getOrCreatePlayerId } from "../lib/playerIdentity"
import { createRoomId, getRoomIdFromUrl, replaceOnlineRoomUrl } from "../lib/rooms"
import type { GamePageProps } from "../types"

const realtimeUrl = import.meta.env.VITE_REALTIME_URL ?? "http://localhost:4000"

export function WithOnlineFriend({ board, setBoard, onBack }: GamePageProps) {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState("")
  const [playerId] = useState(getOrCreatePlayerId)
  const [playerMark, setPlayerMark] = useState<PlayerMark | null>(null)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")
  const gameState = getGameState(board, roomState?.currentTurn ?? "X")
  const canPlay = playerMark !== null && roomState?.currentTurn === playerMark && gameState.status === "playing"
  const isConnected = socket?.connected ?? false
  const playerCount = roomState?.players.length ?? 0
  const onlinePlayers = useMemo(
    () => ({
      X: createPlayerProfile("X", playerMark === "X" ? "You" : "Friend", roomState?.players.find((player) => player.mark === "X")?.playerId ?? "online-player-x"),
      O: createPlayerProfile("O", playerMark === "O" ? "You" : "Friend", roomState?.players.find((player) => player.mark === "O")?.playerId ?? "online-player-o"),
    }),
    [playerMark, roomState?.players],
  )

  useEffect(() => {
    const nextRoomId = getRoomIdFromUrl() ?? createRoomId()
    const nextShareUrl = replaceOnlineRoomUrl(nextRoomId)

    setRoomId(nextRoomId)
    setShareUrl(nextShareUrl)
  }, [])

  useEffect(() => {
    if (!roomId) {
      return undefined
    }

    const nextSocket = io(realtimeUrl, {
      auth: { playerId },
    })

    nextSocket.emit("room:join", { roomId, playerId })

    nextSocket.on("room:state", (state: RoomState) => {
      setError(null)
      setRoomState(state)
      setBoard(state.board)
      setPlayerMark(state.players.find((player) => player.playerId === playerId)?.mark ?? null)
    })

    nextSocket.on("room:error", (payload: { message: string }) => {
      setError(payload.message)
    })

    nextSocket.on("connect_error", () => {
      setError("Realtime server is not connected. Start pnpm dev:realtime and refresh this page.")
    })

    setSocket(nextSocket)

    return () => {
      nextSocket.disconnect()
      setSocket(null)
    }
  }, [playerId, roomId, setBoard])

  const handleOnlineFriendMove = useCallback(
    (move: Move) => {
      if (!socket || !roomId || !canPlay || !isLegalMove(board, move)) {
        return
      }

      socket.emit("game:move", { roomId, playerId, move })
    },
    [board, canPlay, playerId, roomId, socket],
  )

  const statusText = useMemo(() => {
    if (error) {
      return error
    }

    if (!playerMark) {
      return "Waiting for room assignment..."
    }

    return canPlay ? `Your turn (${playerMark})` : `Waiting for ${roomState?.currentTurn ?? "X"}`
  }, [canPlay, error, playerMark, roomState?.currentTurn])

  function resetOnlineGame() {
    if (!socket || !roomId) {
      return
    }

    socket.emit("game:reset", { roomId, playerId })
  }

  async function copyRoomLink() {
    if (!shareUrl) {
      return
    }

    await navigator.clipboard.writeText(shareUrl)
    setCopyState("copied")
    window.setTimeout(() => setCopyState("idle"), 1200)
  }

  return (
    <section className="mx-auto grid h-full max-w-5xl grid-rows-[auto_1fr_auto] gap-3">
      <header className="flex items-center justify-between gap-3">
        <button className="text-sm font-semibold text-teal-700 hover:text-teal-900" onClick={onBack} type="button">
          Back
        </button>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-xl font-bold sm:text-2xl">Online Friend</h1>
          <p className="text-xs font-medium text-slate-500">
            Room {roomId ?? "..."} · {playerCount}/2 players
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isConnected ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
          }`}
        >
          {isConnected ? "Live" : "Offline"}
        </span>
      </header>

      <div className="flex min-h-0 flex-col items-center justify-center gap-3">
        <div className="grid w-full max-w-xl grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Invite link</p>
            <p className="truncate text-sm font-semibold text-slate-900">{shareUrl || "Creating room..."}</p>
          </div>
          <button
            className="rounded-md bg-teal-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-700 disabled:bg-slate-300"
            disabled={!shareUrl}
            onClick={copyRoomLink}
            type="button"
          >
            {copyState === "copied" ? "Copied" : "Copy"}
          </button>
        </div>

        <PlayerStrip currentTurn={roomState?.currentTurn} players={onlinePlayers} />

        <GameStatusBanner
          error={error}
          fallbackText={statusText}
          gameState={gameState}
          players={onlinePlayers}
        />

        <TickTakBoard
          board={board}
          disabled={!canPlay || Boolean(error)}
          onCellClick={handleOnlineFriendMove}
          players={onlinePlayers}
        />
      </div>

      <footer className="flex items-center justify-center gap-3">
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          onClick={resetOnlineGame}
          type="button"
        >
          Reset room
        </button>
      </footer>
    </section>
  )
}

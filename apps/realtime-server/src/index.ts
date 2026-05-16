import { createServer } from "node:http"
import { applyMove, createEmptyBoard, getGameState, isLegalMove } from "@tik-tak/game-engine"
import type { Board, JoinRoomPayload, PlayerMark, RoomMovePayload, RoomPlayer, RoomState } from "@tik-tak/types"
import { Server } from "socket.io"

type RoomRecord = {
  board: Board
  currentTurn: PlayerMark
  players: RoomPlayer[]
}

const port = Number(process.env.PORT ?? 4000)
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173"
const rooms = new Map<string, RoomRecord>()

const httpServer = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" })
    response.end(JSON.stringify({ ok: true }))
    return
  }

  response.writeHead(404)
  response.end()
})

const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
    methods: ["GET", "POST"],
  },
})

registerRealtimeHandlers(io)

httpServer.listen(port, () => {
  console.log(`Realtime server running on http://localhost:${port}`)
})

function registerRealtimeHandlers(io: Server): void {
  io.on("connection", (socket) => {
    socket.emit("ready", { socketId: socket.id })

    socket.on("room:join", (payload: JoinRoomPayload) => {
      const result = joinRoom(payload.roomId, payload.playerId)

      if (!result.ok) {
        socket.emit("room:error", { code: result.code, message: result.message })
        return
      }

      socket.join(payload.roomId)
      io.to(payload.roomId).emit("room:state", toRoomState(payload.roomId, result.room))
    })

    socket.on("game:move", (payload: RoomMovePayload) => {
      const room = rooms.get(payload.roomId)

      if (!room) {
        socket.emit("room:error", { code: "ROOM_NOT_FOUND", message: "Room does not exist." })
        return
      }

      const player = room.players.find((roomPlayer) => roomPlayer.playerId === payload.playerId)
      const state = getGameState(room.board, room.currentTurn)

      if (!player || player.mark !== room.currentTurn || state.status !== "playing" || !isLegalMove(room.board, payload.move)) {
        return
      }

      const nextBoard = applyMove(room.board, payload.move, player.mark)
      const nextTurn = player.mark === "X" ? "O" : "X"

      room.board = nextBoard
      room.currentTurn = nextTurn

      io.to(payload.roomId).emit("room:state", toRoomState(payload.roomId, room))
    })

    socket.on("game:reset", (payload: JoinRoomPayload) => {
      const room = rooms.get(payload.roomId)

      if (!room || !room.players.some((player) => player.playerId === payload.playerId)) {
        return
      }

      room.board = createEmptyBoard()
      room.currentTurn = "X"

      io.to(payload.roomId).emit("room:state", toRoomState(payload.roomId, room))
    })
  })
}

function joinRoom(roomId: string, playerId: string):
  | { ok: true; room: RoomRecord }
  | { ok: false; code: "ROOM_FULL"; message: string } {
  const room = rooms.get(roomId) ?? {
    board: createEmptyBoard(),
    currentTurn: "X" as PlayerMark,
    players: [],
  }

  const existingPlayer = room.players.find((player) => player.playerId === playerId)

  if (!existingPlayer) {
    if (room.players.length >= 2) {
      return {
        ok: false,
        code: "ROOM_FULL",
        message: "This room already has two players.",
      }
    }

    room.players.push({
      playerId,
      mark: room.players.length === 0 ? "X" : "O",
    })
  }

  rooms.set(roomId, room)

  return { ok: true, room }
}

function toRoomState(roomId: string, room: RoomRecord): RoomState {
  return {
    ...getGameState(room.board, room.currentTurn),
    roomId,
    players: room.players,
  }
}

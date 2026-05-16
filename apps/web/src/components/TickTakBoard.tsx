import type { TickTakBoardProps } from "../types"
import { Avatar } from "./Avatar"

export function TickTakBoard({ board, disabled = false, onCellClick, players }: TickTakBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-900 p-2 shadow-xl sm:gap-3 sm:p-3">
      {board.map((row, rowIndex) =>
        row.map((cell, columnIndex) => (
          <button
            className="flex aspect-square w-[clamp(4.75rem,22vw,6.5rem)] cursor-pointer items-center justify-center rounded-md bg-white transition duration-150 hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={disabled || cell !== null}
            key={`${rowIndex}-${columnIndex}`}
            type="button"
            onClick={() => onCellClick({ row: rowIndex, col: columnIndex })}
          >
            {cell ? <Avatar player={players[cell]} size="lg" /> : null}
          </button>
        )),
      )}
    </div>
  )
}

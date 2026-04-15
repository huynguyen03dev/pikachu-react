import type { JSX } from "react"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { doSelectCell, selectCells, selectSelectedCellIds } from "./boardSlice"
import { cn } from "../../utils/utils"

export const Board = (): JSX.Element => {
  const cells = useAppSelector(selectCells); 
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedCellIds);
  
  return (
    <main className="p-4 flex-1 grid place-items-center">
      <div className="grid grid-cols-12 gap-1 w-[min(92vw,720px)]">
        {cells.map((cell, i) => {
          if (cell.kind === "empty") {
            return (
              <div
                key={i}
                aria-hidden="true"
                className="aspect-square"
              />
            )
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => dispatch(doSelectCell(i))}
              className={cn(
                "aspect-square border border-gray-400 hover:bg-gray-300 active:bg-gray-400 transition-colors",
                selectedIds.includes(cell.id) ? "bg-yellow-300" : "bg-gray-200"
              )}
            >
              <p>{cell.tileType}</p>
            </button>
          )
        })}
      </div>
    </main>
  )
}

import { createSelector } from "@reduxjs/toolkit";
import { Cell, selectCells, selectCols, selectRemainingTiles, selectRows, selectStatus } from "./boardSlice";
import { getPath } from "./pathfinding";

const findAnyMatchablePair = (cells: Cell[], rows: number, cols: number): { x: number, y: number } | null => {
  const tileCells = cells.filter(cell => cell.kind === "tile");

  for (let i = 0; i < tileCells.length; i++) {
    for (let j = i + 1; j < tileCells.length; j++) {
      if (tileCells[i].tileType !== tileCells[j].tileType) {
        continue;
      }

      if (getPath(cells, rows, cols, tileCells[i].id, tileCells[j].id)) {
        return { x: tileCells[i].id, y: tileCells[j].id };
      }
    }
  }

  return null;
}

export const selectMatchablePair = createSelector(
	[selectCells, selectRows, selectCols],
	(cells : Cell[], rows: number, cols: number) => findAnyMatchablePair(cells, rows, cols)
)

export const selectIsGameEnd = createSelector(
  [selectStatus],
  (status) => status === "won" || status === "lost"
)

export const selectMatchesRemaining = createSelector(
  [selectRemainingTiles],
  (remainingTiles) => remainingTiles / 2
)
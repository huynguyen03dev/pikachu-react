import { createSelector } from "@reduxjs/toolkit";
import { Cell, selectCells, selectCols, selectRemainingTiles, selectRows, selectStatus } from "./boardSlice";
import { getPath } from "./pathfinding";
import { getAffectedCellsIfAMatchRemoved } from "./matchPathfinding";

let cachedMatchablePairs: { pair: Set<number>, path: { x: number, y: number }[] }[] | null = null;
let cachedCells: Cell[] | null = null;

const findAllMatchablePair = (cells: Cell[], rows: number, cols: number)
  : { pair: Set<number>, path: { x: number, y: number }[] }[] | null => {
  const tileCells = cells.filter(cell => cell.kind === "tile");

  const matchablePairs = new Array<{ pair: Set<number>, path: { x: number, y: number }[] }>();

  for (let i = 0; i < tileCells.length; i++) {
    for (let j = i + 1; j < tileCells.length; j++) {
      if (tileCells[i].tileType !== tileCells[j].tileType) {
        continue;
      }

      const path = getPath(cells, rows, cols, tileCells[i].id, tileCells[j].id);
      if (path) {
        matchablePairs.push({ pair: new Set([tileCells[i].id, tileCells[j].id]), path });
      }
    }
  }

  return matchablePairs.length === 0 ? null : matchablePairs;
}

const handleSelectMatchablePair = (cells: Cell[], rows: number, cols: number) => {
  if (cachedCells === null || cachedMatchablePairs === null) {
    cachedCells = cells;
    cachedMatchablePairs = findAllMatchablePair(cells, rows, cols);
    return cachedMatchablePairs;
  }


  if (cachedCells.filter(cell => cell.kind === "tile").length !== cells.filter(cell => cell.kind === "tile").length) {
    console.log("Number of tiles changed, recalculating matchable pairs...");
    // If the number of tiles has changed, we need to recalculate the matchable pairs for affected selectCells that are affected by the removed pair
    const matchedCellIds = new Set<number>();

    for (let i = 0; i < cells.length; i++) {
      const prev = cachedCells[i];
      const next = cells[i];

      if (prev.kind === "tile" && next.kind !== "tile") {
        matchedCellIds.add(prev.id);
      }
    }

    if (matchedCellIds.size !== 2) {
      // happens when restart1
      cachedCells = cells;
      cachedMatchablePairs = findAllMatchablePair(cells, rows, cols);
      return cachedMatchablePairs;
    }

    cachedCells = [...cells];
    const affectedCellIds = getAffectedCellsIfAMatchRemoved(matchedCellIds, cells, rows, cols);
    console.log("Affected cells:", affectedCellIds);

    // Update cached matchable pairs by removing pairs and affected cells that involve removed cells 
    cachedMatchablePairs = cachedMatchablePairs.filter(pair => {
      for (const cellId of pair.pair) {
        if (matchedCellIds.has(cellId) || affectedCellIds.has(cellId)) {
          return false; // Remove pairs that involve removed cells
        }
      }
      return true;
    });

    // caculate new pairs that involve affected cells
    for (const affectedCellId of affectedCellIds) {
      const affectedCell = cells.find(c => c.id === affectedCellId);
      if (affectedCell && affectedCell.kind === "tile") {
        for (const otherCell of cells) {
          if (otherCell.id !== affectedCellId && otherCell.kind === "tile" && otherCell.tileType === affectedCell.tileType) {
            const path = getPath(cells, rows, cols, affectedCell.id, otherCell.id);
            if (path) {
              cachedMatchablePairs.push({ pair: new Set([affectedCell.id, otherCell.id]), path });
            }
          }
        }
      }
    }

    return cachedMatchablePairs;
  } else {
    // number same but this trigger - new cells preset (init game or shuffle board happened) - recaculate all
    cachedCells = cells;
    cachedMatchablePairs = findAllMatchablePair(cells, rows, cols);
    return cachedMatchablePairs;
  }
}

export const selectMatchablePairs = createSelector(
  [selectCells, selectRows, selectCols],
  (cells: Cell[], rows: number, cols: number) => handleSelectMatchablePair(cells, rows, cols)
)

export const selectIsGameEnd = createSelector(
  [selectStatus],
  (status) => status === "won" || status === "lost"
)

export const selectMatchesRemaining = createSelector(
  [selectRemainingTiles],
  (remainingTiles) => remainingTiles / 2
)

import type { Cell } from "./boardSlice"

interface PCell {
  x: number
  y: number
  type: "wall" | "empty"
}

interface PNode {
  prev: PNode | null
  value: PCell
  next: PNode | null
  turnLeft: number // Always max = 2, if < 0 then invalid path
}

interface PGrid {
  cells: PCell[][]
  width: number
  height: number
}

const createEmptyPGrid = (rows: number, cols: number) => {
  const cells: PCell[][] = []

  for (let i = 0; i < rows; i++) {
    const row: PCell[] = []
    for (let j = 0; j < cols; j++) {
      row.push({
        x: j,
        y: i,
        type: "empty",
      })
    }
    cells.push(row)
  }

  return { cells, width: cols, height: rows }
}

export function getAffectedCellsIfAMatchRemoved(
  removedPair: Set<number>,
  cells: Cell[],
  rows: number,
  cols: number,
): Set<number> {
  // Convert pair of id to coordinates
  const removedCoords: Array<{ x: number; y: number }> = []
  for (const cellId of removedPair) {
    const cell = cells.find(c => c.id === cellId)
    if (cell) {
      removedCoords.push({
        x: cell.id % cols,
        y: Math.floor(cell.id / cols),
      })
    }
  }

  if (removedCoords.length !== 2) {
    console.error("Invalid removed pair:", removedPair, "cells:", cells)
    throw new Error("removedPair must contain exactly 2 existing cells")
  }

  // calculate the grid from cells
  const pGrid: PGrid = createEmptyPGrid(rows, cols)

  for (let i = 0; i < cells.length; i++) {
    const rowId = Math.floor(i / cols)
    const colId = i % cols

    pGrid.cells[rowId][colId] = {
      x: colId,
      y: rowId,
      type: cells[i].kind === "tile" ? "wall" : "empty",
    }
  }

  for (const removedCell of removedCoords) {
    pGrid.cells[removedCell.y][removedCell.x] = {
      x: removedCell.x,
      y: removedCell.y,
      type: "empty",
    }
  }

  // padding
  const gridWithPadding = createEmptyPGrid(rows + 2, cols + 2)

  for (let i = 0; i < pGrid.height; i++) {
    for (let j = 0; j < pGrid.width; j++) {
      const cell = pGrid.cells[i][j]
      cell.x = j + 1
      cell.y = i + 1
      gridWithPadding.cells[i + 1][j + 1] = pGrid.cells[i][j]
    }
  }

  // find affected cells
  const startNode1: PNode = {
    prev: null,
    value:
      gridWithPadding.cells[removedCoords[0].y + 1][removedCoords[0].x + 1],
    next: null,
    turnLeft: 2,
  }

  const startNode2: PNode = {
    prev: null,
    value:
      gridWithPadding.cells[removedCoords[1].y + 1][removedCoords[1].x + 1],
    next: null,
    turnLeft: 2,
  }

  const result: Set<number> = new Set()
  findAffected(startNode1, gridWithPadding, result)
  findAffected(startNode2, gridWithPadding, result)

  return result;
}

function getCellIdFromPaddedPCell(pcell: PCell, cols: number): number {
  return (pcell.y - 1) * cols + (pcell.x - 1)
}

function findAffected(current: PNode, grid: PGrid, result: Set<number>): void {
  // first point
  // find relative points
  // build nodes from relative points with max turn, compare with last pre to see if turn => -1 => check valid
  //
  if (current.value.type === "wall") {
    result.add(getCellIdFromPaddedPCell(current.value, grid.width - 2)) // -2 to remove padding
    return
  }

  const relativeCells = checkNearbyPCells(current, grid, result)

  for (const relativeCell of relativeCells) {
    if (current.prev === null) {
      // recusive({prev: current, body: point, next: null, turnLeft: current.turnLeft})
      findAffected(
        {
          prev: current,
          value: relativeCell,
          next: null,
          turnLeft: current.turnLeft,
        },
        grid,
        result,
      )
    } else {
      const vectorPrevToCurrent = {
        x: current.value.x - current.prev.value.x,
        y: current.value.y - current.prev.value.y,
      }

      const vectorCurrentToPoint = {
        x: relativeCell.x - current.value.x,
        y: relativeCell.y - current.value.y,
      }

      const dotProduct =
        vectorPrevToCurrent.x * vectorCurrentToPoint.x +
        vectorPrevToCurrent.y * vectorCurrentToPoint.y

      if (dotProduct < 0) {
        // go back, invalid path, do not continue
        continue
      }

      const turn: boolean = dotProduct === 0
      const turnLeft = turn ? current.turnLeft - 1 : current.turnLeft

      if (turnLeft < 0) {
        // invalid path, do not continue
        continue
      }

      const nextNode: PNode = {
        prev: current,
        value: relativeCell,
        next: null,
        turnLeft: turnLeft,
      }

      // recusive(nextNode)
      findAffected(nextNode, grid, result)
    }
  }
}

function checkNearbyPCells(
  current: PNode,
  grid: PGrid,
  result: Set<number>,
): PCell[] {
  const ans: PCell[] = []
  const cell = current.value

  const up = { x: cell.x, y: cell.y - 1 }
  const left = { x: cell.x - 1, y: cell.y }
  const right = { x: cell.x + 1, y: cell.y }
  const down = { x: cell.x, y: cell.y + 1 }

  const points = [up, left, right, down]

  for (const point of points) {
    const insideGrid: boolean =
      point.x >= 0 &&
      point.x < grid.width &&
      point.y >= 0 &&
      point.y < grid.height

    if (!insideGrid) {
      continue
    }

    if (current.prev !== null) {
      const vectorPrevToCurrent = {
        x: current.value.x - current.prev.value.x,
        y: current.value.y - current.prev.value.y,
      }

      const vectorCurrentToPoint = {
        x: point.x - current.value.x,
        y: point.y - current.value.y,
      }

      const dotProduct =
        vectorPrevToCurrent.x * vectorCurrentToPoint.x +
        vectorPrevToCurrent.y * vectorCurrentToPoint.y
      if (dotProduct < 0) {
        continue
      }

      const turn: boolean = dotProduct === 0
      const turnLeft = turn ? current.turnLeft - 1 : current.turnLeft
      if (turnLeft < 0) {
        continue
      }
    }

    if (grid.cells[point.y][point.x].type === "wall") {
      result.add(
        getCellIdFromPaddedPCell(
          { x: point.x, y: point.y, type: "wall" },
          grid.width - 2,
        ),
      ) // -2 to remove padding
      continue
    }

    if (grid.cells[point.y][point.x].type !== "wall") {
      const currentCell = grid.cells[point.y][point.x]
      if (currentCell.type === "empty") {
        ans.push(currentCell)
      }
    }
  }

  return ans
}

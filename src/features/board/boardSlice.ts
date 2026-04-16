import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { getPath } from "./pathfinding"

export interface Cell {
  id: number,
  kind: "empty" | "tile",
  tileType: number
}

export type BoardSliceState = {
  rows: number,
  cols: number,
  status: "idle" | "playing" | "won" | "lost",
  cells: Cell[],
  selectedCellIds: number[], //Max 2
  remainingTiles: number,
  shuffleLeft: number,
  hintLeft: number,
  moveCount: number,
  timeLimit: number,
  timeLeft: number
}

const DEFAULT_ROWS = 8
const DEFAULT_COLS = 12

const createEmptyCells = (rows: number, cols: number): Cell[] => {
  const cells: Cell[] = []
  for (let i = 0; i < rows * cols; i++) {
    cells.push({
      id: i,
      kind: "empty",
      tileType: 0
    })
  }

  return cells;
}

function shuffleRandom(array: any[]) {
  const result = [...array]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
// Shuffle the tiles
const createShuffledCells = (rows: number, cols: number): Cell[] => {
  const totalCells = rows * cols
  if (totalCells % 2 !== 0) {
    throw new Error("rows * cols must be even")
  }

  const totalTileTypes = 6 
  const pairCount = totalCells / 2
  let tiles: number[] = []

  for (let i = 0; i < pairCount; i++) {
    const tileType = (i % totalTileTypes) + 1
    tiles.push(tileType, tileType)
  }

  tiles = shuffleRandom(tiles)

  return tiles.map((tileType, id) => ({
    id,
    kind: "tile",
    tileType,
  }))
}

const initialState: BoardSliceState = {
  rows: DEFAULT_ROWS,
  cols: DEFAULT_COLS,
  status: "idle",
  cells: createEmptyCells(DEFAULT_ROWS, DEFAULT_COLS),
  selectedCellIds: [],
  remainingTiles: DEFAULT_COLS * DEFAULT_ROWS,
  shuffleLeft: 3,
  hintLeft: 3,
  moveCount: 0,
  timeLimit: 200,
  timeLeft: 200,
}

// If you are not using async thunks you can use the standalone `createSlice`.
export const boardSlice = createAppSlice({
  name: "board",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: create => ({
    initBoard: create.reducer((state, action: PayloadAction<{ rows?: number, cols?: number }>) => {
        state.rows = action.payload.rows ?? DEFAULT_ROWS
        state.cols = action.payload.cols ?? DEFAULT_COLS
        state.cells = createShuffledCells(state.rows, state.cols)
        state.status = "playing"
        state.selectedCellIds = []
        state.remainingTiles = state.rows * state.cols
        state.shuffleLeft = 3
        state.hintLeft = 3
        state.moveCount = 0
        state.timeLimit = 200
        state.timeLeft = 200
    }),
    doSelectCell: create.reducer((state, action: PayloadAction<number>) => {
      const cellId = action.payload;
      if (state.selectedCellIds.length === 2) {
        return;
      }

      if (state.status !== "playing") {
        return;
      }

      const targetCell = state.cells[cellId]

      if (targetCell.kind === "empty") {
        return;
      }
      
      if (state.selectedCellIds.length === 0) {
        state.selectedCellIds.push(cellId);
        return;
      }

      if (state.selectedCellIds.length === 1) {
        const firstSelectedCellId = state.selectedCellIds[0]
        if (firstSelectedCellId === cellId) {
          // click the same cell, deselect it
          state.selectedCellIds = [];
          return;
        }

        const path = getPath(state.cells, state.rows, state.cols, firstSelectedCellId, targetCell.id)
        console.log(path);
        if (state.cells[firstSelectedCellId].tileType === targetCell.tileType && path) {
          console.log()
          // match
          state.cells[firstSelectedCellId].kind = "empty"
          state.cells[cellId].kind = "empty"
          state.remainingTiles -= 2
          state.selectedCellIds = []
          if (state.remainingTiles === 0) {
            state.status = "won"
          }
        } else {
          // not match
          state.selectedCellIds = [];
          state.moveCount += 1;
        }
      }
    }),
    loseGame: create.reducer((state) => {
      state.status = "lost"
    }),
    tick: create.reducer((state) => {
      if (state.status !== "playing") {
        return;
      }
      
      if (state.timeLeft <= 0) {
        state.status = "lost"
        return;
      }

      state.timeLeft -= 1;
    }),
    shuffle: create.reducer((state) => {
      // TODO: implement shuffle action
      const tiledCells = state.cells.filter((cell) => cell.kind === "tile");
      let typeArr: number[] = [];

      for (let cell of tiledCells) {
        typeArr.push(cell.tileType);
      }

      typeArr = shuffleRandom(typeArr);

      for (let i = 0; i < typeArr.length; i++) {
        tiledCells[i].tileType = typeArr[i];
      }
    })
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectCells: board => board.cells,
    selectStatus: board => board.status,
    selectSelectedCellIds: board => board.selectedCellIds,
    selectRemainingTiles: board => board.remainingTiles,
    selectShuffleLeft: board => board.shuffleLeft,
    selectHintLeft: board => board.hintLeft,
    selectMoveCount: board => board.moveCount,
    selectTimeLimit: board => board.timeLimit,
    selectTimeLeft: board => board.timeLeft
  },
});

// Action creators are generated for each case reducer function.
export const { initBoard, doSelectCell, loseGame, tick, shuffle } = boardSlice.actions;

export const { 
  selectCells, 
  selectSelectedCellIds, 
  selectStatus, 
  selectHintLeft, 
  selectRemainingTiles, 
  selectShuffleLeft, 
  selectMoveCount, 
  selectTimeLimit, 
  selectTimeLeft 
} = boardSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd =
//   (amount: number): AppThunk =>
//   (dispatch, getState) => {
//     const currentValue = selectCount(getState())

//     if (currentValue % 2 === 1 || currentValue % 2 === -1) {
//       dispatch(incrementByAmount(amount))
//     }
//   }

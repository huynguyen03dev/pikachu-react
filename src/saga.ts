import { PayloadAction } from '@reduxjs/toolkit'
import { SagaIterator } from 'redux-saga'
import { put, takeEvery, all, select, delay, takeLatest } from 'redux-saga/effects'
import { Cell, doSelectCell, initBoard, removeMatchPair, removeSelection, selectCells, selectCols, selectRows, selectSelectedCellIds, selectStatus, shuffle, updateMatchPath } from './features/board/boardSlice'
import { getPath } from './features/board/pathfinding'
import { selectMatchablePair } from './features/board/boardSelectors'

export const SELLECT_CELL = "SELECT_CELL";
export const CHECK_MATCHABLE_PAIR = "CHECK_MATCHABLE_PAIR";
export const INIT_GAME = "INIT_GAME";
export const SHUFFLE_BOARD = "SHUFFLE_BOARD";

export function* selectCell(action: PayloadAction<number>) : SagaIterator {
    const cellId = action.payload;
    const selectedCellIds: number[] = yield select(selectSelectedCellIds);

    if (selectedCellIds.length === 0) {
        // none selected, select the cell
        yield put({type: doSelectCell.type, payload: cellId });
        return;
    }

    if (selectedCellIds.length >= 2) {
        // already have 2 selected, do nothing
        return;
    }

    if (selectedCellIds.includes(cellId)) {
        // already selected, deselect the cell
        yield put({type: removeSelection.type });
        return;
    }

    const cells: Cell[] = yield select(selectCells);
    const firstCell = cells[selectedCellIds[0]]
    const secondCell = cells[cellId]

    if (firstCell.tileType !== secondCell.tileType) {
        // Different type, deselect
        yield put({ type: removeSelection.type });
        return;
    }

    // same type, check if they can be matched
    const rows = yield select(selectRows);
    const cols = yield select(selectCols);

    const path = getPath(cells, rows, cols, firstCell.id, secondCell.id);

    if (!path) {
        // Cannot match, deselect
        yield put({ type: removeSelection.type });
        return;
    }

    // Can match
    yield put({ type: doSelectCell.type, payload: secondCell.id });
    yield put({ type: updateMatchPath.type, payload: path });

    yield delay(300);

    yield put({ type: updateMatchPath.type, payload: [] });
    yield put({ type: removeSelection.type });
    yield put({ type: removeMatchPair.type, payload: [ firstCell.id, secondCell.id ] });

    yield delay(1000);

    yield put({ type: CHECK_MATCHABLE_PAIR });
}

export function* watchSelectCell() {
    yield takeEvery(SELLECT_CELL, selectCell) 
}


export function* checkForMatchablePair() : SagaIterator {
    const status = yield select(selectStatus);

    if (status !== "playing") {
        // Only check for matchable pair when the game is in playing status
        return;
    }

    const cols = yield select(selectCols);

    const pair = yield select(selectMatchablePair);

    console.log(
        `Checking for matchable pair, found: ${pair?.x}, ${pair?.y} ` + 
        `[${Math.floor(pair?.x / cols)}, ${pair?.x % cols}], [${Math.floor(pair?.y / cols)}, ${pair?.y % cols}]`
    );

    if (pair) {
        // Found a matchable pair, do nothing
        return;
    }

    // No matchable pair, reshuffle the board
    console.log("No matchable pair found, reshuffling the board...");

    yield delay(2000);
    yield put({ type: shuffle.type });

    yield delay(1000);

    // recheck 
    yield put({ type: CHECK_MATCHABLE_PAIR });
}

export function* watchCheckForMatchablePair() {
    yield takeLatest(CHECK_MATCHABLE_PAIR, checkForMatchablePair) 
}

export function* initGame(action: PayloadAction<{ rows?: number, cols?: number }>) : SagaIterator {
    console.log("Initializing game...");
    yield put({ type: initBoard.type, payload: action.payload });

    yield delay(1000);

    yield put({ type: CHECK_MATCHABLE_PAIR });
}

export function* watchInitGame() {
    yield takeLatest(INIT_GAME, initGame) 
}

export function* shuffleBoard() : SagaIterator {
    yield put({ type: shuffle.type });

    yield delay(1000);

    yield put({ type: CHECK_MATCHABLE_PAIR });
}

export function* watchShuffleBoard() {
    yield takeLatest(SHUFFLE_BOARD, shuffleBoard) 
}

// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
    watchSelectCell(),
    watchCheckForMatchablePair(),
    watchInitGame(),
    watchShuffleBoard(),
  ])
}

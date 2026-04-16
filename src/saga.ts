import { PayloadAction } from '@reduxjs/toolkit'
import { SagaIterator } from 'redux-saga'
import { put, takeEvery, all, select, delay } from 'redux-saga/effects'
import { Cell, doSelectCell, removeMatchPair, removeSelection, selectCells, selectCols, selectRows, selectSelectedCellIds, updateMatchPath } from './features/board/boardSlice'
import { getPath } from './features/board/pathfinding'

export const SELLECT_CELL = "SELECT_CELL";

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
}

export function* watchSelectCell() {
    yield takeEvery(SELLECT_CELL, selectCell) 
}

// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
    watchSelectCell()
  ])
}

import { Cell } from "./boardSlice";

interface PCell {
    x: number,
    y: number,
    type: "wall" | "empty"
}

interface PNode {
    prev: PNode | null;
    value: PCell;
    next: PNode | null;
    turnLeft: number; // Always max = 2, if < 0 then invalid path
}

interface PGrid {
    cells: PCell[][];
    width: number;
    height: number;
}

const createEmptyPGrid = (rows: number, cols: number) => {
    const cells: PCell[][] = [];

    for (let i = 0; i < rows; i++) {
        const row: PCell[] = [];
        for (let j = 0; j < cols; j++) {
            row.push({
                x: j,
                y: i,
                type: "empty"
            })
        }
        cells.push(row);
    }

    return { cells, width: cols, height: rows };
}

export const getPath = (cells: Cell[], rows: number, cols: number, startId: number, endId: number)
    : { x: number, y: number}[] | null => {
    let startPCell: PCell | null = null;
    let endPCell: PCell | null = null;
    const pGrid: PGrid = createEmptyPGrid(rows, cols);

    for (let i = 0; i < cells.length; i++) {
        const rowId = Math.floor(i / cols);
        const colId = i % cols;
        if (cells[i].id === startId) {
            startPCell = {
                x: colId,
                y: rowId,
                type: cells[i].kind === "tile" ? "wall" : "empty"
            }
        }

        if (cells[i].id === endId) {
            endPCell = {
                x: endId % cols,
                y: Math.floor(endId / cols),
                type: cells[endId].kind === "tile" ? "wall" : "empty"
            }
        }

        pGrid.cells[rowId][colId] = {
            x: colId,
            y: rowId,
            type: cells[i].kind === "tile" ? "wall" : "empty"
        }
    }

    if (!startPCell || !endPCell) {
        throw new Error("startId or endId not found in cells");
    }

    // TODO: padding
    const gridWithPadding = createEmptyPGrid(rows + 2, cols + 2);

    for (let i = 0; i < pGrid.height; i++) {
        for (let j = 0; j < pGrid.width; j++) {
            const cell = pGrid.cells[i][j];
            cell.x = j + 1;
            cell.y = i + 1;
            gridWithPadding.cells[i + 1][j + 1] = pGrid.cells[i][j];
        }
    }

    const startPCellWithPadding = {
        x: startPCell.x + 1,
        y: startPCell.y + 1,
        type: startPCell.type
    };

    const endPCellWithPadding = {
        x: endPCell.x + 1,
        y: endPCell.y + 1,
        type: endPCell.type
    };

    const startNodeWithPadding: PNode = {
        prev: null,
        value: startPCellWithPadding,
        next: null,
        turnLeft: 2
    };

    const endNodePath = findEndNodePath(startNodeWithPadding, endPCellWithPadding, gridWithPadding);

    if (!endNodePath) {
        return null;
    }

    const path: { x: number, y: number}[] = [];
    let currentNode: PNode | null = endNodePath;

    while (currentNode) {
        path.push({ x: currentNode.value.x - 1, y: currentNode.value.y - 1}); // -1 to remove padding
        currentNode = currentNode.prev;
    }

    return path.reverse();  
}

function findRelativePCells(cell: PCell, end: PCell, grid: PGrid): PCell[] {
	const result: PCell[] = [];

	const up = { x: cell.x, y: cell.y - 1 };
	const left = { x: cell.x - 1, y: cell.y };
	const right = { x: cell.x + 1, y: cell.y };
	const down = { x: cell.x, y: cell.y + 1 };

	const points = [up, left, right, down];

	for (const point of points) {
		const insideGrid =
			point.x >= 0 &&
			point.x < grid.width &&
			point.y >= 0 &&
			point.y < grid.height;

		if (point.x === end.x && point.y === end.y) {
			return [end];
		}

		if (insideGrid && grid.cells[point.y][point.x].type !== "wall") {
			const currentCell = grid.cells[point.y][point.x];
			if (currentCell.type === "empty") {
				result.push(currentCell);
			}
		}
	}

	return result;
}

function findEndNodePath(current: PNode, end: PCell, grid: PGrid) : PNode | null {
    // first point
	// find relative points
	// build nodes from relative points with max turn, compare with last pre to see if turn => -1 => check valid
	// 
	if (current.value.x === end.x && current.value.y === end.y) {
		return current;
	}

	const relativeCells = findRelativePCells(current.value, end, grid);

	for (const relativeCell of relativeCells) {
		if (current.prev === null) {
			// recusive({prev: current, body: point, next: null, turnLeft: current.turnLeft})
			const result = findEndNodePath({
				prev: current,
				value: relativeCell,
				next: null,
				turnLeft: current.turnLeft,
			}, end, grid);
			if (result) {
				return result;
			}
		} else {
			const vectorPrevToCurrent = {
				x: current.value.x - current.prev.value.x,
				y: current.value.y - current.prev.value.y,
			};

			const vectorCurrentToPoint = {
				x: relativeCell.x - current.value.x,
				y: relativeCell.y - current.value.y,
			};

			const dotProduct = vectorPrevToCurrent.x * vectorCurrentToPoint.x + vectorPrevToCurrent.y * vectorCurrentToPoint.y;

			if (dotProduct < 0) {
				// go back, invalid path, do not continue
				continue;
			}

			const turn: boolean = dotProduct === 0;
			const turnLeft = turn ? current.turnLeft - 1 : current.turnLeft;

			if (turnLeft < 0) {
				// invalid path, do not continue
				continue;
			}

			const nextNode: PNode = {
				prev: current,
				value: relativeCell,
				next: null,
				turnLeft: turnLeft,
			};

			// recusive(nextNode)
			const result = findEndNodePath(nextNode, end, grid);

			if (result) {
				return result;
			}
		}
	}

	return null;
}
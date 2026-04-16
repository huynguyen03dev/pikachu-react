import { useCallback, useEffect, useRef, useState, type JSX } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectCells, selectCols, selectRows, selectSelectedCellIds, selectMatchPath } from "./boardSlice"
import { BoardCell } from "./components/BoardCell"
import { SELLECT_CELL } from "../../saga"

interface Point {
  x: number,
  y: number
}

interface Line {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}

export const Board = (): JSX.Element => {
  const cells = useAppSelector(selectCells); 
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedCellIds);
  const rows = useAppSelector(selectRows);
  const cols = useAppSelector(selectCols);
  const matchPath = useAppSelector(selectMatchPath);
  
  const [lineList, setLineList] = useState<Line[]>([]);

  const handleSelect = useCallback((cellId: number) => {
    dispatch({ type: SELLECT_CELL, payload: cellId });
  }, [dispatch]);

  const boardRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const pointToPixelCoords = (point: Point, center: Point, cellSize: number) 
  : Point => {
    const x1 = center.x - ((cols - 1)/2 - point.x) * cellSize;
    const y1 = center.y - ((rows - 1)/2 - point.y) * cellSize;

    return { x: x1, y: y1 };
  }

  useEffect(() => {
    let rect = boardRef.current?.getBoundingClientRect();
    let main = mainRef.current?.getBoundingClientRect();
    const cellSize = rect ? rect.width / 12 : 0;

    const center = {
      x: rect ? rect.left + rect.width / 2 - main.left : 0,
      y: rect ? rect.top + rect.height / 2 - main.top : 0,
    }

    const drawpoints = matchPath.map(point => pointToPixelCoords(point, center, cellSize));

    for (let i = 1; i < drawpoints.length; i++) {
      const line = {
        x1: drawpoints[i-1].x,
        y1: drawpoints[i-1].y,
        x2: drawpoints[i].x,
        y2: drawpoints[i].y,
      };
      console.log(line);1
      setLineList(prev => [...prev, line]);
    }

    return () => {
      setLineList([]);
    }
  }, [matchPath]);

  return (
    <main ref={mainRef} className="relative p-4 flex-1">
      <div className="grid place-items-center mt-10">
        <div ref={boardRef} className="grid grid-cols-12 gap-1 w-[min(92vw,720px)] bg-gray-300">
          {cells.map((cell) => {
            const isSelected = selectedIds.includes(cell.id);
            return <BoardCell key={cell.id} cell={cell} isSelected={isSelected} onClick={handleSelect} />;
          })}
        </div>
      </div>
      <svg className="absolute left-0 top-0 w-full h-full pointer-events-none">
        {lineList.map((line, i) => (
          <line key={i} {...line} stroke="red" strokeWidth="10" />
        ))}
      </svg>
    </main>
  )
}

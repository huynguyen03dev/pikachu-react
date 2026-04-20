import { useEffect, useState } from "react";
import { selectCols, selectMatchPath, selectRows } from "../boardSlice";
import { useAppSelector } from "../../../app/hooks";

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

export default function MatchLine({ boardRef, mainRef }: { boardRef: React.RefObject<HTMLDivElement | null>; mainRef: React.RefObject<HTMLElement | null> }) {
  const cols = useAppSelector(selectCols);
  const rows = useAppSelector(selectRows);
  const matchPath = useAppSelector(selectMatchPath);

  const pointToPixelCoords = (point: Point, center: Point, cellSize: number)
    : Point => {
    const x1 = center.x - ((cols - 1) / 2 - point.x) * cellSize;
    const y1 = center.y - ((rows - 1) / 2 - point.y) * cellSize;

    return { x: x1, y: y1 };
  }

  const [lineList, setLineList] = useState<Line[]>([]);
  const calculateBoardCenter = (boardRef: React.RefObject<HTMLElement | null>, mainRef: React.RefObject<HTMLElement | null>) => {
    let boardRect = boardRef.current?.getBoundingClientRect();
    let mainRect = mainRef.current?.getBoundingClientRect();

    if (!boardRect || !mainRect) {
      throw new Error("Board or main ref is not attached");
    }

    return {
      x: boardRect ? boardRect.left + boardRect.width / 2 - mainRect.left : 0,
      y: boardRect ? boardRect.top + boardRect.height / 2 - mainRect.top : 0,
    }
  };

  useEffect(() => {
    const boardRect = boardRef.current?.getBoundingClientRect();

    if (!boardRect) {
      throw new Error("Board ref is not attached");
    }

    const cellSize = boardRect.width / cols || 0;
    const center = calculateBoardCenter(boardRef, mainRef);
    const drawpoints = matchPath.map(point => pointToPixelCoords(point, center, cellSize));

    for (let i = 1; i < drawpoints.length; i++) {
      const line = {
        x1: drawpoints[i - 1].x,
        y1: drawpoints[i - 1].y,
        x2: drawpoints[i].x,
        y2: drawpoints[i].y,
      };
      setLineList(prev => [...prev, line]);
    }

    return () => {
      setLineList([]);
    }
  }, [matchPath]);

  return (
    <svg className="absolute left-0 top-0 w-full h-full pointer-events-none">
      {lineList.map((line, i) => (
        <line key={i} {...line} stroke="red" strokeWidth="10" />
      ))}
    </svg>
  )
}
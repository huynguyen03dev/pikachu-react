import { useCallback, useRef, type JSX } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectCells, selectSelectedCellIds } from "./boardSlice"
import { BoardCell } from "./components/BoardCell"
import { SELLECT_CELL } from "../../saga"
import Dialog from "./components/Dialog"
import MatchLine from "./components/MatchLine"

export const Board = (): JSX.Element => {
  const cells = useAppSelector(selectCells); 
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedCellIds);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  const handleSelect = useCallback((cellId: number) => {
    dispatch({ type: SELLECT_CELL, payload: cellId });
  }, [dispatch]);


  return (
    <main ref={mainRef} className="relative p-4 flex-1">
      <Dialog />
      <div className="grid place-items-center mt-10">
        <div ref={boardRef} className="grid grid-cols-12 gap-1 w-[min(92vw,720px)] bg-gray-300">
          {cells.map((cell) => {
            const isSelected = selectedIds.includes(cell.id);
            return <BoardCell key={cell.id} cell={cell} isSelected={isSelected} onClick={handleSelect} />;
          })}
        </div>
      </div>
      <MatchLine boardRef={boardRef} mainRef={mainRef} />
    </main>
  )
}

import { useCallback, type JSX } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { doSelectCell, selectCells, selectSelectedCellIds } from "./boardSlice"
import { BoardCell } from "./components/BoardCell"

export const Board = (): JSX.Element => {
  const cells = useAppSelector(selectCells); 
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedCellIds);

  const handleSelect = useCallback((cellId: number) => {
    dispatch(doSelectCell(cellId));
  }, [dispatch]);

  return (
    <main className="p-4 flex-1 grid place-items-center">
      <div className="grid grid-cols-12 gap-1 w-[min(92vw,720px)]">
        {cells.map((cell) => {
          const isSelected = selectedIds.includes(cell.id);
          return <BoardCell key={cell.id} cell={cell} isSelected={isSelected} onClick={handleSelect} />;
        })}
      </div>
    </main>
  )
}

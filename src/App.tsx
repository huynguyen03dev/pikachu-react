import { useEffect } from "react"
import { Board } from "./features/board/Board"
import { GameHeader } from "./features/board/components/GameHeader"
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { selectStatus, tick } from "./features/board/boardSlice";

export const App = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectStatus);

  useEffect(() => {
    if (status !== "playing") {
      return;
    }
    
    const id = window.setInterval(() => {
      dispatch(tick());
    }, 1000);
    return () => window.clearInterval(id);
  }, [dispatch, status]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-200">
      <GameHeader />
      <Board />
    </div>
  )
}

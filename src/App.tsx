import { useEffect } from "react"
import { Board } from "./features/board/Board"
import { GameHeader } from "./features/board/components/GameHeader"
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { selectStatus, tick } from "./features/board/boardSlice";
import { INIT_GAME } from "./saga";

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
      {status === "idle" && (
        <div className="mt-6 flex flex-col items-center rounded-2xl bg-white px-8 py-6 shadow-md w-120 m-auto">
          <h2 className="mb-10 text-2xl font-bold text-slate-800">
            PIKACHU GAMEEE
          </h2>
          <button
            onClick={() => dispatch({ type: INIT_GAME })}
            className="rounded bg-yellow-300 px-6 py-3 font-semibold text-slate-900 shadow-sm transition hover:bg-yellow-400 active:scale-95"
          >
            START GAME
          </button>
        </div>
      )}
      {status !== "idle" && (
        <Board />
      )}
    </div>
  )
}

import { useDispatch } from "react-redux"
import "./App.css"
import { useAppSelector } from "./app/hooks"
import { Board } from "./features/board/Board"
import { initBoard, selectRemainingTiles, selectStatus } from "./features/board/boardSlice"

export const App = () => {
  const status = useAppSelector(selectStatus);
  const dispatch = useDispatch();
  const tileLeft = useAppSelector(selectRemainingTiles);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between p-3">
        <div className="text-red-800 text-3xl">
          Pikachu
        </div>
        <div className="text-2xl">
          Time left: {status === "playing"? "-1" : "0"} Status: {status} Tiles left: {tileLeft}
        </div>
        <div className="flex gap-2">
          {status !== "playing" && (
            <button onClick={() => dispatch(initBoard({}))} className="w-28 h-10 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 transition-colors">Start</button>
          )}
          <button className="w-28 h-10 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 transition-colors">Hint</button>
          {status === "playing" && (
            <button onClick={() => dispatch(initBoard({}))} className="w-28 h-10 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 transition-colors">Restart</button>
          )}
        </div>
      </div>
      <Board />
    </div>
  )
}

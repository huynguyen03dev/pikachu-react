import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { initBoard, selectStatus, selectTimeLeft } from "../boardSlice";

export const GameHeader = () => {
	const status = useAppSelector(selectStatus);
	const dispatch = useAppDispatch();
	const timeLeft = useAppSelector(selectTimeLeft);

	return (
		<div className="flex justify-between p-3">
			<div className="text-red-800 text-3xl">
				Pikachu
			</div>
			<div className="text-2xl">
				Time left: {status === "idle" ? 0 : timeLeft}
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
	)
}

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { INIT_GAME } from "../../../saga";
import { selectIsGameEnd } from "../boardSelectors";
import { selectStatus } from "../boardSlice";

export default function Dialog() {
	const status = useAppSelector(selectStatus);
	const isGameEnd = useAppSelector(selectIsGameEnd);

	if (!isGameEnd) {
		return null;
	}

	const dispatch = useAppDispatch();

	return (
		<div className="absolute top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-10">
			<div className="bg-white p-6 rounded-lg shadow-lg">
				<h2 className="text-2xl font-bold mb-2">
					{status === "won" ? "You Win!" : "Game Over"}
				</h2>
				<p className="mb-4">
					{status === "won"
						? "Congratulations! You have won the game!"
						: "You have lost the game. Better luck next time!"}
				</p>
				{status === "won" && (
					<button onClick={() => dispatch({ type: INIT_GAME })} className="px-4 py-2 bg-blue-500 ml-auto text-white rounded hover:bg-blue-600 transition-colors">
						Play Again
					</button>
				)}
				{status === "lost" && (
					<button onClick={() => dispatch({ type: INIT_GAME })} className="px-4 py-2 bg-red-500 ml-auto text-white rounded hover:bg-red-600 transition-colors">
						Try Again
					</button>
				)}
			</div>
		</div>
	);
}
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { INIT_GAME, SHUFFLE_BOARD } from "../../../saga";
import { selectMatchesRemaining } from "../boardSelectors";
import { selectStatus, selectTimeLeft } from "../boardSlice";

export const GameHeader = () => {
	const status = useAppSelector(selectStatus);
	const dispatch = useAppDispatch();
	const timeLeft = useAppSelector(selectTimeLeft);
	const remainingMatches = useAppSelector(selectMatchesRemaining);

	return (
		<div className="flex justify-between p-3 shadow items-center">
			<div className="text-red-800 text-3xl">
				Pikachu
			</div>
			{status === "playing" && (
				<>
					<div className="text-xl mr-1">
						Time left: {timeLeft}
					</div>
					<div className="text-xl">
						Matches left: {remainingMatches}
					</div>
				</>
			)}
			<div className="flex gap-2">
				{status === "playing" && (
					<button
						onClick={() => dispatch({ type: SHUFFLE_BOARD })}
						className="rounded bg-yellow-300 px-6 py-3 font-semibold text-slate-900 shadow-sm transition hover:bg-yellow-400 active:scale-95"
					>
						SHUFFLE BOARD
					</button>
				)}
				{status === "playing" && (
					<button onClick={() => dispatch({ type: INIT_GAME })} className="rounded bg-yellow-300 px-6 py-3 font-semibold text-slate-900 shadow-sm transition hover:bg-yellow-400 active:scale-95">
						RESTART
					</button>
				)}
			</div>
		</div>
	)
}

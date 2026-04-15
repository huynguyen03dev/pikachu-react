import React from "react";
import { cn } from "../../../utils/utils";
import { Cell } from "../boardSlice";

interface BoardCellProps {
    cell: Cell;
    isSelected: boolean;
    onClick: () => void;
}

export const BoardCell = React.memo(({ cell, isSelected, onClick }: BoardCellProps) => {
    if (cell.kind === "empty") {
        return (
            <div
                aria-hidden="true"
                className="aspect-square"
            />
        )
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "aspect-square border border-gray-400  active:bg-gray-400 transition-colors",
                isSelected ? "bg-yellow-300 hover:bg-yellow-400" : "bg-gray-200 hover:bg-gray-300"
            )}
        >
            <p>{cell.tileType}</p>
        </button>
    )
});
import React from "react";
import { cn } from "../../../utils/utils";
import { Cell } from "../boardSlice";

interface BoardCellProps {
  cell: Cell;
  isSelected: boolean;
  onClick: (id: number) => void;
}

export const BoardCell = React.memo(({ cell, isSelected, onClick }: BoardCellProps) => {
  const imagePathForTileType = (tileType: number) => {
    return `/images/${tileType}.png`;
  }

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
      onClick={() => onClick(cell.id)}
      className={cn(
        "aspect-square relative border border-gray-400  active:bg-gray-400 transition-colors",
        isSelected ? "bg-yellow-300 hover:bg-yellow-400" : "bg-gray-200 hover:bg-gray-300"
      )}
    >
      <img className="w-full h-full object-cover" src={imagePathForTileType(cell.tileType)} alt={`Tile ${cell.tileType}`} />
      {isSelected && <div className="absolute inset-0 border-4 border-red-500 pointer-events-none" />}
    </button>
  )
});
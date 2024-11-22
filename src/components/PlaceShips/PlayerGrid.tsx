import React, { useState } from "react";
import './PlayerGrid.css'; // Assuming you have this CSS file for styles

const GRID_COLUMNS = 15; // 15 columns
const GRID_ROWS = 15; // 15 rows

interface Ship {
    id: number;
    size: number;
    name: string;
}

const INITIAL_SHIPS: Ship[] = [
    { id: 1, size: 3, name: 'Destroyer' },
    { id: 2, size: 4, name: 'Submarine' },
    { id: 3, size: 5, name: 'Battleship' },
];

export const PlayerGrid: React.FC = () => {
    const [grid, setGrid] = useState<number[][]>(Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLUMNS).fill(0)));
    const [ships, setShips] = useState<Ship[]>(INITIAL_SHIPS);
    const [draggingShip, setDraggingShip] = useState<Ship | null>(null);
    const [pickedUpShip, setPickedUpShip] = useState<{ ship: Ship; startRow: number; startCol: number } | null>(null);

    const clearShipFromGrid = (ship: Ship, startRow: number, startCol: number) => {
        const newGrid = [...grid];
        for (let i = 0; i < ship.size; i++) {
            newGrid[startRow][startCol + i] = 0;
        }
        setGrid(newGrid);
    };

    const handleDragStart = (ship: Ship, startRow?: number, startCol?: number) => {
        setDraggingShip(ship);

        if (startRow !== undefined && startCol !== undefined) {
            clearShipFromGrid(ship, startRow, startCol);
            setPickedUpShip({ ship, startRow, startCol });
        }
    };

    const handleDrop = (row: number, col: number) => {
        if (!draggingShip) return;

        const newGrid = [...grid];
        if (col + draggingShip.size <= GRID_COLUMNS) {
            let canPlace = true;

            for (let i = 0; i < draggingShip.size; i++) {
                if (newGrid[row][col + i] !== 0) {
                    canPlace = false;
                    break;
                }
            }

            if (canPlace) {
                for (let i = 0; i < draggingShip.size; i++) {
                    newGrid[row][col + i] = draggingShip.id;
                }
                setGrid(newGrid);
                setShips((prevShips) => prevShips.filter((ship) => ship.id !== draggingShip.id));
                setDraggingShip(null);
                setPickedUpShip(null);
            } else if (pickedUpShip) {
                const { ship, startRow, startCol } = pickedUpShip;
                for (let i = 0; i < ship.size; i++) {
                    newGrid[startRow][startCol + i] = ship.id;
                }
                setGrid(newGrid);
                setPickedUpShip(null);
            }
        }
    };

    return (
        <div className="player-grid-container">
            {/* Ships to drag */}
            <div className="ships-container">
                {ships.map((ship) => (
                    <div
                        key={ship.id}
                        className="ship"
                        draggable
                        onDragStart={() => handleDragStart(ship)}
                    >
                        {/* Render cells for the ship */}
                        {Array.from({ length: ship.size }).map((_, idx) => (
                            <div key={idx} className="ship-cell"></div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div
                className="grid-container"
                onDragOver={(e) => e.preventDefault()}
            >
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`grid-cell ${cell === 0 ? "empty" : "filled"}`}
                            onDrop={() => handleDrop(rowIndex, colIndex)}
                            onDragOver={(e) => e.preventDefault()}
                            onDragStart={() => {
                                const ship = ships.find((s) => s.id === cell);
                                if (ship) handleDragStart(ship, rowIndex, colIndex);
                            }}
                            draggable={cell !== 0}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

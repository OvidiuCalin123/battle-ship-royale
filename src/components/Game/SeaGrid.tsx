import React, { useState } from "react";
import './SeaGrid.css'; // Assuming you have this CSS file for styles
import sound from './splash.mp3';

const GRID_COLUMNS = 55; // 55 columns
const GRID_ROWS = 33; // 33 rows

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

export const SeaGrid = () => {
    // Initialize the grid with `false` (not red)
    const [grid, setGrid] = useState<boolean[][]>(
        Array(GRID_ROWS)
            .fill(null)
            .map(() => Array(GRID_COLUMNS).fill(false))
    );

    const audio = new Audio(sound);

    // Ship state
    const [ships] = useState<Ship[]>(INITIAL_SHIPS);


    // Handle the click on a cell to set it red if not already red
    const handleCellClick = (row: number, col: number) => {
        // If the cell is already red, do nothing
        if (grid[row][col]) return;

        // Update the grid
        const newGrid = grid.map((r, rowIndex) =>
            r.map((cell, colIndex) =>
                rowIndex === row && colIndex === col ? true : cell
            )
        );
        setGrid(newGrid); // Update the state with the modified grid
    };

    return (
        <div className="sea-gridsea-grid-container">
            {/* Ships on the left */}
            <div className="sea-gridships-container">
                <h2>Ships</h2>
                <div className="sea-gridships-list">
                    {ships.map((ship) => (
                        <div key={ship.id} className="sea-gridship">
                            <div className="sea-gridship-name">{ship.name}</div>
                            <div className="sea-gridship-cells">
                                {Array(ship.size)
                                    .fill(null)
                                    .map((_, index) => (
                                        <div key={index} className="sea-gridship-cell"></div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div
                className="sea-grid-grid-container"
                onDragOver={(e) => e.preventDefault()} // Prevent default to allow drop
            >
                {grid.map((row, rowIndex) =>
                    row.map((isRed, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`sea-grid-grid-cell ${isRed ? "red" : "blue"}`}
                            onClick={() => {
                                if (grid[rowIndex][colIndex]) return;
                                audio.play();
                                return handleCellClick(rowIndex, colIndex);
                            }}
                        ></div>
                    ))
                )}
            </div>
        </div>
    );
};

import React, { useEffect, useState } from "react";
import './SeaGrid.css'; // Assuming you have this CSS file for styles
import sound from './splash.mp3';
import sea from './sea.mp3';
import cannon from './cannon.wav';

const GRID_COLUMNS = 55; // 55 columns
const GRID_ROWS = 33; // 33 rows
const STAMINA_DECREMENT = 12;
const STAMINA_INCREMENT = 6;
const STAMINA_MAX = 100;

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

export const SeaGrid = ({ playerID }: { playerID: string }) => {
    const [stamina, setStamina] = useState<number>(STAMINA_MAX);
    // Initialize the grid with `false` (not red)
    const [grid, setGrid] = useState<boolean[][]>(
        Array(GRID_ROWS)
            .fill(null)
            .map(() => Array(GRID_COLUMNS).fill(false))
    );


    useEffect(() => {
        // Function to perform the fetch request
        const fetchData = async () => {
            try {
                const getResponse = await fetch('https://battleshiproyale.onrender.com/api/v1/game/state?player_id=' + playerID, { method: 'GET' });
                if (!getResponse.ok) throw new Error('Polling failed');
                const getData = await getResponse.json();
                console.log('Polling Response:', getData);
                // You can update state here if necessary
            } catch (err) {
                console.error('Error during polling:', err);
            }
        };

        // Set up polling using setInterval
        const intervalId = setInterval(fetchData, 2000);

        // Cleanup function to clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const audio = new Audio(sound);
    const cannonSound = new Audio(cannon);
    const seaSound = new Audio(sea);

    useEffect(() => {
        seaSound.play();
    }, []);



    // Ship state
    const [ships] = useState<Ship[]>(INITIAL_SHIPS);

    useEffect(() => {
        const recharge = setInterval(() => {
            setStamina((prevStamina) =>
                Math.min(STAMINA_MAX, prevStamina + STAMINA_INCREMENT)
            );
        }, 1000);
        return () => clearInterval(recharge);
    }, []);

    // Handle the click on a cell to set it red if not already red
    const handleCellClick = (row: number, col: number) => {
        if (stamina >= 12) {
            // If the cell is already red, do nothing
            if (grid[row][col]) return;

            // Update the grid
            const newGrid = grid.map((r, rowIndex) =>
                r.map((cell, colIndex) =>
                    rowIndex === row && colIndex === col ? true : cell
                )
            );
            setStamina((prevStamina) => Math.max(0, prevStamina - STAMINA_DECREMENT));
            setGrid(newGrid); // Update the state with the modified grid
        }
    };

    return (
        <div className="sea-gridsea-grid-container">
            <div className="stamina-bar">
                <div
                    className="stamina-bar-fill"
                    style={{ height: `${stamina}%` }}
                ></div>
            </div>
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
                                cannonSound.play();
                                return handleCellClick(rowIndex, colIndex);
                            }}
                        ></div>
                    ))
                )}
            </div>
        </div>
    );
};

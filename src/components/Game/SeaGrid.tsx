import React, { useEffect, useState } from "react";
import './SeaGrid.css'; // Assuming you have this CSS file for styles
import sound from './splash.mp3';
import sea from './sea.mp3';
import cannon from './cannon.wav';
import shipExplosion from './shipExplosion.wav';
import error from './error.wav';

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
    const [grid, setGrid] = useState<Number[][]>(
        Array(GRID_ROWS).fill(1).map(() => Array(GRID_COLUMNS).fill(1)) // Initialize with '1' for water
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const getResponse = await fetch(`https://battleshiproyale.onrender.com/api/v1/game/state?player_id=${playerID}`, { method: 'GET' });
                if (!getResponse.ok) throw new Error('Polling failed');
                const getData = await getResponse.json();
                setGrid(getData.mainGrid.grid);
            } catch (err) {
                console.error('Error during polling:', err);
            }
        };

        const intervalId = setInterval(fetchData, 500);
        return () => clearInterval(intervalId);
    }, [playerID]);

    const audio = new Audio(sound);
    const cannonSound = new Audio(cannon);
    const error1 = new Audio(error);
    const shipExplosion1 = new Audio(shipExplosion);
    const seaSound = new Audio(sea);

    useEffect(() => {
        seaSound.play();
    }, []);

    const [ships] = useState<Ship[]>(INITIAL_SHIPS);

    useEffect(() => {
        const recharge = setInterval(() => {
            setStamina((prevStamina) =>
                Math.min(STAMINA_MAX, prevStamina + STAMINA_INCREMENT)
            );
        }, 1000);
        return () => clearInterval(recharge);
    }, []);

    const handleCellClick = async (row: number, col: number) => {
        if (stamina >= STAMINA_DECREMENT) {
            const cellValue = grid[row][col];
            if (cellValue === 2 || cellValue === 4) return; // Already clicked

            const getResponseHit = await fetch(`https://battleshiproyale.onrender.com/api/v1/game/hit?player_id=${playerID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ x: row, y: col })
            });
            if (!getResponseHit.ok) throw new Error('HMM eroare?');
            const getData = await getResponseHit.json();

            console.log(getData);

            const newGrid = grid.map((r, rowIndex) =>
                r.map((cell, colIndex) => {
                    if (rowIndex === row && colIndex === col) {
                        if (cell === 3) {
                            return 4; // Change solid brown to dark grey
                        }
                        return 2; // Regular cell to red
                    }
                    return cell;
                })
            );

            setStamina((prevStamina) => Math.max(0, prevStamina - STAMINA_DECREMENT));
            setGrid(newGrid);
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
            <div className="sea-grid-grid-container" onDragOver={(e) => e.preventDefault()}>
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`sea-grid-grid-cell ${cell === 0 ? "red" : cell === 3 ? "solid" : cell === 4 ? "clicked-solid" : ""}`}
                            onClick={() => {
                                if (stamina >= STAMINA_DECREMENT) {
                                    if (cell === 1) {
                                        audio.play();
                                        cannonSound.play();
                                    } else if (cell === 3) {
                                        cannonSound.play();
                                        shipExplosion1.play();
                                    }
                                    handleCellClick(rowIndex, colIndex);
                                } else {
                                    error1.play();
                                }
                            }}
                        ></div>
                    ))
                )}
            </div>
        </div>
    );
};

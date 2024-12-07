import React, { useState, useEffect } from 'react';
import { PlayerGrid } from './PlayerGrid';
import './PlaceShips.css';
import { SeaGrid } from '../Game/SeaGrid';

const GRID_COLUMNS = 10; // 15 columns
const GRID_ROWS = 10;    // 15 rows

export const PlaceShips = ({ playerName, enemyPlayerName }: { playerName: string; enemyPlayerName: string }) => {
    const [isReady, setIsReady] = useState(false);
    const [showSeaGrid, setShowSeaGrid] = useState(false);
    const [grid, setGrid] = useState<number[][]>(Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLUMNS).fill(0)));
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
    const [enemyReady, setEnemyReady] = useState(false);

    const ships = [
        {
            name: "Royal Ship",
            shipType: "MOTHER_SHIP",
            firstCell_coordinates: { x: 0, y: 0 },
            value: 3,
            orientation: "HORIZONTAL",
        },
        {
            name: "Pirate Ship",
            shipType: "MEDIUM_SHIP",
            firstCell_coordinates: { x: 0, y: 0 },
            value: 2,
            orientation: "HORIZONTAL",
        },
        {
            name: "Fish Boat",
            shipType: "SMALL_SHIP",
            firstCell_coordinates: { x: 0, y: 0 },
            value: 1,
            orientation: "HORIZONTAL",
        },
    ];

    const findShips = () => {
        const updatedShips = ships.map((ship) => {
            for (let x = 0; x < GRID_ROWS; x++) {
                for (let y = 0; y < GRID_COLUMNS; y++) {
                    if (grid[x][y] === ship?.value) {
                        return {
                            name: ship.name,
                            firstCell_coordinates: { x, y },
                            orientation: ship.orientation,
                            shipType: ship.shipType,
                        };
                    }
                }
            }
            return {
                name: ship.name,
                firstCell_coordinates: ship.firstCell_coordinates,
                orientation: ship.orientation,
                shipType: ship.shipType,
            };
        });

        return updatedShips;
    };

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    useEffect(() => {
        // Cleanup polling interval when component unmounts
        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [pollingInterval]);

    const handleReadyClick = async () => {
        console.log(findShips());
        if (isReady) return;

        setIsReady(true);

        try {
            const shipsFULL = findShips();
            const response = await fetch(
                `https://battleshiproyale.onrender.com/api/v1/session/placeShips?player_id=${playerName}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "ships": shipsFULL }),
                }
            );

            if (!response.ok) throw new Error('Failed to place ships');

            const intervalId = setInterval(async () => {
                try {
                    const getResponse = await fetch('https://battleshiproyale.onrender.com/api/v1/session/ready', {
                        method: 'GET',
                    });

                    if (!getResponse.ok) throw new Error('Polling failed');

                    const getData = await getResponse.json();

                    if (getData?.length === 2) {
                        setEnemyReady(true);
                        clearInterval(intervalId);
                        setPollingInterval(null);
                        await delay(3000);
                        setShowSeaGrid(true);
                    }

                    console.log('Polling Response:', getData);
                } catch (err) {
                    console.error('Error during polling:', err);
                }
            }, 2000);

            setPollingInterval(intervalId);
        } catch (err) {
            console.error('Error during ship placement:', err);
        }
    };

    return showSeaGrid ? (
        <SeaGrid />
    ) : (
        <div className="place-ships-container">
            {/* Title Row with Status Indicators */}
            <div className="title-row">
                <div className="status-indicator-container">
                    <div
                        className={`status-indicator ${isReady ? 'ready' : 'not-ready'}`}
                        title={isReady ? 'Ready' : 'Not Ready'}
                    />
                </div>
                <h1 className="title">Place Ships</h1>
                <div className="status-indicator-container">
                    <div className={`status-indicator ${enemyReady ? 'ready' : 'not-ready'}`} />
                </div>
            </div>

            {/* Game Layout */}
            <div className="game-layout">
                {/* Left: Player 1 Info */}
                <div className="player-info">
                    <div className="player-header">
                        <div className="player-name">
                            <strong>Player 1:</strong> {playerName}
                        </div>
                    </div>
                    <button
                        className={`ready-button ${isReady ? 'ready' : ''}`}
                        onClick={handleReadyClick}
                    >
                        Ready
                    </button>
                </div>

                {/* Center: Game Grid */}
                <div className="game-grid">
                    <PlayerGrid grid={grid} setGrid={setGrid} />
                </div>

                {/* Right: Player 2 Info */}
                <div className="player-info">
                    <div className="player-header">
                        <div className="player-name">
                            <strong>Player 2:</strong> {enemyPlayerName}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { PlayerGrid } from './PlayerGrid';
import './PlaceShips.css';
import { SeaGrid } from '../Game/SeaGrid';
import lobbyBack from './placeShips.jpg';

const GRID_COLUMNS = 10;
const GRID_ROWS = 10;

type s = {
    playerName: string;
    enemyPlayerName: string;
}

export const PlaceShips = ({ playerName, enemyPlayerName }: s) => {
    const [isReady, setIsReady] = useState(false);
    const [showSeaGrid, setShowSeaGrid] = useState(false);
    const [grid, setGrid] = useState(Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLUMNS).fill(0)));
    const [enemyReady, setEnemyReady] = useState(false);
    const [didPlayerPlacedShips, setDidPlayerPlacedShips] = useState(false);

    const ships = [
        { name: "Royal Ship", shipType: "MOTHER_SHIP", firstCell_coordinates: { x: 0, y: 0 }, value: 3, orientation: "HORIZONTAL" },
        { name: "Pirate Ship", shipType: "MEDIUM_SHIP", firstCell_coordinates: { x: 0, y: 0 }, value: 2, orientation: "HORIZONTAL" },
        { name: "Fish Boat", shipType: "SMALL_SHIP", firstCell_coordinates: { x: 0, y: 0 }, value: 1, orientation: "HORIZONTAL" },
    ];

    const findShips = () => {
        return ships.map(ship => {
            for (let x = 0; x < GRID_ROWS; x++) {
                for (let y = 0; y < GRID_COLUMNS; y++) {
                    if (grid[x][y] === ship.value) {
                        return { ...ship, firstCell_coordinates: { x, y } };
                    }
                }
            }
            return ship;
        });
    };

    const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const getResponse = await fetch('https://battleshiproyale.onrender.com/api/v1/session/ready', { method: 'GET' });
                if (!getResponse.ok) throw new Error('Polling failed');
                const getData = await getResponse.json();

                const readySetGO = getData?.filter((player: any) => player?.readyForBattle === true);
                const isEnemyReadyForBattle = getData?.filter((player: any) => player?.id !== playerName && player?.readyForBattle === true);

                if (isEnemyReadyForBattle?.length === 1) {
                    setEnemyReady(true);
                }

                if (readySetGO?.length === 2) {
                    clearInterval(intervalId);
                    await delay(3000);
                    setShowSeaGrid(true);
                }

                console.log('Polling Response:', getData);
            } catch (err) {
                console.error('Error during polling:', err);
            }
        }, 2000);

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, [didPlayerPlacedShips]);

    const handleReadyClick = async () => {

        if (isReady) return;

        setIsReady(true);

        try {
            const shipsFULL = findShips();
            const response = await fetch(
                `https://battleshiproyale.onrender.com/api/v1/session/placeShips?player_id=${playerName}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ships: shipsFULL }),
                }
            );

            await fetch(`https://battleshiproyale.onrender.com/api/v1/session/join?player_id=${playerName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName }),
            });

            if (!response.ok) throw new Error('Failed to place ships');

            setDidPlayerPlacedShips(true);
        } catch (err) {
            console.error('Error during ship placement:', err);
        }
    };

    const deleteSession = () => {
        const url = 'https://battleshiproyale.onrender.com/api/v1/session/join';

        if (navigator.sendBeacon) {
            navigator.sendBeacon(url);
            console.log('Session deletion request sent.');
        } else {
            console.log('sendBeacon not supported. Using fetch instead.');
            fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            }).catch(err => console.error('Error during session deletion:', err));
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
            deleteSession();

            return '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [playerName]);

    return showSeaGrid ? (
        <SeaGrid playerID={playerName} />
    ) : (
        <div className="place-ships-container" style={{
            backgroundImage: `url(${lobbyBack})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}>
            <div className="title-row">
                <div className="status-indicator-container">
                    <div className={`status-indicator ${isReady ? 'ready' : 'not-ready'}`} title={isReady ? 'Ready' : 'Not Ready'} />
                </div>
                <h1 className="title" style={{ textShadow: '2px 2px 0 black, -2px 2px 0 black, 2px -2px 0 black, -2px -2px 0 black', }}>Place Ships</h1>
                <div className="status-indicator-container">
                    <div className={`status-indicator ${enemyReady ? 'ready' : 'not-ready'}`} />
                </div>
            </div>
            <div className="game-layout">
                <div className="player-info">
                    <div className="player-header">
                        <div className="player-name">
                            <strong style={{ textShadow: '2px 2px 0 black, -2px 2px 0 black, 2px -2px 0 black, -2px -2px 0 black', }}>Player 1: {playerName}</strong>
                        </div>
                    </div>
                    <button
                        className={`ready-button ${isReady ? 'ready' : ''}`}
                        onClick={handleReadyClick}
                        style={{
                            padding: '14px 20px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: 'rgb(120 29 255)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            width: '100%',
                            transition: 'background-color 0.3s, transform 0.2s ease',
                        }}
                    >
                        Ready
                    </button>
                </div>
                <div className="game-grid" >
                    <PlayerGrid grid={grid} setGrid={setGrid} />
                </div>
                <div className="player-info">
                    <div className="player-header">
                        <div className="player-name">
                            <strong style={{ textShadow: '2px 2px 0 black, -2px 2px 0 black, 2px -2px 0 black, -2px -2px 0 black', }}>Player 2: {enemyPlayerName}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

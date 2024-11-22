import React, { useState } from 'react';
import { PlayerGrid } from './PlayerGrid';
import './PlaceShips.css';
import { SeaGrid } from '../Game/SeaGrid';

export const PlaceShips = ({ playerName }: { playerName: string }) => {
    const [isReady, setIsReady] = useState(false);
    const [showSeaGrid, setShowSeaGrid] = useState(false);

    const handleReadyClick = () => {
        if (!isReady) {
            setIsReady(true);
            setTimeout(() => {
                setShowSeaGrid(true);
            }, 2000);
        }
    };

    return (
        showSeaGrid ? (
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
                        <div className="status-indicator not-ready" title="Not Ready" />
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
                        <PlayerGrid />
                    </div>

                    {/* Right: Player 2 Info */}
                    <div className="player-info">
                        <div className="player-header">
                            <div className="player-name">
                                <strong>Player 2:</strong> OtherPlayerName
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

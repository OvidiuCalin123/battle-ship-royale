// src/components/PlayerStart.tsx
import React, { useState } from 'react';
import { PlaceShips } from '../PlaceShips/PlaceShips'; // Correctly import PlaceShips

export const PlayerStart = () => {
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [joined, setJoined] = useState(false);

    const handleInputChange = (e: any) => {
        setPlayerName(e.target.value);
    };

    const handleJoinGame = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setJoined(true);
        }, 2000);
    };

    if (joined) {
        return <PlaceShips playerName={playerName} />;  // Use PlaceShips when game is joined
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'white',
                padding: '20px',
            }}
        >
            <h1
                style={{
                    fontSize: '36px',
                    color: 'white',
                    marginTop: '0',
                    paddingTop: '20px',
                    textAlign: 'center',
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
            >
                Welcome to BattleShip Royale
            </h1>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '120px',
                    width: '120%',
                    maxWidth: '500px',
                    padding: '20px',
                    backgroundColor: '#333',
                    borderRadius: '10px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                        marginBottom: '60px',
                    }}
                >
                    <label
                        htmlFor="player-name"
                        style={{
                            fontSize: '18px',
                            color: 'white',
                            marginRight: '10px',
                        }}
                    >
                        Player Name
                    </label>
                    <input
                        id="player-name"
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={handleInputChange}
                        disabled={loading}
                        style={{
                            padding: '10px',
                            fontSize: '16px',
                            width: '100%',
                            maxWidth: '300px',
                            borderRadius: '5px',
                            border: `1px solid ${loading ? '#888' : '#ccc'}`,
                            backgroundColor: loading ? '#444' : '#000',
                            color: loading ? '#bbb' : 'white',
                            cursor: loading ? 'not-allowed' : 'text',
                        }}
                    />
                </div>

                <button
                    onClick={handleJoinGame}
                    disabled={playerName.length <= 2 || loading}
                    style={{
                        padding: '12px 20px',
                        fontSize: '18px',
                        cursor: playerName.length > 2 && !loading ? 'pointer' : 'not-allowed',
                        backgroundColor: playerName.length > 2 && !loading ? '#4CAF50' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        width: '100%',
                        maxWidth: '300px',
                    }}
                >
                    {loading ? 'Loading...' : 'Join Game'}
                </button>
            </div>
        </div>
    );
};

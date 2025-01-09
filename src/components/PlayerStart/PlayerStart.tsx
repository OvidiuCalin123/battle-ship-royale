import { useEffect, useState } from 'react';
import { PlaceShips } from '../PlaceShips/PlaceShips';

export const PlayerStart = () => {
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState('');
    const [enemyPlayerName, setEnemyPlayerName] = useState('');
    const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | undefined>(undefined);

    const handleInputChange = (e: any) => {
        setPlayerName(e.target.value);
    };

    const stopPolling = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(undefined);
        }
    };

    useEffect(() => {
        return () => stopPolling();
    }, [pollingInterval]);

    const deleteSession = () => {
        const url = 'https://battleshiproyale.onrender.com/api/v1/session/join';

        fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        }).catch(err => console.error('Error during session deletion:', err));

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

    const handleJoinGame = async () => {
        if (!playerName) {
            setError('Player name cannot be empty.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`https://battleshiproyale.onrender.com/api/v1/session/join?player_id=${playerName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName }),
            });
            const data: any = await response.text();
            if (JSON.parse(data).status === 'Player accepted') {
                const intervalId = setInterval(async () => {
                    try {
                        const getResponse = await fetch('https://battleshiproyale.onrender.com/api/v1/session/join', {
                            method: 'GET',
                        });
                        const getData = await getResponse.text();


                        if (JSON.parse(getData)?.playerIds?.length === 2) {
                            const enemyNameArray = JSON.parse(getData)?.playerIds
                                ?.filter((playersNames: any) => playersNames !== playerName);
                            setEnemyPlayerName(enemyNameArray[0]);
                            setJoined(true);
                            clearInterval(pollingInterval);
                            setPollingInterval(undefined);

                        }
                        console.log('Polling Response:', getData);
                    } catch (err) {
                        console.error('Error during polling:', err);
                    }
                }, 2000);

                setPollingInterval(intervalId);
            } else if (JSON.parse(data).status === 'Session full') {
                setLoading(true);
                setError('Session is full. Please try again later.');
            } else {
                setLoading(true);
                setError('Unexpected response from the server.');
            }
        } catch (err) {
            setLoading(true);
            setError('Failed to join the session. Please try again.');
        }
    };

    if (joined) {
        return <PlaceShips playerName={playerName} enemyPlayerName={enemyPlayerName} />;
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
                backgroundImage: 'url("lobbyBack.jpeg")', // Add the URL of your image here
                backgroundSize: 'cover', // Ensures the image covers the entire container
                backgroundPosition: 'center', // Centers the image
                backgroundRepeat: 'no-repeat',
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
                    textShadow: '2px 2px 0 black, -2px 2px 0 black, 2px -2px 0 black, -2px -2px 0 black',
                }}
            >
                Welcome to BattleShip Royale
            </h1>


            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '400px',
                    padding: '50px',
                    backgroundColor: '#f4f4f9', // Light background for a soft feel
                    borderRadius: '15px',
                    boxShadow: '0px 80px 80px rgba(0, 0, 0, 0.8)', // Soft shadow for a clean look
                }}
            >
                <h1
                    style={{
                        fontSize: '27px',
                        color: 'rgb(212 183 255)',
                        marginBottom: '50px',
                        fontWeight: '700',
                        textShadow: '2px 2px 0 black, -2px 2px 0 black, 2px -2px 0 black, -2px -2px 0 black'
                    }}
                >
                    Player Name
                </h1>

                <input
                    id="player-name"
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={handleInputChange}
                    disabled={loading}
                    style={{
                        padding: '12px 20px',
                        fontSize: '16px',
                        width: '100%',
                        borderRadius: '8px',
                        border: `1px solid ${loading ? '#ccc' : '#007bff'}`, // Subtle border color
                        backgroundColor: loading ? '#e9ecef' : '#fff', // Lighter input field
                        color: loading ? '#888' : '#333', // Color based on loading state
                        outline: 'none',
                        transition: 'border 0.3s ease, box-shadow 0.3s ease',
                        marginBottom: '50px', // More space between input and button
                    }}
                />

                <button
                    onClick={handleJoinGame}
                    disabled={playerName.length <= 2 || loading}
                    style={{
                        padding: '14px 20px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: playerName.length > 2 && !loading ? 'pointer' : 'not-allowed',
                        backgroundColor: playerName.length > 2 && !loading ? '#007bff' : '#aaa', // Primary blue color
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        width: '100%',
                        transition: 'background-color 0.3s, transform 0.2s ease',
                    }}
                >
                    {loading ? 'Loading...' : 'Join Game'}
                </button>
            </div>


        </div>
    );
};

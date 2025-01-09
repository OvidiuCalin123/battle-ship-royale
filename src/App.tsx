import './App.css';
import { SeaGrid } from './components/Game/SeaGrid';
import { PlayerStart } from './components/PlayerStart/PlayerStart';
import lobbyBack from './ship.jpeg';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'white',
          padding: '20px',
          backgroundImage: `url(${lobbyBack})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <PlayerStart />
        </div>
      </header>
    </div>
  );
}

export default App;

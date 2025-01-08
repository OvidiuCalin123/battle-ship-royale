import './App.css';
import { SeaGrid } from './components/Game/SeaGrid';
import { PlayerStart } from './components/PlayerStart/PlayerStart';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <PlayerStart />
      </header>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import HomeScreen from './components/HomeScreen';
import BattleScreen from './components/BattleScreen';

function App() {
  const [gameState, setGameState] = useState({
    currentScreen: 'start',
    party: [],
    eggs: [],
    currentDigimon: null
  });

  const chooseStarterDigimon = (digimon) => {
    setGameState({
      currentScreen: 'home',
      party: [digimon],
      eggs: [],
      currentDigimon: digimon
    });
  };

  const startBattle = () => {
    setGameState(prevState => ({
      ...prevState,
      currentScreen: 'battle'
    }));
  };

  const endBattle = (battleResult) => {
    setGameState(prevState => ({
      ...prevState,
      currentScreen: 'home'
    }));
  };

  const renderScreen = () => {
    switch (gameState.currentScreen) {
      case 'start':
        return <StartScreen onChooseDigimon={chooseStarterDigimon} />;
      case 'home':
        return (
          <HomeScreen
            currentDigimon={gameState.currentDigimon}
            party={gameState.party}
            eggs={gameState.eggs}
            onStartBattle={startBattle}
          />
        );
      case 'battle':
        return (
          <BattleScreen
            playerDigimon={gameState.currentDigimon}
            onBattleEnd={endBattle}
          />
        );
      default:
        return <div>Error: Unknown screen</div>;
    }
  };

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
}

export default App;
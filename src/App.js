import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import HomeScreen from './components/HomeScreen';
import BattleScreen from './components/BattleScreen';

function App() {
  const [gameState, setGameState] = useState({
    currentScreen: 'start',
    chosenDigimon: null,
  });

  const chooseDigimon = (digimon) => {
    setGameState({
      currentScreen: 'home',
      chosenDigimon: {
        ...digimon,
        hp: 100,
        attack: 15,
        defense: 10,
      },
    });
  };

  const startBattle = () => {
    setGameState(prev => ({ ...prev, currentScreen: 'battle' }));
  };

  const endBattle = () => {
    setGameState(prev => ({ ...prev, currentScreen: 'home' }));
  };

  return (
    <div className="App">
      {gameState.currentScreen === 'start' && (
        <StartScreen onChooseDigimon={chooseDigimon} />
      )}
      {gameState.currentScreen === 'home' && (
        <HomeScreen digimon={gameState.chosenDigimon} onStartBattle={startBattle} />
      )}
      {gameState.currentScreen === 'battle' && (
        <BattleScreen playerDigimon={gameState.chosenDigimon} onBattleEnd={endBattle} />
      )}
    </div>
  );
}

export default App;
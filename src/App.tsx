import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import HomeScreen from './components/HomeScreen';
import BattleScreen from './components/BattleScreen';
import { Digimon, DigimonEgg } from './shared/types';
import { createDigimon } from './shared/digimonManager';
import { DigimonTemplates } from './shared/DigimonTemplate';
import './App.css';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'start' | 'home' | 'battle'>('start');
  const [playerTeam, setPlayerTeam] = useState<Digimon[]>([]);
  const [eggs, setEggs] = useState<DigimonEgg[]>([]);
  const [enemyDigimon, setEnemyDigimon] = useState<Digimon | null>(null);

  const handleChooseDigimon = (digimon: Digimon) => {
    setPlayerTeam([digimon]);
    setGameState('home');
  };

  const handleStartBattle = () => {
    const agumonTemplate = DigimonTemplates.agumon;
    const enemyAgumon = createDigimon(
      agumonTemplate.name,
      agumonTemplate.type,
      agumonTemplate.baseHp,
      agumonTemplate.startingCard
    );
    setEnemyDigimon(enemyAgumon);
    setGameState('battle');
  };

  const handleBattleEnd = (playerWon: boolean) => {
    if (playerWon) {
      setPlayerTeam(prevTeam => 
        prevTeam.map(digimon => ({
          ...digimon,
          exp: digimon.exp + 50, // gain 50 exp
        }))
      );
    }
    setGameState('home');
  };

  switch (gameState) {
    case 'start':
      return <StartScreen onChooseDigimon={handleChooseDigimon} />;
    case 'home':
      return (
        <HomeScreen 
          playerTeam={playerTeam} 
          eggs={eggs} 
          onStartBattle={handleStartBattle}
        />
      );
    case 'battle':
      return enemyDigimon ? (
        <BattleScreen 
          playerTeam={playerTeam} 
          enemy={enemyDigimon}
          onBattleEnd={handleBattleEnd} 
        />
      ) : null;
    default:
      return null;
  }
};

export default App;

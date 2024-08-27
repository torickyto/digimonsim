import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import BattleScreen from './components/BattleScreen';
import { Digimon, DigimonEgg } from './shared/types';
import { createUniqueDigimon } from './data/digimon';
import './App.css';
import { EggTypes, getRandomOutcome } from './data/eggTypes';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'home' | 'battle'>('home');
  const [playerTeam, setPlayerTeam] = useState<Digimon[]>([]);
  const [ownedDigimon, setOwnedDigimon] = useState<Digimon[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<Digimon[]>([]);
  const [eggs, setEggs] = useState<DigimonEgg[]>([]);

  useEffect(() => {
    // Initialize with some starter Digimon
    const starterDigimon = [
      createUniqueDigimon('agumon'),
      createUniqueDigimon('gabumon'),
      createUniqueDigimon('patamon')
    ];
    setOwnedDigimon(starterDigimon);
    setPlayerTeam(starterDigimon.slice(0, 3)); // Set the first three as the player's team
  }, []);

  const handleStartBattle = () => {
    const testEnemy = createUniqueDigimon('goblimon');
    setEnemyTeam([testEnemy]);
    setGameState('battle');
  };

  const handleUpdatePlayerTeam = (updatedTeam: Digimon[]) => {
    setPlayerTeam(updatedTeam);
  };

  const handleUpdateOwnedDigimon = (updatedOwnedDigimon: Digimon[]) => {
    setOwnedDigimon(updatedOwnedDigimon);
  };

  const handleBattleEnd = (result: 'win' | 'lose') => {
    if (result === 'win') {
      // Handle victory (e.g., gain experience, level up)
      setPlayerTeam(prevTeam =>
        prevTeam.map(digimon => ({
          ...digimon,
          exp: digimon.exp + 50, // gain 50 exp
          // logic for leveling up if necessary
        }))
      );
    }
    setGameState('home');
  };

  const generateNewEgg = () => {
    const newEgg: DigimonEgg = {
      id: Date.now(), // Use timestamp as a simple unique id
      typeId: Math.floor(Math.random() * EggTypes.length),
      hatchTime: Math.floor(Math.random() * 10) + 5, // Random hatch time between 5-15 units
    };
    setEggs(prevEggs => [...prevEggs, newEgg]);
  };

  const hatchEgg = (eggId: number) => {
    const eggToHatch = eggs.find(egg => egg.id === eggId);
    if (eggToHatch) {
      const eggType = EggTypes.find(type => type.id === eggToHatch.typeId);
      if (eggType) {
        const newDigimonTemplate = getRandomOutcome(eggType);
        if (newDigimonTemplate) {
          const newDigimon = createUniqueDigimon(newDigimonTemplate.name);
          setOwnedDigimon(prevOwned => [...prevOwned, newDigimon]);
        }
      }
      setEggs(prevEggs => prevEggs.filter(egg => egg.id !== eggId));
    }
  };

  switch (gameState) {
    case 'home':
      return (
        <HomeScreen
          playerTeam={playerTeam}
          eggs={eggs}
          onStartBattle={handleStartBattle}
          onUpdatePlayerTeam={handleUpdatePlayerTeam}
          onUpdateOwnedDigimon={handleUpdateOwnedDigimon}
          ownedDigimon={ownedDigimon}
          onGenerateEgg={generateNewEgg}
          onHatchEgg={hatchEgg}
        />
      );
    case 'battle':
      return (
        <BattleScreen
          playerTeam={playerTeam}
          enemyTeam={enemyTeam}
          onBattleEnd={handleBattleEnd}
        />
      );
    default:
      return null;
  }
};

export default App;
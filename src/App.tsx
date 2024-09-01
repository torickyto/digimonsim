import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import BattleScreen from './components/BattleScreen';
import ZoneMap from './components/ZoneMap';
import { Digimon, DigimonEgg, DigimonTemplate } from './shared/types';
import { createUniqueDigimon } from './data/digimon';
import './App.css';
import { EggTypes, getRandomOutcome } from './data/eggTypes';
import { generateEnemyTeam } from './data/enemyManager';

type NodeType = 'start' | 'monster' | 'chest' | 'event' | 'boss' | 'empty' | 'rest';

type MapNode = {
  type: NodeType;
  connections: number[];
  completed: boolean;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'home' | 'battle' | 'adventure'>('home');
  const [playerTeam, setPlayerTeam] = useState<Digimon[]>([]);
  const [ownedDigimon, setOwnedDigimon] = useState<Digimon[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<Digimon[]>([]);
  const [eggs, setEggs] = useState<DigimonEgg[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [zoneMap, setZoneMap] = useState<MapNode[][]>([]);
  const [availableNodes, setAvailableNodes] = useState<number[]>([]);
  const [dayCount, setDayCount] = useState(1);
  const [bits, setBits] = useState(0);

  useEffect(() => {
    // Initialize with some starter Digimon
    const starterDigimon = [
      createUniqueDigimon('wargreymon'),
      createUniqueDigimon('wargreymon'),
      createUniqueDigimon('wargreymon')
    ];
    setOwnedDigimon(starterDigimon);
    setPlayerTeam(starterDigimon.slice(0, 3)); // Set the first three as the player's team
  }, []);

  const handleUpdateBits = (amount: number) => {
    setBits(prevBits => prevBits + amount);
  };
  const getZoneDifficulty = (zoneName: string): number => {
    switch (zoneName) {
      case 'Label Forest':
        return 1;
      // Add more zones here as they are implemented
      default:
        return 1;
    }
  };

  const handleStartBattle = (nodeIndex: number, enemyTeam: Digimon[]) => {
    setEnemyTeam(enemyTeam);
    setCurrentNode(nodeIndex);
    setGameState('battle');
  };

  const handleUpdatePlayerTeam = (updatedTeam: Digimon[]) => {
    setPlayerTeam(updatedTeam);
  };

  const handleUpdateOwnedDigimon = (updatedOwnedDigimon: Digimon[]) => {
    setOwnedDigimon(updatedOwnedDigimon);
  };

  const handleBattleEnd = (result: 'win' | 'lose', updatedPlayerTeam: Digimon[]) => {
    console.log("App: handleBattleEnd called with result:", result);
    console.log("App: Updated player team:", updatedPlayerTeam.map(d => `${d.displayName} (exp: ${d.exp}, level: ${d.level})`));
    
    if (result === 'win') {
      console.log("App: Updating player team for win");
      setPlayerTeam(updatedPlayerTeam);

      // Mark the current node as completed
      if (currentNode !== null) {
        setZoneMap(prevMap => {
          const newMap = prevMap.map(row => row.map(node => ({ ...node })));
          const [row, col] = [Math.floor(currentNode / newMap[0].length), currentNode % newMap[0].length];
          if (newMap[row] && newMap[row][col]) {
            newMap[row][col].completed = true;
          }
          return newMap;
        });
      }

    } else {
      // Handle lose condition (e.g., return to home screen or retry)
      setGameState('home');
    }

    // Return to the adventure map
    setGameState('adventure');
  };

  const handleUpdateMap = (newMap: MapNode[][]) => {
    setZoneMap(newMap);
  };

  const handleUpdateAvailableNodes = (newAvailableNodes: number[]) => {
    setAvailableNodes(newAvailableNodes);
  };

  const handleUpdateCurrentNode = (newCurrentNode: number) => {
    setCurrentNode(newCurrentNode);
  };

  const generateNewEgg = () => {
    const newEgg: DigimonEgg = {
      id: Date.now(), // Use timestamp as a simple unique id
      typeId: Math.floor(Math.random() * EggTypes.length),
      hatchTime: Math.floor(Math.random() * 10) + 5, // replace with actual hatch mechanic
    };
    setEggs(prevEggs => [...prevEggs, newEgg]);
  };

  const hatchEgg = (eggId: number): Digimon | null => {
    const eggToHatch = eggs.find(egg => egg.id === eggId);
    if (eggToHatch) {
      const eggType = EggTypes.find(type => type.id === eggToHatch.typeId);
      if (eggType) {
        const newDigimonTemplate = getRandomOutcome(eggType);
        if (newDigimonTemplate) {
          const newDigimon = createUniqueDigimon(newDigimonTemplate.name);
          setOwnedDigimon(prevOwned => [...prevOwned, newDigimon]);
          setEggs(prevEggs => prevEggs.filter(egg => egg.id !== eggId));
          return newDigimon;
        }
      }
    }
    return null;
  };

  const handleHatchEgg = (eggId: number, newDigimonTemplate: DigimonTemplate) => {
    const newDigimon = hatchEgg(eggId);
    if (newDigimon) {
      console.log(`New Digimon hatched: ${newDigimon.displayName}`);
    }
  };

  const handleStartAdventure = (zone: string) => {
    setSelectedZone(zone);
    setGameState('adventure');
    setZoneMap([]);
    setCurrentNode(null);
    setAvailableNodes([]);
  };

  const handleEndDay = () => {
    setSelectedZone(null);
    setCurrentNode(null);
    setGameState('home');
    setDayCount(prevDay => prevDay + 1);
    
    //end-of-day actions here
    setPlayerTeam(prevTeam => prevTeam.map(digimon => ({
      ...digimon,
      hp: digimon.maxHp,  // Fully heal Digimon
      // Reset any daily stats or buffs here
    })));

          //temporary egg hatching logic
    setEggs(prevEggs => prevEggs.map(egg => ({
      ...egg,
      hatchTime: Math.max(0, egg.hatchTime - 1)
    })));

    eggs.forEach(egg => {
      if (egg.hatchTime <= 0) {
        hatchEgg(egg.id);
      }
    });
  };

  const handleExitZone = () => {
    setSelectedZone(null);
    setCurrentNode(null);
    setGameState('home');
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
          onHatchEgg={handleHatchEgg}
          onStartAdventure={handleStartAdventure}
          dayCount={dayCount}
          bits={bits}
          onUpdateBits={handleUpdateBits}
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
        case 'adventure':
      return (
        <ZoneMap
          playerTeam={playerTeam}
          onEndDay={handleEndDay}
          onStartBattle={handleStartBattle}
          zoneName={selectedZone || ""}
          zoneDifficulty={getZoneDifficulty(selectedZone || "")}
          currentNode={currentNode}
          map={zoneMap}
          availableNodes={availableNodes}
          onUpdateMap={handleUpdateMap}
          onUpdateAvailableNodes={handleUpdateAvailableNodes}
          onUpdateCurrentNode={handleUpdateCurrentNode}
          onUpdatePlayerTeam={handleUpdatePlayerTeam}
          onAddEgg={(eggType) => {
            const newEgg: DigimonEgg = {
              id: Date.now(),
              typeId: EggTypes.find(egg => egg.name === eggType)?.id || 0,
              hatchTime: Math.floor(Math.random() * 10) + 5,
            };
            setEggs(prevEggs => [...prevEggs, newEgg]);
          }}
          bits={bits}
          onUpdateBits={handleUpdateBits}
        />
      );
        default:
          return null;
  }
};

export default App;
import React, { useState, useEffect, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import BattleScreen from './components/BattleScreen';
import ZoneMap from './components/ZoneMap';
import AuthForm from './components/AuthForm';
import { Digimon, DigimonEgg, DigimonTemplate } from './shared/types';
import { createUniqueDigimon } from './data/digimon';
import './App.css';
import { EggTypes, getRandomOutcome } from './data/eggTypes';
import { generateEnemyTeam } from './data/enemyManager';
import { savePlayerData, loadPlayerData, PlayerData } from './playerData';
import { getCurrentUser, signOut } from './auth';

type NodeType = 'start' | 'monster' | 'chest' | 'event' | 'boss' | 'empty' | 'rest';

type MapNode = {
  type: NodeType;
  connections: number[];
  completed: boolean;
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* AUTO LOG IN
  useEffect(() => {
    const fetchUser = async () => {
      const { user, error } = await getCurrentUser();
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        loadGameData(user.id);
      } else if (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []); */

  /* const handleAuthSuccess = (user: any) => {
    setUser(user);
    setIsAuthenticated(true);
    loadGameData(user.id);
  }; */

  const handleEndDay = useCallback(async () => {
    setSelectedZone(null);
    setCurrentNode(null);
    setGameState('home');
    setDayCount(prevDay => prevDay + 1);
    
    // Perform end-of-day actions
    const updatedPlayerTeam = playerTeam.map(digimon => ({
      ...digimon,
      hp: digimon.maxHp,
    }));

    const updatedEggs = eggs.map(egg => ({
      ...egg,
      hatchTime: Math.max(0, egg.hatchTime - 1)
    }));

    const newlyHatchedEggs = updatedEggs.filter(egg => egg.hatchTime <= 0);
    const remainingEggs = updatedEggs.filter(egg => egg.hatchTime > 0);

    const newDigimon = newlyHatchedEggs.map(egg => {
      const eggType = EggTypes.find(type => type.id === egg.typeId);
      if (eggType) {
        const newDigimonTemplate = getRandomOutcome(eggType);
        if (newDigimonTemplate) {
          return createUniqueDigimon(newDigimonTemplate.name);
        }
      }
      return null;
    }).filter((digimon): digimon is Digimon => digimon !== null);

    const updatedOwnedDigimon = [...ownedDigimon, ...newDigimon];

    // Update state
    setPlayerTeam(updatedPlayerTeam);
    setEggs(remainingEggs);
    setOwnedDigimon(updatedOwnedDigimon);

    // Save updated game data
    if (user) {
      const gameData: PlayerData = {
        owned_digimon: updatedOwnedDigimon,
        player_team: updatedPlayerTeam,
        eggs: remainingEggs,
        bits,
        day_count: dayCount + 1
      };
      await savePlayerData(user.id, gameData);
    }
  }, [playerTeam, eggs, ownedDigimon, bits, dayCount, user, setSelectedZone, setCurrentNode, setGameState, setDayCount, setPlayerTeam, setEggs, setOwnedDigimon]);

  const handleAuthSuccess = (user: any) => {
    setUser(user);
    loadGameData(user.id);
  };

  const saveData = useCallback(() => {
    if (user) {
      const gameData: PlayerData = {
        owned_digimon: ownedDigimon,
        player_team: playerTeam,
        eggs,
        bits,
        day_count: dayCount
      };
      savePlayerData(user.id, gameData).then(() => {
        console.log('Game progress saved after adventure.');
      }).catch((error) => {
        console.error('Failed to save game progress:', error);
      });
    }
  }, [user, ownedDigimon, playerTeam, eggs, bits, dayCount]);

  const handleLogout = async () => {
    if (user) {
      // Save game data before logging out
      await saveData();
      
      const { error } = await signOut();
      if (!error) {
        setUser(null);
        // Reset game state
        setPlayerTeam([]);
        setOwnedDigimon([]);
        setEggs([]);
        setBits(0);
        setDayCount(1);
        setGameState('home');
      } else {
        console.error('Logout error:', error);
      // Handle logout error
    }
  }
  };


  const loadGameData = async (userId: string) => {
    const { data, error } = await loadPlayerData(userId);
    if (data) {
      setOwnedDigimon(data.owned_digimon);
      setPlayerTeam(data.player_team);
      setEggs(data.eggs);
      setBits(data.bits);
      setDayCount(data.day_count);
    } else if (error) {
      console.error('Error loading game data:', error.message);
      initializeNewUserData(userId);
    } else {
      // No data found for the user, initialize new user data
      initializeNewUserData(userId);
    }
  };

   const initializeNewUserData = async (userId: string) => {
    const starterDigimon = [
      createUniqueDigimon('agumon'),
      createUniqueDigimon('gabumon')
    ];
    setOwnedDigimon(starterDigimon);
    setPlayerTeam(starterDigimon.slice(0, 2));
    
    const initialGameData: PlayerData = {
      owned_digimon: starterDigimon,
      player_team: starterDigimon.slice(0, 2),
      eggs: [],
      bits: 0,
      day_count: 1
    };
    
    await savePlayerData(userId, initialGameData);
  };

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  const handleUpdateDayCount = (newDayCount: number) => {
    setDayCount(newDayCount);
  };

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
    setOwnedDigimon(prevOwned => {
      const newOwned = prevOwned.filter(d => !updatedTeam.some(teamD => teamD.id === d.id));
      return [...newOwned, ...updatedTeam];
    });
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


  const handleExitZone = () => {
    setSelectedZone(null);
    setCurrentNode(null);
    setGameState('home');
  };

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

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
          onUpdateDayCount={handleUpdateDayCount}
          onLogout={handleLogout}
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
          onAddEgg={(eggTypeId: number) => {
            const newEgg: DigimonEgg = {
              id: Date.now(),
              typeId: eggTypeId,
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
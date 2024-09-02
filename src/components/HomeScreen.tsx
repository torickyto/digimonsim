import React, { useState, useEffect, useRef } from 'react';
import DigimonSprite from './DigimonSprite';
import DigimonStatScreen from './DigimonStatScreen';
import CardDex from './CardDex';
import { Digimon, DigimonEgg, Card, DigimonTemplate } from '../shared/types';
import { CardCollection as AllCards } from '../shared/cardCollection';
import './HomeScreen.css';
import DeckEditor from './DeckEditor';
import DevTestBattleScreen from './DevTestBattleScreen';
import { FaPencilAlt } from 'react-icons/fa';
import DigivolutionTree from './DigivolutionTree';
import { createUniqueDigimon } from '../data/digimon';
import { getDigivolutionConnections } from './DigivolutionWeb'
import { checkDigivolutionConditions } from '../data/digivolutionConditions';
import { getDigimonTemplate } from '../data/DigimonTemplate';
import { calculateBaseStat } from '../shared/statCalculations';
import { v4 as uuidv4 } from 'uuid';
import DevDigimonPartyBox from './DevDigimonPartyBox';
import DigimonPartyBox from './DigimonPartyBox';
import Eggs from './Eggs';
import AdventureMap from './ZoneMap';
import ZoneMap from './ZoneMap';
import ArenaScreen from './ArenaScreen';
import Shop from './Shop';


interface HomeScreenProps {
  playerTeam: Digimon[];
  eggs: DigimonEgg[];
  onStartBattle: (nodeIndex: number, enemyTeam: Digimon[]) => void;
  onUpdatePlayerTeam: (updatedTeam: Digimon[]) => void;
  onUpdateOwnedDigimon: (updatedOwnedDigimon: Digimon[]) => void; 
  ownedDigimon: Digimon[];  
  onGenerateEgg: () => void;
  onHatchEgg: (eggId: number, newDigimonTemplate: DigimonTemplate) => void;
  onUpdateEggs?: (updatedEggs: DigimonEgg[]) => void; 
  onStartAdventure: (zone: string) => void;
  dayCount: number;
  bits: number;
  onUpdateBits: (newBits: number) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  playerTeam, 
  eggs, 
  onStartBattle, 
  onUpdatePlayerTeam,
  onUpdateOwnedDigimon,  
  ownedDigimon,  
  onGenerateEgg,
  onHatchEgg,
  onStartAdventure,
  bits,
  onUpdateBits,
  onUpdateEggs,
  dayCount 
}) => {
  const [showStats, setShowStats] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [showEggs, setShowEggs] = useState(false);
  const [showCardCollection, setShowCardCollection] = useState(false);
  const [showTestArena, setShowTestArena] = useState(false);
  const [showDeckEditor, setShowDeckEditor] = useState(false);
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
  const [spriteScale, setSpriteScale] = useState(1);
  const screenRef = useRef<HTMLDivElement>(null);
  const [currentDigimonIndex, setCurrentDigimonIndex] = useState(0);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  const [showDigivolutionTree, setShowDigivolutionTree] = useState(false);
  const [allDigimon, setAllDigimon] = useState<Digimon[]>([]);
  const [showDigivolutionModal, setShowDigivolutionModal] = useState(false);
  const [digivolvingDigimon, setDigivolvingDigimon] = useState<Digimon | null>(null);
  const [newDigimonForm, setNewDigimonForm] = useState<string | null>(null);
  const [digivolutionStage, setDigivolutionStage] = useState(0);
  const [showPartyBox, setShowPartyBox] = useState(false);
  const [showDevPartyBox, setShowDevPartyBox] = useState(false);
  const [allObtainedDigimon, setAllObtainedDigimon] = useState<Digimon[]>([]);
  const [localOwnedDigimon, setLocalOwnedDigimon] = useState<Digimon[]>(ownedDigimon);
  const [showNewDigimonStats, setShowNewDigimonStats] = useState(false);
  const [newlyHatchedDigimon, setNewlyHatchedDigimon] = useState<Digimon | null>(null);
  const [currentScreen, setCurrentScreen] = useState<string | null>(null);
  const [showZoneMap, setShowZoneMap] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [isArenaAvailable, setIsArenaAvailable] = useState(false);
  const [daysUntilArena, setDaysUntilArena] = useState(0);
  const [showShop, setShowShop] = useState(false);

  
  
  useEffect(() => {
    // Check for digivolution conditions
    playerTeam.forEach((digimon, index) => {
      const digivolveTarget = checkDigivolutionConditions(digimon);
      if (digivolveTarget) {
        setDigivolvingDigimon(digimon);
        setNewDigimonForm(digivolveTarget);
        setShowDigivolutionModal(true);
      }
    });
  }, [playerTeam]);

  useEffect(() => {
    // Check if arena is available (every 10 days)
    const isAvailable = dayCount % 10 === 0 && dayCount > 0;
    setIsArenaAvailable(isAvailable);

    // Calculate days until next arena
    if (!isAvailable) {
      const nextArenaDay = Math.ceil(dayCount / 10) * 10;
      setDaysUntilArena(nextArenaDay - dayCount);
    }
  }, [dayCount]);

  useEffect(() => {
    // Initialize allObtainedDigimon with playerTeam and some additional Digimon
    const initialObtainedDigimon = [...playerTeam, ...allDigimon.slice(0, 5)];
    setAllObtainedDigimon(initialObtainedDigimon);
  }, []);

  useEffect(() => {
    // Update allObtainedDigimon whenever playerTeam changes
    setAllObtainedDigimon(prev => {
      const updatedObtainedDigimon = prev.map(digimon => {
        const updatedTeamDigimon = playerTeam.find(d => d.id === digimon.id);
        return updatedTeamDigimon || digimon;
      });
      return updatedObtainedDigimon;
    });
  }, [playerTeam]);

  useEffect(() => {
    setLocalOwnedDigimon(ownedDigimon);
  }, [ownedDigimon]);



   useEffect(() => {
    if (showDigivolutionModal) {
      handleDigivolve();
    }
  }, [showDigivolutionModal]);

  useEffect(() => {
    const connections = getDigivolutionConnections();
    const digimonNames = Array.from(new Set(connections.flatMap(c => [c.from, c.to])));
    
    const allDigimonArray = digimonNames.map(name => {
      const existingDigimon = playerTeam.find(d => d.name === name);
      return existingDigimon || createUniqueDigimon(name);
    });
  
    setAllDigimon(allDigimonArray);
  }, [playerTeam]);

  useEffect(() => {
    const updateSpriteScale = () => {
      if (screenRef.current) {
        const { width, height } = screenRef.current.getBoundingClientRect();
        const scale = Math.min(width / 1280, height / 720);
        setSpriteScale(scale);
      }
    };

    updateSpriteScale();
    window.addEventListener('resize', updateSpriteScale);
    return () => window.removeEventListener('resize', updateSpriteScale);
  }, []);

  useEffect(() => {
    if (isEditingNickname && nicknameInputRef.current) {
      nicknameInputRef.current.focus();
    }
  }, [isEditingNickname]);

  

  const handleArenaClick = () => {
    if (isArenaAvailable) {
      setCurrentScreen('arena');
    }
  };

  const handleCloseArena = () => {
    setCurrentScreen(null);
  };

  const handleSelectTournament = (rank: string) => {
    console.log(`Selected Rank ${rank} Tournament`);
    // TODO: Implement tournament logic
  };

  const toggleScreen = (screenName: string) => {
    setCurrentScreen(currentScreen === screenName ? null : screenName);
  };

  const handleAdventureClick = () => {
    setShowZoneModal(true);
  };

  const handleStartAdventure = (zone: string) => {
    setSelectedZone(zone);
    setShowZoneModal(false);
    onStartAdventure(zone);
  };

  const handlePurchase = (itemName: string, cost: number) => {
    if (bits >= cost) {
      onUpdateBits(bits - cost);
      if (itemName === 'Golden Egg') {
        onGenerateEgg(); 
        alert('You have purchased a Golden Egg!');
      } else if (itemName === 'Bits Boost') {
        onUpdateBits(bits + 10000);
        alert('You gained 10,000 bits!');
      } else if (itemName === 'Mystery Box') {
        // placeholder
        alert('You opened a Mystery Box!');
      } else if (itemName === 'EXP Booster') {
        // placeholder
        alert('EXP Booster activated for all Digimon!');
      }
    } else {
      alert('Not enough bits to make this purchase!');
    }
  };
  const handleExitZone = () => {
    setShowZoneMap(false);
    setSelectedZone(null);
  };


  const toggleStats = () => {
    setShowStats(!showStats);
    setCurrentDigimonIndex(0);
  };

  const getAvailableDigimon = () => {
    return localOwnedDigimon.filter(digimon => !playerTeam.some(partyMember => partyMember.id === digimon.id));
  };

  const handleCloseNewDigimonStats = () => {
    setCurrentScreen(null);
    setNewlyHatchedDigimon(null);
  };

  const handleUpdateEggs = (updatedEggs: DigimonEgg[]) => {
    if (onUpdateEggs) {
      onUpdateEggs(updatedEggs);
    }
  };

  const handleSwapDigimon = (partyIndex: number, newDigimon: Digimon | null) => {
    let updatedTeam = [...playerTeam];
    let updatedOwnedDigimon = [...localOwnedDigimon];
  
    if (newDigimon) {
      // Adding a Digimon to the party
      if (updatedTeam[partyIndex]) {
        // Swap
        const oldDigimon = updatedTeam[partyIndex];
        updatedTeam[partyIndex] = newDigimon;
        updatedOwnedDigimon = updatedOwnedDigimon.filter(d => d.id !== newDigimon.id);
        if (!updatedOwnedDigimon.find(d => d.id === oldDigimon.id)) {
          updatedOwnedDigimon.push(oldDigimon);
        }
      } else {
        // Add to empty slot
        updatedTeam[partyIndex] = newDigimon;
        updatedOwnedDigimon = updatedOwnedDigimon.filter(d => d.id !== newDigimon.id);
      }
    } else {
      // Removing a Digimon from the party
      if (updatedTeam[partyIndex] && updatedTeam.length > 1) {
        const removedDigimon = updatedTeam[partyIndex];
        updatedTeam = updatedTeam.filter((_, index) => index !== partyIndex);
        if (!updatedOwnedDigimon.find(d => d.id === removedDigimon.id)) {
          updatedOwnedDigimon.push(removedDigimon);
        }
      }
    }
  
    onUpdatePlayerTeam(updatedTeam);
    setLocalOwnedDigimon(updatedOwnedDigimon);
    onUpdateOwnedDigimon(updatedOwnedDigimon);
  };


  const addNewObtainedDigimon = (newDigimon: Digimon) => {
    setAllObtainedDigimon(prev => [...prev, newDigimon]);
  };

  const handleHatchEgg = (eggId: number, newDigimonTemplate: DigimonTemplate) => {
    onHatchEgg(eggId, newDigimonTemplate);
    
    // Update the eggs state
    if (onUpdateEggs) {
      const updatedEggs = eggs.filter(egg => egg.id !== eggId);
      onUpdateEggs(updatedEggs);
    }

    // Set the newly hatched Digimon for display
    const newDigimon = createUniqueDigimon(newDigimonTemplate.name);
    setNewlyHatchedDigimon(newDigimon);
    setCurrentScreen('newDigimonStats');
  };

  const handleDigivolve = () => {
    if (digivolvingDigimon && newDigimonForm) {
      setDigivolutionStage(1);
      setTimeout(() => {
        setDigivolutionStage(2);
        setTimeout(() => {
          setDigivolutionStage(3);
          setTimeout(() => {
            const newTemplate = getDigimonTemplate(newDigimonForm);
            if (!newTemplate) {
              console.error(`No template found for ${newDigimonForm}`);
              return;
            }

            const newStartingCard: Card = {
              ...newTemplate.startingCard,
              instanceId: uuidv4(),
              ownerDigimonIndex: playerTeam.findIndex(d => d.id === digivolvingDigimon.id)
            };

            const evolvedDigimon: Digimon = {
              ...digivolvingDigimon,
              name: newTemplate.name,
              displayName: newTemplate.displayName,
              type: newTemplate.type,
              digivolutionStage: newTemplate.digivolutionStage,
              hp: calculateBaseStat(newTemplate.baseHp, digivolvingDigimon.level),
              maxHp: calculateBaseStat(newTemplate.baseHp, digivolvingDigimon.level),
              attack: calculateBaseStat(newTemplate.baseAttack, digivolvingDigimon.level),
              healing: calculateBaseStat(newTemplate.baseHealing, digivolvingDigimon.level),
              evasion: newTemplate.baseEvadeChance,
              critChance: newTemplate.baseCritChance,
              accuracy: newTemplate.baseAccuracy,
              corruptionResistance: newTemplate.baseCorruptionResistance,
              buggedResistance: newTemplate.baseBuggedResistance,
              passiveSkill: newTemplate.passiveSkill,
              deck: [
                ...digivolvingDigimon.deck,
                newStartingCard
              ]
            };

            const updatedTeam = playerTeam.map(d => 
              d.id === digivolvingDigimon.id ? evolvedDigimon : d
            );
            setDigivolutionStage(4);
            setTimeout(() => {
            
            onUpdatePlayerTeam(updatedTeam);
            setShowDigivolutionModal(false);
            setDigivolvingDigimon(null);
            setNewDigimonForm(null);
            setDigivolutionStage(0);
          }, 2000);
          }, 2000);
        }, 2000);
      }, 2000);
    }
  };

  const toggleDevPartyBox = () => setShowDevPartyBox(!showDevPartyBox);

  const cycleDigimon = (direction: 'next' | 'prev') => {
    setCurrentDigimonIndex((prevIndex) => {
      if (direction === 'next') {
        return (prevIndex + 1) % playerTeam.length;
      } else {
        return (prevIndex - 1 + playerTeam.length) % playerTeam.length;
      }
    });
  };

  const handleNicknameEdit = () => {
    setNewNickname(playerTeam[currentDigimonIndex].nickname || playerTeam[currentDigimonIndex].displayName);
    setIsEditingNickname(true);
  };

  const handleNicknameSave = () => {
    const updatedTeam = playerTeam.map((digimon, index) => 
      index === currentDigimonIndex ? { ...digimon, nickname: newNickname } : digimon
    );
    onUpdatePlayerTeam(updatedTeam);
    setIsEditingNickname(false);
  };

  const toggleParty = () => setShowPartyBox(!showPartyBox);
  const toggleEggs = () => setShowEggs(!showEggs);
  const toggleCardCollection = () => setShowCardCollection(!showCardCollection);
  const toggleTestArena = () => setShowTestArena(!showTestArena);
  const handleOpenDeckEditor = () => {
    setShowDeckEditor(true);
  };

  const handleCloseDeckEditor = () => {
    setShowDeckEditor(false);
  };

  const handleUpdateNickname = (id: string, nickname: string) => {
    const updatedTeam = playerTeam.map(digimon => 
      digimon.id === id ? { ...digimon, nickname } : digimon
    );
    onUpdatePlayerTeam(updatedTeam);
  };

  const handleSaveDeck = (updatedDigimon: Digimon) => {
    const updatedTeam = playerTeam.map(d => 
      d.id === updatedDigimon.id ? updatedDigimon : d
    );
    onUpdatePlayerTeam(updatedTeam);
    setShowDeckEditor(false);
  };

  if (currentScreen === 'testArena') {
    return <DevTestBattleScreen 
      onExit={() => setCurrentScreen(null)} 
      playerTeam={playerTeam}  // Pass the current player team
    />;
  }

  return (
    <div className="home-screen">
      <div className="digivice">
        <div className="digivice-content">
          <div className="screen-wrapper">
          <p>Day: {dayCount}</p>
            <div className="screen" ref={screenRef}>
              <div className="screen-content">
                <div className="digimon-display">
                  {playerTeam.map((digimon, index) => (
                    <div key={index} className="digimon-card">
                      <DigimonSprite 
                        name={digimon.name} 
                        scale={spriteScale * 1.5} 
                      />
                      <p>{digimon.nickname ? digimon.nickname : digimon.displayName}</p>
                    </div>
                  ))}
                </div>
                {currentScreen === 'shop' && (
                  <div className="stat-overlay">
                    <Shop
                      bits={bits}
                      onPurchase={handlePurchase}
                      onClose={() => setCurrentScreen(null)}
                    />
                  </div>
                )}
                {currentScreen === 'party' && (
                  <div className="stat-overlay">
                    <DigimonPartyBox
                      party={playerTeam}
                      ownedDigimon={getAvailableDigimon()}
                      onSwapDigimon={handleSwapDigimon}
                    />
                  </div>
                )}
                {currentScreen === 'arena' && (
                  <div className="stat-overlay">
                    <ArenaScreen
                      onClose={handleCloseArena}
                      onSelectTournament={handleSelectTournament}
                    />
                  </div>
                )}
          {currentScreen === 'devPartyBox' && (
                  <div className="stat-overlay">
                    <DevDigimonPartyBox
                      party={playerTeam}
                      allDigimon={allDigimon}
                      onSwapDigimon={handleSwapDigimon}
                    />
                  </div>
                )}

{currentScreen === 'stats' && (
                  <div className="stat-overlay">
                    <div className="stat-navigation">
                      <button onClick={() => cycleDigimon('prev')}>&lt; Prev</button>
                      {isEditingNickname ? (
                        <input
                          ref={nicknameInputRef}
                          type="text"
                          value={newNickname}
                          onChange={(e) => setNewNickname(e.target.value)}
                          onBlur={handleNicknameSave}
                          onKeyPress={(e) => e.key === 'Enter' && handleNicknameSave()}
                          className="nickname-input"
                        />
                      ) : (
                        <h2>
                          {playerTeam[currentDigimonIndex].nickname || playerTeam[currentDigimonIndex].displayName}
                          <FaPencilAlt className="edit-icon" onClick={handleNicknameEdit} />
                        </h2>
                      )}
                      <button onClick={() => cycleDigimon('next')}>Next &gt;</button>
                    </div>
                    <DigimonStatScreen 
                      digimon={playerTeam[currentDigimonIndex]} 
                      isObtained={true}
                    />
                    <div className="stat-actions">
                      <button className="deck-button" onClick={() => setCurrentScreen('deckEditor')}>Deck</button>
                      <button className="digivolve-button" onClick={() => setCurrentScreen('digivolutionTree')}>Digivolution</button>
                    </div>
                  </div>
                )}  {currentScreen === 'eggs' && (
                  <div className="stat-overlay">
                    <Eggs 
                      eggs={eggs} 
                      onHatchEgg={handleHatchEgg}
                      onUpdateEggs={onUpdateEggs || (() => {})}
                      onClose={() => setCurrentScreen(null)}
                    />
                  </div>
                )}
       {currentScreen === 'newDigimonStats' && newlyHatchedDigimon && (
                  <div className="stat-overlay">
                    <h2>New Digimon Hatched!</h2>
                    <DigimonStatScreen 
                      digimon={newlyHatchedDigimon} 
                      isObtained={true}
                    />
                    <button className="close-button" onClick={handleCloseNewDigimonStats}>Close</button>
                  </div>
                )}
                {currentScreen === 'deckEditor' && (
                  <div className="stat-overlay">
                    <DeckEditor 
                      digimon={playerTeam[currentDigimonIndex]}
                      onSave={handleSaveDeck}
                      onClose={() => setCurrentScreen(null)}
                      onPrev={() => cycleDigimon('prev')}
                      onNext={() => cycleDigimon('next')}
                      onUpdateNickname={handleUpdateNickname}
                    />
                  </div>
                )}
                      

       {showDigivolutionModal && digivolvingDigimon && newDigimonForm && (
        <div className="digivolution-overlay">
          <div className="digivolution-content">
            <h2>{digivolvingDigimon.nickname || digivolvingDigimon.displayName} IS DIGIVOLVING</h2>
            <div className={`digivolution-animation stage-${digivolutionStage}`}>
              <div className="digimon-container original">
                <DigimonSprite name={digivolvingDigimon.name} scale={2} />
              </div>
              <div className="digivolution-effect"></div>
              <div className="digimon-container target">
                <DigimonSprite 
                  name={newDigimonForm} 
                  scale={2} 
                  isAttacking={digivolutionStage === 4}
                />
              </div>
            </div>
          </div>
        </div>
      )}
              </div>
            </div>
          </div>
          <div className="controls-container">
        <div className="hbutton-container">
          <button className="stats-button" onClick={() => toggleScreen('stats')}>Stats</button>
          <button className="eggs-button" onClick={() => toggleScreen('eggs')}>Eggs</button>
          <button onClick={onGenerateEgg}>DEV Generate Egg</button>
          <button className="stats-button" onClick={() => toggleScreen('party')}>Party</button>
          <button className="battle-button" onClick={handleAdventureClick}>Adventure</button>
          <button 
            className={`arena-button ${isArenaAvailable ? 'available' : ''}`} 
            onClick={handleArenaClick}
            disabled={!isArenaAvailable}
          >
            {isArenaAvailable ? 'ENTER ARENA' : `ARENA: ${daysUntilArena} day${daysUntilArena !== 1 ? 's' : ''}`}
          </button>
        </div>
        <div className="hbutton-container">
        <button className="stats-button" onClick={() => setCurrentScreen('shop')}>Shop</button>
          <button className="dev-button" onClick={() => toggleScreen('cardCollection')}>DEV: Cards</button>
          <button className="dev-button" onClick={() => toggleScreen('devPartyBox')}>DEV: Party Box</button>
          <button className="test-arena-button" onClick={() => toggleScreen('testArena')}>DEV: Test Battle</button>
        </div>
      </div>
        </div>
      </div>

      {showZoneModal && (
        <div className="modal zone-selection-modal">
          <h2>Select a Zone</h2>
          <button onClick={() => handleStartAdventure('Label Forest')}>Label Forest</button>
          {/* Add more zone buttons here as needed */}
          <button onClick={() => setShowZoneModal(false)}>Cancel</button>
        </div>
      )}
       

{currentScreen === 'cardCollection' && (
        <div className="modal card-collection-modal">
          <CardDex cards={Object.values(AllCards)} />
          <button onClick={() => setCurrentScreen(null)}>Close</button>
        </div>
      )}
      
      {currentScreen === 'digivolutionTree' && (
        <div className="digivolution-overlay">
          <DigivolutionTree 
            currentDigimon={playerTeam[currentDigimonIndex]} 
            allDigimon={allDigimon} 
          />
          <button className="close-button" onClick={() => setCurrentScreen(null)}>Close</button>
        </div>
      )}

    </div>
  );
};

export default HomeScreen;
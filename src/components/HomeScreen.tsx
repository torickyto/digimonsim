import React, { useState, useEffect, useRef } from 'react';
import DigimonSprite from './DigimonSprite';
import DigimonStatScreen from './DigimonStatScreen';
import CardDex from './CardDex';
import { Digimon, DigimonEgg, Card } from '../shared/types';
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

interface HomeScreenProps {
  playerTeam: Digimon[];
  eggs: DigimonEgg[];
  onStartBattle: () => void;
  onUpdatePlayerTeam: (updatedTeam: Digimon[]) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ playerTeam, eggs, onStartBattle, onUpdatePlayerTeam }) => {
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

  const toggleStats = () => {
    setShowStats(!showStats);
    setCurrentDigimonIndex(0);
  };

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

  const toggleParty = () => setShowParty(!showParty);
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

  if (showTestArena) {
    return <DevTestBattleScreen onExit={() => setShowTestArena(false)} />;
  }

  return (
    <div className="home-screen">
      <div className="digivice">
        <div className="digivice-content">
          <div className="screen-wrapper">
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
                {showStats && (
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
                      <button className="deck-button" onClick={handleOpenDeckEditor}>Deck</button>
                      <button className="digivolve-button" onClick={() => setShowDigivolutionTree(true)}>Digivolution</button>
                    </div>
                  </div>
                )}
                {showDeckEditor && (
  <div className="stat-overlay">
    <DeckEditor 
      digimon={playerTeam[currentDigimonIndex]}
      onSave={handleSaveDeck}
      onClose={handleCloseDeckEditor}
      onPrev={() => cycleDigimon('prev')}
      onNext={() => cycleDigimon('next')}
      onUpdateNickname={handleUpdateNickname}
    />
  </div>
)}
              </div>
            </div>
          </div>
          <div className="controls-container">
            <div className="hbutton-container">
            <button className="stats-button" onClick={toggleStats}>Stats</button>
              <button className="eggs-button" onClick={toggleEggs}>Eggs</button>
              <button className="party-button" onClick={toggleParty}>Party</button>
              <button className="battle-button" onClick={onStartBattle}>Battle</button>
            </div>
            <div className="hbutton-container">
              <button className="dev-button" onClick={toggleCardCollection}>DEV: Cards</button>
              <button className="test-arena-button" onClick={toggleTestArena}>DEV: Test Battle</button>
            </div>
          </div>
        </div>
      </div>

      {showParty && (
        <div className="modal">
          <h2>Your Party</h2>
          {playerTeam.map(digimon => (
            <div key={digimon.id} className="party-member">
              <DigimonSprite name={digimon.name} />
              <p>{digimon.displayName} Lv.{digimon.level}</p>
            </div>
          ))}
          <button onClick={toggleParty}>Close</button>
        </div>
      )}

      {showEggs && (
        <div className="modal">
          <h2>Your Eggs</h2>
          <ul>
            {eggs.map((egg) => (
              <li key={egg.id}>Egg {egg.id}</li>
            ))}
          </ul>
          <button onClick={toggleEggs}>Close</button>
        </div>
      )}

{showDigivolutionModal && digivolvingDigimon && newDigimonForm && (
        <div className="digivolution-modal">
          <div className="digivolution-content">
            <h2>{digivolvingDigimon.nickname || digivolvingDigimon.displayName} is digivolving!</h2>
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
            {digivolutionStage === 0 && (
              <button onClick={handleDigivolve}>Start Digivolution</button>
            )}
          </div>
        </div>
      )}
      {showDeckEditor && selectedDigimon && (
        <DeckEditor 
          digimon={selectedDigimon} 
          onSave={handleSaveDeck} 
          onClose={() => setShowDeckEditor(false)} 
          onPrev={() => cycleDigimon('prev')}
           onNext={() => cycleDigimon('next')}
           onUpdateNickname={handleUpdateNickname}
        />
      )}

      {showCardCollection && (
        <div className="modal card-collection-modal">
          <CardDex cards={Object.values(AllCards)} />
          <button onClick={toggleCardCollection}>Close</button>
        </div>
      )}

{showDigivolutionTree && (
  <div className="digivolution-overlay">
    <DigivolutionTree 
      currentDigimon={playerTeam[currentDigimonIndex]} 
      allDigimon={allDigimon} 
    />
    <button className="close-button" onClick={() => setShowDigivolutionTree(false)}>Close</button>
  </div>
)}

    </div>
  );
};

export default HomeScreen;
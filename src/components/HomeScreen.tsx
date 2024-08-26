import React, { useState, useEffect, useRef } from 'react';
import DigimonSprite from './DigimonSprite';
import DigimonStatScreen from './DigimonStatScreen';
import CardDex from './CardDex';
import { Digimon, DigimonEgg } from '../shared/types';
import { CardCollection as AllCards } from '../shared/cardCollection';
import './HomeScreen.css';
import DeckEditor from './DeckEditor';
import DevTestBattleScreen from './DevTestBattleScreen';
import { FaPencilAlt } from 'react-icons/fa';

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
  const handleOpenDeckEditor = (digimon: Digimon) => {
    setSelectedDigimon(digimon);
    setShowDeckEditor(true);
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
                    <div key={index} className="digimon-card" onClick={() => handleOpenDeckEditor(digimon)}>
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
                   <button className="close-stats" onClick={toggleStats}>Close</button>
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

      {showDeckEditor && selectedDigimon && (
        <DeckEditor 
          digimon={selectedDigimon} 
          onSave={handleSaveDeck} 
          onClose={() => setShowDeckEditor(false)} 
        />
      )}

      {showCardCollection && (
        <div className="modal card-collection-modal">
          <CardDex cards={Object.values(AllCards)} />
          <button onClick={toggleCardCollection}>Close</button>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
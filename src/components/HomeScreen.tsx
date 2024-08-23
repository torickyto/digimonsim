import React, { useState } from 'react';
import DigimonSprite from './DigimonSprite';
import DigimonStatScreen from './DigimonStatScreen';
import CardDex from './CardDex'; 
import { Digimon, DigimonEgg } from '../shared/types';
import { CardCollection as AllCards } from '../shared/cardCollection';  // Import all cards
import './HomeScreen.css';
import DeckEditor from './DeckEditor';

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

  const toggleStats = () => setShowStats(!showStats);
  const toggleParty = () => setShowParty(!showParty);
  const toggleEggs = () => setShowEggs(!showEggs);
  const toggleCardCollection = () => setShowCardCollection(!showCardCollection);
  const toggleTestArena = () => setShowTestArena(!showTestArena);
  const handleOpenDeckEditor = (digimon: Digimon) => {
    setSelectedDigimon(digimon);
    setShowDeckEditor(true);
  };

  const handleSaveDeck = (updatedDigimon: Digimon) => {
    // Update the player's team with the new deck
    const updatedTeam = playerTeam.map(d => 
      d.id === updatedDigimon.id ? updatedDigimon : d
    );
    
    // Call the function to update the player team in the parent component
    onUpdatePlayerTeam(updatedTeam);
    
    console.log('Updated team:', updatedTeam);
    setShowDeckEditor(false);
  };

  return (
    <div className="home-screen">
      <div className="top-bar">
        <button className="stats-button" onClick={toggleStats}>Stats</button>
        <button className="eggs-button" onClick={toggleEggs}>Eggs ({eggs.length})</button>
        <button className="dev-button" onClick={toggleCardCollection}>Dev: Cards</button>
      </div>
      
      <div className="digimon-display">
        {playerTeam.map((digimon, index) => (
          <div key={index} className="digimon-card" onClick={() => handleOpenDeckEditor(digimon)}>
            <DigimonSprite name={digimon.name} />
            <p>{digimon.displayName}</p>
            <button>Edit Deck</button>
          </div>
        ))}
      </div>

      <div className="bottom-bar1">
        <button className="party-button" onClick={toggleParty}>Party</button>
        <button className="battle-button" onClick={onStartBattle}>Battle</button>
        <button className="test-arena-button" onClick={toggleTestArena}>DEV TEST BATTLE</button>
      </div>

      {showStats && (
        <div className="modal">
          <DigimonStatScreen digimon={playerTeam[0]} isObtained={true} />
          <button onClick={toggleStats}>Close</button>
        </div>
      )}

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
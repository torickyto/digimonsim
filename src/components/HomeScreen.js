import React, { useState } from 'react';
import DigimonSprite from './DigimonSprite';
import DigimonStatScreen from './DigimonStatScreen';
import BattleScreen from './BattleScreen';
import './HomeScreen.css';

const HomeScreen = ({ currentDigimon, party, eggs, onStartBattle }) => {
  const [showStats, setShowStats] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [showEggs, setShowEggs] = useState(false);
  const [inBattle, setInBattle] = useState(false);

  const toggleStats = () => setShowStats(!showStats);
  const toggleParty = () => setShowParty(!showParty);
  const toggleEggs = () => setShowEggs(!showEggs);
  const startBattle = () => setInBattle(true);
  const endBattle = (playerWon) => {
    setInBattle(false);
    // post-battle effects (exp gain, etc.)
  };

  if (inBattle) {
    return <BattleScreen playerDigimon={currentDigimon} onBattleEnd={endBattle} />;
  }

  return (
    <div className="home-screen">
      <div className="top-bar">
        <button className="stats-button" onClick={toggleStats}>Stats</button>
        <button className="eggs-button" onClick={toggleEggs}>Eggs ({eggs.length})</button>
      </div>
      
      <div className="digimon-display">
        <DigimonSprite name={currentDigimon.name} />
      </div>

      <div className="bottom-bar">
        <button className="party-button" onClick={toggleParty}>Party</button>
        <button className="battle-button" onClick={startBattle}>Battle</button>
      </div>

      {showStats && (
        <div className="modal">
          <DigimonStatScreen digimon={currentDigimon} isObtained={true} />
          <button onClick={toggleStats}>Close</button>
        </div>
      )}

      {showParty && (
        <div className="modal">
          <h2>Your Party</h2>
          {party.map(digimon => (
            <div key={digimon.id} className="party-member">
              <DigimonSprite name={digimon.name} />
              <p>{digimon.name} Lv.{digimon.level}</p>
            </div>
          ))}
          <button onClick={toggleParty}>Close</button>
        </div>
      )}

      {showEggs && (
        <div className="modal">
          <h2>Your Eggs</h2>
          <ul>
            {eggs.map((egg, index) => (
              <li key={index}>Egg {index + 1}</li>
            ))}
          </ul>
          <button onClick={toggleEggs}>Close</button>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
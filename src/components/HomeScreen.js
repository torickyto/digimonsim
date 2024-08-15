import React, { useState } from 'react';
import DigimonSprite from './DigimonSprite';
import DigimonStatScreen from './DigimonStatScreen';
import './HomeScreen.css';

const HomeScreen = ({ currentDigimon, allDigimon, eggs }) => {
  const [showStats, setShowStats] = useState(false);
  const [showDigimonList, setShowDigimonList] = useState(false);
  const [showEggs, setShowEggs] = useState(false);

  const toggleStats = () => setShowStats(!showStats);
  const toggleDigimonList = () => setShowDigimonList(!showDigimonList);
  const toggleEggs = () => setShowEggs(!showEggs);

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
        <button className="digimon-button" onClick={toggleDigimonList}>Digimon</button>
        <button className="battle-button">Battle</button>
      </div>

      {showStats && (
        <div className="modal">
          <DigimonStatScreen digimon={currentDigimon} isObtained={true} />
          <button onClick={toggleStats}>Close</button>
        </div>
      )}

      {showDigimonList && (
        <div className="modal">
          <h2>Your Digimon</h2>
          <ul>
            {allDigimon.map(digimon => (
              <li key={digimon.id}>
                <DigimonSprite name={digimon.name} />
                {digimon.displayName}
              </li>
            ))}
          </ul>
          <button onClick={toggleDigimonList}>Close</button>
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
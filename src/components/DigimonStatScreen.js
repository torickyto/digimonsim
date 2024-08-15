import React from 'react';
import DigimonSprite from './DigimonSprite';
import './DigimonStatScreen.css';

const TYPE_COLORS = {
  DATA: '#85daeb',
  VACCINE: '#f5daa7',
  VIRUS: '#ca60ae'
};

const DigimonStatScreen = ({ digimon, isObtained }) => {
  const typeColor = TYPE_COLORS[digimon.type] || '#ffffff';
  return (
    <div className="digimon-stat-screen" style={{ backgroundColor: typeColor }}>
      <div className="stat-inner">
        <div className="stat-header">
          <div className="digimon-name">
            <span className={`obtained-status ${isObtained ? 'obtained' : 'not-obtained'}`}></span>
            {digimon.name}
          </div>
          {isObtained && <div className="digimon-level">Lv.{digimon.level}</div>}
          <div className="digimon-type">{digimon.type}</div>
        </div>
        <div className="stat-content">
          <div className="digimon-image">
            <DigimonSprite name={digimon.name} />
          </div>
          <div className="stat-table">
            <div className="stat-row">
              <div className="stat-label">HP</div>
              <div className="stat-value">{digimon.hp}/{digimon.maxHp}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Block</div>
              <div className="stat-value">{digimon.block}</div>
            </div>
            {isObtained && (
              <div className="stat-row">
                <div className="stat-label">EXP</div>
                <div className="stat-value">{digimon.exp}</div>
              </div>
            )}
          </div>
        </div>
        <div className="digimon-ability">
          <div className="ability-label">Special Ability</div>
          <div className="ability-value">{digimon.specialAbility.name}</div>
          <div className="ability-description">{digimon.specialAbility.description}</div>
        </div>
      </div>
    </div>
  );
};

export default DigimonStatScreen;
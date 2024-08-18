import React from 'react';
import DigimonSprite from './DigimonSprite';
import { Digimon, TYPE_COLORS } from '../shared/types';
import './DigimonStatScreen.css';

interface DigimonStatScreenProps {
  digimon: Digimon;
  isObtained: boolean;
}

const DigimonStatScreen: React.FC<DigimonStatScreenProps> = ({ digimon, isObtained }) => {
  const typeColor = TYPE_COLORS[digimon.type] || '#ffffff';
  
  return (
    <div className="digimon-stat-screen" style={{ backgroundColor: typeColor }}>
      <div className="stat-inner">
        <div className="stat-header">
          <div className="digimon-name">
            <span className={`obtained-status ${isObtained ? 'obtained' : 'not-obtained'}`}></span>
            {digimon.displayName}
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
              <div className="stat-label">Energy Bonus</div>
              <div className="stat-value">0</div> {/* placeholder for Energy Bonus stat, add logic for this later*/}
            </div>
            {isObtained && (
              <div className="stat-row">
                <div className="stat-label">EXP</div>
                <div className="stat-value">{digimon.exp}</div>
              </div>
            )}
          </div>
        </div>
        <div className="digimon-starting-card">
          <div className="ability-label">Starting Card</div>
          <div className="game-card">
            <div className="card-content">
              <div className="card-info">
                <h3 className="card-name">{digimon.startingCard.name}</h3>
                <p className="card-description">{digimon.startingCard.description}</p>
              </div>
              <div className="card-cost" data-type={digimon.startingCard.digimonType}>
                {digimon.startingCard.cost}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigimonStatScreen;
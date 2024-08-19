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
    <div className="digimon-stat-screen" style={{ backgroundColor: `${typeColor}22` }}>
      <div className="stat-inner">
        <div className="stat-header">
          <h2 className="digimon-name">{digimon.displayName}</h2>
          <div className="digimon-type" style={{ backgroundColor: typeColor }}>{digimon.type}</div>
        </div>
        <div className="stat-content">
          <div className="digimon-image">
            <DigimonSprite name={digimon.name} />
          </div>
          <div className="stat-details">
            <div className="stat-column">
              <div className="stat-row">
                <span className="stat-label">Level</span>
                <span className="stat-value">{digimon.level}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">HP</span>
                <span className="stat-value">{digimon.hp}/{digimon.maxHp}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Attack</span>
                <span className="stat-value">{digimon.attack}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Healing</span>
                <span className="stat-value">{digimon.healing}</span>
              </div>
            </div>
            <div className="stat-column">
              <div className="stat-row">
                <span className="stat-label">Evade</span>
                <span className="stat-value">{(digimon.evadeChance * 100).toFixed(1)}%</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{(digimon.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Crit Chance</span>
                <span className="stat-value">{(digimon.critChance * 100).toFixed(1)}%</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Crit Damage</span>
                <span className="stat-value">{(digimon.critDamage * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="resistance-section">
          <h3>Resistances</h3>
          <div className="resistance-bars">
            <div className="resistance-bar">
              <span className="resistance-label">Corruption</span>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: `${digimon.corruptionResistance * 100}%` }}></div>
              </div>
              <span className="resistance-value">{(digimon.corruptionResistance * 100).toFixed(1)}%</span>
            </div>
            <div className="resistance-bar">
              <span className="resistance-label">Bugged</span>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: `${digimon.buggedResistance * 100}%` }}></div>
              </div>
              <span className="resistance-value">{(digimon.buggedResistance * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <div className="passive-section">
          <h3>Passive Skill</h3>
          <div className="passive-skill">
            <img src={`/assets/skills/${digimon.passiveSkill?.name.toLowerCase().replace(' ', '_')}.png`} alt={digimon.passiveSkill?.name} />
            <span>{digimon.passiveSkill?.name || 'None'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigimonStatScreen;
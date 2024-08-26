import React, { useRef, useEffect, useState } from 'react';
import DigimonSprite from './DigimonSprite';
import { Digimon, TYPE_COLORS } from '../shared/types';
import './DigimonStatScreen.css';

interface DigimonStatScreenProps {
  digimon: Digimon;
  isObtained: boolean;
}

const DigimonStatScreen: React.FC<DigimonStatScreenProps> = ({ digimon, isObtained }) => {
  const typeColor = TYPE_COLORS[digimon.type] || '#ffffff';
  const containerRef = useRef<HTMLDivElement>(null);
  const [spriteScale, setSpriteScale] = useState(1);

  useEffect(() => {
    const updateSpriteScale = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const scale = Math.min(width / 400, height / 400) * 0.8;
        setSpriteScale(scale);
      }
    };

    updateSpriteScale();
    window.addEventListener('resize', updateSpriteScale);
    return () => window.removeEventListener('resize', updateSpriteScale);
  }, []);
  
  return (
    <div className="digimon-stat-screen" ref={containerRef}>
      <div className="top-section">
        <div className="digimon-image">
          <DigimonSprite name={digimon.name} scale={spriteScale} />
        </div>
        <div className="sdigimon-info">
          <h2 className="digimon-name">{digimon.displayName}</h2>
          <div className="digimon-type" style={{ backgroundColor: typeColor }}>{digimon.type}</div>
          <div className="digimon-details">
          <span className="digimon-level">Level: {digimon.level}</span>
            <span className="digimon-stage">Stage: Rookie</span>
            
          </div>
        </div>
      </div>
      <div className="stats-section">
        <div className="stat-columns">
          <div className="stat-column">
          <div className="stat-row">
          <span className="stat-label">HP</span>
          <div className="stat-bar-container">
            <div className="stat-bar" style={{width: `${(digimon.hp / digimon.maxHp) * 100}%`}}></div>
          </div>
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
              <span className="stat-value">{(digimon.evasion * 100).toFixed(1)}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Crit Chance</span>
              <span className="stat-value">{(digimon.critChance * 100).toFixed(1)}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{(digimon.accuracy * 100).toFixed(1)}%</span>
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
          <span>{digimon.passiveSkill?.name || 'No Passive'}</span>
        </div>
      </div>
    </div>
  );
};

export default DigimonStatScreen;
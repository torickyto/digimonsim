import React, { useState, useRef, useEffect } from 'react';
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
        const scale = Math.min(width / 400, height / 400) * 0.6;
        setSpriteScale(scale);
      }
    };

    updateSpriteScale();
    window.addEventListener('resize', updateSpriteScale);
    return () => window.removeEventListener('resize', updateSpriteScale);
  }, []);


  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="digimon-stat-screen" ref={containerRef}>
      <div className="sstop-section">
        <div className="ssdigimon-image">
          <DigimonSprite name={digimon.name} scale={spriteScale} />
        </div>
        <div className="ssdigimon-info">
          <h2 className="ssdigimon-name">{digimon.displayName} </h2>
          <span className="ssdate-obtained">
          Obtained: {formatDate(digimon.dateObtained)}
        </span>
          <div className="ssdigimon-type" style={{ backgroundColor: typeColor }}>{digimon.type}</div>
          <div className="ssdigimon-details">
          <span className="ssdigimon-level">Level: {digimon.level}</span>
          <span className="ssdigimon-stage">Stage: {digimon.digivolutionStage}</span>
            
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
      <div className="ssresistance-section">
        <h3>Resistances</h3>
        <div className="ssresistance-bars">
          <div className="ssresistance-bar">
            <span className="ssresistance-label">Corruption</span>
            <div className="ssbar-container">
              <div className="ssbar-fill" style={{ width: `${digimon.corruptionResistance * 100}%` }}></div>
            </div>
            <span className="ssresistance-value">{(digimon.corruptionResistance * 100).toFixed(1)}%</span>
          </div>
          <div className="resistance-bar">
            <span className="ssresistance-label">Bugged</span>
            <div className="ssbar-container">
              <div className="ssbar-fill" style={{ width: `${digimon.buggedResistance * 100}%` }}></div>
            </div>
            <span className="ssresistance-value">{(digimon.buggedResistance * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      <div className="sspassive-section">
        <h3>Passive Skill</h3>
        <div className="sspassive-skill">
          <span>{digimon.passiveSkill?.name || 'No Passive'}</span>
        </div>
      </div>
    </div>
  );
};

export default DigimonStatScreen;
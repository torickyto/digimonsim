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
  const expPercentage = (digimon.exp / digimon.expToNextLevel) * 100;

  useEffect(() => {
    const updateSpriteScale = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const scale = Math.min(width / 600, height / 600) * 0.9; // Increased scale factor
        setSpriteScale(scale);
      }
    };

    updateSpriteScale();
    window.addEventListener('resize', updateSpriteScale);
    return () => window.removeEventListener('resize', updateSpriteScale);
  }, []);

  const formatDate = (date: Date | string) => {
    const dateObject = date instanceof Date ? date : new Date(date);
    return dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  return (
    <div className="dss-container" ref={containerRef}>
      <div className="dss-header">
        <h2 className="dss-digimon-name">{digimon.displayName}</h2>
        <div className="dss-digimon-type" style={{ backgroundColor: typeColor }}>{digimon.type}</div>
      </div>
      
      <div className="dss-scrollable-content">
        <div className="dss-content">
          <div className="dss-image-info-container">
            <div className="dss-image-container">
              <DigimonSprite name={digimon.name} scale={spriteScale} />
            </div>
            <div className="dss-basic-info">
              <div className="dss-info-item">
                <span className="dss-info-label">Level:</span>
                <span className="dss-info-value">{digimon.level}</span>
              </div>
              <div className="dss-exp-section">
            <div className="dss-exp-bar-container">
              <div className="dss-exp-bar" style={{width: `${expPercentage}%`}}></div>
            </div>
            <div className="dss-exp-text">
              <span>EXP: {digimon.exp} / {digimon.expToNextLevel}</span>
            </div>
          </div>
              <div className="dss-info-item">
                <span className="dss-info-label">Stage:</span>
                <span className="dss-info-value">{digimon.digivolutionStage}</span>
              </div>
              <div className="dss-info-item">
                <span className="dss-info-label">Obtained:</span>
                <span className="dss-info-value">{formatDate(digimon.dateObtained)}</span>
              </div>
            </div>
          </div>
          
          

          <div className="dss-stats-grid">
            <div className="dss-stat-item">
              <span className="dss-stat-label">HP</span>
              <div className="dss-stat-bar-container">
                <div className="dss-stat-bar" style={{width: `${(digimon.hp / digimon.maxHp) * 100}%`}}></div>
              </div>
              <span className="dss-stat-value">{digimon.hp}/{digimon.maxHp}</span>
            </div>
            <div className="dss-stat-item">
              <span className="dss-stat-label">Attack</span>
              <span className="dss-stat-value">{digimon.attack}</span>
            </div>
            <div className="dss-stat-item">
              <span className="dss-stat-label">Healing</span>
              <span className="dss-stat-value">{digimon.healing}</span>
            </div>
            <div className="dss-stat-item">
              <span className="dss-stat-label">Evade</span>
              <span className="dss-stat-value">{(digimon.evasion * 100).toFixed(1)}%</span>
            </div>
            <div className="dss-stat-item">
              <span className="dss-stat-label">Crit Chance</span>
              <span className="dss-stat-value">{(digimon.critChance * 100).toFixed(1)}%</span>
            </div>
            <div className="dss-stat-item">
              <span className="dss-stat-label">Accuracy</span>
              <span className="dss-stat-value">{(digimon.accuracy * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="dss-resistance-section">
            <h3 className="dss-section-title">Resistances</h3>
            <div className="dss-resistance-bars">
              <div className="dss-resistance-bar">
                <span className="dss-resistance-label">Corruption</span>
                <div className="dss-bar-container">
                  <div className="dss-bar-fill" style={{ width: `${digimon.corruptionResistance * 100}%` }}></div>
                </div>
                <span className="dss-resistance-value">{(digimon.corruptionResistance * 100).toFixed(1)}%</span>
              </div>
              <div className="dss-resistance-bar">
                <span className="dss-resistance-label">Bugged</span>
                <div className="dss-bar-container">
                  <div className="dss-bar-fill" style={{ width: `${digimon.buggedResistance * 100}%` }}></div>
                </div>
                <span className="dss-resistance-value">{(digimon.buggedResistance * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="dss-passive-section">
            <h3 className="dss-section-title">Passive Skill</h3>
            <div className="dss-passive-skill">
              <span>{digimon.passiveSkill?.name || 'No Passive'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigimonStatScreen;
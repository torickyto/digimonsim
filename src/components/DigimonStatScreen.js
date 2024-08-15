import React from 'react';
import DigimonSprite from './DigimonSprite';
import './DigimonStatScreen.css';

const TYPE_COLORS = {
  DATA: '#85daeb',
  VACCINE: '#f5daa7',
  VIRUS: '#ca60ae'
};

const DigimonStatScreen = ({ digimon, isObtained = false }) => {
  const typeColor = TYPE_COLORS[digimon.type] || '#ffffff';

  return (
    <div className="digimon-stat-screen" style={{ backgroundColor: typeColor }}>
      <div className="stat-inner">
        <div className="stat-header">
          <div className="digimon-name">
            <span className={`obtained-status ${isObtained ? 'obtained' : 'not-obtained'}`}></span>
            {digimon.displayName}
          </div>
          <div className="digimon-level">Lv.{digimon.stats.level}</div>
          <div className="digimon-type">{digimon.type}</div>
        </div>
        <div className="stat-content">
          <div className="digimon-image">
            <DigimonSprite name={digimon.name} />
          </div>
          <div className="stat-table">
            {Object.entries(digimon.stats).map(([stat, value]) => (
              stat !== 'level' && (
                <div key={stat} className="stat-row">
                  <div className="stat-label">{stat.charAt(0).toUpperCase() + stat.slice(1)}</div>
                  <div className="stat-value">{value}</div>
                </div>
              )
            ))}
          </div>
        </div>
        <div className="digimon-ability">
          <div className="ability-label">Ability</div>
          <div className="ability-value">Placeholder Ability</div>
          <div className="ability-description">Description</div>
        </div>
      </div>
    </div>
  );
};

export default DigimonStatScreen;
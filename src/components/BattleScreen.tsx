import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { Digimon, CardType } from '../shared/types';
import DigimonSprite from './DigimonSprite';
import Card from './Card';
import BattleLogic from './BattleLogic';
import './BattleScreen.css';

interface BattleScreenProps {
  playerTeam: Digimon[];
  enemy: Digimon;
  onBattleEnd: (playerWon: boolean) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerTeam, enemy, onBattleEnd }) => {
  const [hoveredCard, setHoveredCard] = useState<CardType | null>(null);

  return (
    <BattleLogic playerTeam={playerTeam} enemy={enemy} onBattleEnd={onBattleEnd}>
      {({
        turn,
        playerEnergy,
        playerHand,
        playerDeck,
        selectedCardId,
        enemyHp,
        enemyBlock,
        enemy,
        playerTeamHp,
        playerTeamBlock,
        handleCardClick,
        handleCardUse,
        handleDiscard,
        endTurn
      }) => {
        const isAttackSelected = selectedCardId !== null && 
          (playerHand.find(card => card.id === selectedCardId)?.type === 'attack' ||
           playerHand.find(card => card.id === selectedCardId)?.type === 'special');

        return (
          <div className="battle-screen">
            {/* Top bar */}
            <div className="top-bar">
              <div className="turn-display">TURN {turn}</div>
              <div className="tutorial-mode">TESTING AREA</div>
            </div>

            {/* Main content */}
            <div className="main-content">
              {/* Left sidebar - Cards */}
              <div className="card-sidebar">
                <div className="action-buttons">
                  <button onClick={endTurn} className="end-turn-button">END TURN</button>
                  <button onClick={handleDiscard} disabled={selectedCardId === null} className="discard-button">DISCARD</button>
                  <div className="deck-count">
                    <Layers className="deck-icon" />
                    <span>{playerDeck.length}</span>
                  </div>
                </div>
                <div className="energy-gauge">
                  Energy {playerEnergy}/10
                  <div className="energy-stars">
                    {[...Array(10)].map((_, i) => (
                      <span key={i} className={`energy-star ${i < playerEnergy ? 'active' : ''}`}>★</span>
                    ))}
                  </div>
                </div>
                <div className="card-list">
                  {playerHand.map(card => (
                    <Card
                      key={card.id}
                      card={card}
                      onClick={() => handleCardClick(card)}
                      isSelected={selectedCardId === card.id}
                      onMouseEnter={() => setHoveredCard(card)}
                      onMouseLeave={() => setHoveredCard(null)}
                    />
                  ))}
                </div>
              </div>

              {/* Main battle area */}
              <div className="battle-area">
              <div className="battle-background">
                <div 
                  className={`enemy enemy-left ${isAttackSelected ? 'attackable' : ''}`}
                  onClick={() => handleCardUse('enemy')}
                >
                  <DigimonSprite name={enemy.name} />
                  <div className="enemy-info">
                    <div className="enemy-name">{enemy.displayName}</div>
                    <div className="health-bar">
                      <div className="health-fill" style={{ width: `${(enemyHp / enemy.maxHp) * 100}%` }}></div>
                      <div className="health-text">{enemyHp}/{enemy.maxHp}</div>
                    </div>
                    {enemyBlock > 0 && <div className="block-indicator">Shield: {enemyBlock}</div>}
                </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar - Player's party */}
            <div className="player-party">
              {playerTeam.map((digimon, index) => (
                <div key={digimon.id} className="party-member" onClick={() => handleCardUse('self')}>
                  <DigimonSprite name={digimon.name} />
                  <div className="digimon-info">
                    <div className="digimon-name">{digimon.displayName}</div>
                    <div className="health-bar">
                      <div 
                        className="health-fill" 
                        style={{ width: `${(playerTeamHp[index] / digimon.maxHp) * 100}%` }}
                      ></div>
                      <div className="health-text">
                        {playerTeamHp[index]}/{digimon.maxHp}
                      </div>
                    </div>
                    {playerTeamBlock[index] > 0 && <div className="block-indicator">Shield: {playerTeamBlock[index]}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </BattleLogic>
  );
};

export default BattleScreen;
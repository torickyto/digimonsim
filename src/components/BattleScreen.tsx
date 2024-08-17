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
  const [showDiscardTooltip, setShowDiscardTooltip] = useState(false);

  return (
    <BattleLogic playerTeam={playerTeam} enemy={enemy} onBattleEnd={onBattleEnd}>
      {({
        turn,
        playerEnergy,
        playerHand,
        playerDeck,
        selectedCardInstanceId,
        enemyHp,
        enemyBlock,
        enemy,
        playerTeamHp,
        playerTeamBlock,
        selectingCardToDiscard,
        handleCardSelection,
        handleCardUse,
        handleDiscard,
        endTurn
      }) => {
        const isAttackSelected = selectedCardInstanceId !== null && 
          (playerHand.find(card => card.instanceId === selectedCardInstanceId)?.type === 'attack' ||
           playerHand.find(card => card.instanceId === selectedCardInstanceId)?.type === 'special');

        return (
          <div className="battle-screen">
            <div className="top-bar">
              <div className="turn-display">TURN {turn}</div>
              <div className="tutorial-mode">TESTING AREA</div>
            </div>

            <div className="main-content">
              {/* card sidebar */}
              <div className="card-sidebar">
                <div className="action-buttons">
                  <button onClick={endTurn} className="end-turn-button">END TURN</button>
                  <div className="discard-button-container">
                    <button 
                      onClick={handleDiscard} 
                      className="discard-button"
                      onMouseEnter={() => setShowDiscardTooltip(true)}
                      onMouseLeave={() => setShowDiscardTooltip(false)}
                    >
                      DISCARD
                    </button>
                    {showDiscardTooltip && (
                      <div className="discard-tooltip">
                        Discard the top card from your deck
                      </div>
                    )}
                  </div>
                  <div className="deck-count">
                    <Layers className="deck-icon" />
                    <span>{playerDeck.length}</span>
                  </div>
                </div>
                <div className="energy-gauge">
                  Energy {playerEnergy}
                  <div className="energy-stars">
                    {[...Array(10)].map((_, i) => (
                      <span key={i} className={`energy-star ${i < playerEnergy ? 'active' : ''}`}>★</span>
                    ))}
                  </div>
                </div>
                <div className="card-list">
              {playerHand.map(card => (
                <Card
                  key={card.instanceId}
                  card={card}
                  onClick={() => selectingCardToDiscard ? handleCardSelection(card) : handleCardSelection(card)}
                  isSelected={selectedCardInstanceId === card.instanceId}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                  disabled={!selectingCardToDiscard && playerEnergy < card.cost}
                />
              ))}
            </div>
            {selectingCardToDiscard && (
              <div className="overlay">
                <div className="message">Select a card to discard</div>
              </div>
            )}
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

            {/* players digimon party */}
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
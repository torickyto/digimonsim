import React, { useState, useRef, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { Digimon, CardType, CardInstance } from '../shared/types';
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
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [arrowEnd, setArrowEnd] = useState<{ x: number; y: number } | null>(null);
  const battleAreaRef = useRef<HTMLDivElement>(null);
  const cardSidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (arrowStart && battleAreaRef.current && cardSidebarRef.current) {
        const battleRect = battleAreaRef.current.getBoundingClientRect();
        const sidebarRect = cardSidebarRef.current.getBoundingClientRect();
        setArrowEnd({
          x: e.clientX - battleRect.left,
          y: e.clientY - battleRect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [arrowStart]);

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
        selectingCardForEffect,
        selectedCard,
        requiresTarget,
        handleCardClick,
        handleCardSelection,
        handleCardUse,
        handleDiscard,
        endTurn
      }) => {
        const isAttackSelected = selectedCard !== null && 
          (selectedCard.type === 'attack' || (selectedCard.type === 'special' && selectedCard.requiresTarget !== false));

          const handleCardAction = (card: CardInstance) => {
            if (selectedCard?.instanceId === card.instanceId) {
              // if the card is already selected, use it
              if (card.requiresTarget === false) {
                handleCardUse('self');
              } else if (card.requiresTarget === true) {
              } else {
                // requiresTarget is undefined, default to 'self'
                handleCardUse('self');
              }
            } else {
              handleCardClick(card);
            }
          };


        return (
          <div className="battle-screen">
            <div className="top-bar">
              <div className="turn-display">TURN {turn}</div>
              <div className="tutorial-mode">TESTING AREA</div>
            </div>

            <div className="main-content">
              <div className="card-sidebar" ref={cardSidebarRef}>
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
              {playerHand.map((card: CardInstance) => (
                <Card
                  key={card.instanceId}
                  card={card}
                  onClick={() => handleCardAction(card)}
                  onDoubleClick={() => handleCardAction(card)}
                  isSelected={selectedCard?.instanceId === card.instanceId}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                  disabled={playerEnergy < card.cost && !selectingCardForEffect}
                />
              ))}
            </div>
                {selectingCardToDiscard && (
                  <div className="overlay">
                    <div className="message">Select a card to discard</div>
                  </div>
                )}
                {selectingCardForEffect && (
                  <div className="overlay">
                    <div className="message">Select a card for {selectingCardForEffect.name}</div>
                  </div>
                )}
              </div>
              <div className="battle-area" ref={battleAreaRef}>
              <div className="battle-background">
                <div 
                  className={`enemy enemy-left ${isAttackSelected ? 'attackable' : ''}`}
                  onClick={() => isAttackSelected && handleCardUse('enemy')}
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
                  {arrowStart && arrowEnd && (
                    <svg className="targeting-arrow" style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                    }}>
                      <line
                        x1={arrowStart.x}
                        y1={arrowStart.y}
                        x2={arrowEnd.x}
                        y2={arrowEnd.y}
                        stroke="red"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>

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
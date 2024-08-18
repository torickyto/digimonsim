import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layers, Trash2 } from 'lucide-react';
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
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isDiscardAnimationPlaying, setIsDiscardAnimationPlaying] = useState(false);
  const [cardsBeingDiscarded, setCardsBeingDiscarded] = useState<CardInstance[]>([]);
  const battleAreaRef = useRef<HTMLDivElement>(null);
  const cardSidebarRef = useRef<HTMLDivElement>(null);
  const unselectCardRef = useRef<() => void>(() => {});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        unselectCardRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  

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
        playerDiscardPile,
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
        tempEnergy,
        handleCardClick,
        handleCardSelection,
        handleCardUse,
        handleDiscard,
        endTurn,
        unselectCard,
        triggerDiscardAnimation,
        handleCardEffect
      }) => {
        const handleOutsideClick = (e: React.MouseEvent) => {
          if (selectedCard && !cardSidebarRef.current?.contains(e.target as Node)) {
            unselectCard();
          }
        };

        const handleDiscardButtonClick = useCallback(() => {
          if (!isDiscardAnimationPlaying && playerHand.length > 0) {
            const cardToDiscard = playerHand[0];
            setCardsBeingDiscarded([cardToDiscard]);
            setIsDiscardAnimationPlaying(true);
            setTimeout(() => {
              handleDiscard();
              setCardsBeingDiscarded([]);
              setIsDiscardAnimationPlaying(false);
            }, 1000);
          }
        }, [isDiscardAnimationPlaying, playerHand, handleDiscard]);

        const isAttackSelected = selectedCard !== null && 
          (selectedCard.type === 'attack' || (selectedCard.type === 'special' && selectedCard.requiresTarget !== false));

        const handleCardAction = (card: CardInstance) => {
          if (selectingCardForEffect) {
            handleCardSelection(card);
          } else if (selectedCard?.instanceId === card.instanceId) {
            if (card.requiresTarget === false) {
              handleCardUse('self');
            } else if (card.requiresTarget === true) {
              // Do nothing, wait for target selection
            } else {
              handleCardUse('self');
            }
          } else {
            handleCardClick(card);
          }
        };

        return (
          <div className="battle-screen" onClick={handleOutsideClick}>
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
                      onClick={handleDiscardButtonClick}
                      className={`discard-button ${isDiscardAnimationPlaying ? 'disabled' : ''}`}
                      onMouseEnter={() => setShowDiscardTooltip(true)}
                      onMouseLeave={() => setShowDiscardTooltip(false)}
                      disabled={isDiscardAnimationPlaying}
                    >
                      DISCARD
                    </button>
                    {showDiscardTooltip && (
                      <div className="discard-tooltip">
                        Discard the top card from your hand
                      </div>
                    )}
                  </div>
                  <div className="deck-count" onClick={() => setShowDeckModal(true)}>
                    <Layers className="deck-icon" />
                    <span>{playerDeck.length}</span>
                  </div>
                  <div className="discard-count" onClick={() => setShowDiscardModal(true)}>
                    <Trash2 className="discard-icon" />
                    <span>{playerDiscardPile.length}</span>
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
              {playerHand.map((card: CardInstance, index: number) => (
                <Card
                  key={card.instanceId}
                  card={card}
                  onClick={() => handleCardAction(card)}
                  isSelected={selectedCard?.instanceId === card.instanceId}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                  disabled={(tempEnergy !== null ? tempEnergy : playerEnergy) < card.cost && !selectingCardForEffect}
                  isBeingDiscarded={cardsBeingDiscarded.includes(card)}
                  isTopCard={index === 0 && showDiscardTooltip}
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

            {showDeckModal && (
              <DeckModal 
                cards={playerDeck} 
                onClose={() => setShowDeckModal(false)} 
                title="Your Deck" 
              />
            )}

            {showDiscardModal && (
              <DeckModal 
                cards={playerDiscardPile} 
                onClose={() => setShowDiscardModal(false)} 
                title="Discard Pile" 
              />
            )}
          </div>
        );
      }}
    </BattleLogic>
  );
};

interface DeckModalProps {
  cards: CardType[];
  onClose: () => void;
  title: string;
}

const DeckModal: React.FC<DeckModalProps> = ({ cards, onClose, title }) => {
  return (
    <div className="deck-modal">
      <div className="modal-content">
        <h2>{title}</h2>
        <div className="card-grid">
          {cards.map((card, index) => (
            <Card key={index} card={card} isCompact={true} />
          ))}
        </div>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default BattleScreen;
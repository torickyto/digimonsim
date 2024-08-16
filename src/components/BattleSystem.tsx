import React, { useState, useEffect } from 'react';
import { Digimon, CardType, BattleState } from '../shared/types';
import Card from './Card';
import DigimonSprite from './DigimonSprite';
import { createDeck, shuffleArray } from '../utils/deckUtils';
import './BattleSystem.css';

interface BattleSystemProps {
  playerTeam: Digimon[];
  enemy: Digimon;
  onBattleEnd: (playerWon: boolean) => void;
}

const BattleSystem: React.FC<BattleSystemProps> = ({ playerTeam, enemy, onBattleEnd }) => {
  const [turn, setTurn] = useState(1);
  const [playerEnergy, setPlayerEnergy] = useState(6);
  const [playerDeck, setPlayerDeck] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [playerDiscardPile, setPlayerDiscardPile] = useState<CardType[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [enemyBlock, setEnemyBlock] = useState(0); 
  const [playerTeamHp, setPlayerTeamHp] = useState(playerTeam.map(d => d.hp));

  useEffect(() => {
    const initialDeck = createDeck(playerTeam);
    const shuffledDeck = shuffleArray(initialDeck);
    setPlayerDeck(shuffledDeck);
    drawInitialHand(shuffledDeck);
  }, [playerTeam]);

  const drawInitialHand = (deck: CardType[]) => {
    const initialHandSize = 3 + playerTeam.length;
    setPlayerHand(deck.slice(0, initialHandSize));
    setPlayerDeck(deck.slice(initialHandSize));
  };

  const drawCard = () => {
    if (playerDeck.length === 0) {
      if (playerDiscardPile.length === 0) return;
      const shuffledDiscard = shuffleArray(playerDiscardPile);
      setPlayerDeck(shuffledDiscard);
      setPlayerDiscardPile([]);
    }
    const [newCard, ...remainingDeck] = playerDeck;
    setPlayerHand(prev => [...prev, newCard]);
    setPlayerDeck(remainingDeck);
  };

  const playCard = (card: CardType) => {
    if (playerEnergy < card.cost) return;

    setPlayerEnergy(prev => prev - card.cost);
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    setPlayerDiscardPile(prev => [...prev, card]);

    // Implement card effects here
    switch (card.type) {
      case 'attack':
        setEnemyHp(prev => Math.max(0, prev - (card.damage || 0)));
        break;
      case 'block':
        // Implement block logic
        break;
      case 'special':
        if (card.effect) {
          const battleState: BattleState = {
            playerEnergy,
            playerHand,
            playerDeck,
            playerDiscardPile,
            enemyHp,
            enemyBlock
          };
          card.effect(playerTeam[0], enemy, battleState);
        }
        break;
    }

    setSelectedCardId(null);
  };

  const handleCardClick = (card: CardType) => {
    setSelectedCardId(prev => prev === card.id ? null : card.id);
  };

  const endTurn = () => {
    setTurn(prev => prev + 1);
    setPlayerEnergy(6);
    drawCard();
    // Implement enemy turn logic here
  };

  const discardSelected = () => {
    if (selectedCardId === null) return;
    const cardToDiscard = playerHand.find(card => card.id === selectedCardId);
    if (!cardToDiscard) return;

    setPlayerHand(prev => prev.filter(card => card.id !== selectedCardId));
    setPlayerDiscardPile(prev => [...prev, cardToDiscard]);
    setSelectedCardId(null);
  };

  return (
    <div className="battle-system">
      <div className="top-bar">
        <div className="turn-display">TURN {turn}</div>
        <div className="energy-gauge">
          Gauge {playerEnergy}
          {[...Array(6)].map((_, i) => (
            <span key={i} className={`energy-star ${i < playerEnergy ? 'active' : ''}`}>★</span>
          ))}
        </div>
        <div className="button-container">
          <button onClick={endTurn}>END TURN</button>
          <button onClick={discardSelected} disabled={selectedCardId === null}>DISCARD</button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="card-list">
          {playerHand.map(card => (
            <Card 
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card)}
              isSelected={card.id === selectedCardId}
            />
          ))}
        </div>
        
        <div className="battle-area">
          <div className="enemy-area">
            <DigimonSprite name={enemy.name} />
            <div>{enemy.name}</div>
            <div className="hp-bar">
              <div className="hp-fill" style={{width: `${(enemyHp / enemy.maxHp) * 100}%`}}></div>
              <span>{enemyHp}/{enemy.maxHp}</span>
            </div>
          </div>
          
          <div className="player-area">
            {playerTeam.map((digimon, index) => (
              <div key={digimon.id} className="player-digimon">
                <DigimonSprite name={digimon.name} />
                <div>{digimon.name}</div>
                <div className="hp-bar">
                  <div className="hp-fill" style={{width: `${(playerTeamHp[index] / digimon.maxHp) * 100}%`}}></div>
                  <span>{playerTeamHp[index]}/{digimon.maxHp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleSystem;
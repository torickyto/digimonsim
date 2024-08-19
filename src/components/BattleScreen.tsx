// BattleScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { GameState, Card, Digimon, BattleAction } from '../shared/types';
import { initializeBattle, startPlayerTurn, playCard, endPlayerTurn, executeEnemyTurn, checkBattleEnd } from '../game/battle';
import DigimonSprite from './DigimonSprite';
import CompactCard from './CompactCard';
import './BattleScreen.css';
import './BattleScreenAnimations.css';

interface BattleScreenProps {
  playerTeam: Digimon[];
  enemyTeam: Digimon[];
  onBattleEnd: (result: 'win' | 'lose') => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerTeam, enemyTeam, onBattleEnd }) => {
  const [gameState, setGameState] = useState<GameState>(() => initializeBattle(playerTeam, enemyTeam));
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationQueue = useRef<BattleAction[]>([]);

  useEffect(() => {
    processAnimations();
  }, [gameState]);

  const processAnimations = async () => {
    if (isAnimating || animationQueue.current.length === 0) return;

    setIsAnimating(true);
    const action = animationQueue.current.shift()!;
    await animateAction(action);
    setIsAnimating(false);
    processAnimations();
  };

  useEffect(() => {
    setGameState(startPlayerTurn(gameState));
  }, []);

  const animateAction = async (action: BattleAction) => {
    switch (action.type) {
      case 'DRAW_CARD':
        await animateCardDraw(action.card);
        break;
      case 'BURN_CARD':
        await animateCardBurn(action.card);
        break;
      case 'SHUFFLE_DISCARD_TO_DECK':
        await animateShuffleDiscardToDeck();
        break;
      // ... handle other action types
    }
  };

  const animateCardDraw = async (card: Card) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card-animation', 'draw');
    cardElement.style.backgroundImage = `url('/assets/cards/${card.id}.png')`;
    document.querySelector('.battle-screen')?.appendChild(cardElement);

    await new Promise(resolve => setTimeout(resolve, 500)); // Duration of the animation

    cardElement.remove();
    // Update the UI to show the new card in the player's hand
    setGameState(prevState => ({
      ...prevState,
      player: {
        ...prevState.player,
        hand: [...prevState.player.hand, card]
      }
    }));
  };

   const animateCardBurn = async (card: Card) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card-animation', 'burn');
    cardElement.style.backgroundImage = `url('/assets/cards/${card.id}.png')`;
    document.querySelector('.battle-screen')?.appendChild(cardElement);

    await new Promise(resolve => setTimeout(resolve, 1000)); // Duration of the animation

    cardElement.remove();
    // Update the UI to show the card has been discarded
    setGameState(prevState => ({
      ...prevState,
      player: {
        ...prevState.player,
        discardPile: [...prevState.player.discardPile, card]
      }
    }));
  };

  const animateShuffleDiscardToDeck = async () => {
    const discardPile = document.querySelector('.discard-pile');
    const deck = document.querySelector('.deck');

    if (discardPile && deck) {
      discardPile.classList.add('shuffle');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Duration of the shuffle animation
      discardPile.classList.remove('shuffle');
    }

    // Update the game state to reflect the shuffle
    setGameState(prevState => ({
      ...prevState,
      player: {
        ...prevState.player,
        deck: [...prevState.player.deck, ...prevState.player.discardPile],
        discardPile: []
      }
    }));
  };

  const handleCardClick = (card: Card) => {
    if (gameState.player.energy >= card.cost) {
      setSelectedCard(card);
    }
  };

  const handleCardPlay = (targetIndex: number) => {
    if (selectedCard) {
      const updatedState = playCard(gameState, gameState.player.hand.indexOf(selectedCard), { targetType: selectedCard.target, sourceDigimonIndex: 0, targetDigimonIndex: targetIndex });
      setGameState(updatedState);
      setSelectedCard(null);
    }
  };

  const handleEndTurn = () => {
    let updatedState = endPlayerTurn(gameState);
    updatedState = executeEnemyTurn(updatedState);
    const battleResult = checkBattleEnd(updatedState);
    
    if (battleResult === 'ongoing') {
      updatedState = startPlayerTurn(updatedState);
      setGameState(updatedState);
    } else {
      onBattleEnd(battleResult === 'player_win' ? 'win' : 'lose');
    }
  };

  const handleDiscard = () => {
    if (gameState.player.hand.length > 0) {
      const updatedState = { ...gameState };
      const discardedCard = updatedState.player.hand.pop()!;
      updatedState.player.discardPile.push(discardedCard);
      setGameState(updatedState);
    }
  };

  return (
    <div className="battle-screen">
      <div className="battle-background"></div>
      <div className="top-bar">
        <button className="discard-button" onClick={handleDiscard}>Discard</button>
        <div className="deck-info">
          <span>Deck: {gameState.player.deck.length}</span>
          <span>Discard: {gameState.player.discardPile.length}</span>
        </div>
        <button className="end-turn-button" onClick={handleEndTurn}>End Turn</button>
      </div>
      
      <div className="battle-area">
        <div className="enemy-digimon">
          <DigimonSprite name={gameState.enemy.digimon[0].name} />
        </div>
        <div className="player-digimon">
          {playerTeam.map((digimon, index) => (
            <DigimonSprite key={index} name={digimon.name} />
          ))}
        </div>
      </div>

      <div className="deck"></div>
      <div className="discard-pile"></div>
      
      <div className="hand-area">
        {gameState.player.hand.map((card, index) => (
          <CompactCard 
            key={index} 
            card={card} 
            onClick={() => handleCardClick(card)}
            isSelected={selectedCard === card}
            disabled={gameState.player.energy < card.cost}
          />
        ))}
      </div>
      
      <div className="bottom-bar">
        {playerTeam.map((digimon, index) => (
          <div key={index} className="digimon-info">
            <img src={`/assets/images/${digimon.name}-icon.png`} alt={digimon.displayName} />
            <span>{digimon.displayName}</span>
            <span>{digimon.hp}/{digimon.maxHp}</span>
            <div className="hp-bar">
              <div className="hp-fill" style={{width: `${(digimon.hp / digimon.maxHp) * 100}%`}}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleScreen;
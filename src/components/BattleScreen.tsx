import React, { useState, useEffect, useRef } from 'react';
import { GameState, Card, Digimon, BattleAction } from '../shared/types';
import { initializeBattle, startPlayerTurn, playCard, endPlayerTurn, executeEnemyTurn, checkBattleEnd} from '../game/battle';
import DigimonSprite from './DigimonSprite';
import CompactCard from './CompactCard';
import './BattleScreen.css';
import './BattleScreenAnimations.css';
import CardPileModal from './CardPileModal';


interface BattleScreenProps {
  playerTeam: Digimon[];
  enemyTeam: Digimon[];
  onBattleEnd: (result: 'win' | 'lose') => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerTeam, enemyTeam, onBattleEnd }) => {
  const [gameState, setGameState] = useState<GameState>(() => initializeBattle(playerTeam, enemyTeam));
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [spriteScale, setSpriteScale] = useState(1);
  const battleScreenRef = useRef<HTMLDivElement>(null);
  const [isDiscardHovered, setIsDiscardHovered] = useState(false);
  const previousHandRef = useRef<Card[]>([]);
  const [newlyDrawnCards, setNewlyDrawnCards] = useState<string[]>([]);
  const [handKey, setHandKey] = useState(0);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [shuffledDeckForDisplay, setShuffledDeckForDisplay] = useState<Card[]>([]);

  useEffect(() => {
    const initialState = startPlayerTurn(gameState);
    setGameState(initialState);
    setHandKey(prevKey => prevKey + 1); // Force re-render for initial hand
  }, []);


  useEffect(() => {
    const updateScaleFactor = () => {
        if (battleScreenRef.current) {
            const battleBackground = battleScreenRef.current.querySelector('.battle-background');
            if (battleBackground) {
                const { width, height } = battleBackground.getBoundingClientRect();
                const uiScaleFactor = Math.min(1, width / 1280, height / 720);
                battleScreenRef.current.style.setProperty('--scale-factor', uiScaleFactor.toString());

                const scale = Math.min(width / 1280, height / 720);
                setSpriteScale(scale);
            }
        }
    };

    updateScaleFactor();
    window.addEventListener('resize', updateScaleFactor);
    return () => window.removeEventListener('resize', updateScaleFactor);
}, []);
  
  useEffect(() => {
    setGameState(startPlayerTurn(gameState));
  }, []);

  useEffect(() => {
    console.log('Hand changed. Current hand:', gameState.player.hand);
    console.log('Previous hand:', previousHandRef.current);
  
    const currentHand = gameState.player.hand;
    const newCards = currentHand.filter(card => 
      !previousHandRef.current.some(prevCard => prevCard.instanceId === card.instanceId)
    );
    
    console.log('New cards:', newCards);
  
    if (newCards.length > 0) {
      setNewlyDrawnCards(newCards.map(card => card.instanceId ?? '').filter(id => id !== ''));
      setHandKey(prevKey => prevKey + 1); // Force re-render of hand area
    }
    
    const timer = setTimeout(() => {
      setNewlyDrawnCards([]);
    }, 600); // Slightly longer than the animation duration to ensure it completes

    previousHandRef.current = [...currentHand];

    return () => clearTimeout(timer);
  }, [gameState.player.hand]);

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
        hand: prevState.player.hand.slice(1),
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
    if (gameState.player.ram >= card.cost) {
      setSelectedCard(card);
    }
  };

  const handleCardPlay = (targetIndex: number) => {
    if (selectedCard) {
      const cardIndex = gameState.player.hand.findIndex(card => card.instanceId === selectedCard.instanceId);
      if (cardIndex !== -1) {
        const updatedState = playCard(gameState, cardIndex, {
          targetType: selectedCard.target,
          sourceDigimonIndex: 0,
          targetDigimonIndex: targetIndex,
        });
        setGameState(updatedState);
        setSelectedCard(null);
      }
    }
  };

  const handleEndTurn = () => {
    let updatedState = endPlayerTurn(gameState);
    updatedState = executeEnemyTurn(updatedState);
    const battleResult = checkBattleEnd(updatedState);
  
    if (battleResult === 'ongoing') {
      updatedState = startPlayerTurn(updatedState);
      setGameState(updatedState);
      
      // Force re-render and set newly drawn card
      const newCards = updatedState.player.hand.filter(card => 
        !previousHandRef.current.some(prevCard => prevCard.instanceId === card.instanceId)
      );
      setNewlyDrawnCards(newCards.map(card => card.instanceId ?? '').filter(id => id !== ''));
      setHandKey(prevKey => prevKey + 1);
      
      // Update the previous hand reference
      previousHandRef.current = [...updatedState.player.hand];
      
      // Clear the newly drawn cards after animation
      setTimeout(() => {
        setNewlyDrawnCards([]);
      }, 600);
    } else {
      onBattleEnd(battleResult === 'player_win' ? 'win' : 'lose');
    }
  };
  
  const handleDiscard = () => {
    if (gameState.player.hand.length > 0) {
      const discardedCard = gameState.player.hand[0];
      
      // Create and append the card animation element
      const cardElement = document.createElement('div');
      cardElement.classList.add('card-animation', 'burn');
      
      // Position the card element
      const handArea = document.querySelector('.hand-area');
      if (handArea) {
        const firstCard = handArea.firstElementChild as HTMLElement;
        if (firstCard) {
          const rect = firstCard.getBoundingClientRect();
          cardElement.style.position = 'fixed';
          cardElement.style.left = `${rect.left}px`;
          cardElement.style.top = `${rect.top}px`;
          cardElement.style.width = `${rect.width}px`;
          cardElement.style.height = `${rect.height}px`;
  
          const cardImage = firstCard.querySelector('.card-image') as HTMLImageElement;
          if (cardImage) {
            cardElement.style.backgroundImage = `url(${cardImage.src})`;
            cardElement.style.backgroundSize = 'cover';
            cardElement.style.backgroundPosition = 'center';
          }
        }
      }
      
      document.body.appendChild(cardElement);

      setGameState(prevState => ({
        ...prevState,
        player: {
          ...prevState.player,
          hand: prevState.player.hand.slice(1),
        }
      }));
      // Play the burn animation
      setTimeout(() => {
        cardElement.remove();
        
        // Update the game state after the animation
        setGameState(prevState => ({
          ...prevState,
          player: {
            ...prevState.player,
            discardPile: [discardedCard, ...prevState.player.discardPile]
          }
        }));
      }, 1000); // Duration of the animation
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleDeckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShuffledDeckForDisplay(shuffleArray([...gameState.player.deck]));
    setIsDeckModalOpen(true);
  };

  const handleDiscardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDiscardModalOpen(true);
  };

  return (
    <div className="battle-screen-container">
      <div className="battle-screen" ref={battleScreenRef}>
        <div className="battle-background"></div>
        <div className="top-bar">
          <div className="left-controls">
            <div className="button-container">
            <button 
                className="discard-button"
                onClick={handleDiscard}
                onMouseEnter={() => setIsDiscardHovered(true)}
                onMouseLeave={() => setIsDiscardHovered(false)}
              >
                Discard
              </button>
              <button 
          className="end-turn-button" 
          onClick={handleEndTurn} 
          disabled={isAnimating}
        >End Turn</button>
            </div>
            <div className="ram-and-deck">
      <div className="ram-info">
        <span className="ram-label">RAM</span>
        <span className="ram-text">{gameState.player.ram}</span>
        <div className="ram-crystals">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`ram-crystal ${i < gameState.player.ram ? 'filled' : 'empty'}`}
            ></div>
          ))}
        </div>
      </div>
      <div className="deck-info" onClick={handleDeckClick}>
            <div className="deck-icon">D</div>
            <span className="deck-count">{gameState.player.deck.length}</span>
          </div>
          <div className="discard-info" onClick={handleDiscardClick}>
            <div className="discard-icon">X</div>
            <span className="discard-count">{gameState.player.discardPile.length}</span>
          </div>
            </div>
          </div>
          <div className="turn-display">
            TURN {gameState.turn}
          </div>
        </div>
        <div className="battle-area">
          <div className="enemy-digimon">
            <DigimonSprite 
              name={gameState.enemy.digimon[0].name} 
              scale={spriteScale * 1.75}
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '0',
                transform: 'translateX(-50%)',
              }}
            />
          </div>
          <div className="player-digimon">
            {playerTeam.map((digimon, index) => (
              <DigimonSprite 
                key={index} 
                name={digimon.name} 
                scale={spriteScale * 1.6}
                style={{
                  position: 'absolute',
                  left: `${16.67 + index * 33.33}%`,
                  bottom: '0',
                  transform: 'translateX(-50%)',
                }}
              />
            ))}
          </div>
        </div>
        <div className="hand-area" key={handKey}>
      {gameState.player.hand.map((card, index) => (
        <CompactCard 
          key={card.instanceId ?? index}
          card={card} 
          onClick={() => handleCardClick(card)}
          isSelected={selectedCard?.instanceId === card.instanceId}
          isPlayable={gameState.player.ram >= card.cost}
          isTopCard={index === 0 && isDiscardHovered}
          isNewlyDrawn={card.instanceId ? newlyDrawnCards.includes(card.instanceId) : false}
        />
      ))}
    </div>
        <div className="bottom-bar">
          {playerTeam.map((digimon, index) => (
            <div key={index} className="digimon-info">
              <span className="digimon-name">{digimon.displayName}</span>
              <div className="hp-container">
                <span className="hp-number">{digimon.hp}/{digimon.maxHp}</span>
                <div className="hp-bar">
                  <div className="hp-fill" style={{ width: `${(digimon.hp / digimon.maxHp) * 100}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <CardPileModal
          isOpen={isDeckModalOpen}
          onClose={() => setIsDeckModalOpen(false)}
          cards={shuffledDeckForDisplay}
          title="Draw Pile"
        />
      <CardPileModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        cards={gameState.player.discardPile}
        title="Discard Pile"
      />
      </div>
    </div>
  );
};

export default BattleScreen;
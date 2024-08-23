import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Card, Digimon, BattleAction } from '../shared/types';
import { initializeBattle, startPlayerTurn, playCard, endPlayerTurn, executeEnemyTurn, checkBattleEnd} from '../game/battle';
import DigimonSprite from './DigimonSprite';
import CompactCard from './CompactCard';
import FullCardDisplay from './FullCardDisplay';
import RamDisplay from './RamDisplay';
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
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [highlightedRam, setHighlightedRam] = useState(0);
  const [parentDimensions, setParentDimensions] = useState({ width: 0, height: 0 });
  const [isShuffling, setIsShuffling] = useState(false);
  const [targetingDigimon, setTargetingDigimon] = useState(false);
  const [attackingDigimon, setAttackingDigimon] = useState<number | null>(null);
  const [hitDigimon, setHitDigimon] = useState<{ isEnemy: boolean, index: number } | null>(null);
  const [battleStarting, setBattleStarting] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [showSpiralWipe, setShowSpiralWipe] = useState(false);
  const [showBattleField, setShowBattleField] = useState(false);
  const [showGlitchTransition, setShowGlitchTransition] = useState(true);
  const [showOpeningAttacks, setShowOpeningAttacks] = useState(false);
  const [initialAnimationComplete, setInitialAnimationComplete] = useState(false);
  const [openingAttacksComplete, setOpeningAttacksComplete] = useState(false);
  


  useEffect(() => {
    if (battleStarting) {
      setTimeout(() => setShowWarning(false), 1000);
      setTimeout(() => setShowGlitchTransition(true), 1000);
      setTimeout(() => {
        setShowGlitchTransition(false);
        setShowBattleField(true);
      }, 1000);
      setTimeout(() => {
        setBattleStarting(false);
        setShowOpeningAttacks(true);
      }, 1100);
    }
  }, [battleStarting]);

  useEffect(() => {
    if (showOpeningAttacks) {
      const totalDigimon = playerTeam.length + enemyTeam.length;
      let attacksCompleted = 0;

      const triggerAttacks = () => {
        setAttackingDigimon(0);
        setTimeout(() => {
          setAttackingDigimon(null);
          attacksCompleted++;
          if (attacksCompleted < totalDigimon) {
            setTimeout(triggerAttacks, 200);
          } else {
            setOpeningAttacksComplete(true);
          }
        }, 10);
      };

      triggerAttacks();
    }
  }, [showOpeningAttacks, playerTeam.length, enemyTeam.length]);

  useEffect(() => {
    if (openingAttacksComplete) {
      const initialState = startPlayerTurn(gameState);
      setGameState(initialState);
      setHandKey(prevKey => prevKey + 1); // Force re-render for initial hand
    }
  }, [openingAttacksComplete]);

  useEffect(() => {
    const initialState = startPlayerTurn(gameState);
    setGameState(initialState);
    setHandKey(prevKey => prevKey + 1); // Force re-render for initial hand
  }, []);

  const processActionQueue = useCallback(() => {
    console.log('Processing action queue:', gameState.actionQueue);
    gameState.actionQueue.forEach(action => {
      switch (action.type) {
        case 'ANIMATE_ATTACK':
          console.log('ANIMATE_ATTACK action:', action);
          if (action.isEnemy) {
            console.log(`Enemy attacking: ${action.sourceIndex}, Player hit: ${action.targetIndex}`);
            setAttackingDigimon(null);
            setHitDigimon({ isEnemy: false, index: action.targetIndex });
          } else {
            console.log(`Player attacking: ${action.sourceIndex}, Enemy hit: ${action.targetIndex}`);
            setAttackingDigimon(action.sourceIndex);
            setHitDigimon({ isEnemy: true, index: action.targetIndex });
          }
          setTimeout(() => {
            console.log('Resetting attack/hit states');
            setAttackingDigimon(null);
            setHitDigimon(null);
          }, 600);
          break;
        case 'ENEMY_ACTION':
          console.log('ENEMY_ACTION:', action);
          setAttackingDigimon(action.attackingEnemyIndex);
          setHitDigimon({ isEnemy: false, index: action.targetPlayerIndex });
          setTimeout(() => {
            console.log('Resetting enemy attack/hit states');
            setAttackingDigimon(null);
            setHitDigimon(null);
          }, 600);
          break;
      }
    });
  
    setGameState(prevState => {
      console.log('Clearing action queue');
      return { ...prevState, actionQueue: [] };
    });
  }, [gameState.actionQueue, setGameState]);

  useEffect(() => {
    console.log('Action queue changed, processing...');
    processActionQueue();
  }, [gameState.actionQueue, processActionQueue]);

  useEffect(() => {
    console.log('attackingDigimon:', attackingDigimon);
    console.log('hitDigimon:', hitDigimon);
  }, [attackingDigimon, hitDigimon]);

  

  useEffect(() => {
    // listener for the Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        deselectCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
  console.log("Player Digimon Shields:");
  gameState.player.digimon.forEach((digimon, index) => {
    console.log(`Player Digimon ${index}: ${digimon.displayName}, Shield: ${digimon.shield}`);
  });

  console.log("Enemy Digimon Shields:");
  gameState.enemy.digimon.forEach((digimon, index) => {
    console.log(`Enemy Digimon ${index}: ${digimon.displayName}, Shield: ${digimon.shield}`);
  });
}, [gameState]);

  const deselectCard = () => {
    setSelectedCard(null);
    setHighlightedRam(0);
  };

  const handleBackgroundClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      deselectCard();
    }
  };

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
    const updateDimensions = () => {
      if (battleScreenRef.current) {
        setParentDimensions({
          width: battleScreenRef.current.offsetWidth,
          height: battleScreenRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
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

  const shuffleDiscardIntoDeck = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setGameState(prevState => ({
        ...prevState,
        player: {
          ...prevState.player,
          deck: [...prevState.player.deck, ...prevState.player.discardPile].sort(() => Math.random() - 0.5),
          discardPile: []
        }
      }));
      setIsShuffling(false);
    }, 1000); // Duration of the shuffle animation
  };

  const handleCardClick = (card: Card) => {
    if (gameState.player.ram >= card.cost) {
      if (selectedCard && selectedCard.instanceId === card.instanceId) {
        deselectCard();
      } else {
        setSelectedCard(card);
        setHighlightedRam(card.cost);
        setTargetingDigimon(true);
      }
    }
  };

  const handleEndTurn = () => {
    deselectCard();
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
    deselectCard();
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

  const handleDigimonClick = (isEnemy: boolean, index: number) => {
    if (targetingDigimon && selectedCard) {
      const cardIndex = gameState.player.hand.findIndex(card => card.instanceId === selectedCard.instanceId);
      if (cardIndex !== -1) {
        let targetInfo = {
          targetType: selectedCard.target,
          sourceDigimonIndex: selectedCard.ownerDigimonIndex,
          targetDigimonIndex: index,
        };
  
        // If the card targets self or ally, but an enemy was clicked, target the player's Digimon
        if ((selectedCard.target === 'self' || selectedCard.target === 'single_ally') && isEnemy) {
          targetInfo.targetDigimonIndex = 0; // for now have the target be at index 0
        }
  
        // Set attacking and hit states immediately
        setAttackingDigimon(targetInfo.sourceDigimonIndex);
        setHitDigimon({ isEnemy, index: targetInfo.targetDigimonIndex });
  
        // Play the card and update the game state
        const updatedState = playCard(gameState, cardIndex, targetInfo);
        setGameState(updatedState);
  
        // Reset states after a short delay
        setTimeout(() => {
          setAttackingDigimon(null);
          setHitDigimon(null);
          setSelectedCard(null);
          setTargetingDigimon(false);
          setHighlightedRam(0);
        }, 600); 
      }
    }
  };

  const handleEnemyClick = (index: number) => {
    handleDigimonClick(true, index);
  };

  const handlePlayerDigimonClick = (index: number) => {
    handleDigimonClick(false, index);
  };


  const handleCardHover = (card: Card, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const battleScreenRect = battleScreenRef.current?.getBoundingClientRect();
    if (battleScreenRect) {
      setHoveredCard(card);
      setHoverPosition({ 
        x: rect.right - battleScreenRect.left, 
        y: rect.top - battleScreenRect.top 
      });
      setHighlightedRam(card.cost);
    }
  };

  const handleCardHoverEnd = () => {
    setHoveredCard(null);
    setHighlightedRam(selectedCard ? selectedCard.cost : 0);
  };

  return (
    <div className="battle-screen-container">
      <div className={`battle-screen ${battleStarting ? 'battle-starting' : ''}`} ref={battleScreenRef} onClick={handleBackgroundClick}>
        {battleStarting && (
          <div className="battle-start-overlay">
            {showWarning && <div className="warning-sign">WARNING!</div>}
            {showGlitchTransition && (
              <div className={`glitch-transition ${showBattleField ? 'fade-out' : ''}`}>
                <div className="glitch-line" style={{top: '25%'}}></div>
                <div className="glitch-line" style={{top: '50%'}}></div>
                <div className="glitch-line" style={{top: '75%'}}></div>
                <div className="glitch-text" style={{top: '40%', left: '10%'}}>INITIALIZING BATTLE</div>
                <div className="glitch-text" style={{top: '60%', left: '60%'}}>LOADING DIGIMON DATA</div>
                <div className="digital-noise"></div>
              </div>
            )}
          </div>
        )}
        <div className={`battle-content ${showBattleField ? 'show' : ''}`}>
          <div className="battle-background"></div>
          {openingAttacksComplete && (<>
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
        <RamDisplay
              currentRam={gameState.player.ram}
              maxRam={10}
              highlightedRam={highlightedRam}
            />
        </div>
      </div>
      <div className={`deck-info ${isShuffling ? 'shuffling' : ''}`} onClick={handleDeckClick}>
            <div className="deck-icon">D</div>
            <span className="deck-count">{gameState.player.deck.length}</span>
          </div>
          <div className={`discard-info ${isShuffling ? 'shuffling' : ''}`} onClick={handleDiscardClick}>
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
  {gameState.enemy.digimon.map((digimon, index) => (
    <div key={index} className="enemy-digimon-container" onClick={() => handleEnemyClick(index)}>
      <DigimonSprite 
        name={digimon.name} 
        scale={spriteScale * 1.75}
        isAttacking={attackingDigimon === index && hitDigimon?.isEnemy === false}
        isOnHit={hitDigimon?.isEnemy && hitDigimon.index === index}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '0',
          transform: 'translateX(-50%)',
        }}
      />
                <div className="enemy-health-bar">
        <div className="health-fill" style={{ width: `${(digimon.hp / digimon.maxHp) * 100}%` }}></div>
        <span className="enemy-hp-number">{`${digimon.hp}/${digimon.maxHp}`}</span>
      </div>
      <div className="enemy-info-tooltip">
        {digimon.displayName} - Type: {digimon.type}
      </div>
      {digimon.shield > 0 && (
        <div className="shield-bar">
          <div 
            className="shield-fill" 
            style={{ width: `${(digimon.shield / digimon.maxHp) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  ))}
</div>
          <div className="player-digimon">
            {gameState.player.digimon.map((digimon, index) => (
              <div key={index} className="player-digimon-container" onClick={() => handlePlayerDigimonClick(index)}>
                <DigimonSprite 
                  name={digimon.name} 
                  scale={spriteScale * 1.6}
                  isAttacking={attackingDigimon === index && hitDigimon?.isEnemy === true}
                  isOnHit={hitDigimon?.isEnemy === false && hitDigimon.index === index}
                  style={{
                    position: 'absolute',
                    left: `${16.67 + index * 33.33}%`,
                    bottom: '0',
                    transform: 'translateX(-50%)',
  }}
/>
              </div>
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
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardHoverEnd}
            />
          ))}
    </div>
    {hoveredCard && (
          <FullCardDisplay 
          card={hoveredCard} 
          position={hoverPosition} 
          attacker={gameState.player.digimon[hoveredCard.ownerDigimonIndex]}
        />
        )}
       <div className="bottom-bar">
          {gameState.player.digimon.map((digimon, index) => (
            <div key={index} className="digimon-info">
              <span className="digimon-name">{digimon.displayName}</span>
              
              <div className="hp-container">
                <span className="hp-number">{digimon.hp}/{digimon.maxHp}</span>
                <div className="hp-bar">
                  <div 
                    className="hp-fill" 
                    style={{ width: `${(digimon.hp / digimon.maxHp) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="shield-container">
                <span className="shield-icon">🛡️</span>
                <span className="shield-number">{digimon.shield || 0}</span>
                <div className="shield-bar">
                  <div 
                    className="shield-fill" 
                    style={{ width: `${((digimon.shield || 0) / digimon.maxHp) * 100}%` }}
                  ></div>
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
       </>
          )}
          </div>
      </div>
    </div>
  );
};

export default BattleScreen;
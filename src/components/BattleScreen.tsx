import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Card, Digimon, BattleAction, TargetType, TargetInfo, EnemyAction } from '../shared/types';
import { initializeBattle, startPlayerTurn, playCard, endPlayerTurn, executeEnemyTurn, checkBattleEnd, applyDamage as battleApplyDamage} from '../game/battle';
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
  backgroundImage?: string; 
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerTeam, enemyTeam, onBattleEnd, backgroundImage }) => {
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
  const [showBattleField, setShowBattleField] = useState(false);
  const [showGlitchTransition, setShowGlitchTransition] = useState(true);
  const [showOpeningAttacks, setShowOpeningAttacks] = useState(false);
  const [initialAnimationComplete, setInitialAnimationComplete] = useState(false);
  const [openingAttacksComplete, setOpeningAttacksComplete] = useState(false);
  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [shouldProcessQueue, setShouldProcessQueue] = useState(false);
  const [currentEnemyActionIndex, setCurrentEnemyActionIndex] = useState(0);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [attackingEnemyDigimon, setAttackingEnemyDigimon] = useState<number | null>(null);
  const [removedCards, setRemovedCards] = useState<{ [digimonIndex: number]: Card[] }>({});
  
  


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
  
    gameState.player.digimon.forEach((digimon, index) => {
      
    });
  
   
    gameState.enemy.digimon.forEach((digimon, index) => {
     
    });
  }, [gameState]);

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


  const processEnemyTurn = useCallback((state: GameState) => {
    console.log('Processing enemy turn');
    const enemyState = executeEnemyTurn(state);
    setGameState(enemyState);
    setCurrentEnemyActionIndex(0);
    setShouldProcessQueue(true);
  }, [executeEnemyTurn]);



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
    console.log('Newly drawn cards:', newlyDrawnCards);
  
    if (newlyDrawnCards.length > 0) {
      const timer = setTimeout(() => {
        setNewlyDrawnCards([]);
      }, 600); 
  
      return () => clearTimeout(timer);
    }
  }, [gameState.player.hand, newlyDrawnCards]);

  const animateCardBurn = useCallback(async (card: Card) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card-animation', 'burn');
    cardElement.style.backgroundImage = `url(${require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)})`;
    
    // Position the card element
    const battleScreen = document.querySelector('.battle-screen');
    if (battleScreen) {
      const rect = battleScreen.getBoundingClientRect();
      cardElement.style.position = 'fixed';
      cardElement.style.left = `${rect.left + rect.width / 2}px`;
      cardElement.style.top = `${rect.top + rect.height / 2}px`;
      cardElement.style.width = `${rect.width * 0.1}px`;
      cardElement.style.height = `${rect.height * 0.2}px`;
    }
    
    document.body.appendChild(cardElement);
  
    await new Promise(resolve => setTimeout(resolve, 1000)); // Duration of the animation
  
    cardElement.remove();
  }, []);


  const shuffleDiscardIntoDeck = () => { //NEED TO BE RE-IMPLEMENTED WITH ANIM
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
    if (isEnemyTurn) return;
    
    deselectCard();
    const updatedState = endPlayerTurn(gameState);
    setGameState(updatedState);
    setIsEnemyTurn(true);
    setHitDigimon(null);
    processEnemyTurn(updatedState);
  };

  const handleDiscard = () => {
    if (gameState.player.hand.length > 0) {
      const discardedCard = gameState.player.hand[0];
      console.log(`discard button clicked. card discarded`);
      
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
  
      // Update the game state immediately to remove the card from hand
      setGameState(prevState => ({
        ...prevState,
        player: {
          ...prevState.player,
          hand: prevState.player.hand.slice(1),
          discardPile: [discardedCard, ...prevState.player.discardPile]
        },
        cardsDiscardedThisTurn: prevState.cardsDiscardedThisTurn + 1,
        cardsDiscardedThisBattle: prevState.cardsDiscardedThisBattle + 1
      }));
  
      // Play the burn animation
      setTimeout(() => {
        cardElement.remove();
      }, 1000); // Duration of the animation
  
      // Add a DISCARD_CARD action to the queue
      setGameState(prevState => ({
        ...prevState,
        actionQueue: [...prevState.actionQueue, { type: 'DISCARD_CARD', card: discardedCard }]
      }));
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

  const doesCardAffectTarget = (card: Card, isEnemy: boolean): boolean => {
    return card.effects.some(effect => 
      (effect.damage && ['enemy', 'all_enemies', 'random_enemy'].includes(effect.damage.target)) ||
      (effect.applyStatus && effect.applyStatus.type !== 'bugged' && isEnemy) ||
      (effect.shield && ['enemy', 'all_enemies', 'random_enemy'].includes(effect.shield.target))
    );
  };


  const handleDigimonClick = (isEnemy: boolean, index: number) => {
    if (targetingDigimon && selectedCard) {
      const cardIndex = gameState.player.hand.findIndex(card => card.instanceId === selectedCard.instanceId);
      if (cardIndex !== -1) {
        let targetInfo: TargetInfo = {
          targetType: isEnemy ? 'enemy' : 'single_ally' as TargetType,
          sourceDigimonIndex: selectedCard.ownerDigimonIndex,
          targetDigimonIndex: index,
        };
  
        // Set attacking state for the player's Digimon
        setAttackingDigimon(selectedCard.ownerDigimonIndex);
  
        // Only set hitDigimon if the card affects the target
        if (doesCardAffectTarget(selectedCard, isEnemy)) {
          setHitDigimon({ isEnemy, index: targetInfo.targetDigimonIndex });
        }
  
        // Play the card and update the game state
        const updatedState = playCard(gameState, cardIndex, targetInfo);
        setGameState(updatedState);
  
        // Trigger action queue processing
        setShouldProcessQueue(true);
  
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

  const handleDigimonDeath = useCallback(async (deadDigimonIndex: number, prevState: GameState) => {
    console.log(`Handling death of Digimon at index ${deadDigimonIndex}`);
    
    const deadDigimon = prevState.player.digimon[deadDigimonIndex];
    console.log(`Dead Digimon: ${deadDigimon.displayName}`);
      
      // Collect all cards belonging to the dead Digimon
      const cardsToRemove = [
        ...prevState.player.hand.filter(card => card.ownerDigimonIndex === deadDigimonIndex),
        ...prevState.player.deck.filter(card => card.ownerDigimonIndex === deadDigimonIndex),
        ...prevState.player.discardPile.filter(card => card.ownerDigimonIndex === deadDigimonIndex),
      ];
      console.log(`Cards to remove: ${cardsToRemove.length}`);
  
      // Remove cards from hand, deck, and discard pile
      const newHand = prevState.player.hand.filter(card => card.ownerDigimonIndex !== deadDigimonIndex);
      const newDeck = prevState.player.deck.filter(card => card.ownerDigimonIndex !== deadDigimonIndex);
      const newDiscardPile = prevState.player.discardPile.filter(card => card.ownerDigimonIndex !== deadDigimonIndex);
  
      console.log(`New hand size: ${newHand.length}`);
      console.log(`New deck size: ${newDeck.length}`);
      console.log(`New discard pile size: ${newDiscardPile.length}`);
  
      // Update the removedCards state
      const newRemovedCards = {
        ...prevState.removedCards,
        [deadDigimonIndex]: [...(prevState.removedCards[deadDigimonIndex] || []), ...cardsToRemove]
      };
  
      cardsToRemove.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card-animation', 'burn');
        cardElement.style.backgroundImage = `url(${require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)})`;

        //{require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)
        //`url('/assets/cards/${card.id}.png')
        
        // Position the card element based on its location
        const handArea = document.querySelector('.hand-area');
        const deckInfo = document.querySelector('.deck-info');
        const discardInfo = document.querySelector('.discard-info');
    
        if (handArea && prevState.player.hand.includes(card)) {
          const cardIndex = prevState.player.hand.findIndex(c => c.instanceId === card.instanceId);
          const handCard = handArea.children[cardIndex] as HTMLElement;
          if (handCard) {
            const rect = handCard.getBoundingClientRect();
            cardElement.style.position = 'fixed';
            cardElement.style.left = `${rect.left}px`;
            cardElement.style.top = `${rect.top}px`;
            cardElement.style.width = `${rect.width}px`;
            cardElement.style.height = `${rect.height}px`;
          }
        } else if (deckInfo && prevState.player.deck.includes(card)) {
          const rect = deckInfo.getBoundingClientRect();
          cardElement.style.position = 'fixed';
          cardElement.style.left = `${rect.left}px`;
          cardElement.style.top = `${rect.top}px`;
          cardElement.style.width = `${rect.width}px`;
          cardElement.style.height = `${rect.height}px`;
        } else if (discardInfo && prevState.player.discardPile.includes(card)) {
          const rect = discardInfo.getBoundingClientRect();
          cardElement.style.position = 'fixed';
          cardElement.style.left = `${rect.left}px`;
          cardElement.style.top = `${rect.top}px`;
          cardElement.style.width = `${rect.width}px`;
          cardElement.style.height = `${rect.height}px`;
        }
        
        document.body.appendChild(cardElement);
        
        // Remove the card element after the animation
        setTimeout(() => {
          cardElement.remove();
        }, 1000); // Duration of the animation
      });
  
  return {
    ...prevState,
    player: {
      ...prevState.player,
      hand: newHand,
      deck: newDeck,
      discardPile: newDiscardPile,
    },
    removedCards: newRemovedCards,
  };
}, []);


  useEffect(() => {
    console.log('Hand changed. New hand size:', gameState.player.hand.length);
  }, [gameState.player.hand]);

  const handleDigimonRevive = (revivedDigimonIndex: number) => {
    setGameState(prevState => {
      const cardsToRestore = removedCards[revivedDigimonIndex] || [];
      
      return {
        ...prevState,
        player: {
          ...prevState.player,
          deck: [...prevState.player.deck, ...cardsToRestore],
        },
      };
    });
  
    // Remove the restored cards from removedCards
    setRemovedCards(prev => {
      const newRemovedCards = { ...prev };
      delete newRemovedCards[revivedDigimonIndex];
      return newRemovedCards;
    });
  };


  const processActionQueue = useCallback(async (state: GameState) => {
    if (isProcessingAction || state.actionQueue.length === 0) {
      if (isEnemyTurn && state.actionQueue.length === 0) {
        console.log('Enemy turn ended, transitioning to player turn');
      }
      setShouldProcessQueue(false);
      return;
    }
  
    setIsProcessingAction(true);
    const action = state.actionQueue[0];
    let updatedState = { ...state, actionQueue: state.actionQueue.slice(1) };
  
    const processNextAction = () => {
      setGameState(updatedState);
      setIsProcessingAction(false);
      if (updatedState.actionQueue.length > 0) {
        setTimeout(() => setShouldProcessQueue(true), 500); // delay between actions
      } else {
        setShouldProcessQueue(false);
      }
    };
  
    switch (action.type) {
      case 'ENEMY_ACTION':
        const enemyAction = action as EnemyAction;
        console.log('Processing enemy action:', enemyAction);
        console.log(`Enemy ${enemyAction.attackingEnemyIndex} attacking player Digimon ${enemyAction.targetPlayerIndex}`);
        
        setAttackingEnemyDigimon(enemyAction.attackingEnemyIndex);
        setHitDigimon({ isEnemy: false, index: enemyAction.targetPlayerIndex });
        
        // Get the correct target Digimon
        const targetDigimon = updatedState.player.digimon[enemyAction.targetPlayerIndex];
        
        // Apply damage immediately
        updatedState = battleApplyDamage(
          enemyAction.damage, 
          targetDigimon, 
          updatedState, 
          {
            targetType: 'single_ally',
            sourceDigimonIndex: enemyAction.attackingEnemyIndex,
            targetDigimonIndex: enemyAction.targetPlayerIndex
          }
        );
        
        // Update the state to trigger a re-render
        setGameState(updatedState);
        
        // Set a timeout to reset the animation states
        setTimeout(() => {
          setAttackingEnemyDigimon(null);
          setHitDigimon(null);
          processNextAction();
        }, 1000); // Duration of the attack animation
        break;
        case 'DIGIMON_DEATH':
  console.log(`Processing DIGIMON_DEATH action for Digimon at index ${action.digimonIndex}`);
  updatedState = await handleDigimonDeath(action.digimonIndex, updatedState);
  processNextAction();
  break;
      case 'BURN_CARD':
        const burnAction = action as { type: 'BURN_CARD', card: Card };
        animateCardBurn(burnAction.card).then(() => {
          processNextAction();
        });
        break;
        case 'DRAW_CARD':
          const newlyDrawnCard = action.card;
          setNewlyDrawnCards(prev => [...prev, newlyDrawnCard.instanceId ?? '']);
          setTimeout(() => {
            setNewlyDrawnCards(prev => prev.filter(id => id !== newlyDrawnCard.instanceId));
          }, 500); // Duration of the draw animation
          processNextAction();
          break;
          case 'END_ENEMY_TURN':
            console.log('Ending enemy turn');
            setIsEnemyTurn(false);
            const { updatedState: newState, drawnCard } = startPlayerTurn(updatedState);
            updatedState = newState;
            if (drawnCard) {
              setNewlyDrawnCards([drawnCard.instanceId ?? '']);
            }
            processNextAction();
            break;
      default:
        processNextAction();
    }
  

    // Check if the battle has ended
    const battleStatus = checkBattleEnd(updatedState);
    if (battleStatus !== 'ongoing') {
      onBattleEnd(battleStatus);
    }
  }, [setGameState, startPlayerTurn, battleApplyDamage, onBattleEnd, isEnemyTurn, isProcessingAction, handleDigimonDeath, animateCardBurn]);

  
useEffect(() => {
  if (gameState.actionQueue.length > 0) {
    console.log('Action queue changed, processing...');
    processActionQueue(gameState);
  } else if (isEnemyTurn) {
    console.log('Enemy turn, executing actions...');
    processEnemyTurn(gameState);
  }
}, [gameState, isEnemyTurn, processActionQueue, processEnemyTurn]);


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
    <div className={`battle-screen ${isEnemyTurn ? 'enemy-turn' : ''}`} ref={battleScreenRef} onClick={handleBackgroundClick}>
      {isEnemyTurn && (
        <>
          <div className="enemy-turn-overlay"></div>
          <div className="enemy-turn-indicator">
            <div className="enemy-turn-text">ENEMY TURN</div>
          </div>
          <div className="danger-flash"></div>
        </>
      )}
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
          <div 
            className="battle-background" 
            style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
          />
          {openingAttacksComplete && (
            <>
              <div className="top-bar">
                <div className="left-controls">
                  <div className="button-container">
                    <button 
                      className="discard-button"
                      onClick={handleDiscard}
                      onMouseEnter={() => setIsDiscardHovered(true)}
                      onMouseLeave={() => setIsDiscardHovered(false)}
                      disabled={isEnemyTurn} // Add this line
                      >
                      Discard
                    </button>
                    <button 
                      className="end-turn-button" 
                      onClick={handleEndTurn} 
                      disabled={isAnimating || isEnemyTurn}
                    >
                      End Turn
                    </button>
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
    <div key={`enemy-${index}`} className="enemy-digimon-container" onClick={() => handleEnemyClick(index)}>
      <DigimonSprite 
        name={digimon.name} 
        scale={spriteScale * 1.75}
        isAttacking={attackingEnemyDigimon === index}
        isOnHit={hitDigimon?.isEnemy && hitDigimon.index === index}
        isDead={digimon.hp <= 0}
      />
                      <div className="enemy-health-bar">
                        <div className="health-fill" style={{ width: `${(digimon.hp / digimon.maxHp) * 100}%` }}></div>
                        <span className="enemy-hp-number">{`${digimon.hp}/${digimon.maxHp}`}</span>
                      </div>
                      {digimon.shield > 0 && (
                        <div className="enemy-shield-bar">
                          <div 
                            className="shield-fill" 
                            style={{ width: `${(digimon.shield / digimon.maxHp) * 100}%` }}
                          ></div>
                          <span className="enemy-shield-number">{digimon.shield}</span>
                        </div>
                      )}
                      <div className="enemy-info-tooltip">
                        {digimon.displayName} - Type: {digimon.type}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="player-digimon">
  {gameState.player.digimon.map((digimon, index) => (
    <div key={`player-${index}`} className="player-digimon-container" onClick={() => handlePlayerDigimonClick(index)}>
      <DigimonSprite 
        name={digimon.name} 
        scale={spriteScale * 1.6}
        isAttacking={attackingDigimon === index}
        isOnHit={hitDigimon?.isEnemy === false && hitDigimon.index === index}
        isDead={digimon.hp <= 0}
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
              <div className="hand-area">
      {gameState.player.hand.map((card, index) => (
        <CompactCard 
          key={card.instanceId ?? index}
          card={card} 
          onClick={() => handleCardClick(card)}
          isSelected={selectedCard?.instanceId === card.instanceId}
          isPlayable={gameState.player.ram >= card.cost && !isEnemyTurn}
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
                    <span className="digimon-name">{digimon.nickname ? digimon.nickname : digimon.displayName}</span>
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
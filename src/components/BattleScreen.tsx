import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Card, Digimon, TargetType, TargetInfo, EnemyAction, DigimonState, StatusEffect } from '../shared/types';
import { CORRUPTION_DAMAGE_PER_STACK } from '../game/gameConstants';
import { initializeBattle, startPlayerTurn, playCard, endPlayerTurn, executeEnemyTurn, checkBattleEnd, calculateBattleEndExp, applyDamage as battleApplyDamage} from '../game/battle';
import DigimonSprite from './DigimonSprite';
import CompactCard from './CompactCard';
import FullCardDisplay from './FullCardDisplay';
import RamDisplay from './RamDisplay';
import './BattleScreen.css';
import './BattleScreenAnimations.css';
import CardPileModal from './CardPileModal';
import BattleLog from './BattleLog';
import PostBattleScreen from './PostBattleScreen';
import { gainExperience } from '../data/digimon';
import { isStunned } from '../game/statusEffects';

interface BattleScreenProps {
  playerTeam: Digimon[];
  enemyTeam: Digimon[];
  onBattleEnd: (result: 'win' | 'lose', updatedPlayerTeam: Digimon[]) => void;
  backgroundImage?: string; 
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerTeam, enemyTeam, onBattleEnd, backgroundImage }) => {
  const [gameState, setGameState] = useState<GameState>(() => initializeBattle(playerTeam, enemyTeam));
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [spriteScale, setSpriteScale] = useState(1);
  const [isDiscardHovered, setIsDiscardHovered] = useState(false);
  const [newlyDrawnCards, setNewlyDrawnCards] = useState<string[]>([]);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [shuffledDeckForDisplay, setShuffledDeckForDisplay] = useState<Card[]>([]);
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [highlightedRam, setHighlightedRam] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [targetingDigimon, setTargetingDigimon] = useState(false);
  const [attackingDigimon, setAttackingDigimon] = useState<number | null>(null);
  const [hitDigimon, setHitDigimon] = useState<{ isEnemy: boolean, index: number } | null>(null);
  const [battleStarting, setBattleStarting] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [showBattleField, setShowBattleField] = useState(false);
  const [showGlitchTransition, setShowGlitchTransition] = useState(true);
  const [showOpeningAttacks, setShowOpeningAttacks] = useState(false);
  const [openingAttacksComplete, setOpeningAttacksComplete] = useState(false);
  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [shouldProcessQueue, setShouldProcessQueue] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [attackingEnemyDigimon, setAttackingEnemyDigimon] = useState<number | null>(null);
  const [removedCards, setRemovedCards] = useState<{ [digimonIndex: number]: Card[] }>({});
  const [scale, setScale] = useState(1);
  const [logEntries, setLogEntries] = useState<{ id: number; message: string }[]>([]);
  const [logEntryId, setLogEntryId] = useState(0);
  const [battleStartLogged, setBattleStartLogged] = useState(false);
  const [showPostBattle, setShowPostBattle] = useState(false);
  const [expGained, setExpGained] = useState<number[]>([]);
  const [battleEnded, setBattleEnded] = useState(false);

  const battleScreenRef = useRef<HTMLDivElement>(null);
  const battleBackgroundRef = useRef<HTMLDivElement>(null);
  const prevHandRef = useRef<Card[]>([]);

  const addLogEntry = useCallback((message: string) => {
    setLogEntries(prevEntries => [...prevEntries, { id: logEntryId, message }]);
    setLogEntryId(prevId => prevId + 1);
  }, [logEntryId]);

useEffect(() => {
  const updateScale = () => {
    if (battleScreenRef.current) {
      const { width, height } = battleScreenRef.current.getBoundingClientRect();
      const scale = Math.min(width / 1280, height / 720);
      setScale(scale);
      setSpriteScale(scale);
      document.documentElement.style.setProperty('--battle-scale', scale.toString());
    }
  };

  updateScale();
  window.addEventListener('resize', updateScale);
  return () => window.removeEventListener('resize', updateScale);
}, []);

  useEffect(() => {
    if (battleStarting) {
      const timers = [
        setTimeout(() => setShowWarning(false), 1000),
        setTimeout(() => setShowGlitchTransition(true), 1000),
        setTimeout(() => {
          setShowGlitchTransition(false);
          setShowBattleField(true);
        }, 1000),
        setTimeout(() => {
          setBattleStarting(false);
          setShowOpeningAttacks(true);
        }, 1100)
      ];

      return () => timers.forEach(clearTimeout);
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedCard(null);
        setHighlightedRam(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!battleStartLogged && openingAttacksComplete) {
      addLogEntry(`Battle Start`);
      setBattleStartLogged(true);
    }
  }, [addLogEntry, battleStartLogged, openingAttacksComplete]);
  const processEnemyTurn = useCallback((state: GameState) => {
    console.log('Processing enemy turn');
    const enemyState = executeEnemyTurn(state);
    setGameState(enemyState);
    setShouldProcessQueue(true);
  }, []);

  const handleBattleEnd = useCallback((result: 'win' | 'lose') => {
    if (battleEnded) return;
    
    setBattleEnded(true);
    if (result === 'win') {
      const defeatedEnemies = gameState.enemy.digimon.filter(d => d.hp <= 0);
      const expGained = calculateBattleEndExp(gameState.player.digimon as Digimon[], defeatedEnemies);
      console.log("Battle ended. Exp gained:", expGained);
      const updatedPlayerDigimon = gameState.player.digimon.map(d => ({ ...d, shield: 0 }));
      console.log("Player team HP:", gameState.player.digimon.map(d => d.hp));
      setGameState(prevState => ({
        ...prevState,
        player: {
          ...prevState.player,
          digimon: updatedPlayerDigimon
        }
      }));
      setExpGained(expGained);
      setShowPostBattle(true);
    } else {
      const updatedPlayerTeam = gameState.player.digimon.filter((d): d is Digimon => 
        'deck' in d && 'expToNextLevel' in d && 'displayName' in d && d.displayName !== undefined
      );
      onBattleEnd(result, updatedPlayerTeam);
    }
  }, [gameState, onBattleEnd, battleEnded]);

  const handlePostBattleContinue = useCallback(() => {
    console.log("BattleScreen: handlePostBattleContinue called");
    const updatedPlayerTeam = gameState.player.digimon
      .filter((d): d is Digimon => 
        'deck' in d && 'expToNextLevel' in d && 'displayName' in d && d.displayName !== undefined
      )
      .map((digimon, index) => {
        console.log(`BattleScreen: Applying experience to ${digimon.displayName}: current exp ${digimon.exp}, gaining ${expGained[index]}`);
        return gainExperience(digimon, expGained[index] || 0);
      });
    console.log('BattleScreen: Calling onBattleEnd for win');
    onBattleEnd('win', updatedPlayerTeam);
  }, [gameState, expGained, onBattleEnd]);

  const handleCardClick = useCallback((card: Card) => {
    const sourceDigimon = gameState.player.digimon[card.ownerDigimonIndex];
    if (isStunned(sourceDigimon)) {
      addLogEntry(`${sourceDigimon.displayName} is stunned and cannot play a card`);
      return;
    }
  
    if (gameState.player.ram >= card.cost) {
      if (selectedCard && selectedCard.instanceId === card.instanceId) {
        setSelectedCard(null);
        setHighlightedRam(0);
      } else {
        setSelectedCard(card);
        setHighlightedRam(card.cost);
        setTargetingDigimon(true);
      }
    }
  }, [gameState.player.ram, selectedCard, gameState.player.digimon, addLogEntry]);

  const handleEndTurn = useCallback(() => {
    if (isEnemyTurn) return;
    setSelectedCard(null);
    setHighlightedRam(0);
    const updatedState = endPlayerTurn(gameState);
    setGameState(updatedState);
    setIsEnemyTurn(true);
    setHitDigimon(null);
    processEnemyTurn(updatedState);
  }, [gameState, isEnemyTurn, processEnemyTurn]);

  const doesCardAffectTarget = (card: Card, isEnemy: boolean): boolean => {
    return card.effects.some(effect => 
      (effect.damage && ['enemy', 'all_enemies', 'random_enemy'].includes(effect.damage.target)) ||
      (effect.applyStatus && effect.applyStatus.type !== 'bugged' && isEnemy) ||
      (effect.shield && ['enemy', 'all_enemies', 'random_enemy'].includes(effect.shield.target))
    );
  };

  const deselectCard = () => {
    setSelectedCard(null);
    setHighlightedRam(0);
  };
  
  const handleBackgroundClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      deselectCard();
    }
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
          cardElement.style.backgroundImage = `url(${require(`../assets/cards/${discardedCard.name.toLowerCase().replace(/\s+/g, '')}.png`)})`;
          cardElement.style.backgroundSize = 'cover';
          cardElement.style.backgroundPosition = 'center';
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
  
  const handleDiscardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDiscardModalOpen(true);
  };

  const handleDigimonClick = useCallback((isEnemy: boolean, index: number) => {
    if (targetingDigimon && selectedCard) {
      const targetDigimon = isEnemy ? gameState.enemy.digimon[index] : gameState.player.digimon[index];
      addLogEntry(`${gameState.player.digimon[selectedCard.ownerDigimonIndex].displayName} used ${selectedCard.name} on ${targetDigimon.displayName}`);
      const cardIndex = gameState.player.hand.findIndex(card => card.instanceId === selectedCard.instanceId);
      if (cardIndex !== -1) {
        let targetInfo: TargetInfo = {
          targetType: isEnemy ? 'enemy' : 'single_ally' as TargetType,
          sourceDigimonIndex: selectedCard.ownerDigimonIndex,
          targetDigimonIndex: index,
        };
  
        setAttackingDigimon(selectedCard.ownerDigimonIndex);
  
        if (doesCardAffectTarget(selectedCard, isEnemy)) {
          setHitDigimon({ isEnemy, index: targetInfo.targetDigimonIndex });
        }
  
        const updatedState = playCard(gameState, cardIndex, targetInfo);
        setGameState(updatedState);
        setShouldProcessQueue(true);
  
        setTimeout(() => {
          setAttackingDigimon(null);
          setHitDigimon(null);
          setSelectedCard(null);
          setTargetingDigimon(false);
          setHighlightedRam(0);
        }, 600);
      }
    }
  }, [targetingDigimon, selectedCard, gameState, addLogEntry]);

  const handleEnemyClick = useCallback((index: number) => {
    handleDigimonClick(true, index);
  }, [handleDigimonClick]);

  const handlePlayerDigimonClick = useCallback((index: number) => {
    handleDigimonClick(false, index);
  }, [handleDigimonClick]);

  const handleDeckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShuffledDeckForDisplay(shuffleArray([...gameState.player.deck]));
    setIsDeckModalOpen(true);
  };

  

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
      animateCardBurn(card);
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
  }, [animateCardBurn]);
  
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleCardHover = useCallback((card: Card, event: React.MouseEvent) => {
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
  }, []);

  const handleStartNewTurn = useCallback((newTurn: number) => {
    addLogEntry(`---START TURN ${newTurn}---`);
  }, [addLogEntry]);

  const handleCardHoverEnd = useCallback(() => {
    setHoveredCard(null);
    setHighlightedRam(selectedCard ? selectedCard.cost : 0);
  }, [selectedCard]);

  const processActionQueue = useCallback(async (state: GameState) => {
    if (isProcessingAction || state.actionQueue.length === 0) {
      if (isEnemyTurn && state.actionQueue.length === 0) {
        console.log('Enemy turn ended, transitioning to player turn');
        setIsEnemyTurn(false);
        const { updatedState: newState, drawnCard } = startPlayerTurn(state);
        setGameState(newState);
        if (drawnCard) {
          setNewlyDrawnCards([drawnCard.instanceId ?? '']);
        }
        handleStartNewTurn(newState.turn);
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
        const attackingEnemy = state.enemy.digimon[enemyAction.attackingEnemyIndex];
        const targetPlayer = state.player.digimon[enemyAction.targetPlayerIndex];
        addLogEntry(`${attackingEnemy.displayName} attacks ${targetPlayer.displayName}`);
        
        setAttackingEnemyDigimon(enemyAction.attackingEnemyIndex);
        setHitDigimon({ isEnemy: false, index: enemyAction.targetPlayerIndex });
        
        updatedState = battleApplyDamage(
          enemyAction.damage, 
          targetPlayer, 
          updatedState, 
          {
            targetType: 'single_ally',
            sourceDigimonIndex: enemyAction.attackingEnemyIndex,
            targetDigimonIndex: enemyAction.targetPlayerIndex
          }
        );
        
        setTimeout(() => {
          setAttackingEnemyDigimon(null);
          setHitDigimon(null);
          processNextAction();
        }, 1000);
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
        handleStartNewTurn(updatedState.turn);
        processNextAction();
        break;
  
      default:
        processNextAction();
    }
  
  }, [
    setGameState,
    startPlayerTurn,
    battleApplyDamage,
    handleDigimonDeath,
    animateCardBurn,
    addLogEntry,
    handleStartNewTurn,
    isEnemyTurn,
    isProcessingAction
  ]);

  useEffect(() => {
    if (gameState.actionQueue.length > 0) {
      processActionQueue(gameState);
    } else if (isEnemyTurn) {
      processEnemyTurn(gameState);
    } else {
      const battleStatus = checkBattleEnd(gameState);
      if (battleStatus !== 'ongoing') {
        handleBattleEnd(battleStatus);
      }
    }
  }, [gameState, isEnemyTurn, processActionQueue, processEnemyTurn, checkBattleEnd, handleBattleEnd]);

  const renderStatusEffects = (digimon: DigimonState) => {
    const corruptionEffect = digimon.statusEffects.find(effect => effect.type === 'corruption');
    if (corruptionEffect) {
      const corruptionDamage = corruptionEffect.value * CORRUPTION_DAMAGE_PER_STACK;
      return (
        <div className="corruption-indicator">
          <span className="corruption-icon">☠️</span>
          <span className="corruption-stacks">{corruptionEffect.value}</span>
          <span className="corruption-damage">(-{corruptionDamage}/turn)</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="battle-screen-container">
      <div className={`battle-screen ${isEnemyTurn ? 'enemy-turn' : ''}`} ref={battleScreenRef} onClick={handleBackgroundClick}>
        <BattleLog entries={logEntries} />
        {isEnemyTurn && (
          <>
            <div className="enemy-turn-overlay"></div>
            <div className="enemy-turn-indicator">
              <div className="enemy-turn-text">ENEMY TURN</div>
            </div>
            <div className="danger-flash"></div>
          </>
        )}
        {showPostBattle && (
      <PostBattleScreen
        playerTeam={gameState.player.digimon.filter((d): d is Digimon => 
          'deck' in d && 'expToNextLevel' in d && 'displayName' in d && d.displayName !== undefined
        )}
        expGained={expGained}
        onContinue={handlePostBattleContinue}
      />
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
                      disabled={isEnemyTurn}
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
                        isStunned={isStunned(digimon)}
                      />
                        {isStunned(digimon) && <div className="stunned-indicator">BUGGED</div>}
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
                       {renderStatusEffects(digimon)}
                      <div className="enemy-info-tooltip">
                        {digimon.displayName} - Type: {digimon.type}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="player-digimon">
                  {gameState.player.digimon.map((digimon, index) => {
                    let positionStyle: React.CSSProperties = {
                      position: 'absolute',
                      bottom: '0',
                      transform: 'translateX(-50%)',
                    };
  
                    if (gameState.player.digimon.length === 1) {
                      positionStyle.left = '50%';
                    } else if (gameState.player.digimon.length === 2) {
                      positionStyle.left = index === 0 ? '33.33%' : '66.67%';
                    } else {
                      positionStyle.left = `${16.67 + index * 33.33}%`;
                    }
  
                    return (
                      <div 
                        key={`player-${index}`} 
                        className="player-digimon-container" 
                        onClick={() => handlePlayerDigimonClick(index)}
                        style={positionStyle}
                      >
                        <DigimonSprite 
                          name={digimon.name} 
                          scale={spriteScale * 1.6}
                          isAttacking={attackingDigimon === index}
                          isOnHit={hitDigimon?.isEnemy === false && hitDigimon.index === index}
                          isDead={digimon.hp <= 0}
                        />
                          {renderStatusEffects(digimon)}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="hand-area">
                {gameState.player.hand.map((card, index) => (
                  <CompactCard 
                    key={card.instanceId ?? index}
                    card={card} 
                    ownerDigimon={gameState.player.digimon[card.ownerDigimonIndex]}
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
                {gameState.player.digimon.map((digimon, index) => {
                  let infoStyle: React.CSSProperties = {
                    position: 'absolute',
                    bottom: '0',
                    transform: 'translateX(-50%)',
                  };
  
                  if (gameState.player.digimon.length === 1) {
                    infoStyle.left = '50%';
                  } else if (gameState.player.digimon.length === 2) {
                    infoStyle.left = index === 0 ? '33.33%' : '66.67%';
                  } else {
                    infoStyle.left = `${16.67 + index * 33.33}%`;
                  }
  
                  return (
                    <div key={index} className="digimon-info" style={infoStyle}>
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
                      {renderStatusEffects(digimon)}
                    </div>
                  );
                })}
              </div>
              <CardPileModal
                isOpen={isDeckModalOpen}
                onClose={() => setIsDeckModalOpen(false)}
                cards={shuffledDeckForDisplay}
                title="Draw Pile"
                playerDigimon={gameState.player.digimon}
              />
              <CardPileModal
                isOpen={isDiscardModalOpen}
                onClose={() => setIsDiscardModalOpen(false)}
                cards={gameState.player.discardPile}
                title="Discard Pile"
                playerDigimon={gameState.player.digimon}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default BattleScreen;
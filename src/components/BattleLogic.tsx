import React, { useState, useEffect, useCallback } from 'react';
import { Digimon, CardType, BattleState } from '../shared/types';
import { shuffleArray } from '../utils/deckUtils';

interface CardInstance extends CardType {
  instanceId: string;
}

interface BattleLogicProps {
  playerTeam: Digimon[];
  enemy: Digimon;
  onBattleEnd: (playerWon: boolean) => void;
  children: (battleProps: BattleLogicChildProps) => React.ReactNode;
}

interface BattleLogicChildProps {
  turn: number;
  playerEnergy: number;
  playerDeck: CardType[];
  playerDiscardPile: CardType[];
  enemyHp: number;
  enemyBlock: number;
  enemy: Digimon;
  playerTeamHp: number[];
  playerTeamBlock: number[];
  playerHand: CardInstance[];
  selectedCardInstanceId: string | null;
  selectingCardToDiscard: boolean;
  tempEnergy: number | null;
  isDrawingCards: boolean;
  cardsBeingDrawn: CardInstance[];
  handleCardSelection: (card: CardInstance) => void;
  handleCardUse: (target: 'enemy' | 'self') => void;
  handleDiscard: () => void;
  endTurn: () => void;
  selectedCard: CardInstance | null;
  requiresTarget: boolean;
  handleCardClick: (card: CardInstance) => void;
  selectingCardForEffect: CardInstance | null;
  unselectCard: () => void;
  triggerDiscardAnimation: (onDiscard: (cards: CardInstance[]) => void) => void;
  handleCardEffect: (effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => void) => void;
}

const BattleLogic: React.FC<BattleLogicProps> = ({ playerTeam, enemy, onBattleEnd, children }) => {
  const [turn, setTurn] = useState(1);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  const [playerDeck, setPlayerDeck] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardInstance[]>([]);
  const [playerDiscardPile, setPlayerDiscardPile] = useState<CardType[]>([]);
  const [selectedCardInstanceId, setSelectedCardInstanceId] = useState<string | null>(null);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [playerTeamBlock, setPlayerTeamBlock] = useState(playerTeam.map(() => 0));
  const [playerTeamHp, setPlayerTeamHp] = useState(playerTeam.map(d => d.hp));
  const [selectingCardToDiscard, setSelectingCardToDiscard] = useState(false);
  const [selectingCardForEffect, setSelectingCardForEffect] = useState<CardInstance | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null);
  const [requiresTarget, setRequiresTarget] = useState(false);
  const [cardsBeingDiscarded, setCardsBeingDiscarded] = useState<CardInstance[]>([]);
  const [tempEnergy, setTempEnergy] = useState<number | null>(null);
  const [cardsBeingDrawn, setCardsBeingDrawn] = useState<CardInstance[]>([]);
  const [isDrawingCards, setIsDrawingCards] = useState(false);

  useEffect(() => {
    const initialDeck = shuffleArray(playerTeam.flatMap(digimon => digimon.deck));
    setPlayerDeck(initialDeck);
    drawInitialHand(initialDeck);
  }, [playerTeam]);

  const drawCard = useCallback((amount: number = 1): CardInstance[] => {
    const drawnCards: CardInstance[] = [];
    let newDeck = [...playerDeck];
    let newHand = [...playerHand];
    let newDiscardPile = [...playerDiscardPile];

    const availableCards = Math.min(amount, newDeck.length + newDiscardPile.length);
  
    for (let i = 0; i < availableCards; i++) {
      if (newDeck.length === 0) {
        if (newDiscardPile.length === 0) break;
        newDeck = shuffleArray(newDiscardPile);
        newDiscardPile = [];
      }
  
      const [newCard, ...remainingDeck] = newDeck;
      const newCardInstance = createCardInstance(newCard);
      drawnCards.push(newCardInstance);
      newHand.push(newCardInstance);
      newDeck = remainingDeck;
    }
  
    setPlayerHand(newHand);
    setPlayerDeck(newDeck);
    setPlayerDiscardPile(newDiscardPile);
    return drawnCards;
  }, [playerDeck, playerHand, playerDiscardPile]);

  const drawCardWithAnimation = useCallback((amount: number) => {
    setIsDrawingCards(true);
    const drawnCards = drawCard(amount);
    setCardsBeingDrawn(drawnCards);
  
    const drawNextCard = (index: number) => {
      if (index < drawnCards.length) {
        setTimeout(() => {
          setPlayerHand(prevHand => [...prevHand, drawnCards[index]]);
          drawNextCard(index + 1);
        }, 300); // Adjust this delay to control animation speed
      } else {
        setIsDrawingCards(false);
        setCardsBeingDrawn([]);
      }
    };
  
    drawNextCard(0);
    return drawnCards;
  }, [drawCard, setPlayerHand]);

  const createCardInstance = (card: CardType): CardInstance => ({
    ...card,
    instanceId: `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });

  const triggerDiscardAnimation = useCallback((onDiscard: (cards: CardInstance[]) => void) => {
    const cardsToDiscard = playerHand.slice(0, 1); // Discard the first card
    onDiscard(cardsToDiscard);
    setTimeout(() => {
      setPlayerHand(prev => prev.filter(c => !cardsToDiscard.includes(c)));
      setPlayerDiscardPile(prev => [...prev, ...cardsToDiscard]);
    }, 1000);
  }, [playerHand]);

  const discardCard = useCallback((amount: number): CardInstance[] => {
    const discardedCards = playerHand.slice(0, amount);
    triggerDiscardAnimation((cards) => {
      setPlayerHand(prev => prev.filter(c => !cards.includes(c)));
      setPlayerDiscardPile(prev => [...prev, ...cards]);
    });
    return discardedCards;
  }, [playerHand, triggerDiscardAnimation]);

  const createBattleState = useCallback((): BattleState => ({
    playerEnergy,
    playerHand,
    playerDeck,
    playerDiscardPile,
    enemyHp,
    enemyBlock,
    discardCard,
    discardHand: () => {
      setPlayerDiscardPile(prev => [...prev, ...playerHand]);
      setPlayerHand([]);
    },
    drawCard: (amount: number, callback?: () => void) => {
      console.log('Drawing card start');
      const drawnCards = drawCard(amount);
      if (callback) {
        setTimeout(() => {
          callback();
          console.log('Drawing card callback executed');
        }, 0);
      }
      console.log('Drawing card end');
      return drawnCards;
    },
    discardRandomCards: (amount: number) => {
      const shuffledHand = shuffleArray([...playerHand]);
      const discardedCards = shuffledHand.slice(0, amount);
      setPlayerHand(shuffledHand.slice(amount));
      setPlayerDiscardPile(prev => [...prev, ...discardedCards]);
      return discardedCards;
    },
    getDiscardedCardCount: () => playerDiscardPile.length,
    healRandomAlly: (amount: number) => {
      const randomIndex = Math.floor(Math.random() * playerTeam.length);
      setPlayerTeamHp(prev => {
        const newHp = [...prev];
        newHp[randomIndex] = Math.min(newHp[randomIndex] + amount, playerTeam[randomIndex].maxHp);
        return newHp;
      });
    },
    addRandomAllyBlock: (amount: number) => {
      const randomIndex = Math.floor(Math.random() * playerTeam.length);
      setPlayerTeamBlock(prev => {
        const newBlock = [...prev];
        newBlock[randomIndex] += amount;
        return newBlock;
      });
    },
    damageRandomEnemy: (amount: number) => {
      setEnemyHp(prev => Math.max(0, prev - amount));
    },
    setPlayerEnergy: (amount: number) => setPlayerEnergy(amount),
    damageEnemy: (amount: number) => setEnemyHp(prev => Math.max(0, prev - amount)),
    damagePlayer: (amount: number) => setPlayerTeamHp(prev => {
      const newHp = [...prev];
      newHp[0] = Math.max(0, newHp[0] - amount);
      return newHp;
    }),
    addPlayerBlock: (amount: number) => setPlayerTeamBlock(prev => {
      const newBlock = [...prev];
      newBlock[0] += amount;
      return newBlock;
    }),
    addEnemyBlock: (amount: number) => setEnemyBlock(prev => prev + amount),
    setEnemyBlock: (amount: number) => setEnemyBlock(amount),
    discardSpecificCard: (cardToDiscard: CardInstance) => {
      setPlayerHand(prev => prev.filter(c => c.instanceId !== cardToDiscard.instanceId));
      setPlayerDiscardPile(prev => [...prev, cardToDiscard]);
      setPlayerEnergy(prev => prev + cardToDiscard.cost);
    },
  }), [playerEnergy, playerHand, playerDeck, playerDiscardPile, enemyHp, enemyBlock, discardCard, drawCardWithAnimation, playerTeam]);

  const drawInitialHand = (deck: CardType[]) => {
    const initialHandSize = 3 + playerTeam.length;
    const initialHand = deck.slice(0, initialHandSize).map(createCardInstance);
    setPlayerHand(initialHand);
    setPlayerDeck(deck.slice(initialHandSize));
  };

  const handleCardClick = useCallback((card: CardInstance) => {
    if (selectingCardForEffect) {
      handleCardSelectionForEffect(card);
    } else if (selectedCard && selectedCard.instanceId === card.instanceId) {
      if (!card.requiresTarget && !card.requiresCardSelection) {
        handleCardUse('self');
      }
    } else {
      if (card.requiresCardSelection) {
        setSelectingCardForEffect(card);
        setTempEnergy(playerEnergy - card.cost);
      } else {
        setSelectedCard(card);
        setRequiresTarget(card.requiresTarget !== false);
      }
    }
  }, [selectingCardForEffect, selectedCard, playerEnergy]);

  const handleCardSelection = useCallback((card: CardInstance) => {
    if (selectingCardForEffect) {
      handleCardSelectionForEffect(card);
    } else {
      setSelectedCardInstanceId(prev => prev === card.instanceId ? null : card.instanceId);
    }
  }, [selectingCardForEffect]);

  const handleCardSelectionForEffect = useCallback((selectedCard: CardInstance) => {
    if (!selectingCardForEffect) return;
  
    const battleState = createBattleState();
    if (selectingCardForEffect.effect) {
      selectingCardForEffect.effect(playerTeam[0], enemy, battleState, selectedCard);
    }
  
    playCard(selectingCardForEffect, 'self');
    setSelectingCardForEffect(null);
    setTempEnergy(null);
  }, [selectingCardForEffect, playerTeam, enemy, createBattleState]);

  const unselectCard = useCallback(() => {
    setSelectedCardInstanceId(null);
    setSelectedCard(null);
    setRequiresTarget(false);
    setSelectingCardForEffect(null);
    setTempEnergy(null);
  }, []);

  const handleCardEffect = useCallback((effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => void) => {
    const battleState: BattleState = {
      ...createBattleState(),
      discardCard: (amount: number) => {
        const discardedCards = playerHand.slice(0, amount);
        triggerDiscardAnimation((cards) => {
          setPlayerHand(prev => prev.filter(c => !cards.includes(c)));
          setPlayerDiscardPile(prev => [...prev, ...cards]);
        });
        return discardedCards;
      },
      discardRandomCards: (amount: number) => {
        const shuffledHand = shuffleArray([...playerHand]);
        const discardedCards = shuffledHand.slice(0, amount);
        triggerDiscardAnimation((cards) => {
          setPlayerHand(prev => prev.filter(c => !cards.includes(c)));
          setPlayerDiscardPile(prev => [...prev, ...cards]);
        });
        return discardedCards;
      },
      discardSpecificCard: (cardToDiscard: CardInstance) => {
        triggerDiscardAnimation((cards) => {
          setPlayerHand(prev => prev.filter(c => c.instanceId !== cardToDiscard.instanceId));
          setPlayerDiscardPile(prev => [...prev, cardToDiscard]);
        });
        setPlayerEnergy(prev => prev + cardToDiscard.cost);
      },
    };
  
    effect(playerTeam[0], enemy, battleState);
  }, [playerTeam, enemy, createBattleState, playerHand, triggerDiscardAnimation, setPlayerHand, setPlayerDiscardPile, setPlayerEnergy]);

  const handleDiscard = useCallback(() => {
    if (playerHand.length > 0) {
      const [discardedCard, ...remainingHand] = playerHand;
      setPlayerHand(remainingHand);
      setPlayerDiscardPile(prev => [...prev, discardedCard]);
    }
  }, [playerHand]);

  const handleCardUse = useCallback((target: 'enemy' | 'self') => {
    if (!selectedCard || playerEnergy < selectedCard.cost) return;
  
    console.log('handleCardUse start', selectedCard.name);
  
    if (selectedCard.requiresCardSelection) {
      setSelectingCardForEffect(selectedCard);
      return;
    }
  
    if (selectedCard.requiresTarget && target !== 'enemy') return;
  
    // Remove the played card from hand
    const updatedHand = playerHand.filter(card => card.instanceId !== selectedCard.instanceId);
    
    // Add the played card to the discard pile
    const updatedDiscardPile = [...playerDiscardPile, selectedCard];
    
    // Update state
    setPlayerHand(prevHand => {
      console.log('Removing card from hand', selectedCard.name);
      return prevHand.filter(card => card.instanceId !== selectedCard.instanceId);
    });
    setPlayerDiscardPile(prev => {
      console.log('Adding card to discard pile', selectedCard.name);
      return [...prev, selectedCard];
    });
    setPlayerEnergy(prev => prev - selectedCard.cost);
  
    // Apply card effects
    const battleState = createBattleState();
    if (selectedCard.effect) {
      console.log('Executing card effect', selectedCard.name);
      selectedCard.effect(playerTeam[0], enemy, battleState);
    }
  
    if (selectedCard.requiresCardSelection) {
      setSelectingCardForEffect(selectedCard);
    } else {
      playCard(selectedCard, target);
    }
  
    // Reset selection states
    setSelectedCardInstanceId(null);
    setSelectedCard(null);
    setRequiresTarget(false);
  
    if (enemyHp <= 0) {
      onBattleEnd(true);
    }
  }, [selectedCard, playerEnergy, playerHand, playerDiscardPile, enemyHp, onBattleEnd, playerTeam, enemy, createBattleState]);

  const playCard = useCallback((card: CardInstance, target: 'enemy' | 'self') => {
    const battleState = createBattleState();

    if (card.effect) {
      card.effect(playerTeam[0], enemy, battleState);
    } else {
      switch (card.type) {
        case 'attack':
          if (target === 'enemy' && card.damage) {
            battleState.damageEnemy(card.damage);
          }
          break;
        case 'block':
          if (target === 'self' && card.block) {
            battleState.addPlayerBlock(card.block);
          }
          break;
      }
    }
    setSelectedCardInstanceId(null);
    setSelectedCard(null);
    setRequiresTarget(false);

    if (enemyHp <= 0) {
      onBattleEnd(true);
    }
  }, [createBattleState, playerTeam, enemy, enemyHp, onBattleEnd]);

  const endTurn = useCallback(() => {
    setTurn(prev => prev + 1);
    setPlayerEnergy(3);
    drawCard();
    // enemy turn logic
    // placeholder - just have the enemy deal some damage
    const enemyDamage = 5;
    setPlayerTeamHp(prev => {
      const newHp = [...prev];
      if (playerTeamBlock[0] > 0) {
        const remainingDamage = Math.max(0, enemyDamage - playerTeamBlock[0]);
        setPlayerTeamBlock(prevBlock => {
          const newBlock = [...prevBlock];
          newBlock[0] = Math.max(0, newBlock[0] - enemyDamage);
          return newBlock;
        });
        newHp[0] = Math.max(0, newHp[0] - remainingDamage);
      } else {
        newHp[0] = Math.max(0, newHp[0] - enemyDamage);
      }
      return newHp;
    });

    // reduce block at the end of the turn
    setPlayerTeamBlock(prev => prev.map(block => Math.max(0, block - 1)));
    setEnemyBlock(prev => Math.max(0, prev - 1));

    if (playerTeamHp[0] <= 0) {
      onBattleEnd(false);
    }
  }, [drawCardWithAnimation, playerTeamBlock, playerTeamHp, onBattleEnd]);

  const battleProps: BattleLogicChildProps = {
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
    handleCardSelection,
    handleCardUse,
    isDrawingCards,
    cardsBeingDrawn,
    selectedCard,
    requiresTarget,
    tempEnergy,
    handleCardClick,
    unselectCard,
    triggerDiscardAnimation,
    handleDiscard,
    endTurn,
    selectingCardForEffect,
    handleCardEffect
  };

  return <>{children(battleProps)}</>;
};

export default BattleLogic;
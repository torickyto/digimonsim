import React, { useState, useEffect } from 'react';
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
  handleCardSelection: (card: CardInstance) => void;
  handleCardUse: (target: 'enemy' | 'self') => void;
  handleDiscard: () => void;
  endTurn: () => void;
  selectedCard: CardInstance | null;
  requiresTarget: boolean;
  handleCardClick: (card: CardInstance) => void;
  selectingCardForEffect: CardInstance | null;
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
  const [discardedCardCount, setDiscardedCardCount] = useState(0);
  const [selectingCardToDiscard, setSelectingCardToDiscard] = useState(false);
  const [cardToUseAfterDiscard, setCardToUseAfterDiscard] = useState<CardInstance | null>(null);
  const [selectingCardForEffect, setSelectingCardForEffect] = useState<CardInstance | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null);
  const [requiresTarget, setRequiresTarget] = useState(false);

  useEffect(() => {
    const initialDeck = shuffleArray(playerTeam.flatMap(digimon => digimon.deck));
    setPlayerDeck(initialDeck);
    drawInitialHand(initialDeck);
  }, [playerTeam]);

  const createCardInstance = (card: CardType): CardInstance => ({
    ...card,
    instanceId: `${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });

  const drawInitialHand = (deck: CardType[]) => {
    const initialHandSize = 3 + playerTeam.length;
    const initialHand = deck.slice(0, initialHandSize).map(createCardInstance);
    setPlayerHand(initialHand);
    setPlayerDeck(deck.slice(initialHandSize));
  };

  const drawCard = (amount: number = 1): CardInstance[] => {
    const drawnCards: CardInstance[] = [];
    for (let i = 0; i < amount; i++) {
      if (playerDeck.length === 0) {
        if (playerDiscardPile.length === 0) break;
        const shuffledDiscard = shuffleArray(playerDiscardPile);
        setPlayerDeck(shuffledDiscard);
        setPlayerDiscardPile([]);
      }
      const [newCard, ...remainingDeck] = playerDeck;
      const newCardInstance = createCardInstance(newCard);
      drawnCards.push(newCardInstance);
      setPlayerHand(prev => [...prev, newCardInstance]);
      setPlayerDeck(remainingDeck);
    }
    return drawnCards;
  };

  const discardCard = (amount: number): CardInstance[] => {
    const discardedCards = playerHand.slice(0, amount);
    setPlayerHand(prev => prev.slice(amount));
    setPlayerDiscardPile(prev => [...prev, ...discardedCards]);
    setDiscardedCardCount(prev => prev + amount);
    return discardedCards;
  };

  const discardHand = (): void => {
    setPlayerDiscardPile(prev => [...prev, ...playerHand]);
    setDiscardedCardCount(prev => prev + playerHand.length);
    setPlayerHand([]);
  };

  const discardRandomCards = (amount: number): CardInstance[] => {
    const shuffledHand = shuffleArray([...playerHand]);
    const discardedCards = shuffledHand.slice(0, amount);
    setPlayerHand(shuffledHand.slice(amount));
    setPlayerDiscardPile(prev => [...prev, ...discardedCards]);
    setDiscardedCardCount(prev => prev + amount);
    return discardedCards;
  };

  const getDiscardedCardCount = (): number => {
    return discardedCardCount;
  };

  const healRandomAlly = (amount: number): void => {
    const randomIndex = Math.floor(Math.random() * playerTeam.length);
    setPlayerTeamHp(prev => {
      const newHp = [...prev];
      newHp[randomIndex] = Math.min(newHp[randomIndex] + amount, playerTeam[randomIndex].maxHp);
      return newHp;
    });
  };

  const addRandomAllyBlock = (amount: number): void => {
    const randomIndex = Math.floor(Math.random() * playerTeam.length);
    setPlayerTeamBlock(prev => {
      const newBlock = [...prev];
      newBlock[randomIndex] += amount;
      return newBlock;
    });
  };

  const damageRandomEnemy = (amount: number): void => {
    setEnemyHp(prev => Math.max(0, prev - amount));
  };

  const handleCardClick = (card: CardInstance) => {
    if (selectingCardForEffect) {
      handleCardSelectionForEffect(card);
    } else if (selectedCard && selectedCard.instanceId === card.instanceId) {
      if (!card.requiresTarget) {
        handleCardUse();
      }
    } else {
      setSelectedCard(card);
      setRequiresTarget(card.requiresTarget !== false);
    }
  };

  const handleCardSelection = (card: CardInstance) => {
    if (selectingCardToDiscard) {
      setSelectingCardToDiscard(false);
      if (cardToUseAfterDiscard && cardToUseAfterDiscard.effect) {
        const battleState: BattleState = createBattleState();
        cardToUseAfterDiscard.effect(playerTeam[0], enemy, battleState);
        playCard(cardToUseAfterDiscard, 'self');
      }
      setCardToUseAfterDiscard(null);
    } else {
      setSelectedCardInstanceId(prev => prev === card.instanceId ? null : card.instanceId);
    }
  };

  const handleCardUse = (target?: 'enemy' | 'self') => {
    if (!selectedCard || playerEnergy < selectedCard.cost) return;
  
    if (selectedCard.requiresCardSelection) {
      setSelectingCardForEffect(selectedCard);
      return;
    }
  
    if (selectedCard.requiresTarget && !target) return;
  
    const effectiveTarget = selectedCard.requiresTarget ? target! : 'self';
    playCard(selectedCard, effectiveTarget);
  };
  
  const handleCardSelectionForEffect = (selectedCard: CardInstance) => {
    if (!selectingCardForEffect) return;
  
    const battleState = createBattleState();
    if (selectingCardForEffect.effect) {
      selectingCardForEffect.effect(playerTeam[0], enemy, battleState, selectedCard);
    }
  
    playCard(selectingCardForEffect, 'self');
    setSelectingCardForEffect(null);
  };

  const createBattleState = (): BattleState => ({
    playerEnergy,
    playerHand,
    playerDeck,
    playerDiscardPile,
    enemyHp,
    enemyBlock,
    discardCard,
    discardHand,
    drawCard,
    discardRandomCards,
    getDiscardedCardCount,
    healRandomAlly,
    addRandomAllyBlock,
    damageRandomEnemy,
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
  });

  const playCard = (card: CardInstance, target: 'enemy' | 'self') => {
    setPlayerEnergy(prev => prev - card.cost);
    setPlayerHand(prev => prev.filter(c => c.instanceId !== card.instanceId));
    setPlayerDiscardPile(prev => [...prev, card]);

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
  };

  const dealDamageToPlayer = (damage: number) => {
    setPlayerTeamHp(prev => {
      const newHp = [...prev];
      if (playerTeamBlock[0] > 0) {
        const remainingDamage = Math.max(0, damage - playerTeamBlock[0]);
        setPlayerTeamBlock(prevBlock => {
          const newBlock = [...prevBlock];
          newBlock[0] = Math.max(0, newBlock[0] - damage);
          return newBlock;
        });
        newHp[0] = Math.max(0, newHp[0] - remainingDamage);
      } else {
        newHp[0] = Math.max(0, newHp[0] - damage);
      }
      return newHp;
    });
  };

  const endTurn = () => {
    setTurn(prev => prev + 1);
    setPlayerEnergy(3);
    drawCard();
    // enemy turn logic
    // placeholder - just have the enemy deal some damage
    const enemyDamage = 5;
    dealDamageToPlayer(enemyDamage);

    // reduce block at the end of the turn
    setPlayerTeamBlock(prev => prev.map(block => Math.max(0, block - 1)));
    setEnemyBlock(prev => Math.max(0, prev - 1));

    if (playerTeamHp[0] <= 0) {
      onBattleEnd(false);
    }
  };

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
    selectedCard,
    requiresTarget,
    handleCardClick,
    handleDiscard: () => discardCard(1),
    endTurn,
    selectingCardForEffect
  };

  return <>{children(battleProps)}</>;
};

export default BattleLogic;
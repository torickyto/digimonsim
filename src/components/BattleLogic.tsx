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
  handleCardClick: (card: CardInstance) => void;
  handleCardUse: (target: 'enemy' | 'self') => void;
  handleDiscard: () => void;
  endTurn: () => void;
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

    useEffect(() => {
        const initialDeck = shuffleArray(playerTeam.flatMap(digimon => digimon.deck));
        setPlayerDeck(initialDeck);
        drawInitialHand(initialDeck);
      }, [playerTeam]);

      const createCardInstance = (card: CardType): CardInstance => ({
        ...card,
        instanceId: `${card.id}_${Date.now()}_${Math.random()}`
      });
    
      const drawInitialHand = (deck: CardType[]) => {
        const initialHandSize = 3 + playerTeam.length;
        const initialHand = deck.slice(0, initialHandSize).map(createCardInstance);
        setPlayerHand(initialHand);
        setPlayerDeck(deck.slice(initialHandSize));
      };

      const drawCard = (amount: number = 1) => {
        for (let i = 0; i < amount; i++) {
          if (playerDeck.length === 0) {
            if (playerDiscardPile.length === 0) return;
            const shuffledDiscard = shuffleArray(playerDiscardPile);
            setPlayerDeck(shuffledDiscard.slice(1));
            setPlayerDiscardPile([]);
            setPlayerHand(prev => [...prev, createCardInstance(shuffledDiscard[0])]);
          } else {
            const [newCard, ...remainingDeck] = playerDeck;
            setPlayerHand(prev => [...prev, createCardInstance(newCard)]);
            setPlayerDeck(remainingDeck);
          }
        }
      };

      const handleCardClick = (card: CardInstance) => {
        setSelectedCardInstanceId(prev => prev === card.instanceId ? null : card.instanceId);
      };

  const handleCardUse = (target: 'enemy' | 'self') => {
    if (selectedCardInstanceId === null) return;
    const card = playerHand.find(c => c.instanceId === selectedCardInstanceId);
    if (!card || playerEnergy < card.cost) return;

    setPlayerEnergy(prev => prev - card.cost);
    setPlayerHand(prev => prev.filter(c => c.instanceId !== selectedCardInstanceId));
    setPlayerDiscardPile(prev => [...prev, card]);

    const battleState: BattleState = {
      playerEnergy,
      playerHand,
      playerDeck,
      playerDiscardPile,
      enemyHp,
      enemyBlock,
      drawCard,
      discardCard,
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
      setEnemyBlock: (amount: number) => setEnemyBlock(amount)
    };

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

    if (enemyHp <= 0) {
      onBattleEnd(true);
    }
  };

  const dealDamageToEnemy = (damage: number) => {
    if (enemyBlock > 0) {
      const remainingDamage = Math.max(0, damage - enemyBlock);
      setEnemyBlock(Math.max(0, enemyBlock - damage));
      setEnemyHp(prev => Math.max(0, prev - remainingDamage));
    } else {
      setEnemyHp(prev => Math.max(0, prev - damage));
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

  const discardCard = (amount: number = 1) => {
    const discardedCards = playerHand.slice(0, amount);
    setPlayerHand(prev => prev.slice(amount));
    setPlayerDiscardPile(prev => [...prev, ...discardedCards]);
  };

  const endTurn = () => {
    setTurn(prev => prev + 1);
    setPlayerEnergy(3);
    drawCard();
    // Implement enemy turn logic here
    // For now, let's just have the enemy deal some damage
    const enemyDamage = 5;
    dealDamageToPlayer(enemyDamage);

    // Reduce block at the end of the turn
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
    handleCardClick,
    handleCardUse,
    handleDiscard: discardCard,
    endTurn
  };

  return <>{children(battleProps)}</>;
};

export default BattleLogic;
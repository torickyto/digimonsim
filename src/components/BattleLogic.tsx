import React, { useState, useEffect } from 'react';
import { Digimon, CardType, BattleState } from '../shared/types';
import { shuffleArray } from '../utils/deckUtils';

interface BattleLogicProps {
  playerTeam: Digimon[];
  enemy: Digimon;
  onBattleEnd: (playerWon: boolean) => void;
  children: (battleProps: BattleLogicChildProps) => React.ReactNode;
}

interface BattleLogicChildProps {
  turn: number;
  playerEnergy: number;
  playerHand: CardType[];
  playerDeck: CardType[];
  playerDiscardPile: CardType[];
  selectedCardId: number | null;
  enemyHp: number;
  enemyBlock: number;
  enemy: Digimon;
  playerTeamHp: number[];
  playerTeamBlock: number[];
  handleCardClick: (card: CardType) => void;
  handleCardUse: (target: 'enemy' | 'self') => void;
  handleDiscard: () => void;
  endTurn: () => void;
}

const BattleLogic: React.FC<BattleLogicProps> = ({ playerTeam, enemy, onBattleEnd, children }) => {
  const [turn, setTurn] = useState(1);
  const [playerEnergy, setPlayerEnergy] = useState(1);
  const [playerDeck, setPlayerDeck] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [playerDiscardPile, setPlayerDiscardPile] = useState<CardType[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [playerTeamBlock, setPlayerTeamBlock] = useState(playerTeam.map(() => 0));
  const [playerTeamHp, setPlayerTeamHp] = useState(playerTeam.map(d => d.hp));

  useEffect(() => {
    const initialDeck = shuffleArray(playerTeam.flatMap(digimon => digimon.deck));
    setPlayerDeck(initialDeck);
    drawInitialHand(initialDeck);
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
      setPlayerHand(prev => [...prev, shuffledDiscard[0]]);
      setPlayerDeck(shuffledDiscard.slice(1));
    } else {
      const [newCard, ...remainingDeck] = playerDeck;
      setPlayerHand(prev => [...prev, newCard]);
      setPlayerDeck(remainingDeck);
    }
  };

  const handleCardClick = (card: CardType) => {
    setSelectedCardId(prev => prev === card.id ? null : card.id);
  };

  const handleCardUse = (target: 'enemy' | 'self') => {
    if (selectedCardId === null) return;
    const card = playerHand.find(c => c.id === selectedCardId);
    if (!card || playerEnergy < card.cost) return;

    setPlayerEnergy(prev => prev - card.cost);
    setPlayerHand(prev => prev.filter(c => c.id !== selectedCardId));
    setPlayerDiscardPile(prev => [...prev, card]);

    const battleState: BattleState = {
      playerEnergy,
      playerHand,
      playerDeck,
      playerDiscardPile,
      enemyHp,
      enemyBlock
    };

    switch (card.type) {
      case 'attack':
        if (target === 'enemy') {
          const damage = card.damage || 0;
          dealDamageToEnemy(damage);
        }
        break;
      case 'block':
        if (target === 'self') {
          setPlayerTeamBlock(prev => {
            const newBlock = [...prev];
            newBlock[0] = newBlock[0] + (card.block || 0);
            return newBlock;
          });
        }
        break;
      case 'special':
        if (card.effect) {
          card.effect(playerTeam[0], enemy, battleState);
          if (card.name === 'Bada Boom') {
            dealDamageToEnemy(6);
            drawCard();
          }
        }
        break;
    }

    setSelectedCardId(null);

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

  const handleDiscard = () => {
    if (selectedCardId === null) return;
    const cardToDiscard = playerHand.find(card => card.id === selectedCardId);
    if (!cardToDiscard) return;

    setPlayerHand(prev => prev.filter(card => card.id !== selectedCardId));
    setPlayerDiscardPile(prev => [...prev, cardToDiscard]);
    setSelectedCardId(null);
  };

  const endTurn = () => {
    setTurn(prev => prev + 1);
    setPlayerEnergy(prev => Math.min(10, prev + 1));
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
    selectedCardId,
    enemyHp,
    enemyBlock,
    enemy,
    playerTeamHp,
    playerTeamBlock,
    handleCardClick,
    handleCardUse,
    handleDiscard,
    endTurn
  };

  return <>{children(battleProps)}</>;
};

export default BattleLogic;
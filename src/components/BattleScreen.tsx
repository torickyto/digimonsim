import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DigimonSprite from './DigimonSprite';
import Card from './Card';
import { Digimon, CardType, BattleState, DigimonType } from '../shared/types';
import './BattleScreen.css';

const ENEMY_AGUMON: Digimon = {
  id: 0,
  name: 'agumon',
  displayName: 'Agumon',
  type: 'VACCINE' as DigimonType,
  hp: 50,
  maxHp: 50,
  block: 0,
  level: 1,
  exp: 0,
  baseHp: 50,
  specialAbility: {
    name: 'Pepper Breath',
    cost: 2,
    effect: (attacker: Digimon, defender: Digimon, battleState: BattleState) => {
      console.log(`${attacker.name} uses Pepper Breath on ${defender.name}`);
    },
    description: 'Deal 10 damage to the enemy.'
  }
};

interface BattleScreenProps {
  playerDigimon: Digimon;
  onBattleEnd: (playerWon: boolean) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerDigimon, onBattleEnd }) => {
  const [playerHp, setPlayerHp] = useState(playerDigimon.hp);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [enemyHp, setEnemyHp] = useState(ENEMY_AGUMON.hp);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  const [playerDeck, setPlayerDeck] = useState<CardType[]>(() => [
    { id: 1, name: 'Attack', type: 'attack', cost: 1, damage: 6 },
    { id: 2, name: 'Block', type: 'block', cost: 1, block: 5 },
    { 
      id: 3, 
      name: playerDigimon.specialAbility.name, 
      type: 'special', 
      cost: playerDigimon.specialAbility.cost, 
      effect: playerDigimon.specialAbility.effect 
    },
    ...Array(3).fill(null).map((_, index) => ({ 
      id: 4 + index, 
      name: 'Attack', 
      type: 'attack' as const, 
      cost: 1, 
      damage: 6 
    })),
    ...Array(3).fill(null).map((_, index) => ({ 
      id: 7 + index, 
      name: 'Block', 
      type: 'block' as const, 
      cost: 1, 
      block: 5 
    })),
  ]);

  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [playerDiscardPile, setPlayerDiscardPile] = useState<CardType[]>([]);

  const battleState = useMemo<BattleState>(() => ({
    playerEnergy,
    playerHand,
    playerDeck,
    playerDiscardPile,
    enemyBlock
  }), [playerEnergy, playerHand, playerDeck, playerDiscardPile, enemyBlock]);

  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const drawCard = useCallback(() => {
    setPlayerDeck(prevDeck => {
      if (prevDeck.length === 0) {
        const newDeck = shuffleArray([...playerDiscardPile]);
        setPlayerDiscardPile([]);
        setPlayerHand(prevHand => {
          const drawnCard = newDeck[0];
          return [...prevHand, drawnCard];
        });
        return newDeck.slice(1);
      }
      const [drawnCard, ...remainingDeck] = prevDeck;
      setPlayerHand(prevHand => [...prevHand, drawnCard]);
      return remainingDeck;
    });
  }, [shuffleArray, playerDiscardPile]);

  const drawInitialHand = useCallback(() => {
    setPlayerDeck(prevDeck => {
      const initialHand = prevDeck.slice(0, 5);
      setPlayerHand(initialHand);
      return prevDeck.slice(5);
    });
  }, []);

  const playCard = useCallback((card: CardType) => {
    if (playerEnergy >= card.cost) {
      setPlayerEnergy(prevEnergy => prevEnergy - card.cost);
      setPlayerHand(prevHand => prevHand.filter(c => c.id !== card.id));
      setPlayerDiscardPile(prevDiscard => [...prevDiscard, card]);

      switch (card.type) {
        case 'attack':
          if (typeof card.damage === 'number') {
            const damage = Math.max(0, card.damage - enemyBlock);
            setEnemyHp(prevHp => Math.max(0, prevHp - damage));
            setEnemyBlock(prevBlock => Math.max(0, prevBlock - card.damage));
          }
          break;
        case 'block':
          if (typeof card.block === 'number') {
            setPlayerBlock(prevBlock => prevBlock + card.block);
          }
          break;
        case 'special':
          if (card.effect) {
            card.effect(playerDigimon, ENEMY_AGUMON, battleState);
          }
          break;
      }
    }
  }, [playerEnergy, enemyBlock, playerDigimon, battleState]);

  const executeEnemyTurn = useCallback(() => {
    // Implement enemy turn logic here
    setIsPlayerTurn(true);
    setPlayerEnergy(3);
    drawCard();
  }, [drawCard]);

  const endTurn = useCallback(() => {
    if (isPlayerTurn) {
      setIsPlayerTurn(false);
      setTimeout(executeEnemyTurn, 1000);
    }
  }, [isPlayerTurn, executeEnemyTurn]);

  useEffect(() => {
    drawInitialHand();
  }, [drawInitialHand]);

  useEffect(() => {
    if (playerHp <= 0 || enemyHp <= 0) {
      onBattleEnd(playerHp > 0);
    }
  }, [playerHp, enemyHp, onBattleEnd]);

  return (
    <div className="battle-screen" style={{backgroundImage: 'url(/assets/backgrounds/northcave.png)'}}>
      <div className="player-digimon">
        <DigimonSprite name={playerDigimon.name} />
        <div className="hp-bar">
          HP: {playerHp}/{playerDigimon.maxHp}
          <div className="hp-fill" style={{width: `${(playerHp / playerDigimon.maxHp) * 100}%`}}></div>
        </div>
        <div>Block: {playerBlock}</div>
      </div>
      <div className="enemy-digimon">
        <DigimonSprite name={ENEMY_AGUMON.name} />
        <div className="hp-bar">
          HP: {enemyHp}/{ENEMY_AGUMON.maxHp}
          <div className="hp-fill" style={{width: `${(enemyHp / ENEMY_AGUMON.maxHp) * 100}%`}}></div>
        </div>
        <div>Block: {enemyBlock}</div>
      </div>
      <div className="player-hand">
        {playerHand.map(card => (
          <Card 
            key={card.id} 
            card={card} 
            onPlay={() => playCard(card)} 
            disabled={!isPlayerTurn || playerEnergy < card.cost} 
          />
        ))}
      </div>
      <div className="player-info">
        <div>Energy: {playerEnergy}/3</div>
        <button onClick={endTurn} disabled={!isPlayerTurn}>End Turn</button>
      </div>
    </div>
  );
};

export default BattleScreen;
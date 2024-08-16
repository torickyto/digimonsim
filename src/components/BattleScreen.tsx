import React, { useState, useEffect, useCallback } from 'react';
import DigimonSprite from './DigimonSprite';
import Card from './Card';
import { Digimon, Card as CardType, BattleState } from '../shared/types';
import './BattleScreen.css';

const ENEMY_AGUMON: Digimon = {
  id: 0,
  name: 'agumon',
  displayName: 'Agumon',
  type: 'DATA',
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
  const [playerDeck, setPlayerDeck] = useState<CardType[]>([
    { id: 1, name: 'Attack', type: 'attack', damage: 6, cost: 1 },
    { id: 2, name: 'Block', type: 'block', block: 5, cost: 1 },
    { id: 3, name: playerDigimon.specialAbility.name, type: 'special', cost: 2, effect: playerDigimon.specialAbility.effect },
    ...Array(3).fill({ id: 4, name: 'Attack', type: 'attack', damage: 6, cost: 1 }),
    ...Array(3).fill({ id: 5, name: 'Block', type: 'block', block: 5, cost: 1 }),
  ]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  const battleState: BattleState = {
    playerEnergy,
    playerHand,
    playerDeck,
    playerDiscardPile: [],
    enemyBlock
  };

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
        const newDeck = shuffleArray([...prevDeck, ...playerHand]);
        setPlayerHand([]);
        return newDeck;
      }
      const [drawnCard, ...remainingDeck] = prevDeck;
      setPlayerHand(prevHand => [...prevHand, drawnCard]);
      return remainingDeck;
    });
  }, [playerHand, shuffleArray]);

  const drawInitialHand = useCallback(() => {
    const initialHand = playerDeck.slice(0, 5);
    setPlayerHand(initialHand);
    setPlayerDeck(prevDeck => prevDeck.slice(5));
  }, [playerDeck]);

  useEffect(() => {
    drawInitialHand();
  }, [drawInitialHand]);

  const playCard = useCallback((card: CardType) => {
    if (playerEnergy >= card.cost) {
      setPlayerEnergy(prevEnergy => prevEnergy - card.cost);
      setPlayerHand(prevHand => prevHand.filter(c => c.id !== card.id));
      if (card.type === 'attack' && card.damage !== undefined) {
        const damage = Math.max(0, card.damage - enemyBlock);
        setEnemyHp(prevHp => Math.max(0, prevHp - damage));
        setEnemyBlock(prevBlock => Math.max(0, prevBlock - card.damage!));
      } else if (card.type === 'block' && card.block !== undefined) {
        setPlayerBlock(prevBlock => prevBlock + card.block!);
      } else if (card.type === 'special' && card.effect) {
        card.effect(playerDigimon, ENEMY_AGUMON, battleState);
      }
    }
  }, [playerEnergy, enemyBlock, playerDigimon, battleState]);

  const executeEnemyTurn = useCallback(() => {
    // Implement enemy turn logic here
    setIsPlayerTurn(true);
  }, []);

  const endTurn = useCallback(() => {
    if (isPlayerTurn) {
      setIsPlayerTurn(false);
      setPlayerEnergy(3);
      drawCard();
      setTimeout(executeEnemyTurn, 1000);
    }
  }, [isPlayerTurn, drawCard, executeEnemyTurn]);

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
          <Card key={card.id} card={card} onPlay={() => playCard(card)} disabled={!isPlayerTurn || playerEnergy < card.cost} />
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
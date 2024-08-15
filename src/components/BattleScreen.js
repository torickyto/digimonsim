import React, { useState, useEffect, useCallback } from 'react';
import DigimonSprite from './DigimonSprite';
import Card from './Card';
import './BattleScreen.css';

const ENEMY_AGUMON = {
  name: 'Agumon',
  hp: 50,
  maxHp: 50,
  block: 0,
  deck: [
    { id: 1, name: 'Attack', type: 'attack', damage: 6, cost: 1 },
    { id: 2, name: 'Block', type: 'block', block: 5, cost: 1 },
    { id: 3, name: 'Pepper Breath', type: 'attack', damage: 10, cost: 2 },
  ]
};

const BattleScreen = ({ playerDigimon, onBattleEnd }) => {
  const [playerHp, setPlayerHp] = useState(playerDigimon.hp);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [enemyHp, setEnemyHp] = useState(ENEMY_AGUMON.hp);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [playerDeck, setPlayerDeck] = useState([
    { id: 1, name: 'Attack', type: 'attack', damage: 6, cost: 1 },
    { id: 2, name: 'Block', type: 'block', block: 5, cost: 1 },
    { id: 3, name: playerDigimon.specialAbility.name, type: 'attack', damage: 10, cost: 2 },
    ...Array(3).fill({ id: 4, name: 'Attack', type: 'attack', damage: 6, cost: 1 }),
    ...Array(3).fill({ id: 5, name: 'Block', type: 'block', block: 5, cost: 1 }),
  ]);
  const [playerHand, setPlayerHand] = useState([]);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  const shuffleArray = useCallback((array) => {
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
        // Shuffle discard pile back into deck
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

  const playCard = useCallback((card) => {
    if (playerEnergy >= card.cost) {
      setPlayerEnergy(prevEnergy => prevEnergy - card.cost);
      setPlayerHand(prevHand => prevHand.filter(c => c.id !== card.id));
      if (card.type === 'attack') {
        const damage = Math.max(0, card.damage - enemyBlock);
        setEnemyHp(prevHp => Math.max(0, prevHp - damage));
        setEnemyBlock(prevBlock => Math.max(0, prevBlock - card.damage));
      } else if (card.type === 'block') {
        setPlayerBlock(prevBlock => prevBlock + card.block);
      }
    }
  }, [playerEnergy, enemyBlock]);

  const executeEnemyTurn = useCallback(() => {
    const enemyCard = ENEMY_AGUMON.deck[Math.floor(Math.random() * ENEMY_AGUMON.deck.length)];
    if (enemyCard.type === 'attack') {
      const damage = Math.max(0, enemyCard.damage - playerBlock);
      setPlayerHp(prevHp => Math.max(0, prevHp - damage));
      setPlayerBlock(prevBlock => Math.max(0, prevBlock - enemyCard.damage));
    } else if (enemyCard.type === 'block') {
      setEnemyBlock(prevBlock => prevBlock + enemyCard.block);
    }
    setIsPlayerTurn(true);
  }, [playerBlock]);

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
        <DigimonSprite name={playerDigimon.name} flipped={true} />
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
          <Card key={card.id} card={card} onPlay={playCard} disabled={!isPlayerTurn || playerEnergy < card.cost} />
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
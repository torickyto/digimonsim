import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DigimonSprite from './DigimonSprite';
import Card from './Card';
import { Digimon, CardType, BattleState, DigimonType, SpecialAbility } from '../shared/types';
import { createDeck, shuffleArray } from '../utils/deckUtils';
import './BattleScreen.css';

interface BattleScreenProps {
  playerDigimon: Digimon;
  onBattleEnd: (playerWon: boolean) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerDigimon, onBattleEnd }) => {

  const enemyAgumon: Digimon = {
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
        const damage = 10;
        defender.hp = Math.max(0, defender.hp - damage);
      },
      description: 'Deal 10 damage to the enemy.'
    } as SpecialAbility
  };

  const [playerHp, setPlayerHp] = useState(playerDigimon.hp);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [enemyHp, setEnemyHp] = useState(enemyAgumon.hp);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  const [playerDeck, setPlayerDeck] = useState<CardType[]>(() => 
    createDeck([playerDigimon])
  );
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [playerDiscardPile, setPlayerDiscardPile] = useState<CardType[]>([]);


  useEffect(() => {
    drawCard(5);
  }, []);

  const battleState = useMemo<BattleState>(() => ({
    playerEnergy,
    playerHand,
    playerDeck,
    playerDiscardPile,
    enemyBlock
  }), [playerEnergy, playerHand, playerDeck, playerDiscardPile, enemyBlock]);

  const playCard = useCallback((card: CardType) => {
    if (card && playerEnergy >= card.cost) {
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
            const updatedPlayerDigimon = { ...playerDigimon, hp: playerHp };
            const updatedEnemyAgumon = { ...enemyAgumon, hp: enemyHp };
            card.effect(updatedPlayerDigimon, updatedEnemyAgumon, battleState);
            setPlayerHp(updatedPlayerDigimon.hp);
            setEnemyHp(updatedEnemyAgumon.hp);
          }
          break;
      }
    }
  },  [playerEnergy, enemyBlock, playerDigimon, enemyAgumon, battleState, playerHp, enemyHp]);

  const drawCard = useCallback((amount: number = 1) => {
    for (let i = 0; i < amount; i++) {
      setPlayerDeck(prevDeck => {
        if (prevDeck.length === 0) {
          const newDeck = shuffleArray([...playerDiscardPile]);
          setPlayerDiscardPile([]);
          setPlayerHand(prevHand => {
            const drawnCard = newDeck[0];
            return drawnCard ? [...prevHand, drawnCard] : prevHand;
          });
          return newDeck.slice(1);
        }
        const [drawnCard, ...remainingDeck] = prevDeck;
        setPlayerHand(prevHand => drawnCard ? [...prevHand, drawnCard] : prevHand);
        return remainingDeck;
      });
    }
  }, [playerDiscardPile]);

  const executeEnemyTurn = useCallback(() => {
    // Implement more complex enemy AI here
    const damage = 5 + Math.floor(Math.random() * 5); // Random damage between 5-10
    const blockAmount = Math.floor(Math.random() * 5); // Random block between 0-5

    setPlayerBlock(prevBlock => {
      const remainingDamage = Math.max(0, damage - prevBlock);
      setPlayerHp(prevHp => Math.max(0, prevHp - remainingDamage));
      return Math.max(0, prevBlock - damage);
    });

    setEnemyBlock(prevBlock => prevBlock + blockAmount);

    setIsPlayerTurn(true);
    setPlayerEnergy(3);
    drawCard(5);
  }, [drawCard]);

  const endTurn = useCallback(() => {
    if (isPlayerTurn) {
      setIsPlayerTurn(false);
      setPlayerBlock(0); // Reset player's block at end of turn
      setPlayerHand([]); // Discard hand
      setTimeout(executeEnemyTurn, 1000);
    }
  }, [isPlayerTurn, executeEnemyTurn]);

  useEffect(() => {
    drawCard(5); // Draw initial hand
  }, [drawCard]);

  useEffect(() => {
    if (playerHp <= 0 || enemyHp <= 0) {
      onBattleEnd(playerHp > 0);
    }
  }, [playerHp, enemyHp, onBattleEnd]);

  return (
    <div className="battle-screen" style={{backgroundImage: 'url(/assets/backgrounds/northcave.png)'}}>
      <div className="enemy-intent">
        {/* Display enemy's next action */}
      </div>
      <div className="battle-area">
        <div className="player-digimon">
          <DigimonSprite name={playerDigimon.name} />
          <div className="hp-bar">
            <div className="hp-text">HP: {playerHp}/{playerDigimon.maxHp}</div>
            <div className="hp-fill" style={{width: `${(playerHp / playerDigimon.maxHp) * 100}%`}}></div>
          </div>
          <div className="block-indicator">{playerBlock > 0 && `Block: ${playerBlock}`}</div>
        </div>
        <div className="enemy-digimon">
          <DigimonSprite name={enemyAgumon.name} />
          <div className="hp-bar">
            <div className="hp-text">HP: {enemyHp}/{enemyAgumon.maxHp}</div>
            <div className="hp-fill" style={{width: `${(enemyHp / enemyAgumon.maxHp) * 100}%`}}></div>
          </div>
          <div className="block-indicator">{enemyBlock > 0 && `Block: ${enemyBlock}`}</div>
        </div>
      </div>
      <div className="player-hand">
        {playerHand.map(card => card && (
          <Card 
            key={card.id} 
            card={card} 
            onPlay={() => playCard(card)} 
            disabled={!isPlayerTurn || playerEnergy < card.cost} 
          />
        ))}
      </div>
      <div className="player-info">
        <div className="energy-indicator">Energy: {playerEnergy}/3</div>
        <div className="deck-pile">Deck: {playerDeck.length}</div>
        <div className="discard-pile">Discard: {playerDiscardPile.length}</div>
        <button className="end-turn-button" onClick={endTurn} disabled={!isPlayerTurn}>End Turn</button>
      </div>
    </div>
  );
};

export default BattleScreen;
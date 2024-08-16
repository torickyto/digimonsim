import React, { useState } from 'react';
import Card from './Card';
import { Digimon, Card as CardType, BattleState } from '../shared/types';

interface BattleSystemProps {
  playerTeam: Digimon[];
  enemy: Digimon;
}

const BattleSystem: React.FC<BattleSystemProps> = ({ playerTeam, enemy }) => {
  const shuffleDeck = (deck: CardType[]): CardType[] => {
    return [...deck].sort(() => Math.random() - 0.5);
  };

  const createDeck = (digimon: Digimon): CardType[] => {
    // Implement the logic to create a deck based on the digimon
    return [];
  };

  const getHandSize = (teamSize: number): number => {
    // Implement the logic to determine hand size based on team size
    return 5;
  };

  // Directly initialize state without useEffect
  const initialDeck = shuffleDeck(playerTeam.flatMap(digimon => createDeck(digimon)));
  const initialHandSize = getHandSize(playerTeam.length);
  const initialHand = initialDeck.slice(0, initialHandSize);
  const remainingDeck = initialDeck.slice(initialHandSize);

  const [deck, setDeck] = useState<CardType[]>(remainingDeck);
  const [hand, setHand] = useState<CardType[]>(initialHand);
  const [discardPile, setDiscardPile] = useState<CardType[]>([]);
  const [energy, setEnergy] = useState(3);
  const [turn, setTurn] = useState(1);
  const [enemyBlock, setEnemyBlock] = useState(0);

  const battleState: BattleState = {
    playerEnergy: energy,
    playerHand: hand,
    playerDeck: deck,
    playerDiscardPile: discardPile,
    enemyBlock: enemyBlock
  };

  const drawCard = () => {
    if (deck.length === 0) {
      refreshDeck();
    }
    if (deck.length > 0) {
      const newCard = deck[0];
      setHand([...hand, newCard]);
      setDeck(deck.slice(1));
    }
  };

  const refreshDeck = () => {
    const newDeck = shuffleDeck([...discardPile]);
    setDeck(newDeck);
    setDiscardPile([]);
  };

  const playCard = (card: CardType) => {
    if (energy >= card.cost) {
      if (card.effect) {
        card.effect(playerTeam[0], enemy, battleState);
      }
      setEnergy(energy - card.cost);
      setHand(hand.filter(c => c.id !== card.id));
      setDiscardPile([...discardPile, card]);
    }
  };

  const endTurn = () => {
    setTurn(turn + 1);
    setEnergy(3);
    const handSize = getHandSize(playerTeam.length);
    while (hand.length < handSize && (deck.length > 0 || discardPile.length > 0)) {
      drawCard();
    }
    // enemy turn logic here
  };

  return (
    <div className="battle-system">
      <div className="player-team">
        {playerTeam.map(digimon => (
          <div key={digimon.id} className="digimon-card">
            <h3>{digimon.name}</h3>
            <p>HP: {digimon.hp}/{digimon.maxHp}</p>
            <p>Block: {digimon.block}</p>
          </div>
        ))}
      </div>
      <div className="enemy">
        <h3>{enemy.name}</h3>
        <p>HP: {enemy.hp}/{enemy.maxHp}</p>
        <p>Block: {enemyBlock}</p>
      </div>
      <div className="player-hand">
        {hand.map(card => (
          <Card key={card.id} card={card} onPlay={() => playCard(card)} />
        ))}
      </div>
      <div className="player-info">
        <p>Energy: {energy}/3</p>
        <p>Turn: {turn}</p>
        <p>Deck: {deck.length}</p>
        <p>Discard: {discardPile.length}</p>
      </div>
      <button onClick={endTurn}>End Turn</button>
    </div>
  );
};

export default BattleSystem;
import React from 'react';
import { CardType } from '../shared/types';
import './Card.css';

interface CardProps {
  card: CardType;
  onPlay: (card: CardType) => void;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({ card, onPlay, disabled = false }) => {
  return (
    <div 
      className={`card ${card.type} ${disabled ? 'disabled' : ''}`} 
      onClick={() => !disabled && onPlay(card)}
    >
      <div className="card-cost">{card.cost}</div>
      <h3 className="card-name">{card.name}</h3>
      <div className="card-effect">
        {card.type === 'attack' && `Deal ${card.damage} damage`}
        {card.type === 'block' && `Gain ${card.block} block`}
        {card.type === 'special' && 'Special effect'}
      </div>
    </div>
  );
};

export default Card;
import React from 'react';
import './Card.css';

const Card = ({ card, onPlay, disabled }) => {
  return (
    <div className={`card ${card.type} ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && onPlay(card)}>
      <div className="card-cost">{card.cost}</div>
      <h3 className="card-name">{card.name}</h3>
      <div className="card-effect">
        {card.type === 'attack' && `Deal ${card.damage} damage`}
        {card.type === 'block' && `Gain ${card.block} block`}
      </div>
    </div>
  );
};

export default Card;
import React from 'react';
import { CardType } from '../shared/types';

interface CardProps {
  card: CardType;
  onClick: () => void;
  isSelected: boolean;
  onMouseEnter?: () => void; 
  onMouseLeave?: () => void; 
}

const Card: React.FC<CardProps> = ({ card, onClick, isSelected, onMouseEnter, onMouseLeave }) => {
  const imageSrc = require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`);
  return (
    <div 
      className={`game-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="card-content">
        <div className="card-image">
        <img src={imageSrc} alt={card.name} />
        </div>
        <div className="card-info">
          <h3 className="card-name">{card.name}</h3>
          <p className="card-description">{card.description}</p>
        </div>
        <div className="card-cost">{card.cost}</div>
      </div>
    </div>
  );
};

export default Card;
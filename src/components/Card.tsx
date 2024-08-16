import React from 'react';
import { CardType } from '../shared/types';

interface CardProps {
  card: CardType;
  onClick: () => void;
  isSelected: boolean;
  onMouseEnter?: () => void; 
  onMouseLeave?: () => void; 
}

const Card: React.FC<CardProps> = ({ card, onClick, isSelected }) => {
  return (
    <div 
      className={`game-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-content">
        <div className="card-image">
          <img src={`/api/placeholder/48/48?text=${card.type}`} alt={card.name} />
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
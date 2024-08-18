import React from 'react';
import { CardType } from '../shared/types';
import './Card.css';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isSelected?: boolean;
  isCompact?: boolean;
  onMouseEnter?: () => void; 
  onMouseLeave?: () => void; 
  disabled?: boolean;
  isBeingDiscarded?: boolean;
  isTopCard?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  onDoubleClick, 
  isSelected, 
  isCompact = false, 
  onMouseEnter, 
  onMouseLeave, 
  disabled = false,
  isBeingDiscarded = false,
  isTopCard = false
}) => {
  const imageSrc = require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`);
  
  return (
    <div 
      className={`game-card ${isSelected ? 'selected' : ''} ${isCompact ? 'compact' : ''} ${disabled ? 'disabled' : ''} ${isBeingDiscarded ? 'discarding' : ''} ${isTopCard ? 'top-card' : ''}`}
      onClick={disabled ? undefined : onClick}
      onDoubleClick={disabled ? undefined : onDoubleClick}
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
      </div>
      <div className="card-cost" data-type={card.digimonType}>
        {card.cost}
      </div>
    </div>
  );
};

export default Card;
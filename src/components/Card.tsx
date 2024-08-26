import React from 'react';
import { Card as CardType } from '../shared/types';
import './Card.css';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
  isBeingDiscarded?: boolean;
  isTopCard?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  onDoubleClick, 
  isSelected, 
  disabled = false,
  isBeingDiscarded = false,
  isTopCard = false,
}) => {
  const imageSrc = `/assets/cards/${card.id.toLowerCase()}.png`;
  
  const cardClasses = [
    'game-card',
    isSelected && 'selected',
    disabled && 'disabled',
    isBeingDiscarded && 'discarding',
    isTopCard && 'top-card',
    card.requiresCardSelection && 'requires-selection',
  ].filter(Boolean).join(' ');

  const getCardTags = () => {
    const tags = [];
    if (card.effects.some(effect => effect.burst)) tags.push('BURST');
    if (card.effects.some(effect => effect.recompile)) tags.push('RECURSIVE');
    // Add more tag checks as needed
    return tags;
  };
  
  return (
    <div 
      className={cardClasses}
      onClick={disabled ? undefined : onClick}
      onDoubleClick={disabled ? undefined : onDoubleClick}
    >
      <div className="card-content">
        <div className="card-image">
          <img src={imageSrc} alt={card.name} />
        </div>
        <div className="card-info">
          <h3 className="card-name">{card.name}</h3>
          <p className="card-description">{card.description}</p>
          <div className="card-tags">
            {getCardTags().map(tag => (
              <span key={tag} className="card-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="card-cost" data-type={card.digimonType}>
        {card.cost}
      </div>
      <div className="card-type">{card.type}</div>
    </div>
  );
};

export default Card;
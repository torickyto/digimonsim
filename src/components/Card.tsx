import React from 'react';
import { CardType } from '../shared/types';

interface CardProps {
  card: CardType;
  onClick: () => void;
  isSelected: boolean;
  isCompact?: boolean;
  onMouseEnter?: () => void; 
  onMouseLeave?: () => void; 
}

const Card: React.FC<CardProps> = ({ card, onClick, isSelected, isCompact = false, onMouseEnter, onMouseLeave }) => {
  const imageSrc = require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`);
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'null': return '#808080';
      case 'vaccine': return '#00ff00';
      case 'virus': return '#ff0000';
      case 'data': return '#0000ff';
      default: return '#ffffff';
    }
  };

  return (
    <div 
      className={`game-card ${isSelected ? 'selected' : ''} ${isCompact ? 'compact' : ''}`}
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
        <div className="card-cost" style={{backgroundColor: getTypeColor(card.type)}}>
          {card.cost}
        </div>
      </div>
    </div>
  );
};

export default Card;
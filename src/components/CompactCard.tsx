import React, { useEffect, useState } from 'react';
import { Card } from '../shared/types';
import './CompactCard.css';

interface CompactCardProps {
  card: Card;
  onClick: () => void;
  isSelected: boolean;
  isPlayable: boolean;
  isTopCard: boolean;
  isNewlyDrawn: boolean;
  onMouseEnter: (card: Card, event: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const CompactCard: React.FC<CompactCardProps> = ({ 
  card, 
  onClick, 
  isSelected, 
  isPlayable, 
  isTopCard,
  isNewlyDrawn,
  onMouseEnter,
  onMouseLeave
}) => {
  const isAnimating = isNewlyDrawn;

  return (
    <div 
      className={`compact-card ${isSelected ? 'selected' : ''} ${isPlayable ? 'playable' : ''} ${isTopCard ? 'top-card' : ''} ${isAnimating ? 'draw-animation' : ''}`}
      onClick={onClick}
      onMouseEnter={(e) => onMouseEnter(card, e)}
      onMouseLeave={onMouseLeave}
    >
      <img src={require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={card.name} className="card-image" />
      <div className="card-info">
        <span className="card-name">{card.name}</span>
        <span className={`card-cost ${isPlayable ? 'playable' : 'not-playable'}`}>{card.cost}</span>
      </div>
    </div>
  );
};

export default CompactCard;
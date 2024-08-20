import React from 'react';
import { Card } from '../shared/types';
import './CompactCard.css';

interface CompactCardProps {
  card: Card;
  onClick: () => void;
  isSelected: boolean;
  disabled: boolean;
  isPlayable: boolean;
  }

  const CompactCard: React.FC<CompactCardProps> = ({ card, onClick, isSelected, isPlayable }) => {
    return (
      <div 
        className={`compact-card ${isSelected ? 'selected' : ''} ${isPlayable ? 'playable' : 'disabled'}`}
        onClick={isPlayable ? onClick : undefined}
      >
      <img src={require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={card.name} className="card-image" />
      <div className="card-info">
        <span className="card-name">{card.name}</span>
        <span className={`card-cost ${isPlayable ? 'playable' : 'unplayable'}`}>
  {card.cost}
</span>
      </div>
    </div>
  );
};

export default CompactCard;
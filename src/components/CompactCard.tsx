import React from 'react';
import { Card } from '../shared/types';
import './CompactCard.css';

interface CompactCardProps {
  card: Card;
  onClick: () => void;
  isSelected: boolean;
  disabled: boolean;
}

const CompactCard: React.FC<CompactCardProps> = ({ card, onClick, isSelected, disabled }) => {
  return (
    <div 
      className={`compact-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <img src={`/assets/cards/${card.id.toLowerCase()}.png`} alt={card.name} />
      <div className="card-info">
        <span className="card-name">{card.name}</span>
        <span className="card-cost">{card.cost}</span>
      </div>
    </div>
  );
};

export default CompactCard;
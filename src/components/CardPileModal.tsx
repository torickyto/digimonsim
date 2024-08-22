import React, { useState } from 'react';
import { Card } from '../shared/types';
import CompactCard from './CompactCard';
import FullCardDisplay from './FullCardDisplay';
import './CardPileModal.css';

interface CardPileModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  title: string;
}

const CardPileModal: React.FC<CardPileModalProps> = ({ isOpen, onClose, cards, title }) => {
    const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  
    if (!isOpen) return null;



  const handleCardHover = (card: Card, event: React.MouseEvent) => {
    setHoveredCard(card);
    setHoverPosition({ x: event.clientX + 20, y: event.clientY - 10 });
  };

  const handleCardHoverEnd = () => {
    setHoveredCard(null);
  };

  return (
    <div className="card-pile-modal-overlay" onClick={onClose}>
      <div className="card-pile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="card-pile-grid">
        {cards.map((card, index) => (
            <CompactCard
              key={`${card.instanceId}-${index}`}
              card={card}
              onClick={() => {}}
              isSelected={false}
              isPlayable={false}
              isTopCard={false}
              isNewlyDrawn={false}
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardHoverEnd}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardPileModal;
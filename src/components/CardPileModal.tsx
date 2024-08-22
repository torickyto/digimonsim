import React from 'react';
import { Card } from '../shared/types';
import CompactCard from './CompactCard';
import './CardPileModal.css';

interface CardPileModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  title: string;
}

const CardPileModal: React.FC<CardPileModalProps> = ({ isOpen, onClose, cards, title }) => {
  if (!isOpen) return null;

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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardPileModal;
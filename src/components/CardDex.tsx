import React, { useState } from 'react';
import { CardType } from '../shared/types';
import DetailedCard from './DetailedCard';
import './CardDex.css';

interface CardDexProps {
  cards: CardType[];
}

const CardDex: React.FC<CardDexProps> = ({ cards }) => {
  const [hoveredCard, setHoveredCard] = useState<CardType | null>(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'NULL': return '#808080';
      case 'VACCINE': return '#00ff00';
      case 'VIRUS': return '#ff0000';
      case 'DATA': return '#0000ff';
      default: return '#ffffff';
    }
  };

  return (
    <div className="card-dex">
      <h2>Card Collection</h2>
      <div className="card-grid">
        {cards.map(card => (
          <div 
            key={card.id} 
            className="card-item"
            onMouseEnter={() => setHoveredCard(card)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-image">
              <img src={require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={card.name} />
            </div>
            <div className="card-info">
              <div className="card-name">{card.name}</div>
              <div 
                className="card-cost" 
                style={{backgroundColor: getTypeColor(card.digimonType)}}
              >
                {card.cost}
              </div>
            </div>
          </div>
        ))}
      </div>
      {hoveredCard && (
        <div className="card-details-popup">
          <DetailedCard card={hoveredCard} />
        </div>
      )}
    </div>
  );
};

export default CardDex;
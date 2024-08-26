import React, { useState } from 'react';
import { Card as CardType } from '../shared/types';
import './CardDex.css';

interface CardDexProps {
  cards: CardType[];
}

const CardDex: React.FC<CardDexProps> = ({ cards }) => {
  const [hoveredCard, setHoveredCard] = useState<CardType | null>(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'NULL': return '#808080';
      case 'VACCINE': return '#8dd894';
      case 'VIRUS': return '#ca60ae';
      case 'DATA': return '#5fa1e7';
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
    </div>
  );
};

export default CardDex;
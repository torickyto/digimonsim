import React from 'react';
import { CardType } from '../shared/types';
import './DetailedCard.css';

interface DetailedCardProps {
  card: CardType;
}

const DetailedCard: React.FC<DetailedCardProps> = ({ card }) => {
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
    <div className="detailed-card">
      <div className="card-header">
        <h2 className="card-name">{card.name}</h2>
        <div className="card-cost" style={{backgroundColor: getTypeColor(card.digimonType)}}>
          {card.cost}
        </div>
      </div>
      <div className="card-image-big">
        <img src={require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={card.name} />
      </div>
      <div className="card-body">
        <div className="card-type">{card.type}</div>
        <div className="card-digimon-type">{card.digimonType} Type</div>
        {card.damage && <div className="card-damage">Damage: {card.damage}</div>}
        {card.block && <div className="card-block">Block: {card.block}</div>}
        <div className="card-description">{card.description.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}</div>
      </div>
      <div className="card-footer">
      </div>
    </div>
  );
};

export default DetailedCard;
import React from 'react';
import { Card } from '../shared/types';
import './FullCardDisplay.css';

interface FullCardDisplayProps {
  card: Card;
  position: { x: number; y: number };
}

const FullCardDisplay: React.FC<FullCardDisplayProps> = ({ card, position }) => {
  return (
    <div className="full-card-display" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
      <div className="card-image-container">
        <img src={require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={card.name} className="card-image" />
      </div>
      <div className="card-header">
        <h3 className="card-name">{card.name}</h3>
        <div className="card-cost">{card.cost}</div>
        <div className="card-target">{card.target}</div>
      </div>
      <div className="card-type">{card.type}</div>
      <div className="card-effects">
        {card.effects.map((effect, index) => (
          <div key={index} className="effect-container">
            {effect.once && <div className="effect-once">Once</div>}
            <p className="effect-description">{effect.description}</p>
            {effect.duration && (
              <div className="effect-duration">
                <span className="duration-icon">⏳</span>
                <span className="duration-value">{effect.duration}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="card-tags">
        {card.effects.map((effect, index) => (
          <span key={index} className="card-tag">
            {effect.damage && 'Damage'}
            {effect.shield && 'Shield'}
            {effect.heal && 'Heal'}
            {effect.drawCards && 'Draw'}
            {effect.discardCards && 'Discard'}
            {effect.gainRam && 'RAM'}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FullCardDisplay;
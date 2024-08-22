import React from 'react';
import { Card, DigimonState } from '../shared/types';
import { DamageCalculations } from '../shared/damageCalculations';
import './FullCardDisplay.css';

interface FullCardDisplayProps {
  card: Card;
  position: { x: number; y: number };
  attacker: DigimonState;
}

const FullCardDisplay: React.FC<FullCardDisplayProps> = ({ card, position, attacker }) => {
  const calculateValue = (formula: string) => {
    if (formula in DamageCalculations) {
      return DamageCalculations[formula as keyof typeof DamageCalculations](attacker);
    }
    return 0;
  };

  const replaceValuesInDescription = (description: string, effect: any) => {
    let updatedDescription = description;
    if (effect.damage && effect.damage.formula) {
      const damageValue = calculateValue(effect.damage.formula);
      updatedDescription = updatedDescription.replace('{damage}', damageValue.toString());
    }
    if (effect.shield && effect.shield.formula) {
      const shieldValue = calculateValue(effect.shield.formula);
      updatedDescription = updatedDescription.replace('{shield}', shieldValue.toString());
    }
    if (effect.heal && effect.heal.formula) {
      const healValue = calculateValue(effect.heal.formula);
      updatedDescription = updatedDescription.replace('{heal}', healValue.toString());
    }
    return updatedDescription;
  };

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
            {effect.description && (
              <p className="effect-description">
                {replaceValuesInDescription(effect.description, effect)}
              </p>
            )}
            {!effect.description && <p className="effect-description">Effect description not available</p>}
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
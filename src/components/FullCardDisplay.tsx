import React from 'react';
import { Card, DigimonState, CardEffectType, TargetType } from '../shared/types';
import { DamageCalculations } from '../shared/damageCalculations';
import './FullCardDisplay.css';

interface FullCardDisplayProps {
  card: Card;
  attacker: DigimonState;
  position?: { x: number; y: number };
}

const FullCardDisplay: React.FC<FullCardDisplayProps> = ({ card, position, attacker }) => {
    const calculateValue = (formula: string) => {
      if (formula in DamageCalculations) {
        return DamageCalculations[formula as keyof typeof DamageCalculations](attacker);
      }
      return 0;
    };
  
    const getEffectValue = (effectType: CardEffectType) => {
        const effect = card.effects.find(effect => 
          (effectType === 'attack' && effect.damage) ||
          (effectType === 'shield' && effect.shield) ||
          (effectType === 'healing' && effect.heal)
        );
        if (effect) {
          const formula = effect.damage?.formula || effect.shield?.formula || effect.heal?.formula;
          return formula ? calculateValue(formula) : null;
        }
        return null;
      };

      const getTargetColor = (target: TargetType): string => {
        switch (target) {
          case 'self':
            return '#4CAF50';  // Green
          case 'single_ally':
            return '#2196F3';  // Blue
          case 'enemy':
            return '#F44336';  // Red
          case 'all_enemies':
            return '#FF5722';  // Deep Orange
          case 'random_enemy':
            return '#9C27B0';  // Purple
          case 'all_allies':
            return '#00BCD4';  // Cyan
          case 'random_ally':
            return '#3F51B5';  // Indigo
          case 'all':
            return '#FFC107';  // Amber
          default:
            return '#9E9E9E';  // Grey
        }
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

      const renderEffectValue = () => {
        const effectValue = getEffectValue(card.type);
        if (effectValue === null) return null;
    
        switch (card.type) {
          case 'attack':
            return <div className="card-effect-value">Damage <span className="value damage-value">{effectValue}</span></div>;
          case 'shield':
            return <div className="card-effect-value">Shield <span className="value shield-value">{effectValue}</span></div>;
          case 'healing':
            return <div className="card-effect-value">Healing <span className="value heal-value">{effectValue}</span></div>;
          default:
            return null;
        }
      };

      const style = position ? {
        position: 'fixed' as 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
      } : {};
    
    
      return (
        <div className="full-card-display" style={style}>
          <div className="card-image-container">
            <img src={require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={card.name} className="card-image" />
          </div>
          <div className="card-header">
          <h3 className="card-name">{card.name}</h3>
            <div className="card-target" style={{ backgroundColor: getTargetColor(card.target) }}>
              {card.target}
            </div>
            <div className="card-cost">{card.cost}</div>
          </div>
          {renderEffectValue()}
          <div className="card-description">{card.description}</div>
          <div className="card-effects">
            {card.effects.map((effect, index) => {
             // if (effect.damage || effect.shield || effect.heal) return null; // update this to only skip the first/main effect
              return (
                <div key={index} className="effect-container">
                  {effect.once && <div className="effect-once">Once</div>}
                  {effect.description && (
                    <p className="effect-description">
                      {replaceValuesInDescription(effect.description, effect)}
                    </p>
                  )}
                  
                  {effect.duration && (
                    <div className="effect-duration">
                      <span className="duration-icon">⏳</span>
                      <span className="duration-value">{effect.duration}</span>
                    </div>
                  )}
                </div>
              );
            })}
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
    
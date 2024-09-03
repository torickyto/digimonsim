import React, { useState, useEffect, useMemo } from 'react';
import { Digimon, Card } from '../shared/types';
import DigimonSprite from './DigimonSprite';
import { updateCardDescription } from '../shared/cardCollection';
import './DeckViewModal.css';

interface DeckViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerTeam: Digimon[];
    title: string;
  }

  const DeckViewModal: React.FC<DeckViewModalProps> = ({ isOpen, onClose, playerTeam, title }) => {
    const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
    const [animate, setAnimate] = useState(false);
  
    useEffect(() => {
      if (isOpen) {
        setAnimate(true);
      }
    }, [isOpen]);
  
    const handleClose = () => {
        setAnimate(false);
        setTimeout(() => {
          onClose();
        }, 300); 
      };

    if (!isOpen) return null;
  
    const renderCardEffects = (effects: any[]) => {
    return effects.map((effect, index) => (
      <div key={index} className="dvm-card-effect">
        {effect.description && <p>{effect.description}</p>}
        {effect.damage && <p>Damage: {effect.damage.formula} to {effect.damage.target}</p>}
        {effect.shield && <p>Shield: {effect.shield.formula} to {effect.shield.target}</p>}
        {effect.heal && <p>Heal: {effect.heal.formula} to {effect.heal.target}</p>}
        {effect.drawCards && <p>Draw {effect.drawCards} card(s)</p>}
        {effect.discardCards && <p>Discard {effect.discardCards} card(s)</p>}
        {effect.gainRam && <p>Gain {typeof effect.gainRam === 'number' ? effect.gainRam : 'variable'} RAM</p>}
        {effect.applyStatus && (
          <p>Apply {effect.applyStatus.type} (Duration: {effect.applyStatus.duration}, Value: {effect.applyStatus.value})</p>
        )}
        {effect.modifyStatMultiplier && (
          <p>Modify {effect.modifyStatMultiplier.stat} by {effect.modifyStatMultiplier.multiplier}x for {effect.modifyStatMultiplier.duration} turn(s)</p>
        )}
        {effect.burst && <p><strong>BURST</strong></p>}
        {effect.recompile && <p><strong>RECOMPILE</strong></p>}
      </div>
    ));
  };

  return (
    <div className={`dvm-overlay ${animate ? 'animate' : ''}`}>
      <div className="dvm-modal">
        <h2>{title}</h2>
        <div className="dvm-content">
          <div className="dvm-digimon-decks">
            {playerTeam.map((digimon, index) => (
              <div key={digimon.id} className="dvm-digimon-column">
                <div className="dvm-digimon-header">
                  <h3>{digimon.nickname || digimon.displayName}</h3>
                </div>
                <div className="dvm-digimon-sprite">
                  <DigimonSprite name={digimon.name} scale={1} />
                </div>
                <div className="dvm-card-list">
                  {digimon.deck.map((card) => (
                    <div
                      key={card.instanceId}
                      className="dvm-card-item"
                      onMouseEnter={() => setHoveredCard(card)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <img src={require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={card.name} />
                      <span>{card.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="dvm-card-preview">
            {hoveredCard && (
              <div className="dvm-selected-card">
                <img src={require(`../assets/cards/${hoveredCard.name.toLowerCase().replace(/\s+/g, '')}.png`)} alt={hoveredCard.name} className="dvm-card-image-large" />
                <h4>{hoveredCard.name}</h4>
                <p className="dvm-card-description">{updateCardDescription(hoveredCard, playerTeam[hoveredCard.ownerDigimonIndex]).description}</p>
                <div className="dvm-card-details">
                  <span>Type: {hoveredCard.type}</span>
                  <span>Cost: {hoveredCard.cost}</span>
                  <span>Digimon Type: {hoveredCard.digimonType}</span>
                  <span>Target: {hoveredCard.target}</span>
                </div>
                <div className="dvm-card-effects">
                  <h5>Effects:</h5>
                  {renderCardEffects(hoveredCard.effects)}
                </div>
              </div>
            )}
          </div>
        </div>
        <button className="dvm-close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default DeckViewModal;
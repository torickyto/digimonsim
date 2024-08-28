import React, { useEffect, useState } from 'react';
import { Card, Digimon, DigimonState } from '../shared/types';
import './CompactCard.css';

interface CompactCardProps {
  card: Card;
  ownerDigimon: Digimon | DigimonState;
  onClick: () => void;
  onDoubleClick?: () => void;
  isSelected: boolean;
  isPlayable: boolean;
  isTopCard: boolean;
  isNewlyDrawn: boolean;
  onMouseEnter: (card: Card, event: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const CompactCard: React.FC<CompactCardProps> = ({ 
  card, 
  ownerDigimon,
  onClick, 
  onDoubleClick,
  isSelected, 
  isPlayable, 
  isTopCard,
  isNewlyDrawn,
  onMouseEnter,
  onMouseLeave
}) => {
  const isAnimating = isNewlyDrawn;
  const [vpetFrame, setVpetFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVpetFrame((prevFrame) => (prevFrame === 0 ? 1 : 0));
    }, 500); // Change frame every 500ms

    return () => clearInterval(interval);
  }, []);

  const vpetStyle = {
    backgroundImage: `url(${require(`../assets/vpet/${ownerDigimon.name.toLowerCase()}.png`)})`,
    backgroundPosition: `${-16 * vpetFrame}px 0`,
  };

  return (
    <div 
      className={`compact-card ${isSelected ? 'selected' : ''} ${isPlayable ? 'playable' : ''} ${isTopCard ? 'top-card' : ''} ${isAnimating ? 'draw-animation' : ''}`}
      onClick={onClick}
      onMouseEnter={(e) => onMouseEnter(card, e)}
      onMouseLeave={onMouseLeave}
    >
      <div className="card-background" style={{backgroundImage: `url(${require(`../assets/cards/${card.name.toLowerCase().replace(/\s+/g, '')}.png`)})`}}></div>
      <div className="vpet-sprite" style={vpetStyle}></div>
      <div className="card-info">
        <span className="card-name">{card.name}</span>
        <span className={`card-cost ${isPlayable ? 'playable' : 'not-playable'}`}>{card.cost}</span>
      </div>
    </div>
  );
};

export default CompactCard;
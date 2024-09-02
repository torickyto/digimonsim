import React, { useState, useEffect } from 'react';
import './DigimonSprite.css';

interface DigimonSpriteProps {
  name: string;
  isAttacking?: boolean;
  isOnHit?: boolean;
  onAttackComplete?: () => void;
  scale?: number;
  isDead?: boolean;
  isStunned?: boolean;
  style?: React.CSSProperties;
}

const DigimonSprite: React.FC<DigimonSpriteProps> = ({ 
  name, 
  isAttacking = false, 
  isOnHit = false, 
  isDead = false,
  isStunned = false,
  onAttackComplete,
  scale = 1,
  style = {}
}) => {
  const [animationClass, setAnimationClass] = useState<'breathing' | 'attacking' | 'onHit'>('breathing');

  useEffect(() => {
    if (isDead) {
      setAnimationClass('onHit');
    } else if (isAttacking) {
      setAnimationClass('attacking');
      const timer = setTimeout(() => {
        setAnimationClass('breathing');
        onAttackComplete?.();
      }, 600); 
      return () => clearTimeout(timer);
    } else if (isOnHit) {
      setAnimationClass('onHit');
      const timer = setTimeout(() => {
        setAnimationClass('breathing');
      }, 600); 
      return () => clearTimeout(timer);
    } else {
      setAnimationClass('breathing');
    }
  }, [isAttacking, isOnHit, isDead, onAttackComplete]);

  return (
    <div 
      className={`digimon ${name} ${animationClass} ${isStunned ? 'stunned' : ''}`}
      style={{
        ...style,
        transform: `${style.transform || ''} scale(${scale})`,
        transformOrigin: 'bottom center',
        filter: isDead ? 'grayscale(100%)' : 'none'
      }}
    >
      {isStunned && <div className="stun-effect"></div>}
    </div>
  );
};

export default DigimonSprite;
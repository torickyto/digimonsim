import React, { useState, useEffect } from 'react';
import './DigimonSprite.css'; 

interface DigimonSpriteProps {
  name: string;
  isAttacking?: boolean;
  isOnHit?: boolean;
  onAttackComplete?: () => void;
}

const DigimonSprite: React.FC<DigimonSpriteProps> = ({ name, isAttacking = false, isOnHit = false, onAttackComplete }) => {
  const [animationClass, setAnimationClass] = useState<'breathing' | 'attacking' | 'onHit'>('breathing');

  useEffect(() => {
    if (isAttacking) {
      setAnimationClass('attacking');
      const timer = setTimeout(() => {
        setAnimationClass('breathing');
        onAttackComplete?.();
      }, 400); 
      return () => clearTimeout(timer);
    } else if (isOnHit) {
      setAnimationClass('onHit');
      const timer = setTimeout(() => {
        setAnimationClass('breathing');
      }, 200); 
      return () => clearTimeout(timer);
    } else {
      setAnimationClass('breathing');
    }
  }, [isAttacking, isOnHit, onAttackComplete]);

  return (
    <div className={`digimon ${name} ${animationClass}`}></div>
  );
};

export default DigimonSprite;

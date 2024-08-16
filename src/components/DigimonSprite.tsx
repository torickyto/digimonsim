import React, { useState, useEffect } from 'react';
import './DigimonSprite.css'; 

interface DigimonSpriteProps {
  name: string;
  isAttacking?: boolean;
  onAttackComplete?: () => void;
}

const DigimonSprite: React.FC<DigimonSpriteProps> = ({ name, isAttacking = false, onAttackComplete }) => {
  const [animationClass, setAnimationClass] = useState<'breathing' | 'attacking'>('breathing');

  useEffect(() => {
    if (isAttacking) {
      setAnimationClass('attacking');
      const timer = setTimeout(() => {
        setAnimationClass('breathing');
        onAttackComplete?.();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAttacking, onAttackComplete]);

  return (
    <div className={`digimon ${name} ${animationClass}`}></div>
  );
};

export default DigimonSprite;
import React, { useState, useEffect } from 'react';
import './DigimonSprite.css';

interface DigimonSpriteProps {
  name: string;
  isAttacking?: boolean;
  isOnHit?: boolean;
  onAttackComplete?: () => void;
  scale?: number;
  style?: React.CSSProperties;
}

const DigimonSprite: React.FC<DigimonSpriteProps> = ({ 
  name, 
  isAttacking = false, 
  isOnHit = false, 
  onAttackComplete,
  scale = 1,
  style = {}
}) => {
  const [animationClass, setAnimationClass] = useState<'breathing' | 'attacking' | 'onHit'>('breathing');

  useEffect(() => {
    if (isAttacking) {
      setAnimationClass('attacking');
      const timer = setTimeout(() => {
        setAnimationClass('breathing');
        onAttackComplete?.();
      }, 600); 
      return () => clearTimeout(timer);
    } else if (isOnHit) {
      console.log(`DigimonSprite ${name}: Setting animation to 'onHit'`);
      setAnimationClass('onHit');
      const timer = setTimeout(() => {
        console.log(`DigimonSprite ${name}: OnHit animation complete, returning to 'breathing'`);
        setAnimationClass('breathing');
      }, 600); 
      return () => clearTimeout(timer);
    } else {
      console.log(`DigimonSprite ${name}: Setting animation to 'breathing'`);
      setAnimationClass('breathing');
    }
  }, [isAttacking, isOnHit, onAttackComplete, name]);

  console.log(`DigimonSprite ${name}: Rendering with animationClass=${animationClass}`);

  return (
    <div 
      className={`digimon ${name} ${animationClass}`}
      style={{
        ...style,
        transform: `${style.transform || ''} scale(${scale})`,
        transformOrigin: 'bottom center'
      }}
    ></div>
  );
};


export default DigimonSprite;
import React, { useState, useEffect } from 'react';
import './DigimonSprite.css'; 

const DigimonSprite = ({ name, isAttacking, onAttackComplete }) => {
  const [animationClass, setAnimationClass] = useState('breathing');

  useEffect(() => {
    if (isAttacking) {
      setAnimationClass('attacking');
      const timer = setTimeout(() => {
        setAnimationClass('breathing');
        if (onAttackComplete) onAttackComplete();
      }, 200); // Duration of attack animation
      return () => clearTimeout(timer);
    }
  }, [isAttacking, onAttackComplete]);

  return (
    <div className={`digimon ${name} ${animationClass}`}></div>
  );
};

export default DigimonSprite;
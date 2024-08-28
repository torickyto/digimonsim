import React, { useEffect, useState } from 'react';
import './VPetSprite.css';

interface VPetSpriteProps {
  digimonName: string;
}

const VPetSprite: React.FC<VPetSpriteProps> = ({ digimonName }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFrame((prevFrame) => (prevFrame === 0 ? 1 : 0));
    }, 500); // Switch frame every 500ms

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div 
      className={`vpet-sprite ${digimonName}`} 
      style={{ backgroundPosition: `${-16 * frame}px 0` }}
    />
  );
};

export default VPetSprite;